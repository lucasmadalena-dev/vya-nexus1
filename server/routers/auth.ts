import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { 
  createTenant, 
  getTenantByOwnerId, 
  createSubscription, 
  upsertUser,
  getUserById,
  getDb,
} from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const authRouter = router({
  /**
   * Obter informações do usuário autenticado
   */
  me: publicProcedure.query(async (opts) => {
    if (!opts.ctx.user) return null;
    
    const user = await getUserById(opts.ctx.user.id);
    return user || null;
  }),

  /**
   * Logout do usuário
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const COOKIE_NAME = "manus_session";
    const cookieOptions = {
      secure: ctx.req.protocol === "https",
      sameSite: "none" as const,
      httpOnly: true,
      path: "/",
    };
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  /**
   * Completar onboarding do usuário
   * Cria um tenant e uma assinatura inicial
   */
  completeOnboarding: protectedProcedure
    .input(
      z.object({
        tenantName: z.string().min(1, "Nome da organização é obrigatório"),
        plan: z.enum(["starter", "professional", "enterprise"]),
        emailSeats: z.number().int().min(1).max(100),
        storageLimitGb: z.number().int().min(10).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      try {
        // Verificar se o usuário já tem um tenant
        const existingTenant = await getTenantByOwnerId(ctx.user.id);
        if (existingTenant) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Usuário já possui uma organização" 
          });
        }

        // Criar novo tenant
        const tenantId = await createTenant({
          name: input.tenantName,
          ownerId: ctx.user.id,
          status: "active",
        });

        // Atualizar usuário com tenantId
        await db.update(users).set({ tenantId }).where(eq(users.id, ctx.user.id));

        // Criar assinatura inicial (status: incomplete até pagamento)
        const planPrices: Record<string, number> = {
          starter: 2999, // R$ 29,99
          professional: 9999, // R$ 99,99
          enterprise: 29999, // R$ 299,99
        };

        await createSubscription({
          tenantId,
          plan: input.plan,
          emailSeats: input.emailSeats,
          storageLimitGb: input.storageLimitGb,
          status: "incomplete",
          monthlyPriceCents: planPrices[input.plan],
        });

        return {
          success: true,
          tenantId,
          message: "Onboarding concluído com sucesso. Prossiga para o pagamento.",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Onboarding error:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Erro ao completar onboarding" 
        });
      }
    }),

  /**
   * Obter informações do tenant do usuário
   */
  getTenant: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const tenant = await getTenantByOwnerId(ctx.user.id);
    return tenant || null;
  }),

  /**
   * Atualizar perfil do usuário
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      try {
        await db.update(users).set({
          name: input.name || ctx.user.name,
          email: input.email || ctx.user.email,
          updatedAt: new Date(),
        }).where(eq(users.id, ctx.user.id));

        return { success: true, message: "Perfil atualizado com sucesso" };
      } catch (error) {
        console.error("Profile update error:", error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Erro ao atualizar perfil" 
        });
      }
    }),
});
