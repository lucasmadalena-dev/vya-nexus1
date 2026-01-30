import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tenants } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const onboardingRouter = router({
  completeWelcome: protectedProcedure
    .input(
      z.object({
        mode: z.enum(["complete", "storage_pro"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const tenant = await db
        .select()
        .from(tenants)
        .where(eq(tenants.ownerId, ctx.user.id))
        .limit(1);

      if (!tenant || tenant.length === 0) {
        throw new Error("Tenant not found");
      }

      const tenantId = tenant[0].id;

      // Atualizar modo de onboarding
      const isEmailActive = input.mode === "complete" ? 1 : 0;
      const storageBonusApplied = input.mode === "storage_pro" ? 1 : 0;

      await db
        .update(tenants)
        .set({
          onboardingMode: input.mode,
          isEmailActive,
          storageBonusApplied,
        })
        .where(eq(tenants.id, tenantId));

      return {
        success: true,
        mode: input.mode,
        tenantId,
      };
    }),

  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const tenant = await db
      .select()
      .from(tenants)
      .where(eq(tenants.ownerId, ctx.user.id))
      .limit(1);

    if (!tenant || tenant.length === 0) {
      return null;
    }

    return {
      mode: tenant[0].onboardingMode,
      isEmailActive: tenant[0].isEmailActive === 1,
      storageBonusApplied: tenant[0].storageBonusApplied === 1,
    };
  }),
});
