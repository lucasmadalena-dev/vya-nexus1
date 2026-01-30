-- ============================================================================
-- VYA NEXUS - DATABASE INITIALIZATION SCRIPT
-- Complete SQL Schema with all tables, relations, and indexes
-- ============================================================================
-- Generated: 30 de Janeiro de 2026
-- Database: MySQL 8.0+ / TiDB
-- ============================================================================

-- ============================================================================
-- 1. USERS TABLE - Usuários da plataforma (autenticação OAuth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`tenantId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	INDEX `idx_users_tenantId` (`tenantId`),
	INDEX `idx_users_role` (`role`)
);

-- ============================================================================
-- 2. TENANTS TABLE - Organizações/Clientes (Multi-tenant)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`ownerId` int NOT NULL,
	`status` enum('active','suspended','cancelled') NOT NULL DEFAULT 'active',
	`onboardingMode` enum('complete','storage_pro') DEFAULT 'complete',
	`isEmailActive` int DEFAULT 1,
	`storageBonusApplied` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`),
	INDEX `idx_tenants_ownerId` (`ownerId`),
	INDEX `idx_tenants_status` (`status`)
);

-- ============================================================================
-- 3. SUBSCRIPTIONS TABLE - Assinaturas e Planos
-- ============================================================================
CREATE TABLE IF NOT EXISTS `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`plan` enum('starter','professional','enterprise') NOT NULL DEFAULT 'starter',
	`emailSeats` int NOT NULL DEFAULT 1,
	`storageLimitGb` int NOT NULL DEFAULT 10,
	`status` enum('active','past_due','cancelled','incomplete') NOT NULL DEFAULT 'incomplete',
	`monthlyPriceCents` int NOT NULL DEFAULT 0,
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	INDEX `idx_subscriptions_tenantId` (`tenantId`),
	INDEX `idx_subscriptions_stripeCustomerId` (`stripeCustomerId`),
	INDEX `idx_subscriptions_status` (`status`)
);

-- ============================================================================
-- 4. FILES TABLE - Arquivos no Vya Cloud (Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`fileKey` varchar(1024) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileSize` bigint NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`folder` varchar(500) NOT NULL DEFAULT '/',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `files_id` PRIMARY KEY(`id`),
	INDEX `idx_files_tenantId` (`tenantId`),
	INDEX `idx_files_userId` (`userId`),
	INDEX `idx_files_folder` (`folder`)
);

-- ============================================================================
-- 5. DOMAINS TABLE - Domínios Customizados
-- ============================================================================
CREATE TABLE IF NOT EXISTS `domains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`domainName` varchar(255) NOT NULL,
	`verified` boolean NOT NULL DEFAULT false,
	`purpose` enum('email','hosting','both') NOT NULL DEFAULT 'both',
	`verificationToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `domains_domainName_unique` UNIQUE(`domainName`),
	INDEX `idx_domains_tenantId` (`tenantId`),
	INDEX `idx_domains_verified` (`verified`)
);

