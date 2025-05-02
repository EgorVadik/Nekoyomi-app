import { db } from '@/db'
import { DownloadedChaptersTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import * as FileSystem from 'expo-file-system'
import { Directory } from 'expo-file-system/next'

const BASE_DIR = `${FileSystem.documentDirectory}Nekoyomi/downloads/`

export const verifyDownloads = async () => {
    const downloadedChapters = await db.select().from(DownloadedChaptersTable)

    for (const chapter of downloadedChapters) {
        const dirLocation = `${BASE_DIR}${chapter.mangaSlug}/${chapter.chapterSlug}/`
        const dir = new Directory(dirLocation)
        const exists = dir.exists && dir.list().length > 0
        if (exists) continue

        await db
            .delete(DownloadedChaptersTable)
            .where(eq(DownloadedChaptersTable.id, chapter.id))
    }
}

export const downloadImage = async (
    url: string,
    mangaSlug: string,
    chapterSlug: string,
    pageIndex: number,
) => {
    try {
        const dir = `${BASE_DIR}${mangaSlug}/${chapterSlug}/`
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true })
        const filename = `page_${pageIndex}.jpg`
        const fileUri = `${dir}${filename}`

        const { uri, status } = await FileSystem.downloadAsync(url, fileUri, {
            headers: {
                Referer: 'https://www.mangakakalot.gg/',
            },
        })

        return { uri, status }
    } catch (error) {
        throw error
    }
}

export const deleteChapterFiles = async (
    mangaSlug: string,
    chapterSlug: string,
) => {
    try {
        const dir = `${BASE_DIR}${mangaSlug}/${chapterSlug}/`
        await FileSystem.deleteAsync(dir, { idempotent: true })
    } catch (error) {
        throw error
    }
}

export const getLocalImagePath = (
    mangaSlug: string,
    chapterSlug: string,
    pageIndex: number,
) => {
    return `${BASE_DIR}${mangaSlug}/${chapterSlug}/page_${pageIndex}.jpg`
}
