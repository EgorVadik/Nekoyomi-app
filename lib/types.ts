export type MangaResponse = {
    data: Manga[]
    lastPage: number
    hasNextPage: boolean
    nextPage: number
}

export type Manga = {
    slug: string
    cover?: string
    title: string
    link?: string
}

export type NameWithLink = {
    name: string
    link?: string
}

export type MangaDetails = Omit<Manga, 'link'> & {
    author: NameWithLink
    status?: string
    lastUpdated: Date | null
    genres: NameWithLink[]
    description: string
    chapters: ChapterList
}

export type ChapterList = {
    totalChapters: number
    chapters: {
        link?: string
        timeUploaded: Date | null
        title: string
        slug: string
    }[]
}
