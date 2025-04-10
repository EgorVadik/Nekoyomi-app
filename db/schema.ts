import { ChapterList, NameWithLink } from '@/lib/types'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const SavedMangaTable = sqliteTable('saved_manga', {
    id: integer('id', {
        mode: 'number',
    }).primaryKey({
        autoIncrement: true,
    }),
    slug: text('slug').unique().notNull(),
    title: text('title').notNull(),
    description: text('description').default(''),
    cover: text('cover').notNull(),
    author: text('author', {
        mode: 'json',
    }).$type<NameWithLink>(),
    status: text('status'),
    lastUpdated: text('last_updated'),
    genres: text('genres', {
        mode: 'json',
    }).$type<NameWithLink[]>(),
    chapters: text('chapters', {
        mode: 'json',
    }).$type<ChapterList>(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
        () => new Date(),
    ),
})

export const HistoryTable = sqliteTable('history', {
    id: integer('id', {
        mode: 'number',
    }).primaryKey({
        autoIncrement: true,
    }),
    mangaSlug: text('manga_slug').unique().notNull(),
    mangaTitle: text('manga_title').notNull(),
    mangaCover: text('manga_cover').notNull(),
    chapterSlug: text('chapter_slug').notNull(),
    readAt: integer('read_at', { mode: 'timestamp' }).$defaultFn(
        () => new Date(),
    ),
})

export const ReadChaptersTable = sqliteTable(
    'read_chapters',
    {
        id: integer('id', {
            mode: 'number',
        }).primaryKey({
            autoIncrement: true,
        }),
        mangaSlug: text('manga_slug').notNull(),
        chapterSlug: text('chapter_slug').notNull(),
        currentPage: integer('current_page').notNull(),
        readAt: integer('read_at', { mode: 'timestamp' }).$defaultFn(
            () => new Date(),
        ),
    },
    (t) => [unique('unique_chapter').on(t.mangaSlug, t.chapterSlug)],
)

export const DownloadedChaptersTable = sqliteTable(
    'downloaded_chapters',
    {
        id: integer('id', {
            mode: 'number',
        }).primaryKey({
            autoIncrement: true,
        }),
        mangaSlug: text('manga_slug').notNull(),
        chapterSlug: text('chapter_slug').notNull(),
        pages: text('pages', {
            mode: 'json',
        }).$type<{ url: string; localPath: string }[]>(),
        downloadedAt: integer('downloaded_at', {
            mode: 'timestamp',
        }).$defaultFn(() => new Date()),
    },
    (t) => [unique('unique_downloaded_chapter').on(t.mangaSlug, t.chapterSlug)],
)

export const DownloadQueueTable = sqliteTable('download_queue', {
    id: integer('id', {
        mode: 'number',
    }).primaryKey({
        autoIncrement: true,
    }),
    mangaSlug: text('manga_slug').notNull(),
    chapterSlug: text('chapter_slug').notNull(),
    status: text('status', {
        enum: ['pending', 'downloading', 'completed', 'failed'],
    }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
        () => new Date(),
    ),
})

export const UpdateTable = sqliteTable('update', {
    id: integer('id', {
        mode: 'number',
    }).primaryKey({
        autoIncrement: true,
    }),
    savedMangaId: integer('saved_manga_id')
        .notNull()
        .references(() => SavedMangaTable.id),
    chapterSlug: text('chapter_slug').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
        () => new Date(),
    ),
})

// Relations

export const savedMangaRelations = relations(SavedMangaTable, ({ many }) => ({
    updates: many(UpdateTable),
}))

export const updateRelations = relations(UpdateTable, ({ one }) => ({
    savedManga: one(SavedMangaTable, {
        fields: [UpdateTable.savedMangaId],
        references: [SavedMangaTable.id],
    }),
}))
