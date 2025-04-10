import type {
    FilteredMangaSchema,
    MangaChapterSchema,
    MangaSchema,
    SearchSchema,
} from '@/lib/schema'
import type { ChapterList, MangaDetails, MangaResponse } from '@/lib/types'
import axios from 'axios'

export const api = axios.create({
    baseURL: 'https://nekoyomi-server.onrender.com',
})

export const getChapterRequest = async (
    params: Partial<MangaChapterSchema>,
) => {
    const { data } = await api.get<string[]>('/chapter', { params })
    return data
}

export const getChapterListRequest = async (params: Partial<MangaSchema>) => {
    const { data } = await api.get<ChapterList>('/chapters', { params })
    return data
}

export const getMangaDetailsRequest = async (params: Partial<MangaSchema>) => {
    const { data } = await api.get<MangaDetails>('/manga', { params })
    return data
}

export const searchMangaRequest = async (params: Partial<SearchSchema>) => {
    const { data } = await api.get<MangaResponse>('/search', { params })
    return data
}

export const getFilteredMangaListRequest = async (
    params: Partial<FilteredMangaSchema>,
) => {
    const { data } = await api.get<MangaResponse>('/list', { params })
    return data
}
