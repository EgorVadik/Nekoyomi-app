CREATE TABLE `downloaded_chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_slug` text NOT NULL,
	`chapter_slug` text NOT NULL,
	`pages` text,
	`downloaded_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_downloaded_chapter` ON `downloaded_chapters` (`manga_slug`,`chapter_slug`);