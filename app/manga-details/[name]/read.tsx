import { ZoomableList } from '@/components/zoomable-list'
import { db } from '@/db'
import {
    DownloadedChaptersTable,
    HistoryTable,
    ReadChaptersTable,
} from '@/db/schema'
import { getChapterRequest, getMangaDetailsRequest } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { and, eq } from 'drizzle-orm'
import { Image } from 'expo-image'
import {
    Stack,
    useGlobalSearchParams,
    useLocalSearchParams,
    useRouter,
} from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import capitalize from 'just-capitalize'
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    RefreshCcw,
} from 'lucide-react-native'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
    ActivityIndicator,
    SectionList,
    Text,
    ToastAndroid,
    TouchableOpacity,
    useWindowDimensions,
    View,
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
        page: { url: string; localPath: string }
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
        const imageSource = useMemo(
            () => ({
                uri: page.localPath || page.url,
                headers: {
                    Referer: 'https://www.mangakakalot.gg/',
                },
            }),
            [page.localPath, page.url],
        )

        const imageStyle = useMemo(
            () => [
                imageDimensions[page.url] || {
                    width: width,
                    height: height,
                },
            ],
            [imageDimensions, page.url, width, height],
        )

        return (
            <View
                key={page.url}
                // onPress={onPress}
                className='relative w-full items-center'
            >
                {loadingStates[page.url] && (
                    <View
                        className='absolute inset-0 items-center justify-center'
                        style={{
                            width: imageDimensions[page.url]?.width || width,
                            height: imageDimensions[page.url]?.height || height,
                        }}
                    >
                        <ActivityIndicator size='large' color='#ffffff' />
                    </View>
                )}
                {errorStates[page.url] && (
                    <View
                        className='absolute inset-0 z-10 items-center justify-center'
                        style={{
                            width: imageDimensions[page.url]?.width || width,
                            height: imageDimensions[page.url]?.height || height,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => retryImageLoad(page.url)}
                        >
                            <Text className='text-white'>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <Image
                    source={imageSource}
                    contentFit='contain'
                    onLoad={(e) => handleImageLoad(page.url, e)}
                    onError={() => handleImageError(page.url)}
                    style={imageStyle}
                    recyclingKey={page.url}
                    cachePolicy={'memory'}
                />
            </View>
        )
    },
    (prevProps, nextProps) => {
        return (
            prevProps.page.url === nextProps.page.url &&
            prevProps.page.localPath === nextProps.page.localPath &&
            prevProps.loadingStates[prevProps.page.url] ===
                nextProps.loadingStates[nextProps.page.url] &&
            prevProps.errorStates[prevProps.page.url] ===
                nextProps.errorStates[nextProps.page.url] &&
            JSON.stringify(prevProps.imageDimensions[prevProps.page.url]) ===
                JSON.stringify(nextProps.imageDimensions[nextProps.page.url])
        )
    },
)

const SectionSeparator = memo(
    ({
        section,
        hasNextChapter,
        currentChapterTitle,
    }: {
        section: { title: string }
        hasNextChapter: boolean
        currentChapterTitle: string
    }) => (
        <View className='px-6 py-10'>
            <Text className='text-2xl text-white'>
                {capitalize(section.title)
                    .replace('-', ' ')
                    .replaceAll('-', '.')}
            </Text>
            {currentChapterTitle === section.title && hasNextChapter && (
                <Text className='text-sm text-white'>Current Chapter</Text>
            )}

            {currentChapterTitle === section.title && !hasNextChapter ? (
                <Text className='text-sm text-white'>Last Chapter</Text>
            ) : (
                !(currentChapterTitle === section.title && hasNextChapter) && (
                    <Text className='text-sm text-white'>Next Chapter</Text>
                )
            )}
        </View>
    ),
)

export default function MangaReaderScreen() {
    const queryClient = useQueryClient()
    const insets = useSafeAreaInsets()
    const { name } = useLocalSearchParams()
    const { chapter } = useGlobalSearchParams()
    const { width, height } = useWindowDimensions()
    const [currentPage, setCurrentPage] = useState(1)
    const [currentChapterTitle, setCurrentChapterTitle] = useState<string>(
        chapter as string,
    )
    const [isLoadingNextChapter, setIsLoadingNextChapter] = useState(false)
    const [hasFailedToLoadNextChapter, setHasFailedToLoadNextChapter] =
        useState(false)
    const [isControlsVisible, setIsControlsVisible] = useState(true)
    const headerTranslateY = useSharedValue(0)
    const indicatorTranslateY = useSharedValue(0)

    const imageDimensionsRef = useRef<{
        [key: string]: { width: number; height: number }
    }>({})
    const loadingStatesRef = useRef<{
        [key: string]: boolean
    }>({})
    const errorStatesRef = useRef<{
        [key: string]: boolean
    }>({})

    const [imageDimensions, setImageDimensions] = useState<{
        [key: string]: { width: number; height: number }
    }>({})
    const [loadingStates, setLoadingStates] = useState<{
        [key: string]: boolean
    }>({})
    const [errorStates, setErrorStates] = useState<{
        [key: string]: boolean
    }>({})

    const debounceTimerRef = useRef<number | null>(null)
    const sectionListRef = useRef<SectionList>(null)

    const toggleControls = useCallback(() => {
        setIsControlsVisible((prev) => {
            const newValue = !prev
            headerTranslateY.value = withSpring(newValue ? 0 : -100, {
                damping: 20,
                stiffness: 200,
            })
            indicatorTranslateY.value = withSpring(newValue ? 0 : 150, {
                damping: 20,
                stiffness: 200,
            })
            return newValue
        })
    }, [headerTranslateY, indicatorTranslateY])

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
            loadedPages: { url: string; localPath: string }[]
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

    const { data: downloadedChapter, isLoading: isDownloadedChapterLoading } =
        useQuery({
            queryKey: ['downloaded-chapter', name, chapter],
            queryFn: async () => {
                const result = await db.query.DownloadedChaptersTable.findFirst(
                    {
                        where: and(
                            eq(
                                DownloadedChaptersTable.mangaSlug,
                                name as string,
                            ),
                            eq(
                                DownloadedChaptersTable.chapterSlug,
                                chapter as string,
                            ),
                        ),
                    },
                )

                return result || null
            },
            staleTime: 5 * 60 * 1000,
        })

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['manga-chapter', name, chapter],
        queryFn: async () => {
            if (downloadedChapter) {
                return downloadedChapter.pages
            }
            const chapterData = await getChapterRequest({
                title: name as string,
                chapter: chapter as string,
            })
            return chapterData.map((url) => ({ url, localPath: '' }))
        },
        refetchOnMount: false,
        enabled: !isDownloadedChapterLoading,
        staleTime: 5 * 60 * 1000,
    })

    const { data: mangaDetails } = useQuery({
        queryKey: ['manga-details', name],
        queryFn: () => getMangaDetailsRequest({ title: name as string }),
        refetchOnMount: false,
        staleTime: 5 * 60 * 1000,
    })

    const { mutate: updateHistory } = useMutation({
        mutationFn: async () => {
            if (!mangaDetails) return

            const existingHistory = await db.query.HistoryTable.findFirst({
                where: eq(HistoryTable.mangaSlug, name as string),
            })

            if (existingHistory) {
                await db
                    .update(HistoryTable)
                    .set({
                        chapterSlug: currentChapterTitle,
                        readAt: new Date(),
                    })
                    .where(eq(HistoryTable.id, existingHistory.id))
            } else {
                await db.insert(HistoryTable).values({
                    mangaSlug: name as string,
                    mangaTitle: mangaDetails.title || '',
                    mangaCover: mangaDetails.cover || '',
                    chapterSlug: currentChapterTitle,
                    readAt: new Date(),
                })
            }

            await queryClient.invalidateQueries({
                queryKey: ['history'],
            })
        },
    })

    const { mutate: updateReadChapter } = useMutation({
        mutationFn: async () => {
            if (!mangaDetails) return
            const readChapter = await db.query.ReadChaptersTable.findFirst({
                where: and(
                    eq(ReadChaptersTable.chapterSlug, currentChapterTitle),
                    eq(ReadChaptersTable.mangaSlug, name as string),
                ),
            })

            if (readChapter) {
                await db
                    .update(ReadChaptersTable)
                    .set({
                        currentPage:
                            currentPage >= totalChapterPages - 2
                                ? 0
                                : currentPage,
                    })
                    .where(eq(ReadChaptersTable.id, readChapter.id))
            } else {
                await db.insert(ReadChaptersTable).values({
                    mangaSlug: name as string,
                    chapterSlug: currentChapterTitle,
                    currentPage:
                        currentPage === totalChapterPages ||
                        currentPage === totalChapterPages - 1
                            ? 0
                            : currentPage,
                })
            }

            queryClient.setQueryData(['manga-details', name], (old: any) => {
                if (!old) return null
                return {
                    ...old,
                    chapters: {
                        ...old.chapters,
                        chapters: old.chapters.chapters.map((chapter: any) => ({
                            ...chapter,
                            isRead:
                                chapter.slug === currentChapterTitle
                                    ? true
                                    : chapter.isRead,
                            currentPage:
                                chapter.slug === currentChapterTitle
                                    ? currentPage
                                    : chapter.currentPage,
                        })),
                    },
                }
            })

            await queryClient.invalidateQueries({
                queryKey: ['read-chapters', name],
            })
            await queryClient.invalidateQueries({
                queryKey: ['saved-manga'],
            })
        },
    })

    const router = useRouter()

    useEffect(() => {
        if (data || downloadedChapter) {
            setSectionsState((prev) => {
                if (prev.data.at(0)?.loadedPages.length === 0)
                    return {
                        ...prev,
                        data: [
                            {
                                title: chapter as string,
                                loadedPages:
                                    downloadedChapter?.pages || data || [],
                            },
                        ],
                    }

                return prev
            })
        }
    }, [data, downloadedChapter])

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
            updateHistory()
        }, 1000)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [currentChapterTitle, updateHistory])

    useEffect(() => {
        if (currentPage !== totalChapterPages && currentPage < 2) return

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        debounceTimerRef.current = setTimeout(() => {
            updateReadChapter()
        }, 1000)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [currentPage, updateReadChapter])

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

    const handleImageLoad = useCallback(
        (page: string, e: any) => {
            const { width: imgWidth, height: imgHeight } = e.source
            const dimensions = calculateDimensions(imgWidth, imgHeight)

            imageDimensionsRef.current[page] = dimensions
            loadingStatesRef.current[page] = false
            errorStatesRef.current[page] = false

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
        },
        [calculateDimensions],
    )

    const handleImageError = useCallback((page: string) => {
        loadingStatesRef.current[page] = false
        errorStatesRef.current[page] = true

        setLoadingStates((prev) => ({
            ...prev,
            [page]: false,
        }))
        setErrorStates((prev) => ({
            ...prev,
            [page]: true,
        }))
    }, [])

    const retryImageLoad = useCallback(async (page: string) => {
        await fetch(page, {
            headers: {
                Referer: 'https://www.mangakakalot.gg/',
            },
        })

        loadingStatesRef.current[page] = true
        errorStatesRef.current[page] = false

        setLoadingStates((prev) => ({
            ...prev,
            [page]: true,
        }))
        setErrorStates((prev) => ({
            ...prev,
            [page]: false,
        }))
    }, [])

    const renderItem = useCallback(
        ({ item: page }: { item: { url: string; localPath: string } }) => {
            return (
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
            )
        },
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
        try {
            setIsLoadingNextChapter(true)
            const currentChapterIdx = sectionsState.data.findIndex(
                (section) => section.title === sectionsState.currentChapter,
            )

            if (currentChapterIdx === -1) return

            const nextChapterIdx = mangaDetails?.chapters?.chapters?.findIndex(
                (page: any) => page.slug === sectionsState.currentChapter,
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

            const downloadedNextChapter =
                await db.query.DownloadedChaptersTable.findFirst({
                    where: and(
                        eq(DownloadedChaptersTable.mangaSlug, name as string),
                        eq(
                            DownloadedChaptersTable.chapterSlug,
                            nextChapter.slug,
                        ),
                    ),
                })

            let nextChapterData: { url: string; localPath: string }[]
            if (downloadedNextChapter?.pages) {
                nextChapterData = downloadedNextChapter.pages
            } else {
                const chapterData = await getChapterRequest({
                    title: name as string,
                    chapter: nextChapter.slug,
                })
                nextChapterData = chapterData.map((url) => ({
                    url,
                    localPath: '',
                }))
            }

            setSectionsState((prev) => {
                const newData = [...prev.data]
                const existingSectionIndex = newData.findIndex(
                    (section) => section.title === nextChapter.slug,
                )

                if (existingSectionIndex !== -1) {
                    newData[existingSectionIndex] = {
                        ...newData[existingSectionIndex],
                        loadedPages: nextChapterData,
                    }
                } else {
                    newData.push({
                        title: nextChapter.slug,
                        loadedPages: nextChapterData,
                    })
                }

                return {
                    ...prev,
                    currentChapter: nextChapter.slug,
                    loadedChapters: Array.from(
                        new Set([...prev.loadedChapters, nextChapter.slug]),
                    ),
                    data: newData,
                }
            })

            setCurrentChapterTitle(nextChapter.slug)
            setHasFailedToLoadNextChapter(false)
        } catch (error) {
            setHasFailedToLoadNextChapter(true)
        } finally {
            setIsLoadingNextChapter(false)
        }
    }, [
        sectionsState.currentChapter,
        sectionsState.loadedChapters,
        mangaDetails?.chapters?.chapters,
        name,
        hasFailedToLoadNextChapter,
        setHasFailedToLoadNextChapter,
    ])

    const handleViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: any[] }) => {
            const chapterTitle = viewableItems.at(0)?.section?.title
            if (chapterTitle) setCurrentChapterTitle(chapterTitle)
            if (viewableItems.length > 0) {
                const sectionIndex = sections.findIndex(
                    (s) => s.title === chapterTitle,
                )
                if (sectionIndex !== -1) {
                    const pageIndex = sections[sectionIndex].data.findIndex(
                        (page) => page.url === viewableItems[0].item.url,
                    )
                    setCurrentPage(pageIndex + 1)
                }
            }
        },
        [sections],
    )

    const keyExtractor = useCallback(
        (item: { url: string; localPath: string }) => item.url,
        [],
    )

    const hasNextChapter = useMemo(() => {
        const nextChapterIdx = mangaDetails?.chapters?.chapters?.findIndex(
            (chapter) => chapter.slug === currentChapterTitle,
        )

        return nextChapterIdx !== -1 && nextChapterIdx !== 0
    }, [mangaDetails?.chapters?.chapters, currentChapterTitle])

    const hasPreviousChapter = useMemo(() => {
        const previousChapterIdx = mangaDetails?.chapters?.chapters?.findIndex(
            (chapter) => chapter.slug === currentChapterTitle,
        )

        return (
            previousChapterIdx !== -1 &&
            previousChapterIdx !==
                (mangaDetails?.chapters?.chapters?.length || 0) - 1
        )
    }, [mangaDetails?.chapters?.chapters, currentChapterTitle])

    if (isLoading || isDownloadedChapterLoading) {
        return (
            <View className='flex-1 items-center justify-center gap-4 bg-[#010001]'>
                <ActivityIndicator size='large' color='#ffffff' />
            </View>
        )
    }

    if (!data && !downloadedChapter) {
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
                <ZoomableList onTap={toggleControls}>
                    <SectionList
                        ref={sectionListRef}
                        sections={sections}
                        showsVerticalScrollIndicator={false}
                        SectionSeparatorComponent={({ section }) => (
                            <SectionSeparator
                                section={section}
                                hasNextChapter={hasNextChapter}
                                currentChapterTitle={currentChapterTitle}
                            />
                        )}
                        onEndReachedThreshold={0.85}
                        onEndReached={handleEndReached}
                        maxToRenderPerBatch={7}
                        initialNumToRender={7}
                        windowSize={8}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        onViewableItemsChanged={handleViewableItemsChanged}
                        contentContainerStyle={{
                            paddingBottom: insets.bottom,
                        }}
                        disableScrollViewPanResponder
                        nestedScrollEnabled
                    />
                </ZoomableList>

                {isLoadingNextChapter && (
                    <View className='absolute bottom-24 left-1/2 z-50 -translate-x-1/2 flex-row items-center justify-center rounded-full bg-[#1c1e25]/80 px-6 py-3 shadow-lg'>
                        <ActivityIndicator size='small' color='#ffffff' />
                        <Text className='ml-2 text-sm font-medium text-white'>
                            Loading next chapter...
                        </Text>
                    </View>
                )}

                {hasFailedToLoadNextChapter && !isLoadingNextChapter && (
                    <View className='absolute bottom-24 left-1/2 z-50 -translate-x-1/2 flex-col items-center justify-center rounded-full bg-[#1c1e25]/80 px-6 py-3 shadow-lg'>
                        <View className='flex-row items-center gap-2'>
                            <AlertCircle size={16} color='#ff6b6b' />
                            <Text className='text-sm font-medium text-white'>
                                Failed to load next chapter
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleEndReached()}>
                            <Text className='text-sm font-medium text-white'>
                                Retry
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <Animated.View
                style={[
                    indicatorStyle,
                    {
                        bottom: insets.bottom + 16,
                    },
                ]}
                className='absolute right-4 flex-row items-center justify-center gap-4'
            >
                {hasPreviousChapter && (
                    <TouchableOpacity
                        disabled={!hasPreviousChapter}
                        onPress={() => {
                            if (!hasPreviousChapter)
                                return ToastAndroid.show(
                                    'No previous chapter',
                                    ToastAndroid.SHORT,
                                )

                            const previousChapterIdx =
                                mangaDetails?.chapters?.chapters?.findIndex(
                                    (chapter) =>
                                        chapter.slug === currentChapterTitle,
                                )

                            if (
                                previousChapterIdx == null ||
                                previousChapterIdx === -1
                            )
                                return ToastAndroid.show(
                                    'Failed to load previous chapter',
                                    ToastAndroid.SHORT,
                                )

                            const previousChapter =
                                mangaDetails?.chapters?.chapters?.at(
                                    previousChapterIdx + 1,
                                )

                            if (!previousChapter)
                                return ToastAndroid.show(
                                    'Failed to load previous chapter',
                                    ToastAndroid.SHORT,
                                )

                            router.replace(
                                `/manga-details/${name}/read?chapter=${encodeURIComponent(previousChapter.slug)}`,
                            )
                        }}
                        className='rounded-full bg-[#1c1e25]/80 p-2 shadow-lg'
                    >
                        <ArrowLeft size={24} color='#fff' />
                    </TouchableOpacity>
                )}

                <View className='rounded-full bg-[#1c1e25]/80 px-6 py-3 shadow-lg'>
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
                </View>

                {hasNextChapter && (
                    <TouchableOpacity
                        disabled={!hasNextChapter}
                        onPress={() => {
                            if (!hasNextChapter)
                                return ToastAndroid.show(
                                    'No next chapter',
                                    ToastAndroid.SHORT,
                                )

                            const nextChapterIdx =
                                mangaDetails?.chapters?.chapters?.findIndex(
                                    (chapter) =>
                                        chapter.slug === currentChapterTitle,
                                )

                            if (nextChapterIdx == null || nextChapterIdx === -1)
                                return ToastAndroid.show(
                                    'Failed to load next chapter',
                                    ToastAndroid.SHORT,
                                )

                            const nextChapter =
                                mangaDetails?.chapters?.chapters?.at(
                                    nextChapterIdx - 1,
                                )

                            if (!nextChapter)
                                return ToastAndroid.show(
                                    'Failed to load next chapter',
                                    ToastAndroid.SHORT,
                                )

                            router.replace(
                                `/manga-details/${name}/read?chapter=${encodeURIComponent(nextChapter.slug)}`,
                            )
                        }}
                        className='rounded-full bg-[#1c1e25]/80 p-2 shadow-lg'
                    >
                        <ArrowRight size={24} color='#fff' />
                    </TouchableOpacity>
                )}
            </Animated.View>
            <Stack.Screen
                options={{
                    headerTransparent: true,
                    header: () => (
                        <Animated.View
                            style={[
                                headerStyle,
                                {
                                    paddingTop: insets.top,
                                    paddingBottom: 10,
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

            <StatusBar hidden={!isControlsVisible} />
        </>
    )
}
