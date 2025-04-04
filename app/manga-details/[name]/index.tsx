import { db } from '@/db'
import {
    ReadChaptersTable,
    SavedMangaTable,
    DownloadedChaptersTable,
} from '@/db/schema'
import { getMangaDetailsRequest, getChapterRequest } from '@/lib/api'
import type { MangaDetails as MangaDetailsType } from '@/lib/types'
import { cn, removeAllExtraSpaces } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { eq, and } from 'drizzle-orm'
import { LinearGradient } from 'expo-linear-gradient'
import {
    router,
    Stack,
    useGlobalSearchParams,
    useLocalSearchParams,
} from 'expo-router'
import {
    AlertCircle,
    ArrowDownCircle,
    ArrowLeft,
    CheckCheck,
    ChevronDown,
    Clock,
    Earth,
    Heart,
    Hourglass,
    RefreshCcw,
    User2,
    Download,
    Bookmark,
    Check,
    CheckCheckIcon,
    ArrowDown,
} from 'lucide-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    Animated as RnAnimated,
    ScrollView,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { downloadImage, deleteChapterFiles } from '@/lib/download'

// type MangaDetailsWithReadChapters = MangaDetailsType & {
//     readChapters?: (typeof ReadChaptersTable.$inferSelect)[]
// }

const getDetailsFromDb = async (slug: string) => {
    const result = await db.query.SavedMangaTable.findFirst({
        where: eq(SavedMangaTable.slug, slug),
    })
    return (result || null) as MangaDetailsType | null
}

