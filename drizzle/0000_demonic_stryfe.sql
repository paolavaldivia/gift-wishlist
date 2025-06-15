CREATE TABLE `big_gifts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image_path` text NOT NULL,
	`target_amount` real NOT NULL,
	`current_amount` real DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`purchase_links` text DEFAULT '[]' NOT NULL,
	`is_taken` integer DEFAULT false NOT NULL,
	`taken_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contributors` (
	`id` text PRIMARY KEY NOT NULL,
	`big_gift_id` text NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`email` text,
	`message` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`big_gift_id`) REFERENCES `big_gifts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `gifts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`image_path` text NOT NULL,
	`approximate_price` real NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`purchase_links` text DEFAULT '[]' NOT NULL,
	`is_taken` integer DEFAULT false NOT NULL,
	`taken_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
