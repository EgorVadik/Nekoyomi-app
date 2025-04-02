CREATE TABLE `history` (
	`id` text PRIMARY KEY NOT NULL,
	`manga_slug` text NOT NULL,
	`manga_title` text NOT NULL,
	`chapter_number` integer NOT NULL,
	`read_at` integer
);
--> statement-breakpoint
CREATE TABLE `read_chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`manga_id` text NOT NULL,
	`chapter_slug` integer NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`manga_id`) REFERENCES `saved_manga`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `saved_manga` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`cover` text NOT NULL,
	`author` blob,
	`status` text,
	`last_updated` text,
	`genres` blob,
	`chapters` blob,
	`created_at` integer
);
--> statement-breakpoint
DROP TABLE `manga`;