ALTER TABLE `tenants` ADD `onboardingMode` enum('complete','storage_pro') DEFAULT 'complete';--> statement-breakpoint
ALTER TABLE `tenants` ADD `isEmailActive` int DEFAULT 1;--> statement-breakpoint
ALTER TABLE `tenants` ADD `storageBonusApplied` int DEFAULT 0;