import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { ENV } from "../_core/env";

/**
 * Stripe Checkout Router
 * Gerencia a criação de sessões de checkout para os planos
 */
export const checkoutRouter = router({
  /**
   * Criar sessão de checkout para um plano
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        hasStandard1TbUpgrade: z.boolean().optional(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new Error("Tenant não encontrado");
      }

      // Mapeamento de planos para Stripe Price IDs (Test Mode)
      const STRIPE_PRICE_IDS: Record<string, string> = {
        "vya-solo": "price_test_solo", // R$ 29,90
        "starter-5": "price_test_starter5", // R$ 99,90
        "starter-10": "price_test_starter10", // R$ 189,90
        "vya-pro": "price_test_pro", // R$ 199,90
      };

      const stripePriceId = STRIPE_PRICE_IDS[input.planId];
      if (!stripePriceId) {
        throw new Error("Plano não encontrado");
      }

      // Calcular preço total com upgrade (se aplicável)
      const PLANS_PRICES: Record<string, number> = {
        "vya-solo": 2990, // R$ 29,90 em centavos
        "starter-5": 9990, // R$ 99,90
        "starter-10": 18990, // R$ 189,90
        "vya-pro": 19990, // R$ 199,90
      };

      let totalPriceCents = PLANS_PRICES[input.planId] || 0;

      if (input.hasStandard1TbUpgrade) {
        totalPriceCents += 14990; // +R$ 149,90
      }

      // Calcular imposto (15%)
      const taxProvisionCents = Math.round(totalPriceCents * 0.15);

      // Criar dados da sessão
      const checkoutSessionData = {
        tenantId: ctx.user.tenantId,
        userId: ctx.user.id,
        planId: input.planId,
        hasUpgrade: input.hasStandard1TbUpgrade || false,
        basePriceCents: PLANS_PRICES[input.planId],
        upgradePriceCents: input.hasStandard1TbUpgrade ? 14990 : 0,
        grossPriceCents: totalPriceCents,
        taxProvisionCents,
        netPriceCents: totalPriceCents - taxProvisionCents,
      };

      // Aqui você integraria com a API do Stripe real
      // Por enquanto, retornamos os dados para simulação
      return {
        success: true,
        checkoutUrl: `${input.successUrl}?session_id=test_session_${ctx.user.tenantId}`,
        sessionData: checkoutSessionData,
        message: "Sessão de checkout criada (Modo Teste)",
      };
    }),

  /**
   * Obter informações da sessão de checkout
   */
  getCheckoutSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      // Simulação de dados de sessão
      return {
        id: input.sessionId,
        status: "open",
        payment_status: "unpaid",
        customer_email: "test@example.com",
        total_details: {
          amount_subtotal: 2990,
          amount_tax: 448,
          amount_discount: 0,
        },
      };
    }),

  /**
   * Confirmar pagamento (webhook do Stripe)
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        paymentStatus: z.enum(["paid", "unpaid", "no_payment_required"]),
        planId: z.string(),
        hasUpgrade: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new Error("Tenant não encontrado");
      }

      // Aqui você atualizaria o banco de dados com o novo plano
      // e criaria a fatura correspondente

      return {
        success: true,
        message: "Pagamento confirmado",
        planId: input.planId,
        hasUpgrade: input.hasUpgrade,
      };
    }),

  /**
   * Obter histórico de checkouts
   */
  getCheckoutHistory: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user.tenantId) {
      return [];
    }

    // Retornar histórico simulado
    return [
      {
        id: "checkout_1",
        planId: "vya-solo",
        amount: 2990,
        tax: 448,
        status: "completed",
        createdAt: new Date(),
      },
    ];
  }),
});
