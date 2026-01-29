import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  tenants, 
  InsertTenant,
  subscriptions,
  InsertSubscription,
  files,
  InsertFile,
  domains,
  InsertDomain,
  emailAccounts,
  InsertEmailAccount,
  hostedSites,
  InsertHostedSite,
  notifications,
  InsertNotification,
  chatConversations,
  InsertChatConversation,
  chatMessages,
  InsertChatMessage,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.tenantId !== undefined) {
      values.tenantId = user.tenantId;
      updateSet.tenantId = user.tenantId;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= TENANT HELPERS =============

export async function createTenant(tenant: InsertTenant) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tenants).values(tenant);
  return result[0].insertId;
}

export async function getTenantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTenantByOwnerId(ownerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tenants).where(eq(tenants.ownerId, ownerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllTenants() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tenants).orderBy(desc(tenants.createdAt));
}

export async function updateTenantStatus(id: number, status: "active" | "suspended" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tenants).set({ status, updatedAt: new Date() }).where(eq(tenants.id, id));
}

// ============= SUBSCRIPTION HELPERS =============

export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(subscription);
  return result[0].insertId;
}

export async function getSubscriptionByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(subscriptions).where(eq(subscriptions.tenantId, tenantId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptions).set({ ...data, updatedAt: new Date() }).where(eq(subscriptions.id, id));
}

export async function getAllActiveSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptions).where(eq(subscriptions.status, "active"));
}

// ============= FILE HELPERS =============

export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(files).values(file);
  return result[0].insertId;
}

export async function getFilesByTenantId(tenantId: number, folder?: string) {
  const db = await getDb();
  if (!db) return [];

  if (folder) {
    return await db.select().from(files)
      .where(and(eq(files.tenantId, tenantId), eq(files.folder, folder)))
      .orderBy(desc(files.createdAt));
  }

  return await db.select().from(files)
    .where(eq(files.tenantId, tenantId))
    .orderBy(desc(files.createdAt));
}

export async function getFileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(files).where(eq(files.id, id));
}

export async function getTenantStorageUsage(tenantId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ total: sql<number>`SUM(${files.fileSize})` })
    .from(files)
    .where(eq(files.tenantId, tenantId));

  return result[0]?.total || 0;
}

export async function searchFiles(tenantId: number, query: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(files)
    .where(and(
      eq(files.tenantId, tenantId),
      sql`${files.filename} LIKE ${`%${query}%`}`
    ))
    .orderBy(desc(files.createdAt));
}

// ============= DOMAIN HELPERS =============

export async function createDomain(domain: InsertDomain) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(domains).values(domain);
  return result[0].insertId;
}

export async function getDomainsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(domains)
    .where(eq(domains.tenantId, tenantId))
    .orderBy(desc(domains.createdAt));
}

export async function getDomainById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(domains).where(eq(domains.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDomainVerification(id: number, verified: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(domains).set({ verified, updatedAt: new Date() }).where(eq(domains.id, id));
}

// ============= EMAIL ACCOUNT HELPERS =============

export async function createEmailAccount(account: InsertEmailAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailAccounts).values(account);
  return result[0].insertId;
}

export async function getEmailAccountsByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(emailAccounts)
    .where(eq(emailAccounts.tenantId, tenantId))
    .orderBy(desc(emailAccounts.createdAt));
}

export async function getEmailAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(emailAccounts).where(eq(emailAccounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteEmailAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(emailAccounts).where(eq(emailAccounts.id, id));
}

// ============= HOSTED SITE HELPERS =============

export async function createHostedSite(site: InsertHostedSite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(hostedSites).values(site);
  return result[0].insertId;
}

export async function getHostedSitesByTenantId(tenantId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(hostedSites)
    .where(eq(hostedSites.tenantId, tenantId))
    .orderBy(desc(hostedSites.createdAt));
}

export async function getHostedSiteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(hostedSites).where(eq(hostedSites.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateHostedSiteSSL(id: number, sslEnabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(hostedSites).set({ 
    sslEnabled, 
    sslIssuedAt: sslEnabled ? new Date() : null,
    updatedAt: new Date() 
  }).where(eq(hostedSites.id, id));
}

// ============= NOTIFICATION HELPERS =============

export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  return result[0].insertId;
}

export async function getNotificationsByTenantId(tenantId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];

  if (unreadOnly) {
    return await db.select().from(notifications)
      .where(and(eq(notifications.tenantId, tenantId), eq(notifications.read, false)))
      .orderBy(desc(notifications.createdAt));
  }

  return await db.select().from(notifications)
    .where(eq(notifications.tenantId, tenantId))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

// ============= CHAT HELPERS =============

export async function createChatConversation(conversation: InsertChatConversation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatConversations).values(conversation);
  return result[0].insertId;
}

export async function getChatConversationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(chatConversations)
    .where(eq(chatConversations.userId, userId))
    .orderBy(desc(chatConversations.updatedAt));
}

export async function getChatConversationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createChatMessage(message: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatMessages).values(message);
  
  // Atualizar timestamp da conversa
  await db.update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(chatConversations.id, message.conversationId));
  
  return result[0].insertId;
}

export async function getChatMessagesByConversationId(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId))
    .orderBy(chatMessages.createdAt);
}