-- ============================================================================
-- 6. EMAIL_ACCOUNTS TABLE - Contas de Email Profissionais
-- ============================================================================
CREATE TABLE IF NOT EXISTS `emailAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`domainId` int NOT NULL,
	`emailAddress` varchar(255) NOT NULL,
	`passwordHash` varchar(255),
	`smtpHost` varchar(255) NOT NULL DEFAULT 'smtp.vya-nexus.com',
	`smtpPort` int NOT NULL DEFAULT 587,
	`imapHost` varchar(255) NOT NULL DEFAULT 'imap.vya-nexus.com',
	`imapPort` int NOT NULL DEFAULT 993,
	`isExternal` boolean NOT NULL DEFAULT false,
	`externalProvider` enum('gmail','outlook','other'),
	`status` enum('active','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emailAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `emailAccounts_emailAddress_unique` UNIQUE(`emailAddress`),
	INDEX `idx_emailAccounts_tenantId` (`tenantId`),
	INDEX `idx_emailAccounts_domainId` (`domainId`),
	INDEX `idx_emailAccounts_status` (`status`)
);

-- ============================================================================
-- 7. HOSTED_SITES TABLE - Sites Hospedados (Vya Hosting)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `hostedSites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`domainId` int,
	`siteName` varchar(255) NOT NULL,
	`subdomain` varchar(100) NOT NULL,
	`rootFolderKey` varchar(1024) NOT NULL,
	`siteUrl` text NOT NULL,
	`sslEnabled` boolean NOT NULL DEFAULT false,
	`sslIssuedAt` timestamp,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hostedSites_id` PRIMARY KEY(`id`),
	CONSTRAINT `hostedSites_subdomain_unique` UNIQUE(`subdomain`),
	INDEX `idx_hostedSites_tenantId` (`tenantId`),
	INDEX `idx_hostedSites_domainId` (`domainId`)
);

-- ============================================================================
-- 8. NOTIFICATIONS TABLE - Notificações do Sistema
-- ============================================================================
CREATE TABLE IF NOT EXISTS `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int,
	`type` enum('billing','storage_limit','new_user','critical','info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`emailSent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`),
	INDEX `idx_notifications_tenantId` (`tenantId`),
	INDEX `idx_notifications_userId` (`userId`),
	INDEX `idx_notifications_type` (`type`)
);

-- ============================================================================
-- 9. CHAT_CONVERSATIONS TABLE - Conversas com Chatbot
-- ============================================================================
CREATE TABLE IF NOT EXISTS `chatConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL DEFAULT 'Nova Conversa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `chatConversations_id` PRIMARY KEY(`id`),
	INDEX `idx_chatConversations_tenantId` (`tenantId`),
	INDEX `idx_chatConversations_userId` (`userId`)
);

-- ============================================================================
-- 10. CHAT_MESSAGES TABLE - Mensagens do Chatbot
-- ============================================================================
CREATE TABLE IF NOT EXISTS `chatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chatMessages_id` PRIMARY KEY(`id`),
	INDEX `idx_chatMessages_conversationId` (`conversationId`)
);

-- ============================================================================
-- 11. PLANS TABLE - Planos Comerciais Disponíveis
-- ============================================================================
CREATE TABLE IF NOT EXISTS `plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`priceMonthCents` int NOT NULL,
	`emailSeats` int NOT NULL,
	`storagePerAccountGb` int NOT NULL,
	`humanSupport` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_name_unique` UNIQUE(`name`),
	INDEX `idx_plans_active` (`active`)
);

-- ============================================================================
-- 12. SUPPORT_TICKETS TABLE - Tickets de Suporte
-- ============================================================================
CREATE TABLE IF NOT EXISTS `supportTickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`supportType` enum('email','chat') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supportTickets_id` PRIMARY KEY(`id`),
	INDEX `idx_supportTickets_tenantId` (`tenantId`),
	INDEX `idx_supportTickets_userId` (`userId`),
	INDEX `idx_supportTickets_status` (`status`)
);

-- ============================================================================
-- 13. ACCOUNT_UPGRADES TABLE - Upgrades de Conta (ex: Standard 1TB)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `accountUpgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`upgradeType` enum('standard_1tb') NOT NULL,
	`additionalPriceCents` int NOT NULL,
	`newStorageLimitGb` int NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accountUpgrades_id` PRIMARY KEY(`id`),
	INDEX `idx_accountUpgrades_tenantId` (`tenantId`),
	INDEX `idx_accountUpgrades_status` (`status`)
);

-- ============================================================================
-- 14. INVOICES TABLE - Faturas e Relatórios Financeiros
-- ============================================================================
CREATE TABLE IF NOT EXISTS `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`invoiceNumber` varchar(50) NOT NULL,
	`grossAmountCents` int NOT NULL,
	`stripeFeesCents` int NOT NULL DEFAULT 0,
	`taxProvisionCents` int NOT NULL,
	`s3CostsCents` int NOT NULL DEFAULT 0,
	`serverCostsCents` int NOT NULL DEFAULT 0,
	`netProfitCents` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`),
	INDEX `idx_invoices_tenantId` (`tenantId`),
	INDEX `idx_invoices_status` (`status`)
);

-- ============================================================================
-- 15. AFFILIATES TABLE - Programa de Afiliados (Influenciadores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`instagramHandle` varchar(100),
	`youtubeChannel` varchar(500),
	`couponCode` varchar(50),
	`stripeCouponId` varchar(255),
	`discountPercentage` int NOT NULL DEFAULT 10,
	`commissionPercentage` int NOT NULL DEFAULT 30,
	`status` enum('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
	`referredCustomers` int NOT NULL DEFAULT 0,
	`totalCommissionCents` int NOT NULL DEFAULT 0,
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliates_email_unique` UNIQUE(`email`),
	CONSTRAINT `affiliates_couponCode_unique` UNIQUE(`couponCode`),
	INDEX `idx_affiliates_status` (`status`)
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE `users` ADD CONSTRAINT `fk_users_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `subscriptions` ADD CONSTRAINT `fk_subscriptions_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `files` ADD CONSTRAINT `fk_files_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `files` ADD CONSTRAINT `fk_files_userId` 
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;

ALTER TABLE `domains` ADD CONSTRAINT `fk_domains_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `emailAccounts` ADD CONSTRAINT `fk_emailAccounts_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `emailAccounts` ADD CONSTRAINT `fk_emailAccounts_domainId` 
	FOREIGN KEY (`domainId`) REFERENCES `domains`(`id`) ON DELETE CASCADE;

ALTER TABLE `hostedSites` ADD CONSTRAINT `fk_hostedSites_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `hostedSites` ADD CONSTRAINT `fk_hostedSites_domainId` 
	FOREIGN KEY (`domainId`) REFERENCES `domains`(`id`) ON DELETE SET NULL;

