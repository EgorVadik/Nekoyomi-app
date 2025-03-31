import type {
    FilteredMangaSchema,
    MangaChapterSchema,
    MangaSchema,
    SearchSchema,
} from '@/lib/schema'
import type { ChapterList, Manga, MangaDetails } from '@/lib/types'
import axios from 'axios'

export const api = axios.create({
    baseURL: 'https://ringtail-literate-sculpin.ngrok-free.app',
})

export const getChapterRequest = async (
    params: Partial<MangaChapterSchema>
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
    const { data } = await api.get<Manga[]>('/search', { params })
    return data
}

export const getFilteredMangaListRequest = async (
    params: Partial<FilteredMangaSchema>
) => {
    const { data } = await api.get<Manga[]>('/list', { params })
    return data
}
