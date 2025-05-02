import { db } from '@/db'
import {
    HistoryTable,
    ReadChaptersTable,
    SavedMangaTable,
    UpdateTable,
} from '@/db/schema'
import { BASE_URL } from '@/lib/constants'
import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { eq, inArray } from 'drizzle-orm'
import { twMerge } from 'tailwind-merge'
import { getMangaDetailsRequest } from './api'

export const api = axios.create({
    baseURL: BASE_URL,
})

export const parseString = (str?: string) =>
    str?.replaceAll('\n', '').trim() ?? ''

export const cn = (...classes: ClassValue[]) => {
    return twMerge(clsx(classes))
}

export const removeAllExtraSpaces = (str?: string) =>
    str
        ?.split(' ')
        .filter((item) => item !== '')
        .join(' ') ?? ''

export const extractNumberFromChapterTitle = (title: string) => {
    const match = title.match(/\d+/)
    return match ? parseFloat(match[0]) : null
}

export const updateLibrary = async ({
    title,
    totalChapters,
    savedMangaId,
    chaptersCount,
}: {
    title: string
    totalChapters: number
    savedMangaId: number
    chaptersCount: number
}) => {
    const backendData = await getMangaDetailsRequest({
        title,
    })
    if (!backendData) return

    if (backendData.chapters.totalChapters === totalChapters) {
        return {
            success: true,
            found: 0,
        }
    }

    if (!savedMangaId) return

    const newChaptersDifference =
        backendData.chapters.chapters.length - (chaptersCount || 0)

    const newChapters = backendData.chapters.chapters.slice(
        0,
        newChaptersDifference,
    )

    await Promise.all([
        db
            .update(SavedMangaTable)
            .set({
                chapters: backendData.chapters,
            })
            .where(eq(SavedMangaTable.slug, title)),
        db.insert(UpdateTable).values(
            newChapters.map((chapter) => ({
                savedMangaId,
                chapterSlug: chapter.slug,
            })),
        ),
    ])

    return {
        success: true,
        found: newChaptersDifference,
    }
}

export const getLibrary = async () => {
    const savedManga = await db.select().from(SavedMangaTable)

    const [readChapters, history] = await Promise.all([
        db
            .select()
            .from(ReadChaptersTable)
            .where(
                inArray(
                    ReadChaptersTable.mangaSlug,
                    savedManga.map((manga) => manga.slug),
                ),
            ),
        db
            .select()
            .from(HistoryTable)
            .where(
                inArray(
                    HistoryTable.mangaSlug,
                    savedManga.map((manga) => manga.slug),
                ),
            ),
    ])

    const mangaWithUnreadCount = savedManga.map((manga) => ({
        ...manga,
        lastRead:
            history.find((h) => h.mangaSlug === manga.slug)?.readAt ||
            new Date(0),
        unReadChaptersCount:
            (manga.chapters?.totalChapters ?? 0) -
            readChapters.filter((chapter) => chapter.mangaSlug === manga.slug)
                .length,
    }))

    return mangaWithUnreadCount
}
