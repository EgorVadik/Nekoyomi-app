import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

const BASE_DIR = `${FileSystem.cacheDirectory}downloaded_chapters/`

export const downloadImage = async (
    url: string,
    mangaSlug: string,
    chapterSlug: string,
    pageIndex: number,
) => {
    try {
        // Create directory if it doesn't exist
        const dir = `${BASE_DIR}${mangaSlug}/${chapterSlug}/`
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true })

        // Generate filename
        const filename = `page_${pageIndex}.jpg`
        const fileUri = `${dir}${filename}`

        // Download the file
        const { uri } = await FileSystem.downloadAsync(url, fileUri, {
            headers: {
                Referer: 'https://www.mangakakalot.gg/',
            },
        })

        return uri
    } catch (error) {
        console.error('Error downloading image:', error)
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
        console.error('Error deleting chapter files:', error)
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