ALTER TABLE `notifications` ADD CONSTRAINT `fk_notifications_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `notifications` ADD CONSTRAINT `fk_notifications_userId` 
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;

ALTER TABLE `chatConversations` ADD CONSTRAINT `fk_chatConversations_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `chatConversations` ADD CONSTRAINT `fk_chatConversations_userId` 
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;

ALTER TABLE `chatMessages` ADD CONSTRAINT `fk_chatMessages_conversationId` 
	FOREIGN KEY (`conversationId`) REFERENCES `chatConversations`(`id`) ON DELETE CASCADE;

ALTER TABLE `supportTickets` ADD CONSTRAINT `fk_supportTickets_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `supportTickets` ADD CONSTRAINT `fk_supportTickets_userId` 
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE;

ALTER TABLE `accountUpgrades` ADD CONSTRAINT `fk_accountUpgrades_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

ALTER TABLE `invoices` ADD CONSTRAINT `fk_invoices_tenantId` 
	FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE;

-- ============================================================================
-- INITIAL DATA - Planos Padrão
-- ============================================================================

INSERT IGNORE INTO `plans` (`name`, `description`, `priceMonthCents`, `emailSeats`, `storagePerAccountGb`, `humanSupport`, `active`) VALUES
('Vya Solo', 'Plano individual com 1 conta de email e 60GB de storage', 2990, 1, 60, 0, 1),
('Starter 5', 'Plano para pequenas equipes com 5 contas de email e 60GB cada', 9990, 5, 60, 0, 1),
('Starter 10', 'Plano para equipes médias com 10 contas de email e 60GB cada', 18990, 10, 60, 1, 1),
('Vya Pro', 'Plano profissional com 10 contas de email e 100GB cada + Suporte Humano', 19990, 10, 100, 1, 1),
('Standard 1TB', 'Upgrade para 1TB de storage adicional', 14990, 0, 1024, 0, 1);

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Tables: 15
-- Total Columns: 142
-- Total Indexes: 35+
-- Total Foreign Keys: 18
-- ============================================================================
