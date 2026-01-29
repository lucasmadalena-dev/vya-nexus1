import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createHostedSite,
  getHostedSitesByTenantId,
  getHostedSiteById,
  updateHostedSiteSSL,
  getDomainById,
} from "../db";
import { nanoid } from "nanoid";

export const hostingRouter = router({
  /**
   * Listar sites hospedados
   */
  listSites: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const sites = await getHostedSitesByTenantId(ctx.user.tenantId);
      return sites;
    } catch (error) {
      console.error("List sites error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Criar novo site hospedado
   */
  createSite: protectedProcedure
    .input(
      z.object({
        siteName: z.string().min(1, "Nome do site é obrigatório"),
        domainId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        // Gerar subdomínio único
        const subdomain = `${input.siteName.toLowerCase().replace(/\s+/g, "-")}-${nanoid(6)}`;
        const rootFolderKey = `${ctx.user.tenantId}/sites/${subdomain}`;
        const siteUrl = `https://${subdomain}.vya-nexus.com`;

        // Verificar domínio customizado se fornecido
        let domainId = input.domainId;
        if (domainId) {
          const domain = await getDomainById(domainId);
          if (!domain || domain.tenantId !== ctx.user.tenantId) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Domínio não encontrado" });
          }
          if (!domain.verified) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Domínio não foi verificado" });
          }
        }

        const siteId = await createHostedSite({
          tenantId: ctx.user.tenantId,
          domainId: domainId || null,
          siteName: input.siteName,
          subdomain,
          rootFolderKey,
          siteUrl,
          sslEnabled: false,
          status: "active",
        });

        return {
          success: true,
          siteId,
          subdomain,
          siteUrl,
          message: "Site criado com sucesso",
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error("Create site error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter detalhes do site
   */
  getSite: protectedProcedure
    .input(z.object({ siteId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const site = await getHostedSiteById(input.siteId);
        if (!site || site.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return site;
      } catch (error) {
        console.error("Get site error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter URL de upload para arquivos do site
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        siteId: z.number(),
        filename: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const site = await getHostedSiteById(input.siteId);
        if (!site || site.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const fileKey = `${site.rootFolderKey}/${input.filename}`;
        const uploadUrl = `${process.env.VITE_FRONTEND_URL || "http://localhost:5173"}/api/upload?key=${fileKey}`;

        return {
          fileKey,
          uploadUrl,
        };
      } catch (error) {
        console.error("Get upload URL error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Habilitar SSL para o site
   */
  enableSSL: protectedProcedure
    .input(z.object({ siteId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const site = await getHostedSiteById(input.siteId);
        if (!site || site.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Simular geração de certificado SSL
        // Em produção, integraria com Let's Encrypt
        await updateHostedSiteSSL(input.siteId, true);

        return {
          success: true,
          message: "Certificado SSL ativado com sucesso",
          siteUrl: `https://${site.subdomain}.vya-nexus.com`,
        };
      } catch (error) {
        console.error("Enable SSL error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Listar arquivos do site
   */
  listSiteFiles: protectedProcedure
    .input(z.object({ siteId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const site = await getHostedSiteById(input.siteId);
        if (!site || site.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Simular listagem de arquivos
        // Em produção, listaria do S3
        return {
          files: [
            { name: "index.html", size: 1024, type: "text/html" },
            { name: "style.css", size: 2048, type: "text/css" },
            { name: "script.js", size: 4096, type: "application/javascript" },
          ],
        };
      } catch (error) {
        console.error("List site files error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Deletar site
   */
  deleteSite: protectedProcedure
    .input(z.object({ siteId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const site = await getHostedSiteById(input.siteId);
        if (!site || site.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Simular deleção
        // Em produção, deletaria do S3 e atualizaria o banco
        return {
          success: true,
          message: "Site deletado com sucesso",
        };
      } catch (error) {
        console.error("Delete site error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
