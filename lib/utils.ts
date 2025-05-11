import { db } from '@/db'
import {
    DownloadedChaptersTable,
    HistoryTable,
    ReadChaptersTable,
    SavedMangaTable,
    UpdateTable,
} from '@/db/schema'
import { getMangaDetailsRequest } from '@/lib/api'
import { BASE_URL } from '@/lib/constants'
import type { SortOptions } from '@/lib/types'
import { type QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
import { eq, inArray } from 'drizzle-orm'
import { twMerge } from 'tailwind-merge'

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
    queryClient,
}: {
    title: string
    totalChapters: number
    savedMangaId: number
    chaptersCount: number
    queryClient?: QueryClient
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
            .where(eq(SavedMangaTable.id, savedMangaId)),
        db.insert(UpdateTable).values(
            newChapters.map((chapter) => ({
                savedMangaId,
                chapterSlug: chapter.slug,
            })),
        ),
    ])

    if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['updates'] })
        queryClient.invalidateQueries({ queryKey: ['saved-manga'] })
    }

    return {
        success: true,
        found: newChaptersDifference,
    }
}

export const getLibrary = async () => {
    const savedManga = await db.select().from(SavedMangaTable)

    const [readChapters, history, downloadedChapters] = await Promise.all([
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
        db
            .select()
            .from(DownloadedChaptersTable)
            .where(
                inArray(
                    DownloadedChaptersTable.mangaSlug,
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
        hasDownloadedChapters:
            downloadedChapters.filter(
                (chapter) => chapter.mangaSlug === manga.slug,
            ).length > 0,
    }))

    return mangaWithUnreadCount
}

export const sortLibrary = (
    library: Awaited<ReturnType<typeof getLibrary>>,
    options: SortOptions,
) => {
    const currentSort = Object.entries(options).find(([_, value]) => value)

    if (!currentSort) return library

    const [key, value] = currentSort

    return library.sort((a, b) => {
        if (key === 'alphabetical') {
            return a.title.localeCompare(b.title) * (value === 'asc' ? 1 : -1)
        }

        if (key === 'lastRead') {
            return (
                (a.lastRead.getTime() - b.lastRead.getTime()) *
                (value === 'asc' ? 1 : -1)
            )
        }

        if (key === 'totalChapters') {
            return (
                ((a.chapters?.totalChapters ?? 0) -
                    (b.chapters?.totalChapters ?? 0)) *
                (value === 'asc' ? 1 : -1)
            )
        }

        if (key === 'unreadCount') {
            return (
                (a.unReadChaptersCount - b.unReadChaptersCount) *
                (value === 'asc' ? 1 : -1)
            )
        }

        if (key === 'lastUpdated') {
            return (
                (new Date(a.lastUpdated ?? new Date()).getTime() -
                    new Date(b.lastUpdated ?? new Date()).getTime()) *
                (value === 'asc' ? 1 : -1)
            )
        }

        if (key === 'dateAdded') {
            return (
                ((a.createdAt?.getTime() ?? 0) -
                    (b.createdAt?.getTime() ?? 0)) *
                (value === 'asc' ? 1 : -1)
            )
        }

        return 0
    })
}
