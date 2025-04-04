import { ChapterList, NameWithLink } from '@/lib/types'
import { relations } from 'drizzle-orm'
import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core'

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
        // mangaId: integer('manga_id')
        //     .notNull()
        //     .references(() => SavedMangaTable.id, { onDelete: 'cascade' }),
        mangaSlug: text('manga_slug').notNull(),
        chapterSlug: text('chapter_slug').notNull(),
        currentPage: integer('current_page').notNull(),
        readAt: integer('read_at', { mode: 'timestamp' }).$defaultFn(
            () => new Date(),
        ),
    },
    (t) => ({
        uniqueChapter: unique('unique_chapter').on(t.mangaSlug, t.chapterSlug),
    }),
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
    (t) => ({
        uniqueChapter: unique('unique_downloaded_chapter').on(
            t.mangaSlug,
            t.chapterSlug,
        ),
    }),
)

// Relations

// export const savedMangaRelations = relations(SavedMangaTable, ({ many }) => ({
//     readChapters: many(ReadChaptersTable),
// }))

// export const readChaptersRelations = relations(
//     ReadChaptersTable,
//     ({ one }) => ({
//         manga: one(SavedMangaTable, {
//             fields: [ReadChaptersTable.mangaId],
//             references: [SavedMangaTable.id],
//         }),
//     }),
// )
