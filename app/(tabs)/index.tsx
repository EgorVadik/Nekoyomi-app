import { MangaCard } from '@/components/manga-card'
import { useUpdateLibrary } from '@/hooks/use-update-library'
import { getLibrary } from '@/lib/utils'
import { useHeaderHeight } from '@react-navigation/elements'
import { FlashList } from '@shopify/flash-list'
import { useQuery } from '@tanstack/react-query'
import * as Notifications from 'expo-notifications'
import { router, Stack } from 'expo-router'
import {
    AlertCircle,
    BookOpen,
    Compass,
    ListFilter,
    MoreVertical,
    RefreshCw,
    Search,
    X,
} from 'lucide-react-native'
import { AnimatePresence, motify, MotiText } from 'moti'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    BackHandler,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AnimatedTextInput = motify(TextInput)()
const AnimatedSearch = motify(Search)()
const AnimatedX = motify(X)()

export default function LibraryScreen() {
    const headerHeight = useHeaderHeight()
    const insets = useSafeAreaInsets()
    const [retry, setRetry] = useState(false)
    const [isSearchActive, setIsSearchActive] = useState(false)
    const [filteredData, setFilteredData] = useState<
        Awaited<ReturnType<typeof getLibrary>>
    >([])
    const { data, error, isLoading } = useQuery({
        queryKey: ['saved-manga'],
        queryFn: async () => {
            const mangaWithUnreadCount = await getLibrary()
            const sortedData = mangaWithUnreadCount.sort(
                (a, b) => b.lastRead.getTime() - a.lastRead.getTime(),
            )
            setFilteredData(sortedData)
            return sortedData
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

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (isSearchActive) {
                    setIsSearchActive(false)
                    setFilteredData(data ?? [])
                    return true
                }
                return false
            },
        )

        return () => backHandler.remove()
    }, [isSearchActive])

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

    if (filteredData == null || filteredData?.length === 0) {
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
            <Stack.Screen
                options={{
                    header: ({ options: { title, headerTitleStyle } }) => (
                        <View
                            style={{
                                height: headerHeight,
                                backgroundColor: '#121218',
                            }}
                        >
                            <View
                                style={{
                                    paddingTop: insets.top + 16,
                                }}
                                className='flex-row items-center justify-between gap-2 px-4'
                            >
                                <AnimatePresence>
                                    {isSearchActive ? (
                                        <AnimatedTextInput
                                            from={{
                                                opacity: 0,
                                                translateY: -15,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                translateY: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                translateY: -15,
                                            }}
                                            transition={{
                                                type: 'timing',
                                                duration: 150,
                                            }}
                                            placeholder='Search'
                                            className='flex-1 py-0.5 text-lg'
                                            autoFocus
                                            onChangeText={(text) => {
                                                setFilteredData(
                                                    (data ?? []).filter(
                                                        (manga) =>
                                                            manga.title
                                                                .toLowerCase()
                                                                .includes(
                                                                    text.toLowerCase(),
                                                                ),
                                                    ),
                                                )
                                            }}
                                        />
                                    ) : (
                                        <MotiText
                                            style={headerTitleStyle}
                                            from={{
                                                opacity: 0,
                                                translateY: 15,
                                            }}
                                            animate={{
                                                opacity: 1,
                                                translateY: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                translateY: 15,
                                            }}
                                            transition={{
                                                type: 'timing',
                                                duration: 150,
                                            }}
                                        >
                                            {title}
                                        </MotiText>
                                    )}
                                </AnimatePresence>

                                <View className='flex-row gap-5'>
                                    <TouchableOpacity
                                        onPress={() =>
                                            setIsSearchActive(!isSearchActive)
                                        }
                                    >
                                        <AnimatePresence>
                                            {isSearchActive ? (
                                                <AnimatedX
                                                    size={24}
                                                    color={'white'}
                                                    from={{
                                                        rotate: '45deg',
                                                    }}
                                                    animate={{
                                                        rotate: '0deg',
                                                    }}
                                                    transition={{
                                                        type: 'timing',
                                                        duration: 150,
                                                    }}
                                                />
                                            ) : (
                                                <AnimatedSearch
                                                    size={24}
                                                    color={'white'}
                                                    from={{
                                                        rotate: '45deg',
                                                    }}
                                                    animate={{
                                                        rotate: '0deg',
                                                    }}
                                                    transition={{
                                                        type: 'timing',
                                                        duration: 150,
                                                    }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() =>
                                            router.push('/library-options')
                                        }
                                    >
                                        <ListFilter size={24} color={'white'} />
                                    </TouchableOpacity>

                                    <TouchableOpacity>
                                        <MoreVertical
                                            size={24}
                                            color={'white'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ),
                }}
            />

            <FlashList
                data={filteredData}
                estimatedItemSize={279}
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
