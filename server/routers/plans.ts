import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { plans, subscriptions, accountUpgrades, invoices } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Matriz de Planos Comerciais do Vya Nexus
 * Define todos os planos disponíveis com preços em centavos (BRL)
 */
const PLANS_MATRIX = {
  "vya-solo": {
    name: "Vya Solo",
    priceMonthCents: 2990, // R$ 29,90
    emailSeats: 1,
    storagePerAccountGb: 60,
    humanSupport: false,
    description: "Perfeito para profissionais autônomos",
  },
  "starter-5": {
    name: "Starter 5",
    priceMonthCents: 9990, // R$ 99,90
    emailSeats: 5,
    storagePerAccountGb: 60,
    humanSupport: false,
    description: "Ideal para pequenas equipes",
  },
  "starter-10": {
    name: "Starter 10",
    priceMonthCents: 18990, // R$ 189,90
    emailSeats: 10,
    storagePerAccountGb: 60,
    humanSupport: true,
    description: "Para empresas em crescimento",
  },
  "vya-pro": {
    name: "Vya Pro",
    priceMonthCents: 19990, // R$ 199,90
    emailSeats: 10,
    storagePerAccountGb: 100,
    humanSupport: true,
    description: "Solução completa com suporte prioritário",
  },
};

/**
 * Upgrade Standard 1TB
 * Adicional de R$ 149,90/mês para qualquer conta
 */
const UPGRADE_STANDARD_1TB = {
  upgradeType: "standard_1tb",
  additionalPriceCents: 14990, // R$ 149,90
  newStorageLimitGb: 1024, // 1TB
};

