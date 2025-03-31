export type MangaResponse = {
    data: Manga[]
    lastPage: number
    hasNextPage: boolean
    nextPage: number
}

export type Manga = {
    cover?: string
    title: string
    link?: string
}

export type MangaDetails = Omit<Manga, 'link'> & {
    author: {
        name: string
        link?: string
    }
    status?: string
    lastUpdated: Date | null
    genres: {
        name: string
        link?: string
    }[]
    description: string
}

export type ChapterList = {
    totalChapters: number
    chapters: {
        link?: string
        timeUploaded: Date | null
        title: string
    }[]
}
