PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_read_chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_slug` text NOT NULL,
	`chapter_slug` text NOT NULL,
	`current_page` integer NOT NULL,
	`read_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_read_chapters`("id", "manga_slug", "chapter_slug", "current_page", "read_at") SELECT "id", "manga_slug", "chapter_slug", "current_page", "read_at" FROM `read_chapters`;--> statement-breakpoint
DROP TABLE `read_chapters`;--> statement-breakpoint
ALTER TABLE `__new_read_chapters` RENAME TO `read_chapters`;--> statement-breakpoint
PRAGMA foreign_keys=ON;