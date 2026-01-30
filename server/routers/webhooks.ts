import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import {
  updateSubscription,
  createNotification,
  getDb,
  getTenantById,
} from "../db";
import { subscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Router para processar webhooks do Stripe
 * Estes endpoints devem ser chamados apenas pelo Stripe
 */
export const webhooksRouter = router({
  /**
   * Processar eventos do Stripe
   * Este endpoint recebe eventos do Stripe e atualiza o banco de dados
   */
  stripeEvent: publicProcedure
    .input(
      z.object({
        type: z.string(),
        data: z.object({
          object: z.any(),
        }),
        id: z.string().optional(),
      })
    )
    .mutation(async (opts) => {
      const { input } = opts;
      try {
        const eventType = input.type;
        const eventData = input.data.object as any;

        console.log(`[Webhook] Processando evento Stripe: ${eventType}`);

        switch (eventType) {
          // Pagamento bem-sucedido
          case "invoice.payment_succeeded":
            await handlePaymentSucceeded(eventData);
            break;

          // Pagamento falhou
          case "invoice.payment_failed":
            await handlePaymentFailed(eventData);
            break;

          // Assinatura criada
          case "customer.subscription.created":
            await handleSubscriptionCreated(eventData);
            break;

          // Assinatura atualizada
          case "customer.subscription.updated":
            await handleSubscriptionUpdated(eventData);
            break;

          // Assinatura deletada/cancelada
          case "customer.subscription.deleted":
            await handleSubscriptionDeleted(eventData);
            break;

          default:
            console.log(`[Webhook] Evento não tratado: ${eventType}`);
        }

        return { success: true, message: "Evento processado com sucesso" };
      } catch (error) {
        console.error("[Webhook] Erro ao processar evento:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao processar webhook",
        });
      }
    }),
});

/**
 * Encontrar assinatura pelo ID do Stripe
 */
async function findSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Processar pagamento bem-sucedido
 */
async function handlePaymentSucceeded(eventData: any) {
  const subscriptionId = eventData.subscription;

  console.log(`[Webhook] Pagamento bem-sucedido para assinatura: ${subscriptionId}`);

  try {
    const subscription = await findSubscriptionByStripeId(subscriptionId);
    if (!subscription) {
      console.warn(`[Webhook] Assinatura não encontrada: ${subscriptionId}`);
      return;
    }

    // Atualizar status da assinatura
    await updateSubscription(subscription.id, { status: "active" });

    // Atualizar status do tenant para ativo
    const tenant = await getTenantById(subscription.tenantId);
    if (tenant) {
      const db = await getDb();
      if (db) {
        await db.update(require("../../drizzle/schema").tenants).set({ status: "active", updatedAt: new Date() }).where(eq(require("../../drizzle/schema").tenants.id, subscription.tenantId));
      }
    }

    // Criar notificação
    await createNotification({
      tenantId: subscription.tenantId,
      type: "billing",
      title: "Pagamento Recebido",
      message: "Seu pagamento foi processado com sucesso. Sua assinatura está ativa.",
    });

    console.log(`[Webhook] Assinatura ${subscriptionId} ativada com sucesso`);
  } catch (error) {
    console.error("[Webhook] Erro ao processar pagamento bem-sucedido:", error);
  }
}

/**
 * Processar pagamento falhado
 */
async function handlePaymentFailed(eventData: any) {
  const subscriptionId = eventData.subscription;

  console.log(`[Webhook] Pagamento falhou para assinatura: ${subscriptionId}`);

  try {
    const subscription = await findSubscriptionByStripeId(subscriptionId);
    if (!subscription) {
      console.warn(`[Webhook] Assinatura não encontrada: ${subscriptionId}`);
      return;
    }

    // Atualizar status da assinatura para past_due
    await updateSubscription(subscription.id, { status: "past_due" });

    // Criar notificação
    await createNotification({
      tenantId: subscription.tenantId,
      type: "critical",
      title: "Falha no Pagamento",
      message:
        "Houve um problema ao processar seu pagamento. Por favor, atualize seus dados de pagamento para evitar a suspensão da conta.",
    });

    console.log(`[Webhook] Assinatura ${subscriptionId} marcada como past_due`);
  } catch (error) {
    console.error("[Webhook] Erro ao processar pagamento falhado:", error);
  }
}

/**
 * Processar criação de assinatura
 */
async function handleSubscriptionCreated(eventData: any) {
  const subscriptionId = eventData.id;

  console.log(`[Webhook] Assinatura criada: ${subscriptionId}`);

  try {
    // Aqui você pode adicionar lógica adicional se necessário
    // Por exemplo, registrar a assinatura no banco de dados
    console.log(`[Webhook] Assinatura ${subscriptionId} criada com sucesso`);
  } catch (error) {
    console.error("[Webhook] Erro ao processar criação de assinatura:", error);
  }
}

/**
 * Processar atualização de assinatura
 */
async function handleSubscriptionUpdated(eventData: any) {
  const subscriptionId = eventData.id;
  const status = eventData.status;

  console.log(`[Webhook] Assinatura atualizada: ${subscriptionId}, status: ${status}`);

  try {
    const subscription = await findSubscriptionByStripeId(subscriptionId);
    if (!subscription) {
      console.warn(`[Webhook] Assinatura não encontrada: ${subscriptionId}`);
      return;
    }

    // Mapear status do Stripe para nosso sistema
    const mappedStatus = mapStripeStatus(status);
    await updateSubscription(subscription.id, { status: mappedStatus });

    console.log(`[Webhook] Assinatura ${subscriptionId} atualizada para ${mappedStatus}`);
  } catch (error) {
    console.error("[Webhook] Erro ao processar atualização de assinatura:", error);
  }
}

/**
 * Processar cancelamento de assinatura
 */
async function handleSubscriptionDeleted(eventData: any) {
  const subscriptionId = eventData.id;

  console.log(`[Webhook] Assinatura cancelada: ${subscriptionId}`);

  try {
    const subscription = await findSubscriptionByStripeId(subscriptionId);
    if (!subscription) {
      console.warn(`[Webhook] Assinatura não encontrada: ${subscriptionId}`);
      return;
    }

    // Atualizar status da assinatura para cancelled
    await updateSubscription(subscription.id, { status: "cancelled" });

    // Suspender o tenant
    const tenant = await getTenantById(subscription.tenantId);
    if (tenant) {
      const db = await getDb();
      if (db) {
        await db.update(require("../../drizzle/schema").tenants).set({ status: "suspended", updatedAt: new Date() }).where(eq(require("../../drizzle/schema").tenants.id, subscription.tenantId));
      }
    }

    // Criar notificação
    await createNotification({
      tenantId: subscription.tenantId,
      type: "critical",
      title: "Assinatura Cancelada",
      message:
        "Sua assinatura foi cancelada. Você perderá acesso aos serviços em 30 dias. Entre em contato com o suporte para reativar.",
    });

    console.log(`[Webhook] Assinatura ${subscriptionId} cancelada e tenant suspenso`);
  } catch (error) {
    console.error("[Webhook] Erro ao processar cancelamento de assinatura:", error);
  }
}

/**
 * Mapear status do Stripe para o sistema
 */
function mapStripeStatus(stripeStatus: string): "active" | "past_due" | "cancelled" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "cancelled":
      return "cancelled";
    default:
      return "active";
  }
}
