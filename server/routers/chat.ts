import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createChatConversation,
  getChatConversationsByUserId,
  getChatConversationById,
  createChatMessage,
  getChatMessagesByConversationId,
} from "../db";
import { invokeLLM } from "../_core/llm";

const SYSTEM_PROMPT = `Você é um assistente inteligente do Vya Nexus, uma plataforma integrada de cloud storage, email profissional e hospedagem de sites.

Sua função é ajudar os usuários com:
1. Configuração de DNS e domínios
2. Uso da plataforma Vya Cloud, Vya Email e Vya Hosting
3. Troubleshooting de problemas com email e hosting
4. Explicar planos e funcionalidades
5. Guiar na configuração de contas de email profissionais

Sempre responda em Português do Brasil de forma clara, concisa e amigável.
Se o usuário fizer uma pergunta fora do escopo, redirecione gentilmente para o suporte.`;

export const chatRouter = router({
  /**
   * Criar nova conversa
   */
  createConversation: protectedProcedure
    .input(z.object({ title: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const conversationId = await createChatConversation({
          tenantId: ctx.user.tenantId,
          userId: ctx.user.id,
          title: input.title || "Nova Conversa",
        });

        return {
          success: true,
          conversationId,
        };
      } catch (error) {
        console.error("Create conversation error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Listar conversas do usuário
   */
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.tenantId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    try {
      const conversations = await getChatConversationsByUserId(ctx.user.id);
      return conversations;
    } catch (error) {
      console.error("List conversations error:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  /**
   * Obter mensagens de uma conversa
   */
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const conversation = await getChatConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const messages = await getChatMessagesByConversationId(input.conversationId);
        return messages;
      } catch (error) {
        console.error("Get messages error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  /**
   * Enviar mensagem e obter resposta do chatbot
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().min(1, "Mensagem não pode estar vazia"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user?.tenantId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      try {
        const conversation = await getChatConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Salvar mensagem do usuário
        await createChatMessage({
          conversationId: input.conversationId,
          role: "user",
          content: input.message,
        });

        // Obter histórico de mensagens
        const previousMessages = await getChatMessagesByConversationId(input.conversationId);

        // Preparar contexto para o LLM
        const messages = [
          { role: "system" as const, content: SYSTEM_PROMPT },
          ...previousMessages.map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
          })),
        ];

        // Invocar LLM
        const response = await invokeLLM({
          messages: messages as any,
        });

        const messageContent = response.choices[0]?.message?.content;
        const assistantMessage = typeof messageContent === 'string' ? messageContent : "Desculpe, não consegui processar sua mensagem.";

        // Salvar resposta do assistente
        if (assistantMessage) {
          await createChatMessage({
            conversationId: input.conversationId,
            role: "assistant",
            content: assistantMessage,
          });
        }

        return {
          success: true,
          userMessage: input.message,
          assistantMessage,
        };
      } catch (error) {
        console.error("Send message error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao processar mensagem",
        });
      }
    }),
});
