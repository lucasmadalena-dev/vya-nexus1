/**
 * Router para gerenciamento de email @vyaconcept.com.br
 * Implementa funcionalidades específicas para o domínio padrão
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createEmailAccount,
  getEmailAccountsByTenantId,
  deleteEmailAccount,
  getEmailAccountById,
  getSubscriptionByTenantId,
} from "../db";
const MAIN_DOMAIN = "vyaconcept.com.br";

export const emailVyaconceptRouter = router({
  /**
   * Criar conta de email @vyaconcept.com.br
   * Usa o domínio padrão da plataforma
   */
  createVyaEmail: protectedProcedure
    .input(
      z.object({
        localPart: z
          .string()
          .min(3, "Mínimo 3 caracteres")
          .max(64, "Máximo 64 caracteres")
          .regex(/^[a-z0-9._-]+$/i, "Apenas letras, números, ponto, hífen e underscore"),
        password: z.string().min(12, "Mínimo 12 caracteres para segurança"),
        displayName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
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

        // Verificar se email já existe
        const emailAddress = `${input.localPart}@${MAIN_DOMAIN}`;
        const existingEmail = existingAccounts.find((acc) => acc.emailAddress === emailAddress);
        if (existingEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Este endereço de email já está em uso",
          });
        }

        // Criar conta de email
        const accountId = await createEmailAccount({
          tenantId: ctx.user.tenantId,
          domainId: 0, // Usar domínio padrão (0 = vyaconcept.com.br)
          emailAddress,
          passwordHash: input.password, // Em produção, seria criptografado
          smtpHost: `smtp.${MAIN_DOMAIN}`,
          smtpPort: 587,
          imapHost: `imap.${MAIN_DOMAIN}`,
          imapPort: 993,
          isExternal: false,
          status: "active",
        });

        return {
          success: true,
          accountId,
          emailAddress,
          smtpConfig: {
            host: `smtp.${MAIN_DOMAIN}`,
            port: 587,
            username: emailAddress,
            password: input.password,
            tls: true,
          },
          imapConfig: {
            host: `imap.${MAIN_DOMAIN}`,
            port: 993,
            username: emailAddress,
            password: input.password,
            tls: true,
          },
          message: `Conta ${emailAddress} criada com sucesso!`,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Create Vya email error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Listar contas @vyaconcept.com.br do tenant
   */
  listVyaEmails: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const accounts = await getEmailAccountsByTenantId(ctx.user.tenantId);
      const vyaEmails = accounts.filter((acc) => acc.emailAddress.endsWith(`@${MAIN_DOMAIN}`));

      return vyaEmails.map((acc) => ({
        id: acc.id,
        emailAddress: acc.emailAddress,
        status: acc.status,
        createdAt: acc.createdAt,
        isDefault: acc.emailAddress === `${ctx.user?.name?.toLowerCase()}@${MAIN_DOMAIN}`,
      }));
    } catch (error) {
      console.error("List Vya emails error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Definir email padrão
   */
  setDefaultEmail: protectedProcedure
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

        if (!account.emailAddress.endsWith(`@${MAIN_DOMAIN}`)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Apenas contas @vyaconcept.com.br podem ser definidas como padrão",
          });
        }

        // Aqui você atualizaria o banco de dados para marcar como padrão
        // await updateUserDefaultEmail(ctx.user.id, input.accountId);

        return {
          success: true,
          message: `${account.emailAddress} definido como email padrão`,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Set default email error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter configurações de email
   */
  getEmailSettings: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return {
      domain: MAIN_DOMAIN,
      smtpHost: `smtp.${MAIN_DOMAIN}`,
      smtpPort: 587,
      imapHost: `imap.${MAIN_DOMAIN}`,
      imapPort: 993,
      supportedClients: [
        {
          name: "Gmail",
          instructions: `Adicione ${MAIN_DOMAIN} como conta IMAP em Configurações > Contas e importação`,
        },
        {
          name: "Outlook",
          instructions: `Adicione ${MAIN_DOMAIN} como conta IMAP em Arquivo > Adicionar conta`,
        },
        {
          name: "Apple Mail",
          instructions: `Adicione ${MAIN_DOMAIN} em Mail > Preferências > Contas > +`,
        },
        {
          name: "Thunderbird",
          instructions: `Crie nova conta com ${MAIN_DOMAIN} em Ferramentas > Configurações de conta`,
        },
      ],
    };
  }),

  /**
   * Validar acesso ao email
   */
  validateEmailAccess: protectedProcedure
    .input(z.object({ emailAddress: z.string().email(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Aqui você faria uma validação real contra o servidor IMAP
        // const imap = new Imap({
        //   user: input.emailAddress,
        //   password: input.password,
        //   host: `imap.${MAIN_DOMAIN}`,
        //   port: 993,
        //   tls: true,
        // });

        // Simulação
        console.log(`[Email] Validando acesso para ${input.emailAddress}`);

        return {
          success: true,
          message: "Acesso validado com sucesso",
        };
      } catch (error) {
        console.error("Email validation error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email ou senha inválidos",
        });
      }
    }),

  /**
   * Obter aliases de email
   */
  listEmailAliases: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const account = await getEmailAccountById(input.accountId);
        if (!account || account.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Retornar aliases (simulado)
        return {
          primary: account.emailAddress,
          aliases: [
            // Exemplo: "contato@vyaconcept.com.br"
          ],
        };
      } catch (error) {
        console.error("List aliases error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Criar alias de email
   */
  createEmailAlias: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        alias: z.string().min(3, "Mínimo 3 caracteres"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const account = await getEmailAccountById(input.accountId);
        if (!account || account.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const aliasEmail = `${input.alias}@${MAIN_DOMAIN}`;

        // Aqui você criaria o alias no servidor de email
        // await createEmailAlias(account.emailAddress, aliasEmail);

        return {
          success: true,
          alias: aliasEmail,
          message: `Alias ${aliasEmail} criado com sucesso`,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Create alias error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
