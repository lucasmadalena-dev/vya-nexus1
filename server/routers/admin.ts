import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getAllTenants,
  getTenantById,
  updateTenantStatus,
  getAllActiveSubscriptions,
  getTenantStorageUsage,
  getNotificationsByTenantId,
  createNotification,
} from "../db";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Middleware para verificar se é admin
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem acessar" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Obter visão geral do dashboard administrativo
   */
  getDashboardOverview: adminProcedure.query(async ({ ctx }) => {
    try {
      const tenants = await getAllTenants();
      const subscriptions = await getAllActiveSubscriptions();

      // Calcular métricas
      const totalUsers = tenants.length;
      const activeSubscriptions = subscriptions.length;
      const totalStorageUsed = await Promise.all(
        tenants.map(async (tenant) => {
          const usage = await getTenantStorageUsage(tenant.id);
          return usage;
        })
      ).then((usages) => usages.reduce((a, b) => a + b, 0));

      // Calcular receita mensal
      const monthlyRevenue = subscriptions.reduce((sum, sub) => {
        return sum + (sub.monthlyPriceCents || 0);
      }, 0);

      return {
        totalUsers,
        activeSubscriptions,
        totalStorageUsedGb: Math.round((totalStorageUsed / (1024 * 1024 * 1024)) * 100) / 100,
        monthlyRevenueR$: (monthlyRevenue / 100).toFixed(2),
        tenants: tenants.map((t) => ({
          id: t.id,
          name: t.name,
          status: t.status,
          createdAt: t.createdAt,
        })),
      };
    } catch (error) {
      console.error("Dashboard overview error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Listar todos os tenants
   */
  listTenants: adminProcedure
    .input(
      z.object({
        status: z.enum(["active", "suspended", "cancelled"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const tenants = await getAllTenants();

        let filtered = tenants;
        if (input.status) {
          filtered = tenants.filter((t) => t.status === input.status);
        }

        const paginated = filtered.slice(input.offset, input.offset + input.limit);

        return {
          tenants: paginated,
          total: filtered.length,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error("List tenants error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter detalhes de um tenant
   */
  getTenantDetails: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .query(async ({ input }) => {
      try {
        const tenant = await getTenantById(input.tenantId);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const storageUsed = await getTenantStorageUsage(input.tenantId);
        const db = await getDb();
        const tenantUsers = db ? await db.select().from(users).where(eq(users.tenantId, input.tenantId)) : [];

        return {
          ...tenant,
          storageUsedGb: Math.round((storageUsed / (1024 * 1024 * 1024)) * 100) / 100,
          userCount: tenantUsers.length,
        };
      } catch (error) {
        console.error("Get tenant details error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Suspender tenant
   */
  suspendTenant: adminProcedure
    .input(z.object({ tenantId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const tenant = await getTenantById(input.tenantId);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await updateTenantStatus(input.tenantId, "suspended");

        // Criar notificação
        await createNotification({
          tenantId: input.tenantId,
          type: "critical",
          title: "Conta Suspensa",
          message: `Sua conta foi suspensa. Motivo: ${input.reason || "Não especificado"}. Entre em contato com o suporte.`,
        });

        return { success: true, message: "Tenant suspenso com sucesso" };
      } catch (error) {
        console.error("Suspend tenant error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Reativar tenant
   */
  reactivateTenant: adminProcedure
    .input(z.object({ tenantId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const tenant = await getTenantById(input.tenantId);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await updateTenantStatus(input.tenantId, "active");

        // Criar notificação
        await createNotification({
          tenantId: input.tenantId,
          type: "info",
          title: "Conta Reativada",
          message: "Sua conta foi reativada com sucesso.",
        });

        return { success: true, message: "Tenant reativado com sucesso" };
      } catch (error) {
        console.error("Reactivate tenant error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter relatório de faturamento
   */
  getBillingReport: adminProcedure
    .input(
      z.object({
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const subscriptions = await getAllActiveSubscriptions();

        const report = {
          totalSubscriptions: subscriptions.length,
          totalMonthlyRevenue: (
            subscriptions.reduce((sum, sub) => sum + (sub.monthlyPriceCents || 0), 0) / 100
          ).toFixed(2),
          planDistribution: {
            starter: subscriptions.filter((s) => s.plan === "starter").length,
            professional: subscriptions.filter((s) => s.plan === "professional").length,
            enterprise: subscriptions.filter((s) => s.plan === "enterprise").length,
          },
          subscriptionsByStatus: {
            active: subscriptions.filter((s) => s.status === "active").length,
            past_due: subscriptions.filter((s) => s.status === "past_due").length,
            cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
          },
        };

        return report;
      } catch (error) {
        console.error("Billing report error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter notificações do sistema
   */
  getSystemNotifications: adminProcedure.query(async ({ ctx }) => {
    try {
      // Buscar notificações de todos os tenants
      const tenants = await getAllTenants();
      const allNotifications = await Promise.all(
        tenants.map((t) => getNotificationsByTenantId(t.id, false))
      ).then((notifications) => notifications.flat());

      return allNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 50);
    } catch (error) {
      console.error("Get system notifications error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Enviar notificação para um tenant
   */
  sendNotification: adminProcedure
    .input(
      z.object({
        tenantId: z.number(),
        type: z.enum(["billing", "storage_limit", "new_user", "critical", "info"]),
        title: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const tenant = await getTenantById(input.tenantId);
        if (!tenant) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await createNotification({
          tenantId: input.tenantId,
          type: input.type,
          title: input.title,
          message: input.message,
        });

        return { success: true, message: "Notificação enviada com sucesso" };
      } catch (error) {
        console.error("Send notification error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