export const plansRouter = router({
  /**
   * Listar todos os planos disponíveis
   */
  listPlans: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return Object.values(PLANS_MATRIX).map((plan) => ({
        id: plan.name.toLowerCase().replace(/\s+/g, "-"),
        ...plan,
      }));
    }

    const dbPlans = await db.select().from(plans).where(eq(plans.active, true));
    return dbPlans.length > 0
      ? dbPlans
      : Object.values(PLANS_MATRIX).map((plan) => ({
          id: plan.name.toLowerCase().replace(/\s+/g, "-"),
          ...plan,
        }));
  }),

  /**
   * Obter detalhes de um plano específico
   */
  getPlan: publicProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ input }) => {
      const planKey = input.planId as keyof typeof PLANS_MATRIX;
      return PLANS_MATRIX[planKey] || null;
    }),

  /**
   * Obter plano atual do tenant
   */
  getCurrentPlan: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db || !ctx.user.tenantId) return null;

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, ctx.user.tenantId))
      .limit(1);

    return subscription.length > 0 ? subscription[0] : null;
  }),

  /**
   * Calcular preço total com upgrades
   */
  calculateTotalPrice: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        hasStandard1TbUpgrade: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const planKey = input.planId as keyof typeof PLANS_MATRIX;
      const plan = PLANS_MATRIX[planKey];

      if (!plan) {
        throw new Error("Plano não encontrado");
      }

      let totalPriceCents = plan.priceMonthCents;

      if (input.hasStandard1TbUpgrade) {
        totalPriceCents += UPGRADE_STANDARD_1TB.additionalPriceCents;
      }

      // Calcular impostos (15%)
      const taxProvisionCents = Math.round(totalPriceCents * 0.15);
      const netPriceCents = totalPriceCents - taxProvisionCents;

      return {
        planName: plan.name,
        basePriceCents: plan.priceMonthCents,
        upgradePriceCents: input.hasStandard1TbUpgrade
          ? UPGRADE_STANDARD_1TB.additionalPriceCents
          : 0,
        grossPriceCents: totalPriceCents,
        taxProvisionCents,
        netPriceCents,
        emailSeats: plan.emailSeats,
        storagePerAccountGb: input.hasStandard1TbUpgrade
          ? UPGRADE_STANDARD_1TB.newStorageLimitGb
          : plan.storagePerAccountGb,
      };
    }),

  /**
   * Obter informações de suporte disponível
   */
  getSupportInfo: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db || !ctx.user.tenantId) return null;

    const subscription = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.tenantId, ctx.user.tenantId))
      .limit(1);

    if (!subscription.length) return null;

    const sub = subscription[0];
    const planKey = sub.plan as keyof typeof PLANS_MATRIX;
    const plan = PLANS_MATRIX[planKey];

    // Verificar se tem upgrade Standard 1TB
    const upgrade = await db
      .select()
      .from(accountUpgrades)
      .where(
        and(
          eq(accountUpgrades.tenantId, ctx.user.tenantId),
          eq(accountUpgrades.status, "active")
        )
      )
      .limit(1);

    const hasStandardUpgrade = upgrade.length > 0;

    return {
      plan: plan?.name || "Desconhecido",
      humanSupportEnabled: plan?.humanSupport || hasStandardUpgrade,
      aiChatEnabled: true, // Sempre habilitado
      supportTypes: {
        email: true,
        chat: plan?.humanSupport || hasStandardUpgrade,
      },
      businessHours: {
        start: "09:00",
        end: "18:00",
        timezone: "America/Sao_Paulo",
      },
    };
  }),

  /**
   * Listar upgrades disponíveis
   */
  listAvailableUpgrades: publicProcedure.query(async () => {
    return [
      {
        id: "standard-1tb",
        name: "Standard 1TB",
        description: "Aumente seu armazenamento para 1TB",
        additionalPriceCents: UPGRADE_STANDARD_1TB.additionalPriceCents,
        newStorageLimitGb: UPGRADE_STANDARD_1TB.newStorageLimitGb,
      },
    ];
  }),

  /**
   * Ativar upgrade para uma conta
   */
  activateUpgrade: protectedProcedure
    .input(
      z.object({
        upgradeType: z.enum(["standard_1tb"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user.tenantId) {
        throw new Error("Tenant não encontrado");
      }

      // Verificar se já tem upgrade ativo
      const existingUpgrade = await db
        .select()
        .from(accountUpgrades)
        .where(
          and(
            eq(accountUpgrades.tenantId, ctx.user.tenantId),
            eq(accountUpgrades.status, "active")
          )
        )
        .limit(1);

      if (existingUpgrade.length > 0) {
        throw new Error("Você já possui um upgrade ativo");
      }

      // Criar novo upgrade
      await db.insert(accountUpgrades).values({
        tenantId: ctx.user.tenantId,
        upgradeType: input.upgradeType,
        additionalPriceCents: UPGRADE_STANDARD_1TB.additionalPriceCents,
        newStorageLimitGb: UPGRADE_STANDARD_1TB.newStorageLimitGb,
        status: "active",
      });

      // Atualizar limite de storage na subscription
      await db
        .update(subscriptions)
        .set({
          storageLimitGb: UPGRADE_STANDARD_1TB.newStorageLimitGb,
        })
        .where(eq(subscriptions.tenantId, ctx.user.tenantId));

      return {
        success: true,
        message: "Upgrade ativado com sucesso",
      };
    }),

  /**
   * Calcular faturamento e lucro
   */
  calculateFinancials: protectedProcedure
    .input(
      z.object({
        grossAmountCents: z.number(),
        stripeFeesCents: z.number().optional(),
        s3CostsCents: z.number().optional(),
        serverCostsCents: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const grossAmount = input.grossAmountCents;
      const stripeFees = input.stripeFeesCents || 0;
      const s3Costs = input.s3CostsCents || 0;
      const serverCosts = input.serverCostsCents || 0;

      // Calcular imposto (15% do bruto)
      const taxProvision = Math.round(grossAmount * 0.15);

      // Calcular lucro líquido
      const netProfit = grossAmount - stripeFees - taxProvision - s3Costs - serverCosts;

      return {
        grossAmountCents: grossAmount,
        stripeFeesCents: stripeFees,
        taxProvisionCents: taxProvision,
        s3CostsCents: s3Costs,
        serverCostsCents: serverCosts,
        netProfitCents: netProfit,
        profitMargin: ((netProfit / grossAmount) * 100).toFixed(2) + "%",
      };
    }),
});
