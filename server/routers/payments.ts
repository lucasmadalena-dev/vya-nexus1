import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { 
  getSubscriptionByTenantId, 
  updateSubscription,
  getTenantById,
  getDb,
} from "../db";
import Stripe from "stripe";

let stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada");
    }
    stripe = new Stripe(apiKey);
  }
  return stripe;
}

export const paymentsRouter = router({
  /**
   * Obter assinatura do tenant
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const subscription = await getSubscriptionByTenantId(ctx.user.tenantId);
    return subscription || null;
  }),

  /**
   * Criar sessão de checkout do Stripe
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "professional", "enterprise"]),
        emailSeats: z.number().int().min(1).max(100),
        storageLimitGb: z.number().int().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const tenant = await getTenantById(ctx.user.tenantId);
      if (!tenant) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tenant não encontrado" });
      }

      const subscription = await getSubscriptionByTenantId(ctx.user.tenantId);

      const planPrices: Record<string, string> = {
        starter: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
        professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || "price_professional",
        enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise",
      };

      try {
        let customerId = subscription?.stripeCustomerId;

        // Criar cliente no Stripe se não existir
        if (!customerId) {
          const customer = await getStripe().customers.create({
            email: ctx.user.email || "",
            name: tenant.name,
            metadata: {
              tenantId: ctx.user.tenantId.toString(),
              userId: ctx.user.id.toString(),
            },
          });
          customerId = customer.id;

          // Atualizar subscription com Stripe customer ID
          if (subscription) {
            await updateSubscription(subscription.id, { stripeCustomerId: customerId });
          }
        }

        // Criar sessão de checkout
        const session = await getStripe().checkout.sessions.create({
          customer: customerId,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: planPrices[input.plan],
              quantity: 1,
            },
          ],
          success_url: `${process.env.VITE_FRONTEND_URL || "http://localhost:5173"}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_FRONTEND_URL || "http://localhost:5173"}/pricing`,
          metadata: {
            tenantId: ctx.user.tenantId.toString(),
            plan: input.plan,
            emailSeats: input.emailSeats.toString(),
            storageLimitGb: input.storageLimitGb.toString(),
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Checkout session error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar sessão de pagamento",
        });
      }
    }),

  /**
   * Obter status de pagamento
   */
  getPaymentStatus: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const session = await getStripe().checkout.sessions.retrieve(input.sessionId);

        return {
          status: session.payment_status,
          subscriptionId: session.subscription,
          customerId: session.customer,
        };
      } catch (error) {
        console.error("Payment status error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter status de pagamento",
        });
      }
    }),

  /**
   * Cancelar assinatura
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const subscription = await getSubscriptionByTenantId(ctx.user.tenantId);
    if (!subscription?.stripeSubscriptionId) {
      throw new TRPCError({ 
        code: "NOT_FOUND", 
        message: "Assinatura não encontrada" 
      });
    }

    try {
      await getStripe().subscriptions.cancel(subscription.stripeSubscriptionId);

      await updateSubscription(subscription.id, { status: "cancelled" });

      return { success: true, message: "Assinatura cancelada com sucesso" };
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao cancelar assinatura",
      });
    }
  }),

  /**
   * Atualizar plano de assinatura
   */
  updateSubscriptionPlan: protectedProcedure
    .input(
      z.object({
        plan: z.enum(["starter", "professional", "enterprise"]),
        emailSeats: z.number().int().min(1).max(100),
        storageLimitGb: z.number().int().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const subscription = await getSubscriptionByTenantId(ctx.user.tenantId);
      if (!subscription) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Assinatura não encontrada" 
        });
      }

      const planPrices: Record<string, number> = {
        starter: 2999,
        professional: 9999,
        enterprise: 29999,
      };

      try {
        await updateSubscription(subscription.id, {
          plan: input.plan,
          emailSeats: input.emailSeats,
          storageLimitGb: input.storageLimitGb,
          monthlyPriceCents: planPrices[input.plan],
        });

        return { 
          success: true, 
          message: "Plano atualizado com sucesso" 
        };
      } catch (error) {
        console.error("Update subscription error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar plano",
        });
      }
    }),
});
