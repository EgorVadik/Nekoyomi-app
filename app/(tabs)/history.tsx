import { CustomModal } from '@/components/ui/custom-modal'
import { db } from '@/db'
import { HistoryTable } from '@/db/schema'
import { extractNumberFromChapterTitle } from '@/lib/utils'
import { useHeaderHeight } from '@react-navigation/elements'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { differenceInDays, endOfDay, format } from 'date-fns'
import { desc, eq } from 'drizzle-orm'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { AlertCircle, BookOpen, Trash2 } from 'lucide-react-native'
import { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    SectionList,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native'

type HistoryGroup = {
    title: string
    data: (typeof HistoryTable.$inferSelect)[]
}

export default function HistoryScreen() {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [selectedItem, setSelectedItem] = useState<
        typeof HistoryTable.$inferSelect | null
    >(null)
    const headerHeight = useHeaderHeight()

    const { mutate: deleteHistory, isPending } = useMutation({
        mutationFn: async (id: number) => {
            await db.delete(HistoryTable).where(eq(HistoryTable.id, id))
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] })
            setDeleteModalVisible(false)
            setSelectedItem(null)
            ToastAndroid.show('Removed from history', ToastAndroid.SHORT)
        },
        onError: () => {
            ToastAndroid.show('Failed to delete history', ToastAndroid.SHORT)
        },
    })

    const handleDeletePress = (item: typeof HistoryTable.$inferSelect) => {
        setSelectedItem(item)
        setDeleteModalVisible(true)
    }

    const handleConfirmDelete = () => {
        if (selectedItem) {
            deleteHistory(selectedItem.id)
        }
    }

    const {
        data: history,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['history'],
        queryFn: async () => {
            const history = await db.query.HistoryTable.findMany({
                orderBy: [desc(HistoryTable.readAt)],
            })

            const groups: HistoryGroup[] = []

            const historyByDays = history.reduce(
                (acc, item) => {
                    const today = endOfDay(new Date())
                    const date = new Date(item.readAt ?? new Date())
                    const daysAgo = differenceInDays(today, date)

                    if (!acc[daysAgo]) {
                        acc[daysAgo] = []
                    }
                    acc[daysAgo].push(item)
                    return acc
                },
                {} as Record<number, (typeof HistoryTable.$inferSelect)[]>,
            )

            Object.entries(historyByDays)
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
                            new Date(items.at(0)?.readAt ?? new Date()),
                            'MMM d, yyyy',
                        )
                    }

                    groups.push({
                        title,
                        data: items.sort((a, b) => {
                            const dateA = new Date(a.readAt ?? new Date())
                            const dateB = new Date(b.readAt ?? new Date())
                            return dateB.getTime() - dateA.getTime()
                        }),
                    })
                })

            return {
                original: groups,
                grouped: groups,
            }
        },
    })

    const renderItem = useCallback(
        ({ item }: { item: typeof HistoryTable.$inferSelect }) => (
            <TouchableOpacity
                onPress={() =>
                    router.push({
                        pathname: '/manga-details/[name]/read',
                        params: {
                            name: item.mangaSlug,
                            chapter: item.chapterSlug,
                        },
                    })
                }
                className='flex-row items-center gap-3 px-4 py-3'
            >
                <Image
                    source={{
                        uri: item.mangaCover,
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
                        {item.mangaTitle}
                    </Text>
                    <Text className='text-sm text-[#908d94]'>
                        Ch. {extractNumberFromChapterTitle(item.chapterSlug)} -{' '}
                        {format(new Date(item.readAt ?? new Date()), 'h:mm a')}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleDeletePress(item)}
                    disabled={isPending}
                    className='p-2'
                >
                    <Trash2 size={20} color='#908d94' />
                </TouchableOpacity>
            </TouchableOpacity>
        ),
        [router, handleDeletePress, isPending],
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
                    Something went wrong while loading your history
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
        !history ||
        history.grouped.length === 0 ||
        history.grouped.some((group) => group.data.length === 0)
    ) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <BookOpen size={48} color='#908d94' />
                <Text className='mt-4 text-center text-base text-[#908d94]'>
                    No reading history yet
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
        <View
            className='flex-1 bg-[#121218]'
            style={{ paddingTop: headerHeight }}
        >
            <SectionList
                sections={history.grouped}
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
            <CustomModal
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false)
                    setSelectedItem(null)
                }}
                title='Remove'
                description={
                    'This will remove the read date of this chapter. Are you sure?'
                }
                confirmText='Remove'
                onConfirm={handleConfirmDelete}
                isPending={isPending}
            />
        </View>
    )
}
