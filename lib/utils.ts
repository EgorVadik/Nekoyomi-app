import { BASE_URL } from '@/lib/constants'
import axios from 'axios'
import { clsx, type ClassValue } from 'clsx'
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
