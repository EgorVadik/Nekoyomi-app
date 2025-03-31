import { atom } from 'jotai'
import { FilteredMangaSchema } from '@/lib/schema'

export const filterAtom = atom<
    Partial<Omit<FilteredMangaSchema, 'type' | 'page'>>
>({})
