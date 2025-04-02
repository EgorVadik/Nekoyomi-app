import { db } from '@/db'
import { HistoryTable } from '@/db/schema'
import { getChapterRequest, getMangaDetailsRequest } from '@/lib/api'
import { extractNumberFromChapterTitle } from '@/lib/utils'
import { useHeaderHeight } from '@react-navigation/elements'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { Image } from 'expo-image'
import {
    Stack,
    useGlobalSearchParams,
    useLocalSearchParams,
    useRouter,
} from 'expo-router'
import capitalize from 'just-capitalize'
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react-native'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    SectionList,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const MangaPage = memo(
    ({
        page,
        width,
        height,
        imageDimensions,
        loadingStates,
        errorStates,
        handleImageLoad,
        handleImageError,
        retryImageLoad,
        onPress,
    }: {
        page: string
        width: number
        height: number
        imageDimensions: { [key: string]: { width: number; height: number } }
        loadingStates: { [key: string]: boolean }
        errorStates: { [key: string]: boolean }
        handleImageLoad: (page: string, e: any) => void
        handleImageError: (page: string) => void
        retryImageLoad: (page: string) => void
        onPress: () => void
    }) => {
        return (
            <TouchableOpacity
                key={page}
                activeOpacity={1}
                onPress={onPress}
                className='relative w-full'
            >
                {loadingStates[page] && (
                    <View
                        className='absolute inset-0 items-center justify-center'
                        style={{
                            width: imageDimensions[page]?.width || width,
                            height: imageDimensions[page]?.height || height,
                        }}
                    >
                        <ActivityIndicator size='large' color='#ffffff' />
                    </View>
                )}
                {errorStates[page] && (
                    <View
                        className='absolute inset-0 z-10 items-center justify-center'
                        style={{
                            width: imageDimensions[page]?.width || width,
                            height: imageDimensions[page]?.height || height,
                        }}
                    >
                        <TouchableOpacity onPress={() => retryImageLoad(page)}>
                            <Text className='text-white'>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <Image
                    source={{
                        uri: page,
                        headers: {
                            Referer: 'https://www.mangakakalot.gg/',
                        },
                    }}
                    contentFit='contain'
                    onLoad={(e) => handleImageLoad(page, e)}
                    onError={() => handleImageError(page)}
                    style={[
                        imageDimensions[page] || {
                            width: width,
                            height: height,
                        },
                    ]}
                />
            </TouchableOpacity>
        )
    },
)

export default function MangaReaderScreen() {
    const queryClient = useQueryClient()
    const headerHeight = useHeaderHeight()
    const insets = useSafeAreaInsets()
    const { name } = useLocalSearchParams()
    const { chapter } = useGlobalSearchParams()
    const { width, height } = useWindowDimensions()
    const [currentPage, setCurrentPage] = useState(1)
    const [currentChapterTitle, setCurrentChapterTitle] = useState<string>(
        chapter as string,
    )
    const [isControlsVisible, setIsControlsVisible] = useState(true)
    const headerTranslateY = useSharedValue(0)
    const indicatorTranslateY = useSharedValue(0)
    const [imageDimensions, setImageDimensions] = useState<{
        [key: string]: { width: number; height: number }
    }>({})
    const [loadingStates, setLoadingStates] = useState<{
        [key: string]: boolean
    }>({})
    const [errorStates, setErrorStates] = useState<{
        [key: string]: boolean
    }>({})

    const toggleControls = useCallback(() => {
        setIsControlsVisible((prev) => !prev)
        headerTranslateY.value = withSpring(isControlsVisible ? -100 : 0, {
            damping: 20,
            stiffness: 200,
        })
        indicatorTranslateY.value = withSpring(isControlsVisible ? 100 : 0, {
            damping: 20,
            stiffness: 200,
        })
    }, [isControlsVisible, headerTranslateY, indicatorTranslateY])

    const headerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: headerTranslateY.value }],
        }
    })

    const indicatorStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: indicatorTranslateY.value }],
        }
    })

    const [sectionsState, setSectionsState] = useState<{
        data: {
            title: string
            loadedPages: string[]
        }[]
        currentChapter: string
        loadedChapters: string[]
    }>({
        data: [
            {
                title: chapter as string,
                loadedPages: [],
            },
        ],
        currentChapter: chapter as string,
        loadedChapters: [chapter as string],
    })
    const sections = useMemo(
        () =>
            sectionsState.data.map((section) => ({
                title: section.title,
                data: section.loadedPages,
            })),
        [sectionsState.data],
    )

    const totalChapterPages = useMemo(() => {
        return sectionsState.data[
            sectionsState.data.findIndex((s) => s.title === currentChapterTitle)
        ]?.loadedPages.length
    }, [sectionsState.data, currentChapterTitle])

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['manga-chapter', name, chapter],
        queryFn: () =>
            getChapterRequest({
                title: name as string,
                chapter: chapter as string,
            }),
        refetchOnMount: false,
    })
    const { data: mangaDetails } = useQuery({
        queryKey: ['manga-details', name],
        queryFn: () => getMangaDetailsRequest({ title: name as string }),
        refetchOnMount: false,
    })
    const { mutate: updateHistory } = useMutation({
        mutationFn: async () => {
            if (!mangaDetails) return

            const existingHistory = await db.query.HistoryTable.findFirst({
                where: eq(HistoryTable.mangaSlug, name as string),
            })

            if (existingHistory) {
                try {
                    await db
                        .update(HistoryTable)
                        .set({
                            chapterSlug: currentChapterTitle,
                            readAt: new Date(),
                        })
                        .where(eq(HistoryTable.id, existingHistory.id))
                } catch (error) {
                    console.log(error)
                }
            } else {
                try {
                    await db.insert(HistoryTable).values({
                        mangaSlug: name as string,
                        mangaTitle: mangaDetails.title,
                        mangaCover: mangaDetails.cover || '',
                        chapterSlug: currentChapterTitle,
                        readAt: new Date(),
                    })
                } catch (error) {
                    console.log(error)
                }
            }

            await queryClient.invalidateQueries({
                queryKey: ['history'],
            })
        },
    })

    const router = useRouter()

    useEffect(() => {
        if (data) {
            setSectionsState((prev) => {
                if (prev.data.at(0)?.loadedPages.length === 0)
                    return {
                        ...prev,
                        data: [
                            {
                                title: chapter as string,
                                loadedPages: data,
                            },
                        ],
                    }

                return prev
            })
        }
    }, [data])

    useEffect(() => {
        updateHistory()
    }, [currentChapterTitle])

    const calculateDimensions = useCallback(
        (originalWidth: number, originalHeight: number) => {
            const aspectRatio = originalWidth / originalHeight
            const screenAspectRatio = width / height

            if (aspectRatio > screenAspectRatio) {
                return {
                    width: width,
                    height: width / aspectRatio,
                }
            } else {
                return {
                    width: height * aspectRatio,
                    height: height,
                }
            }
        },
        [width, height],
    )

    const handleImageLoad = (page: string, e: any) => {
        const { width: imgWidth, height: imgHeight } = e.source
        const dimensions = calculateDimensions(imgWidth, imgHeight)
        setImageDimensions((prev) => ({
            ...prev,
            [page]: dimensions,
        }))
        setLoadingStates((prev) => ({
            ...prev,
            [page]: false,
        }))
        setErrorStates((prev) => ({
            ...prev,
            [page]: false,
        }))
    }

    const handleImageError = (page: string) => {
        setLoadingStates((prev) => ({
            ...prev,
            [page]: false,
        }))
        setErrorStates((prev) => ({
            ...prev,
            [page]: true,
        }))
    }

    const retryImageLoad = async (page: string) => {
        await fetch(page, {
            headers: {
                Referer: 'https://www.mangakakalot.gg/',
            },
        })

        setLoadingStates((prev) => ({
            ...prev,
            [page]: true,
        }))
        setErrorStates((prev) => ({
            ...prev,
            [page]: false,
        }))
    }

    const renderItem = useCallback(
        ({ item: page }: { item: string }) => (
            <MangaPage
                page={page}
                width={width}
                height={height}
                imageDimensions={imageDimensions}
                loadingStates={loadingStates}
                errorStates={errorStates}
                handleImageLoad={handleImageLoad}
                handleImageError={handleImageError}
                retryImageLoad={retryImageLoad}
                onPress={toggleControls}
            />
        ),
        [
            width,
            height,
            imageDimensions,
            loadingStates,
            errorStates,
            handleImageLoad,
            handleImageError,
            retryImageLoad,
            toggleControls,
        ],
    )

    const handleEndReached = useCallback(async () => {
        const currentChapterIdx = sectionsState.data.findIndex(
            (section) => section.title === sectionsState.currentChapter,
        )

        if (currentChapterIdx === -1) return

        const nextChapterIdx = mangaDetails?.chapters?.chapters?.findIndex(
            (page) => page.slug === sectionsState.currentChapter,
        )

        if (!nextChapterIdx || nextChapterIdx === -1) return

        const nextChapter = mangaDetails?.chapters?.chapters?.at(
            nextChapterIdx - 1,
        )

        if (
            !nextChapter ||
            new Set(sectionsState.loadedChapters).has(nextChapter.slug)
        )
            return

        const nextChapterData = await getChapterRequest({
            title: name as string,
            chapter: nextChapter.slug,
        })

        setSectionsState((prev) => ({
            ...prev,
            currentChapter: nextChapter.slug,
            loadedChapters: Array.from(
                new Set([...prev.loadedChapters, nextChapter.slug]),
            ),
            data: new Set(prev.loadedChapters).has(nextChapter.slug)
                ? prev.data
                : [
                      ...prev.data,
                      {
                          title: nextChapter.slug,
                          loadedPages: nextChapterData,
                      },
                  ],
        }))
    }, [
        sectionsState.currentChapter,
        sectionsState.loadedChapters,
        mangaDetails?.chapters?.chapters,
        name,
    ])

    // const handleStartReached = useCallback(async () => {
    //     const currentChapterIdx = sectionsState.data.findIndex(
    //         (section) => section.title === sectionsState.currentChapter,
    //     )

    //     if (currentChapterIdx === -1) return

    //     const prevChapterIdx = mangaDetails?.chapters?.chapters?.findIndex(
    //         (page) => page.slug === sectionsState.currentChapter,
    //     )

    //     if (!prevChapterIdx || prevChapterIdx === -1) return

    //     const prevChapter = mangaDetails?.chapters?.chapters?.at(
    //         prevChapterIdx + 1,
    //     )

    //     if (
    //         !prevChapter ||
    //         new Set(sectionsState.loadedChapters).has(prevChapter.slug)
    //     )
    //         return

    //     const prevChapterData = await getChapterRequest({
    //         title: name as string,
    //         chapter: prevChapter.slug,
    //     })

    //     setSectionsState((prev) => ({
    //         ...prev,
    //         currentChapter: prevChapter.slug,
    //         loadedChapters: [...prev.loadedChapters, prevChapter.slug],
    //         data: [
    //             { title: prevChapter.slug, loadedPages: prevChapterData },
    //             ...prev.data,
    //         ],
    //     }))
    // }, [
    //     sectionsState.currentChapter,
    //     sectionsState.loadedChapters,
    //     mangaDetails?.chapters?.chapters,
    // ])

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center gap-4 bg-[#010001]'>
                <ActivityIndicator size='large' color='#ffffff' />
            </View>
        )
    }

    if (!data) {
        return (
            <View className='flex-1 items-center justify-center gap-6 bg-[#010001] px-4'>
                <View className='items-center gap-3'>
                    <AlertCircle size={48} color='#908d94' />
                    <Text className='text-2xl font-semibold text-white'>
                        Oops!
                    </Text>
                    <Text className='text-center text-[#908d94]'>
                        We couldn't load the chapter. This might be due to a
                        network issue or the chapter might not exist.
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
            <View className='flex-1 bg-[#010001]'>
                <SectionList
                    sections={sections}
                    showsVerticalScrollIndicator={false}
                    SectionSeparatorComponent={({ section }) => (
                        <View className='px-6 py-10'>
                            <Text className='text-2xl text-white'>
                                {capitalize(section.title)
                                    .replace('-', ' ')
                                    .replaceAll('-', '.')}
                            </Text>
                        </View>
                    )}
                    onEndReachedThreshold={3}
                    onEndReached={handleEndReached}
                    maxToRenderPerBatch={5}
                    initialNumToRender={5}
                    windowSize={3}
                    removeClippedSubviews={true}
                    renderItem={renderItem}
                    keyExtractor={(item) => item}
                    onViewableItemsChanged={({ viewableItems }) => {
                        const chapterTitle = viewableItems.at(0)?.section?.title
                        if (chapterTitle) setCurrentChapterTitle(chapterTitle)
                        if (viewableItems.length > 0) {
                            const sectionIndex = sections.findIndex(
                                (s) => s.title === chapterTitle,
                            )
                            if (sectionIndex !== -1) {
                                const pageIndex = sections[
                                    sectionIndex
                                ].data.findIndex(
                                    (page) => page === viewableItems[0].item,
                                )
                                setCurrentPage(pageIndex + 1)
                            }
                        }
                    }}
                />
            </View>

            {/* Page Progress Indicator */}
            <Animated.View
                style={[indicatorStyle]}
                className='absolute bottom-8 left-1/2 -translate-x-1/2 flex-row items-center justify-center rounded-full bg-[#1c1e25]/80 px-6 py-3 shadow-lg'
            >
                <View className='flex-row items-center gap-2'>
                    <View className='h-1 w-20 rounded-full bg-[#2d2f3a]'>
                        <View
                            className='h-full rounded-full bg-white'
                            style={{
                                width: `${(currentPage / (totalChapterPages || 1)) * 100}%`,
                            }}
                        />
                    </View>
                    <Text className='text-sm font-medium text-white'>
                        {currentPage} / {totalChapterPages || 1}
                    </Text>
                </View>
            </Animated.View>
            <Stack.Screen
                options={{
                    headerTransparent: true,
                    header: () => (
                        <Animated.View
                            style={[
                                headerStyle,
                                {
                                    height: headerHeight,
                                    paddingTop: insets.top,
                                },
                            ]}
                            className='w-full bg-[#1c1e25]/80'
                            pointerEvents='box-none'
                        >
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className='h-full w-full flex-row items-center gap-3 px-4'
                            >
                                <ArrowLeft size={24} color='#fff' />
                                <View className='flex-col'>
                                    <Text
                                        className='text-xl font-medium text-white'
                                        numberOfLines={1}
                                    >
                                        {mangaDetails?.title}
                                    </Text>
                                    <Text className='text-white'>
                                        {capitalize(currentChapterTitle)
                                            .replace('-', ' ')
                                            .replaceAll('-', '.')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ),
                }}
            />
        </>
    )
}
