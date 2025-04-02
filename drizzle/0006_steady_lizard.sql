PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_slug` text NOT NULL,
	`manga_title` text NOT NULL,
	`manga_cover` text NOT NULL,
	`chapter_slug` text NOT NULL,
	`read_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_history`("id", "manga_slug", "manga_title", "manga_cover", "chapter_slug", "read_at") SELECT "id", "manga_slug", "manga_title", "manga_cover", "chapter_slug", "read_at" FROM `history`;--> statement-breakpoint
DROP TABLE `history`;--> statement-breakpoint
ALTER TABLE `__new_history` RENAME TO `history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `history_manga_slug_unique` ON `history` (`manga_slug`);