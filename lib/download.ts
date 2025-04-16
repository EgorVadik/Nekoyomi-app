import * as FileSystem from 'expo-file-system'

const BASE_DIR = `${FileSystem.cacheDirectory}downloaded_chapters/`

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

        const { uri } = await FileSystem.downloadAsync(url, fileUri, {
            headers: {
                Referer: 'https://www.mangakakalot.gg/',
            },
        })

        return uri
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
