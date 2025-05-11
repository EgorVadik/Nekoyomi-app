import { updateLibrary as updateLibraryUtils } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ToastAndroid } from 'react-native'

export const useUpdateLibrary = () => {
    const [isUpdating, setIsUpdating] = useState(false)
    const queryClient = useQueryClient()

    const updateLibrary = async ({
        title,
        totalChapters,
        savedMangaId,
        chaptersCount,
        showToast = true,
    }: {
        title: string
        totalChapters: number
        savedMangaId?: number
        chaptersCount?: number
        showToast?: boolean
    }) => {
        if (isUpdating) return
        try {
            setIsUpdating(true)
            const res = await updateLibraryUtils({
                title,
                totalChapters,
                savedMangaId: savedMangaId || 0,
                chaptersCount: chaptersCount || 0,
                queryClient,
            })

            if (res?.found === 0) {
                if (!showToast) {
                    return res
                }
                ToastAndroid.show('No new chapters found', ToastAndroid.SHORT)
                return res
            }

            await queryClient.invalidateQueries({
                queryKey: ['saved-manga', title],
            })

            await queryClient.invalidateQueries({
                queryKey: ['manga-details', title],
            })

            await queryClient.invalidateQueries({
                queryKey: ['saved-manga'],
            })

            if (!showToast) {
                return res
            }

            ToastAndroid.show(
                `${res?.found} new chapters found`,
                ToastAndroid.SHORT,
            )
        } catch (error) {
            if (!showToast) {
                return {
                    success: false,
                    found: 0,
                }
            }
            ToastAndroid.show(
                'Failed to update manga details',
                ToastAndroid.SHORT,
            )
        } finally {
            setIsUpdating(false)
        }
    }

    return {
        isUpdating,
        updateLibrary,
    }
}
