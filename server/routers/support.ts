import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { supportTickets, subscriptions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const supportRouter = router({
  /**
   * Criar novo ticket de suporte
   */
  createTicket: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5).max(255),
        description: z.string().min(10),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user.tenantId) {
        throw new Error("Tenant não encontrado");
      }

      // Verificar se o tenant tem direito a suporte humano
      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.tenantId, ctx.user.tenantId))
        .limit(1);

      if (!subscription.length) {
        throw new Error("Assinatura não encontrada");
      }

      const sub = subscription[0];
      const plansWithHumanSupport = ["starter-10", "vya-pro"];
      const hasHumanSupport =
        plansWithHumanSupport.includes(sub.plan) || sub.storageLimitGb >= 1024;

      if (!hasHumanSupport) {
        throw new Error(
          "Seu plano não inclui suporte humano. Upgrade para Starter 10, Vya Pro ou ative o upgrade Standard 1TB."
        );
      }

      // Criar ticket
      await db.insert(supportTickets).values({
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
        subject: input.subject,
        description: input.description,
        priority: input.priority || "medium",
        supportType: "chat",
        status: "open",
      });

      return {
        success: true,
        message: "Ticket criado com sucesso",
      };
    }),

  /**
   * Listar tickets do usuário
   */
  listTickets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db || !ctx.user.tenantId) {
      return [];
    }

    const tickets = await db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.tenantId, ctx.user.tenantId));

    return tickets;
  }),

  /**
   * Obter detalhes de um ticket
   */
  getTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user.tenantId) {
        throw new Error("Tenant não encontrado");
      }

      const ticket = await db
        .select()
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.id, input.ticketId),
            eq(supportTickets.tenantId, ctx.user.tenantId)
          )
        )
        .limit(1);

      if (!ticket.length) {
        throw new Error("Ticket não encontrado");
      }

      return ticket[0];
    }),

  /**
   * Fechar ticket
   */
  closeTicket: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user.tenantId) {
        throw new Error("Tenant não encontrado");
      }

      // Verificar se o ticket pertence ao tenant
      const ticket = await db
        .select()
        .from(supportTickets)
        .where(
          and(
            eq(supportTickets.id, input.ticketId),
            eq(supportTickets.tenantId, ctx.user.tenantId)
          )
        )
        .limit(1);

      if (!ticket.length) {
        throw new Error("Ticket não encontrado");
      }

      // Fechar ticket
      await db
        .update(supportTickets)
        .set({
          status: "closed",
          resolvedAt: new Date(),
        })
        .where(eq(supportTickets.id, input.ticketId));

      return {
        success: true,
        message: "Ticket fechado com sucesso",
      };
    }),

  /**
   * Verificar se o tenant tem acesso a suporte humano
   */
  checkHumanSupportAccess: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db || !ctx.user.tenantId) {
      return {
        hasAccess: false,
        reason: "Tenant não encontrado",
      };
    }

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, ctx.user.tenantId))
      .limit(1);

    if (!subscription.length) {
      return {
        hasAccess: false,
        reason: "Assinatura não encontrada",
      };
    }

    const sub = subscription[0];
    const plansWithHumanSupport = ["starter-10", "vya-pro"];
    const hasHumanSupport =
      plansWithHumanSupport.includes(sub.plan) || sub.storageLimitGb >= 1024;

    return {
      hasAccess: hasHumanSupport,
      plan: sub.plan,
      reason: hasHumanSupport
        ? "Seu plano inclui suporte humano"
        : "Upgrade necessário para suporte humano",
    };
  }),

  /**
   * Enviar mensagem para suporte via email
   */
  sendEmailSupport: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5),
        message: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Aqui você integraria com um serviço de email real
      // Por enquanto, apenas retornamos sucesso
      return {
        success: true,
        message: "Email enviado para suporte",
        supportEmail: "suporte@vyaconcept.com.br",
      };
    }),
});
