PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_read_chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_id` integer NOT NULL,
	`chapter_slug` integer NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`manga_id`) REFERENCES `saved_manga`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_read_chapters`("id", "manga_id", "chapter_slug", "read_at") SELECT "id", "manga_id", "chapter_slug", "read_at" FROM `read_chapters`;--> statement-breakpoint
DROP TABLE `read_chapters`;--> statement-breakpoint
ALTER TABLE `__new_read_chapters` RENAME TO `read_chapters`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_saved_manga` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`cover` text NOT NULL,
	`author` text,
	`status` text,
	`last_updated` text,
	`genres` text,
	`chapters` text,
	`created_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_saved_manga`("id", "slug", "title", "description", "cover", "author", "status", "last_updated", "genres", "chapters", "created_at") SELECT "id", "slug", "title", "description", "cover", "author", "status", "last_updated", "genres", "chapters", "created_at" FROM `saved_manga`;--> statement-breakpoint
DROP TABLE `saved_manga`;--> statement-breakpoint
ALTER TABLE `__new_saved_manga` RENAME TO `saved_manga`;