import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { affiliates } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe"; // @ts-ignore

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Gerar código de cupom único
 */
function generateCouponCode(): string {
  return `VYA${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export const affiliatesRouter = router({
  /**
   * Registrar novo afiliado (influenciador)
   */
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.string().email("Email inválido"),
        instagramHandle: z.string().optional(),
        youtubeChannel: z.string().url("URL do YouTube inválida").optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Banco de dados não disponível");
      }

      try {
        // Gerar código de cupom único
        const couponCode = generateCouponCode();

        // Criar cupom no Stripe (10% de desconto)
        const stripeCoupon = await stripe.coupons.create({
          percent_off: 10,
          duration: "forever",
          id: couponCode,
          metadata: {
            affiliateEmail: input.email,
            affiliateName: input.name,
          },
        });

        // Inserir afiliado no banco de dados
        const result = await db.insert(affiliates).values({
          name: input.name,
          email: input.email,
          instagramHandle: input.instagramHandle,
          youtubeChannel: input.youtubeChannel,
          couponCode: couponCode,
          stripeCouponId: stripeCoupon.id,
          discountPercentage: 10,
          commissionPercentage: 30,
          status: "pending",
        });

        return {
          success: true,
          message: "Cadastro enviado com sucesso! Aguarde aprovação.",
          couponCode: couponCode,
          affiliateId: (result as any).insertId,
        };
      } catch (error) {
        console.error("Erro ao registrar afiliado:", error);
        throw new Error("Erro ao registrar afiliado. Tente novamente.");
      }
    }),

  /**
   * Obter detalhes de um afiliado
   */
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Banco de dados não disponível");
      }

      const result = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.email, input.email))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),

  /**
   * Listar todos os afiliados (admin)
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user?.role !== "admin") {
      throw new Error("Acesso negado");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Banco de dados não disponível");
    }

    return await db.select().from(affiliates);
  }),

  /**
   * Aprovar afiliado (admin)
   */
  approve: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Banco de dados não disponível");
      }

      await db
        .update(affiliates)
        .set({ status: "approved" })
        .where(eq(affiliates.id, input.affiliateId));

      return { success: true, message: "Afiliado aprovado com sucesso!" };
    }),

  /**
   * Rejeitar afiliado (admin)
   */
  reject: protectedProcedure
    .input(z.object({ affiliateId: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== "admin") {
        throw new Error("Acesso negado");
      }

      const db = await getDb();
      if (!db) {
        throw new Error("Banco de dados não disponível");
      }

      await db
        .update(affiliates)
        .set({
          status: "rejected",
          adminNotes: input.reason || "Rejeitado pelo administrador",
        })
        .where(eq(affiliates.id, input.affiliateId));

      return { success: true, message: "Afiliado rejeitado." };
    }),

  /**
   * Obter estatísticas de um afiliado
   */
  getStats: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Banco de dados não disponível");
      }

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, input.affiliateId))
        .limit(1);

      if (affiliate.length === 0) {
        throw new Error("Afiliado não encontrado");
      }

      const data = affiliate[0];

      return {
        name: data.name,
        email: data.email,
        couponCode: data.couponCode,
        discountPercentage: data.discountPercentage,
        commissionPercentage: data.commissionPercentage,
        referredCustomers: data.referredCustomers,
        totalCommissionBRL: (data.totalCommissionCents / 100).toFixed(2),
        status: data.status,
      };
    }),
});
