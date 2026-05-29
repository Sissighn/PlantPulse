PRAGMA foreign_keys = ON;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text,
  `password_hash` text,
  `display_name` text,
  `account_type` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  CONSTRAINT `users_account_type_check` CHECK(`account_type` in ('registered', 'guest'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `users_email_unique` ON `users` (`email`);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `plants` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text,
  `name` text NOT NULL,
  `type` text,
  `baseInterval` integer,
  `lastWatered` text,
  `image` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_plants_user_id` ON `plants` (`user_id`);
