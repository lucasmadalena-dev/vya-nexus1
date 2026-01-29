import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createFile,
  getFilesByTenantId,
  getFileById,
  deleteFile,
  getTenantStorageUsage,
  searchFiles,
  getSubscriptionByTenantId,
} from "../db";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";

export const cloudRouter = router({
  /**
   * Listar arquivos do tenant
   */
  listFiles: protectedProcedure
    .input(z.object({ folder: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const files = await getFilesByTenantId(ctx.user.tenantId, input.folder);
        return files;
      } catch (error) {
        console.error("List files error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter URL pré-assinada para upload
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Verificar limite de storage
      const subscription = await getSubscriptionByTenantId(ctx.user.tenantId);
      if (!subscription) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
      }

      const storageUsed = await getTenantStorageUsage(ctx.user.tenantId);
      const storageLimit = subscription.storageLimitGb * 1024 * 1024 * 1024; // Convert GB to bytes

      if (storageUsed + input.fileSize > storageLimit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Limite de armazenamento atingido. Você tem ${storageUsed / (1024 * 1024 * 1024)}GB de ${subscription.storageLimitGb}GB`,
        });
      }

      try {
        // Gerar chave única para o arquivo
        const fileId = nanoid();
        const fileKey = `${ctx.user.tenantId}/${fileId}-${input.filename}`;

        // Simular URL de upload (em produção, seria uma URL pré-assinada do S3)
        return {
          fileKey,
          uploadUrl: `${process.env.VITE_FRONTEND_URL || "http://localhost:5173"}/api/upload?key=${fileKey}`,
          fileId,
        };
      } catch (error) {
        console.error("Get upload URL error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Registrar arquivo após upload
   */
  registerFile: protectedProcedure
    .input(
      z.object({
        fileKey: z.string(),
        filename: z.string(),
        mimeType: z.string(),
        fileSize: z.number(),
        folder: z.string().default("/"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const fileUrl = `${process.env.VITE_FRONTEND_URL || "http://localhost:5173"}/files/${input.fileKey}`;

        const fileId = await createFile({
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
          filename: input.filename,
          fileKey: input.fileKey,
          fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          folder: input.folder,
        });

        return {
          success: true,
          fileId,
          message: "Arquivo registrado com sucesso",
        };
      } catch (error) {
        console.error("Register file error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter detalhes de um arquivo
   */
  getFile: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const file = await getFileById(input.fileId);
        if (!file || file.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return file;
      } catch (error) {
        console.error("Get file error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Deletar arquivo
   */
  deleteFile: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const file = await getFileById(input.fileId);
        if (!file || file.tenantId !== ctx.user.tenantId) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await deleteFile(input.fileId);
        return { success: true, message: "Arquivo deletado com sucesso" };
      } catch (error) {
        console.error("Delete file error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Obter uso de storage
   */
  getStorageUsage: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const subscription = await getSubscriptionByTenantId(ctx.user.tenantId);
      if (!subscription) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const storageUsed = await getTenantStorageUsage(ctx.user.tenantId);
      const storageLimit = subscription.storageLimitGb * 1024 * 1024 * 1024;

      return {
        used: storageUsed,
        limit: storageLimit,
        usedGb: Math.round((storageUsed / (1024 * 1024 * 1024)) * 100) / 100,
        limitGb: subscription.storageLimitGb,
        percentage: Math.round((storageUsed / storageLimit) * 100),
      };
    } catch (error) {
      console.error("Get storage usage error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Buscar arquivos
   */
  searchFiles: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const files = await searchFiles(ctx.user.tenantId, input.query);
        return files;
      } catch (error) {
        console.error("Search files error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
});
