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

export type FilterOptions = 'downloaded' | 'unread' | 'completed'
export type SortOptions = Partial<{
    alphabetical: 'asc' | 'desc' | null
    lastRead: 'asc' | 'desc' | null
    totalChapters: 'asc' | 'desc' | null
    unreadCount: 'asc' | 'desc' | null
    lastUpdated: 'asc' | 'desc' | null
    dateAdded: 'asc' | 'desc' | null
}>
