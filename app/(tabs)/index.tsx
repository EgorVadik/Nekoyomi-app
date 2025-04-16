import { MangaCard } from '@/components/manga-card'
import { db } from '@/db'
import { HistoryTable, ReadChaptersTable, SavedMangaTable } from '@/db/schema'
import { useQuery } from '@tanstack/react-query'
import { inArray } from 'drizzle-orm'
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
            const savedManga = await db.select().from(SavedMangaTable)

            const [readChapters, history] = await Promise.all([
                db
                    .select()
                    .from(ReadChaptersTable)
                    .where(
                        inArray(
                            ReadChaptersTable.mangaSlug,
                            savedManga.map((manga) => manga.slug),
                        ),
                    ),
                db
                    .select()
                    .from(HistoryTable)
                    .where(
                        inArray(
                            HistoryTable.mangaSlug,
                            savedManga.map((manga) => manga.slug),
                        ),
                    ),
            ])

            const mangaWithUnreadCount = savedManga.map((manga) => ({
                ...manga,
                lastRead:
                    history.find((h) => h.mangaSlug === manga.slug)?.readAt ||
                    new Date(0),
                unReadChaptersCount:
                    (manga.chapters?.totalChapters ?? 0) -
                    readChapters.filter(
                        (chapter) => chapter.mangaSlug === manga.slug,
                    ).length,
            }))

            return mangaWithUnreadCount.sort(
                (a, b) => b.lastRead.getTime() - a.lastRead.getTime(),
            )
        },
        refetchOnMount: 'always',
    })

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
            />
        </View>
    )
}
