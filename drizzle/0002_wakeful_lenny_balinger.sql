PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_slug` text NOT NULL,
	`manga_title` text NOT NULL,
	`chapter_number` integer NOT NULL,
	`read_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_history`("id", "manga_slug", "manga_title", "chapter_number", "read_at") SELECT "id", "manga_slug", "manga_title", "chapter_number", "read_at" FROM `history`;--> statement-breakpoint
DROP TABLE `history`;--> statement-breakpoint
ALTER TABLE `__new_history` RENAME TO `history`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_read_chapters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`manga_id` text NOT NULL,
	`chapter_slug` integer NOT NULL,
	`read_at` integer,
	FOREIGN KEY (`manga_id`) REFERENCES `saved_manga`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_read_chapters`("id", "manga_id", "chapter_slug", "read_at") SELECT "id", "manga_id", "chapter_slug", "read_at" FROM `read_chapters`;--> statement-breakpoint
DROP TABLE `read_chapters`;--> statement-breakpoint
ALTER TABLE `__new_read_chapters` RENAME TO `read_chapters`;--> statement-breakpoint
CREATE TABLE `__new_saved_manga` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
INSERT INTO `__new_saved_manga`("id", "slug", "title", "description", "cover", "author", "status", "last_updated", "genres", "chapters", "created_at") SELECT "id", "slug", "title", "description", "cover", "author", "status", "last_updated", "genres", "chapters", "created_at" FROM `saved_manga`;--> statement-breakpoint
DROP TABLE `saved_manga`;--> statement-breakpoint
ALTER TABLE `__new_saved_manga` RENAME TO `saved_manga`;