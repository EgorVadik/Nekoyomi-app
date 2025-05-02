import { MangaCard } from '@/components/manga-card'
import { useUpdateLibrary } from '@/hooks/use-update-library'
import { getLibrary } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import { AlertCircle, BookOpen, Compass, RefreshCw } from 'lucide-react-native'
import { useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

export default function LibraryScreen() {
    const [retry, setRetry] = useState(false)
    const { data, error, isLoading } = useQuery({
        queryKey: ['saved-manga'],
        queryFn: async () => {
            const mangaWithUnreadCount = await getLibrary()
            return mangaWithUnreadCount.sort(
                (a, b) => b.lastRead.getTime() - a.lastRead.getTime(),
            )
        },
        refetchOnMount: 'always',
    })
    const { isUpdating, updateLibrary } = useUpdateLibrary()

    const handleRefresh = async () => {
        if (data == null) return

        const notification = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Updating Library...',
                autoDismiss: false,
                sticky: true,
            },
            trigger: null,
        })

        const results = await Promise.all(
            data.map((manga) =>
                updateLibrary({
                    title: manga.title,
                    totalChapters: manga.chapters?.totalChapters ?? 0,
                    chaptersCount: manga.chapters?.chapters.length ?? 0,
                    savedMangaId: manga.id,
                    showToast: false,
                }),
            ),
        )

        await Notifications.dismissNotificationAsync(notification)

        const foundChapters = results.reduce(
            (acc, curr) => acc + (curr?.found ?? 0),
            0,
        )

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Library updated',
                body:
                    foundChapters > 0
                        ? `Found ${foundChapters} new chapters`
                        : 'No new chapters found',
            },
            trigger: null,
        })
    }

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <ActivityIndicator size='large' color='#fff' />
            </View>
        )
    }

    if (error) {
        return (
            <View className='flex-1 items-center justify-center gap-4 bg-[#121218] px-4'>
                <AlertCircle size={64} color='#ef4444' opacity={0.5} />
                <Text className='text-xl font-semibold text-white'>
                    Something Went Wrong
                </Text>
                <Text
                    className='text-center text-gray-400'
                    textBreakStrategy='balanced'
                >
                    We couldn't load your library. Please try again later.
                </Text>
                <TouchableOpacity
                    onPress={() => setRetry(!retry)}
                    className='mt-4 flex-row items-center gap-2 rounded-full bg-[#a9c8fc] px-6 py-3'
                >
                    <RefreshCw size={20} color='#1f2937' />
                    <Text className='font-medium text-gray-800'>Try Again</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (data == null || data?.length === 0) {
        return (
            <View className='flex-1 items-center justify-center gap-4 bg-[#121218] px-4'>
                <BookOpen size={64} color='#ffffff' opacity={0.5} />
                <Text className='text-xl font-semibold text-white'>
                    Your Library is Empty
                </Text>
                <Text
                    className='text-center text-gray-400'
                    textBreakStrategy='balanced'
                >
                    Start building your collection by browsing and adding manga
                    to your library
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/browse')}
                    className='mt-4 flex-row items-center gap-2 rounded-full bg-[#a9c8fc] px-6 py-3'
                >
                    <Compass size={20} color='#1f2937' />
                    <Text className='font-medium text-gray-800'>
                        Browse Manga
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-[#121218]'>
            <FlatList
                data={data}
                renderItem={({ item }) => (
                    <MangaCard
                        item={item}
                        inLibrary
                        unReadChaptersCount={item.unReadChaptersCount}
                    />
                )}
                keyExtractor={(item) => item.title}
                numColumns={2}
                contentContainerStyle={{ padding: 8 }}
                refreshing={isUpdating}
                onRefresh={handleRefresh}
            />
        </View>
    )
}