export default function MangaDetails() {
    const { name } = useLocalSearchParams()
    const { inLibrary } = useGlobalSearchParams()
    const queryClient = useQueryClient()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const [selectedChapter, setSelectedChapter] = useState<
        MangaDetailsType['chapters']['chapters'][number] | null
    >(null)

    const { data: readChapters } = useQuery({
        queryKey: ['read-chapters', name],
        queryFn: async () => {
            const result = await db.query.ReadChaptersTable.findMany({
                where: eq(ReadChaptersTable.mangaSlug, name as string),
            })
            return result || []
        },
    })
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['manga-details', name],
        queryFn: async () => {
            if (inLibrary === 'true') {
                const result = await getDetailsFromDb(name as string)
                if (!result) return null
                return {
                    ...result,
                    chapters: {
                        ...result.chapters,
                        chapters: result.chapters.chapters.map((chapter) => {
                            const readChapter = readChapters?.find(
                                (readChapter) =>
                                    readChapter.chapterSlug === chapter.slug,
                            )
                            return {
                                ...chapter,
                                isRead: readChapter ? true : false,
                                readAt: readChapter?.readAt,
                                currentPage: readChapter?.currentPage,
                            }
                        }),
                    },
                }
            } else {
                const result = await getMangaDetailsRequest({
                    title: name as string,
                })
                if (!result) return null
                return {
                    ...result,
                    chapters: {
                        ...result.chapters,
                        chapters: result.chapters.chapters.map((chapter) => {
                            const readChapter = readChapters?.find(
                                (readChapter) =>
                                    readChapter.chapterSlug === chapter.slug,
                            )
                            return {
                                ...chapter,
                                isRead: readChapter ? true : false,
                                readAt: readChapter?.readAt,
                                currentPage: readChapter?.currentPage,
                            }
                        }),
                    },
                }
            }
        },
        refetchOnMount: false,
        enabled: readChapters != null,
    })
    const { data: savedManga } = useQuery({
        queryKey: ['saved-manga', name],
        queryFn: async () => {
            const result = await db.query.SavedMangaTable.findFirst({
                columns: { id: true },
                where: eq(SavedMangaTable.slug, name as string),
            })
            return result || null
        },
    })
    const { data: downloadedChapters } = useQuery({
        queryKey: ['downloaded-chapters', name],
        queryFn: async () => {
            const result = await db.query.DownloadedChaptersTable.findMany({
                where: eq(DownloadedChaptersTable.mangaSlug, name as string),
            })
            return result || []
        },
    })

    const [hasScrolled, setHasScrolled] = useState(false)
    const [synopsisExpanded, setSynopsisExpanded] = useState(false)
    const chevronRotation = useRef(new RnAnimated.Value(0)).current
    const animatedBgColor = useAnimatedStyle(() => {
        return {
            flex: 1,
            backgroundColor: withTiming(
                hasScrolled ? '#1f212b' : 'transparent',
                {
                    duration: 200,
                },
            ),
        }
    })

    const spin = chevronRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    })

    useEffect(() => {
        RnAnimated.spring(chevronRotation, {
            friction: 8,
            tension: 40,
            toValue: synopsisExpanded ? 1 : 0,
            useNativeDriver: true,
        }).start()
    }, [synopsisExpanded])

    const handleRefetch = async () => {
        if (inLibrary === 'true') {
            const backendData = await getMangaDetailsRequest({
                title: name as string,
            })
            queryClient.setQueryData(['manga-details', name], backendData)
        } else {
            refetch()
        }
    }

    const handleSnapPress = useCallback((index: number) => {
        bottomSheetRef.current?.expand()
    }, [])

    const handleChapterLongPress = useCallback(
        (chapter: MangaDetailsType['chapters']['chapters'][number]) => {
            setSelectedChapter(chapter)
            handleSnapPress(0)
        },
        [handleSnapPress],
    )

    const handleMarkAsRead = useCallback(
        async (type: 'single' | 'multiple') => {
            if (!selectedChapter)
                return ToastAndroid.show(
                    'Something went wrong, please try again',
                    ToastAndroid.SHORT,
                )

            if (type === 'single') {
                if (
                    readChapters?.some(
                        (chapter) =>
                            chapter.chapterSlug === selectedChapter?.slug,
                    )
                ) {
                    await db
                        .delete(ReadChaptersTable)
                        .where(
                            eq(
                                ReadChaptersTable.chapterSlug,
                                selectedChapter.slug,
                            ),
                        )
                    queryClient.setQueryData(
                        ['manga-details', name],
                        (old: any) => {
                            if (!old) return null
                            return {
                                ...old,
                                chapters: {
                                    ...old.chapters,
                                    chapters: old.chapters.chapters.map(
                                        (chapter: any) => ({
                                            ...chapter,
                                            isRead:
                                                chapter.slug ===
                                                selectedChapter.slug
                                                    ? false
                                                    : chapter.isRead,
                                        }),
                                    ),
                                },
                            }
                        },
                    )
                } else {
                    await db.insert(ReadChaptersTable).values({
                        mangaSlug: name as string,
                        chapterSlug: selectedChapter.slug,
                        readAt: new Date(),
                        currentPage: 0,
                    })

                    queryClient.setQueryData(
                        ['manga-details', name],
                        (old: any) => {
                            if (!old) return null
                            return {
                                ...old,
                                chapters: {
                                    ...old.chapters,
                                    chapters: old.chapters.chapters.map(
                                        (chapter: any) => ({
                                            ...chapter,
                                            isRead:
                                                chapter.slug ===
                                                selectedChapter.slug
                                                    ? true
                                                    : chapter.isRead,
                                        }),
                                    ),
                                },
                            }
                        },
                    )
                }
            }

            if (type === 'multiple') {
                const currentChapterIndex = data?.chapters.chapters.findIndex(
                    (chapter) => chapter.slug === selectedChapter?.slug,
                )

                if (!currentChapterIndex || currentChapterIndex === -1) return

                const chaptersToMark =
                    data?.chapters.chapters.slice(currentChapterIndex)

                if (!chaptersToMark) return

                const filteredChapters = chaptersToMark.filter(
                    (chapter) =>
                        !readChapters?.some(
                            (readChapter) =>
                                readChapter.chapterSlug === chapter.slug,
                        ),
                )

                if (filteredChapters.length !== 0) {
                    await db.insert(ReadChaptersTable).values(
                        filteredChapters.map((chapter) => ({
                            mangaSlug: name as string,
                            chapterSlug: chapter.slug,
                            readAt: new Date(),
                            currentPage: 0,
                        })),
                    )

                    queryClient.setQueryData(
                        ['manga-details', name],
                        (old: any) => {
                            if (!old) return null
                            return {
                                ...old,
                                chapters: {
                                    ...old.chapters,
                                    chapters: old.chapters.chapters.map(
                                        (chapter: any) => ({
                                            ...chapter,
                                            isRead: chaptersToMark.some(
                                                (filteredChapter) =>
                                                    filteredChapter.slug ===
                                                    chapter.slug,
                                            ),
                                        }),
                                    ),
                                },
                            }
                        },
                    )
                }
            }

            await queryClient.invalidateQueries({
                queryKey: ['read-chapters', name],
            })

            bottomSheetRef.current?.close()
        },
        [selectedChapter, readChapters, name],
    )

    const handleDownloadChapter = useCallback(
        async (chapter: MangaDetailsType['chapters']['chapters'][number]) => {
            try {
                const chapterData = await getChapterRequest({
                    title: name as string,
                    chapter: chapter.slug,
                })

                ToastAndroid.show('Downloading chapter...', ToastAndroid.SHORT)

                // Download all images
                const pagesWithLocalPaths = await Promise.all(
                    chapterData.map(async (url, index) => {
                        const localPath = await downloadImage(
                            url,
                            name as string,
                            chapter.slug,
                            index,
                        )
                        return { url, localPath }
                    }),
                )

                await db.insert(DownloadedChaptersTable).values({
                    mangaSlug: name as string,
                    chapterSlug: chapter.slug,
                    pages: pagesWithLocalPaths,
                })

                ToastAndroid.show(
                    'Chapter downloaded successfully',
                    ToastAndroid.SHORT,
                )
                queryClient.invalidateQueries({
                    queryKey: ['downloaded-chapters', name],
                })
            } catch (error) {
                ToastAndroid.show(
                    'Failed to download chapter',
                    ToastAndroid.SHORT,
                )
            }
        },
        [name],
    )

    const handleDeleteDownload = useCallback(
        async (chapter: MangaDetailsType['chapters']['chapters'][number]) => {
            try {
                // Delete local files
                await deleteChapterFiles(name as string, chapter.slug)

                // Delete from database
                await db
                    .delete(DownloadedChaptersTable)
                    .where(
                        and(
                            eq(
                                DownloadedChaptersTable.mangaSlug,
                                name as string,
                            ),
                            eq(
                                DownloadedChaptersTable.chapterSlug,
                                chapter.slug,
                            ),
                        ),
                    )
                ToastAndroid.show(
                    'Chapter deleted successfully',
                    ToastAndroid.SHORT,
                )
                queryClient.invalidateQueries({
                    queryKey: ['downloaded-chapters', name],
                })
            } catch (error) {
                ToastAndroid.show(
                    'Failed to delete chapter',
                    ToastAndroid.SHORT,
                )
            }
        },
        [name],
    )

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <ActivityIndicator size='large' color='#fff' />
            </View>
        )
    }

    if (!data) {
        return (
            <View className='flex-1 items-center justify-center gap-6 bg-[#121218] px-4'>
                <View className='items-center gap-3'>
                    <AlertCircle size={48} color='#908d94' />
                    <Text className='text-2xl font-semibold text-white'>
                        Oops!
                    </Text>
                    <Text className='text-center text-[#908d94]'>
                        We couldn't load the manga details. This might be due to
                        a network issue or the manga might not exist.
                    </Text>
                </View>

                <View className='flex-row items-center gap-4'>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className='flex-row items-center gap-2 rounded-lg bg-[#1f212b] px-4 py-2'
                    >
                        <ArrowLeft size={20} color='#fff' />
                        <Text className='font-medium text-white'>Go Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => refetch()}
                        className='flex-row items-center gap-2 rounded-lg bg-[#1f212b] px-4 py-2'
                    >
                        <RefreshCcw size={20} color='#fff' />
                        <Text className='font-medium text-white'>
                            Try Again
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <>
            <View className='flex-1 bg-[#121218]'>
                <ScrollView
                    className='flex-1'
                    onScroll={(event) =>
                        setHasScrolled(event.nativeEvent.contentOffset.y > 30)
                    }
                    scrollEventThrottle={16}
                    overScrollMode='always'
                    decelerationRate={'fast'}
                    showsVerticalScrollIndicator={true}
                    scrollsToTop
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefetch}
                        />
                    }
                >
                    {/* Header Section */}
                    <View className='relative h-72'>
                        <Image
                            source={{ uri: data.cover }}
                            className='h-full w-full object-cover object-center'
                            blurRadius={2}
                        />
                        <View className='absolute bottom-0 z-10 flex-row items-center gap-4 px-4'>
                            <Image
                                source={{ uri: data.cover }}
                                className='h-44 w-28 rounded-md object-cover object-center'
                            />
                            <View className='w-full'>
                                <Text
                                    className='mb-2 w-full max-w-[52%] text-2xl font-medium text-white'
                                    numberOfLines={3}
                                >
                                    {data.title}
                                </Text>
                                <TouchableOpacity className='flex-row items-center gap-1'>
                                    <User2
                                        className='text-[#908d94]'
                                        size={14}
                                        color={'#908d94'}
                                    />
                                    <Text className='font-medium text-[#908d94]'>
                                        {removeAllExtraSpaces(data.author.name)}
                                    </Text>
                                </TouchableOpacity>
                                <View className='flex-row items-center gap-1'>
                                    {data.status === 'Ongoing' ? (
                                        <Clock size={14} color={'#908d94'} />
                                    ) : (
                                        <CheckCheck
                                            size={14}
                                            color={'#908d94'}
                                        />
                                    )}
                                    <Text className='font-medium text-[#908d94]'>
                                        {data.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <LinearGradient
                            colors={['transparent', '#121218']}
                            className='absolute inset-0'
                        />
                    </View>

                    {/* Action Buttons */}
                    <View className='flex-row justify-around bg-[#121218] p-4'>
                        <TouchableOpacity
                            className='items-center'
                            onPress={async () => {
                                if (savedManga) {
                                    try {
                                        await db
                                            .delete(SavedMangaTable)
                                            .where(
                                                eq(
                                                    SavedMangaTable.slug,
                                                    name as string,
                                                ),
                                            )
                                        ToastAndroid.show(
                                            'Removed from library',
                                            ToastAndroid.SHORT,
                                        )
                                    } catch (error) {
                                        ToastAndroid.show(
                                            'Failed to remove from library',
                                            ToastAndroid.SHORT,
                                        )
                                    }
                                } else {
                                    try {
                                        await db
                                            .insert(SavedMangaTable)
                                            .values({
                                                title: data.title,
                                                cover: data.cover ?? '',
                                                slug: name as string,
                                                author: data.author,
                                                status: data.status,
                                                genres: data.genres,
                                                chapters: data.chapters,
                                                description:
                                                    data.description ?? '',
                                                lastUpdated: new Date(
                                                    data.lastUpdated ??
                                                        new Date(),
                                                ).toISOString(),
                                            })
                                        ToastAndroid.show(
                                            'Added to library',
                                            ToastAndroid.SHORT,
                                        )
                                    } catch (error) {
                                        ToastAndroid.show(
                                            'Failed to add to library',
                                            ToastAndroid.SHORT,
                                        )
                                    }
                                }

                                queryClient.invalidateQueries({
                                    queryKey: ['saved-manga'],
                                    refetchType: 'all',
                                })
                            }}
                        >
                            <Heart
                                color={savedManga ? '#a9c8fc' : '#908d94'}
                                fill={savedManga ? '#a9c8fc' : 'none'}
                                size={18}
                            />
                            <Text
                                className={cn(
                                    'mt-1 text-center text-sm font-medium text-[#908d94]',
                                    savedManga && 'text-[#a9c8fc]',
                                )}
                            >
                                {savedManga ? 'In Library' : 'Add to Library'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='items-center'>
                            <Hourglass size={18} color={'#908d94'} />
                            <Text className='mt-1 text-sm font-medium text-[#908d94]'>
                                {data.status === 'Ongoing' ? 'Soon' : 'N/A'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='items-center'>
                            <RefreshCcw size={18} color={'#908d94'} />
                            <Text className='mt-1 text-sm font-medium text-[#908d94]'>
                                Tracking
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='items-center'>
                            <Earth size={18} color={'#908d94'} />
                            <Text className='mt-1 text-sm font-medium text-[#908d94]'>
                                WebView
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <View
                        className={cn(
                            'relative h-16 overflow-hidden px-4',
                            synopsisExpanded && 'h-auto pb-6',
                        )}
                    >
                        <Text className='font-medium text-[#908d94]'>
                            {data.description}
                        </Text>
                        <LinearGradient
                            colors={['transparent', '#121218']}
                            className={cn(
                                'absolute bottom-0 h-8 w-full',
                                synopsisExpanded && 'h-0',
                            )}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    setSynopsisExpanded(!synopsisExpanded)
                                }
                                className='absolute bottom-0 left-0 right-0 items-center'
                            >
                                <RnAnimated.View
                                    style={{
                                        transform: [{ rotate: spin }],
                                    }}
                                >
                                    <ChevronDown size={20} color={'#fff'} />
                                </RnAnimated.View>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* Genres */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className='mt-4'
                        contentContainerClassName='gap-2 px-4'
                    >
                        {data.genres.map((genre) => (
                            <TouchableOpacity
                                key={genre.name}
                                className='rounded-lg border border-[#7e7d87] px-4 py-2'
                            >
                                <Text className='font-medium text-[#c4c4ce]'>
                                    {genre.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Chapters */}
                    <View className='mt-6 px-4'>
                        <Text className='mb-2 text-lg font-semibold text-white'>
                            {data.chapters.totalChapters} chapters
                        </Text>
                        <FlatList
                            data={data.chapters.chapters}
                            keyExtractor={(item) => item.title}
                            scrollEnabled={false}
                            renderItem={({ item: chapter }) => {
                                const isRead = chapter.isRead
                                return (
                                    <TouchableOpacity
                                        className='flex-row items-center justify-between py-4'
                                        onPress={() => {
                                            router.push(
                                                `/manga-details/${name}/read?chapter=${encodeURIComponent(chapter.slug)}`,
                                            )
                                        }}
                                        onLongPress={() =>
                                            handleChapterLongPress(chapter)
                                        }
                                        delayLongPress={500}
                                    >
                                        <View className='gap-2'>
                                            <Text
                                                className={cn(
                                                    'text-white',
                                                    isRead && 'opacity-50',
                                                )}
                                            >
                                                {chapter.title}
                                            </Text>
                                            <Text
                                                className={cn(
                                                    'flex-row items-center text-sm text-gray-400',
                                                    isRead && 'opacity-80',
                                                )}
                                            >
                                                {new Date(
                                                    chapter.timeUploaded ??
                                                        new Date(),
                                                ).toLocaleDateString()}{' '}
                                                <Text className='text-xs text-gray-500'>
                                                    {chapter.currentPage !=
                                                        null &&
                                                        chapter.currentPage !==
                                                            0 &&
                                                        `• Page: ${chapter.currentPage}`}
                                                </Text>
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                const isDownloaded =
                                                    downloadedChapters?.some(
                                                        (downloaded) =>
                                                            downloaded.chapterSlug ===
                                                            chapter.slug,
                                                    )
                                                if (isDownloaded) {
                                                    handleDeleteDownload(
                                                        chapter,
                                                    )
                                                } else {
                                                    handleDownloadChapter(
                                                        chapter,
                                                    )
                                                }
                                            }}
                                            className='p-2'
                                        >
                                            <ArrowDownCircle
                                                color={
                                                    downloadedChapters?.some(
                                                        (downloaded) =>
                                                            downloaded.chapterSlug ===
                                                            chapter.slug,
                                                    )
                                                        ? '#a9c8fc'
                                                        : '#8e8d96'
                                                }
                                                fill={
                                                    downloadedChapters?.some(
                                                        (downloaded) =>
                                                            downloaded.chapterSlug ===
                                                            chapter.slug,
                                                    )
                                                        ? '#a9c8fc'
                                                        : 'none'
                                                }
                                            />
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                )
                            }}
                        />
                    </View>
                </ScrollView>
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                enablePanDownToClose
                index={-1}
                enableDynamicSizing
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                    />
                )}
                backgroundStyle={{ backgroundColor: '#1a1c23' }}
            >
                <BottomSheetView className='flex-1 px-4 pb-7'>
                    <View className='flex-row items-center justify-between border-b border-[#2e2d33] pb-4'>
                        <Text className='text-lg font-semibold text-white'>
                            {selectedChapter?.title}
                        </Text>
                    </View>
                    <View className='mt-4 flex-row justify-around'>
                        <TouchableOpacity
                            className='items-center'
                            onPress={() => handleMarkAsRead('single')}
                        >
                            <CheckCheckIcon size={24} color='#908d94' />
                            <Text className='mt-1 text-sm font-medium text-[#908d94]'>
                                Mark as Read
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='items-center'
                            onPress={() => handleMarkAsRead('multiple')}
                        >
                            <View className='relative'>
                                <Check size={24} color='#908d94' />
                                <ArrowDown
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                    }}
                                    size={12}
                                    color='#908d94'
                                />
                            </View>
                            <Text className='mt-1 text-sm font-medium text-[#908d94]'>
                                Mark Below as Read
                            </Text>
                        </TouchableOpacity>
                    </View>
                </BottomSheetView>
            </BottomSheet>

            <Stack.Screen
                options={{
                    headerTitle: '',
                    headerTransparent: true,
                    headerBackground() {
                        return (
                            <Animated.View
                                style={animatedBgColor}
                                pointerEvents='box-none'
                            />
                        )
                    },
                }}
            />
        </>
    )
}
