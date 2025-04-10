CREATE TABLE `download_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_slug` text NOT NULL,
	`chapter_slug` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `update` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`saved_manga_id` integer NOT NULL,
	`chapter_slug` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`saved_manga_id`) REFERENCES `saved_manga`(`id`) ON UPDATE no action ON DELETE no action
);
