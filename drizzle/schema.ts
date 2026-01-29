import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  /** ID do tenant ao qual o usuário pertence */
  tenantId: int("tenantId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de Tenants (Organizações/Clientes)
 * Cada tenant representa uma organização ou cliente individual na plataforma
 */
export const tenants = mysqlTable("tenants", {
  id: int("id").autoincrement().primaryKey(),
  /** Nome da organização/empresa */
  name: varchar("name", { length: 255 }).notNull(),
  /** ID do usuário dono do tenant */
  ownerId: int("ownerId").notNull(),
  /** Status do tenant */
  status: mysqlEnum("status", ["active", "suspended", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Tabela de Assinaturas (Subscriptions)
 * Gerencia os planos e pagamentos dos tenants
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  /** ID do cliente no Stripe */
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  /** ID da assinatura no Stripe */
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  /** Plano contratado */
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise"]).default("starter").notNull(),
  /** Quantidade de contas de email contratadas */
  emailSeats: int("emailSeats").default(1).notNull(),
  /** Limite de armazenamento em GB */
  storageLimitGb: int("storageLimitGb").default(10).notNull(),
  /** Status da assinatura */
  status: mysqlEnum("status", ["active", "past_due", "cancelled", "incomplete"]).default("incomplete").notNull(),
  /** Valor mensal em centavos */
  monthlyPriceCents: int("monthlyPriceCents").default(0).notNull(),
  /** Data de início da assinatura */
  currentPeriodStart: timestamp("currentPeriodStart"),
  /** Data de término do período atual */
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Tabela de Arquivos (Vya Cloud)
 * Armazena metadados dos arquivos no storage S3
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  /** Nome do arquivo */
  filename: varchar("filename", { length: 255 }).notNull(),
  /** Chave do arquivo no S3 */
  fileKey: varchar("fileKey", { length: 1024 }).notNull(),
  /** URL pública do arquivo */
  fileUrl: text("fileUrl").notNull(),
  /** Tamanho do arquivo em bytes */
  fileSize: bigint("fileSize", { mode: "number" }).notNull(),
  /** Tipo MIME do arquivo */
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  /** Pasta/diretório do arquivo */
  folder: varchar("folder", { length: 500 }).default("/").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type File = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

/**
 * Tabela de Domínios
 * Gerencia domínios customizados dos tenants
 */
export const domains = mysqlTable("domains", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  /** Nome do domínio (ex: exemplo.com.br) */
  domainName: varchar("domainName", { length: 255 }).notNull().unique(),
  /** Se o domínio foi verificado via DNS */
  verified: boolean("verified").default(false).notNull(),
  /** Tipo de uso do domínio */
  purpose: mysqlEnum("purpose", ["email", "hosting", "both"]).default("both").notNull(),
  /** Token de verificação DNS */
  verificationToken: varchar("verificationToken", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = typeof domains.$inferInsert;

/**
 * Tabela de Contas de Email (Vya Email)
 * Gerencia contas de email profissionais
 */
export const emailAccounts = mysqlTable("emailAccounts", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  domainId: int("domainId").notNull(),
  /** Endereço de email completo */
  emailAddress: varchar("emailAddress", { length: 255 }).notNull().unique(),
  /** Senha criptografada (para acesso SMTP/IMAP) */
  passwordHash: varchar("passwordHash", { length: 255 }),
  /** Configurações SMTP */
  smtpHost: varchar("smtpHost", { length: 255 }).default("smtp.vya-nexus.com").notNull(),
  smtpPort: int("smtpPort").default(587).notNull(),
  /** Configurações IMAP */
  imapHost: varchar("imapHost", { length: 255 }).default("imap.vya-nexus.com").notNull(),
  imapPort: int("imapPort").default(993).notNull(),
  /** Se é uma conta vinculada externa (Gmail/Outlook) */
  isExternal: boolean("isExternal").default(false).notNull(),
  /** Provedor externo se aplicável */
  externalProvider: mysqlEnum("externalProvider", ["gmail", "outlook", "other"]),
  /** Status da conta */
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = typeof emailAccounts.$inferInsert;

/**
 * Tabela de Sites Hospedados (Vya Hosting)
 * Gerencia sites estáticos hospedados na plataforma
 */
export const hostedSites = mysqlTable("hostedSites", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  domainId: int("domainId"),
  /** Nome do site */
  siteName: varchar("siteName", { length: 255 }).notNull(),
  /** Subdomínio gerado automaticamente */
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
  /** Chave da pasta raiz no S3 */
  rootFolderKey: varchar("rootFolderKey", { length: 1024 }).notNull(),
  /** URL pública do site */
  siteUrl: text("siteUrl").notNull(),
  /** Se possui certificado SSL ativo */
  sslEnabled: boolean("sslEnabled").default(false).notNull(),
  /** Data de emissão do certificado SSL */
  sslIssuedAt: timestamp("sslIssuedAt"),
  /** Status do site */
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HostedSite = typeof hostedSites.$inferSelect;
export type InsertHostedSite = typeof hostedSites.$inferInsert;

/**
 * Tabela de Notificações
 * Registra notificações enviadas aos usuários
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId"),
  /** Tipo de notificação */
  type: mysqlEnum("type", ["billing", "storage_limit", "new_user", "critical", "info"]).notNull(),
  /** Título da notificação */
  title: varchar("title", { length: 255 }).notNull(),
  /** Conteúdo da notificação */
  message: text("message").notNull(),
  /** Se foi lida */
  read: boolean("read").default(false).notNull(),
  /** Se foi enviada por email */
  emailSent: boolean("emailSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Tabela de Conversas do Chatbot
 * Armazena histórico de conversas com o chatbot
 */
export const chatConversations = mysqlTable("chatConversations", {
  id: int("id").autoincrement().primaryKey(),
  tenantId: int("tenantId").notNull(),
  userId: int("userId").notNull(),
  /** Título da conversa */
  title: varchar("title", { length: 255 }).default("Nova Conversa").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

/**
 * Tabela de Mensagens do Chatbot
 * Armazena mensagens individuais das conversas
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  /** Papel da mensagem (usuário ou assistente) */
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  /** Conteúdo da mensagem */
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
