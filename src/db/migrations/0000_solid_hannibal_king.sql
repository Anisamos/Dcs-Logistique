CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`project_id` integer,
	`space_id` integer,
	`status` text DEFAULT 'planned' NOT NULL,
	`date` integer,
	`budget` real,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cleanliness_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`space_id` integer NOT NULL,
	`status` text NOT NULL,
	`details` text,
	`checked_by` integer,
	`checked_at` integer,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`checked_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `equipment` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`space_id` integer,
	`quantity` integer DEFAULT 1 NOT NULL,
	`condition` text DEFAULT 'good' NOT NULL,
	`purchase_date` integer,
	`purchase_price` real,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'planning' NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`budget` real,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`supplier` text,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`invoice_number` text,
	`invoice_date` integer NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`space_id` integer,
	`project_id` integer,
	`activity_id` integer,
	`created_by` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`activity_id`) REFERENCES `activities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `spaces` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`address` text,
	`surface` real,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `stock_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`unit` text DEFAULT 'piece' NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`min_quantity` integer DEFAULT 0 NOT NULL,
	`unit_price` real,
	`space_id` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`stock_item_id` integer NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`reason` text,
	`reference` text,
	`notes` text,
	`created_by` integer,
	`created_at` integer,
	FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);