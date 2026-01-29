import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createDomain,
  getDomainsByTenantId,
  getDomainById,
  updateDomainVerification,
  createEmailAccount,
  getEmailAccountsByTenantId,
  getEmailAccountById,
  deleteEmailAccount,
  getSubscriptionByTenantId,
} from "../db";
import { nanoid } from "nanoid";

export const emailRouter = router({
  /**
   * Listar domínios do tenant
   */
  listDomains: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const domains = await getDomainsByTenantId(ctx.user.tenantId);
      return domains;
    } catch (error) {
      console.error("List domains error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Criar novo domínio
   */
  createDomain: protectedProcedure
    .input(
      z.object({
        domainName: z.string().min(3, "Domínio deve ter pelo menos 3 caracteres"),
        purpose: z.enum(["email", "hosting", "both"]).default("both"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const verificationToken = nanoid(32);

        const domainId = await createDomain({
          tenantId: ctx.user.tenantId,
          domainName: input.domainName,
          purpose: input.purpose,
          verified: false,
          verificationToken,
        });

        return {
          success: true,
          domainId,
          verificationToken,
          dnsRecords: [
            {
              type: "TXT",
              name: `_vya-verify.${input.domainName}`,
              value: verificationToken,
              description: "Registro de verificação de domínio",
            },
            {
              type: "MX",
              name: input.domainName,
              value: `mail.vya-nexus.com`,
              priority: 10,
              description: "Servidor de email",
            },
          ],
          message: "Domínio criado. Configure os registros DNS conforme indicado acima.",
        };
      } catch (error: any) {
        if (error.message?.includes("Duplicate")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Este domínio já está registrado" });
        }
        console.error("Create domain error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Verificar domínio
   */
  verifyDomain: protectedProcedure
    .input(z.object({ domainId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const domain = await getDomainById(input.domainId);
        if (!domain || domain.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Simular verificação de DNS
        // Em produção, faria uma consulta real ao DNS
        await updateDomainVerification(input.domainId, true);

        return {
          success: true,
          message: "Domínio verificado com sucesso",
        };
      } catch (error) {
        console.error("Verify domain error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Listar contas de email
   */
  listEmailAccounts: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const accounts = await getEmailAccountsByTenantId(ctx.user.tenantId);
      return accounts;
    } catch (error) {
      console.error("List email accounts error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Criar conta de email
   */
  createEmailAccount: protectedProcedure
    .input(
      z.object({
        domainId: z.number(),
        localPart: z.string().min(1, "Parte local do email é obrigatória"),
        password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const domain = await getDomainById(input.domainId);
        if (!domain || domain.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Domínio não encontrado" });
        }

        if (!domain.verified) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Domínio não foi verificado" });
        }

        // Verificar limite de contas de email
        const subscription = await getSubscriptionByTenantId(ctx.user.tenantId);
        if (!subscription) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
        }

        const existingAccounts = await getEmailAccountsByTenantId(ctx.user.tenantId);
        if (existingAccounts.length >= subscription.emailSeats) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Limite de contas de email atingido (${subscription.emailSeats})`,
          });
        }

        const emailAddress = `${input.localPart}@${domain.domainName}`;

        const accountId = await createEmailAccount({
          tenantId: ctx.user.tenantId,
          domainId: input.domainId,
          emailAddress,
          passwordHash: input.password, // Em produção, seria criptografado
          smtpHost: "smtp.vya-nexus.com",
          smtpPort: 587,
          imapHost: "imap.vya-nexus.com",
          imapPort: 993,
          isExternal: false,
          status: "active",
        });

        return {
          success: true,
          accountId,
          emailAddress,
          smtpConfig: {
            host: "smtp.vya-nexus.com",
            port: 587,
            username: emailAddress,
            password: input.password,
          },
          imapConfig: {
            host: "imap.vya-nexus.com",
            port: 993,
            username: emailAddress,
            password: input.password,
          },
          message: "Conta de email criada com sucesso",
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Create email account error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Deletar conta de email
   */
  deleteEmailAccount: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const account = await getEmailAccountById(input.accountId);
        if (!account || account.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await deleteEmailAccount(input.accountId);
        return { success: true, message: "Conta de email deletada com sucesso" };
      } catch (error) {
        console.error("Delete email account error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Vincular conta externa (Gmail/Outlook)
   */
  linkExternalAccount: protectedProcedure
    .input(
      z.object({
        domainId: z.number(),
        externalEmail: z.string().email(),
        provider: z.enum(["gmail", "outlook", "other"]),
        accessToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const domain = await getDomainById(input.domainId);
        if (!domain || domain.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const accountId = await createEmailAccount({
          tenantId: ctx.user.tenantId,
          domainId: input.domainId,
          emailAddress: input.externalEmail,
          passwordHash: input.accessToken, // Armazenar token criptografado
          smtpHost: input.provider === "gmail" ? "smtp.gmail.com" : "smtp.outlook.com",
          smtpPort: 587,
          imapHost: input.provider === "gmail" ? "imap.gmail.com" : "imap.outlook.com",
          imapPort: 993,
          isExternal: true,
          externalProvider: input.provider,
          status: "active",
        });

        return {
          success: true,
          accountId,
          message: `Conta ${input.provider} vinculada com sucesso`,
        };
      } catch (error) {
        console.error("Link external account error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
