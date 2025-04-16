import { db } from '@/db'
import { SavedMangaTable, UpdateTable } from '@/db/schema'
import { extractNumberFromChapterTitle } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { differenceInDays, format } from 'date-fns'
import { desc } from 'drizzle-orm'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { AlertCircle, BookOpen } from 'lucide-react-native'
import { useCallback } from 'react'
import {
    ActivityIndicator,
    SectionList,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

type UpdateWithManga = typeof UpdateTable.$inferSelect & {
    savedManga: typeof SavedMangaTable.$inferSelect
}

type UpdateGroup = {
    title: string
    data: UpdateWithManga[]
}

export default function UpdatesScreen() {
    const router = useRouter()

    const {
        data: updates,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['updates'],
        queryFn: async () => {
            const updates = await db.query.UpdateTable.findMany({
                orderBy: [desc(UpdateTable.createdAt)],
                with: {
                    savedManga: true,
                },
            })

            const groups: UpdateGroup[] = []

            const updatesByDays = updates.reduce(
                (acc, item) => {
                    const date = new Date(item.createdAt ?? new Date())
                    const daysAgo = differenceInDays(new Date(), date)

                    if (!acc[daysAgo]) {
                        acc[daysAgo] = []
                    }
                    acc[daysAgo].push(item)
                    return acc
                },
                {} as Record<number, UpdateWithManga[]>,
            )

            Object.entries(updatesByDays)
                .sort(([a], [b]) => Number(a) - Number(b))
                .forEach(([days, items]) => {
                    const daysNum = Number(days)
                    let title = ''

                    if (daysNum === 0) {
                        title = 'Today'
                    } else if (daysNum === 1) {
                        title = 'Yesterday'
                    } else if (daysNum <= 6) {
                        title = `${daysNum} days ago`
                    } else {
                        title = format(
                            new Date(items.at(0)?.createdAt ?? new Date()),
                            'MMM d, yyyy',
                        )
                    }

                    groups.push({
                        title,
                        data: items.sort((a, b) => {
                            const dateA = new Date(a.createdAt ?? new Date())
                            const dateB = new Date(b.createdAt ?? new Date())
                            return dateB.getTime() - dateA.getTime()
                        }),
                    })
                })

            return {
                groups,
            }
        },
    })

    const renderItem = useCallback(
        ({ item }: { item: UpdateWithManga }) => (
            <TouchableOpacity
                onPress={() =>
                    router.push({
                        pathname: '/manga-details/[name]/read',
                        params: {
                            name: item.savedManga.slug,
                            chapter: item.chapterSlug,
                        },
                    })
                }
                className='flex-row items-center gap-3 px-4 py-3'
            >
                <Image
                    source={{
                        uri: item.savedManga.cover,
                        headers: {
                            Referer: 'https://www.mangakakalot.gg/',
                        },
                    }}
                    style={{
                        width: 50,
                        height: 75,
                        borderRadius: 4,
                    }}
                    className='h-20 w-14 flex-1 overflow-hidden bg-red-50'
                    contentFit='cover'
                />
                <View className='flex-1'>
                    <Text
                        className='text-base font-medium text-white'
                        numberOfLines={2}
                    >
                        {item.savedManga.title}
                    </Text>
                    <Text className='text-sm text-[#908d94]'>
                        Ch. {extractNumberFromChapterTitle(item.chapterSlug)} -{' '}
                        {format(
                            new Date(item.createdAt ?? new Date()),
                            'h:mm a',
                        )}
                    </Text>
                </View>
            </TouchableOpacity>
        ),
        [router],
    )

    const renderSectionHeader = useCallback(
        ({ title }: { title: string }) => (
            <View className='bg-[#121218] px-4 py-2'>
                <Text className='text-lg font-semibold text-white'>
                    {title}
                </Text>
            </View>
        ),
        [],
    )

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <ActivityIndicator size='large' color='#a8c3ef' />
            </View>
        )
    }

    if (error) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <AlertCircle size={48} color='#908d94' />
                <Text className='mt-4 text-center text-base text-[#908d94]'>
                    Something went wrong while loading your updates
                </Text>
                <TouchableOpacity
                    onPress={() => refetch()}
                    className='mt-4 rounded-lg bg-[#1c1e25] px-4 py-2'
                >
                    <Text className='text-base text-white'>Try Again</Text>
                </TouchableOpacity>
            </View>
        )
    }

    if (
        !updates ||
        updates.groups.length === 0 ||
        updates.groups.some((group) => group.data.length === 0)
    ) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <BookOpen size={48} color='#908d94' />
                <Text className='mt-4 text-center text-base text-[#908d94]'>
                    No updates yet
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/')}
                    className='mt-4 rounded-lg bg-[#1c1e25] px-4 py-2'
                >
                    <Text className='text-base text-white'>Browse Manga</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-[#121218]'>
            <SectionList
                sections={updates.groups}
                renderItem={renderItem}
                renderSectionHeader={({ section }) =>
                    renderSectionHeader({ title: section.title })
                }
                keyExtractor={(item) => item.id.toString()}
                maxToRenderPerBatch={20}
                initialNumToRender={20}
                getItemLayout={(_, index) => ({
                    length: 100,
                    offset: 100 * index,
                    index,
                })}
            />
        </View>
    )
}
