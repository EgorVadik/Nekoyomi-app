import { db } from '@/db'
import { SavedMangaTable } from '@/db/schema'
import { getMangaDetailsRequest } from '@/lib/api'
import { cn, removeAllExtraSpaces } from '@/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { eq } from 'drizzle-orm'
import { LinearGradient } from 'expo-linear-gradient'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import {
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
    AlertCircle,
} from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    Animated as RnAnimated,
    ScrollView,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

export default function MangaDetails() {
    const { name } = useLocalSearchParams()
    const queryClient = useQueryClient()
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['manga-details', name],
        queryFn: () => getMangaDetailsRequest({ title: name as string }),
        refetchOnMount: false,
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
                            renderItem={({ item: chapter }) => (
                                <TouchableOpacity
                                    className='flex-row items-center justify-between py-4'
                                    onPress={() => {
                                        router.push(
                                            `/manga-details/${name}/read?chapter=${encodeURIComponent(chapter.slug)}`,
                                        )
                                    }}
                                >
                                    <View className='gap-2'>
                                        <Text className='text-white'>
                                            {chapter.title}
                                        </Text>
                                        <Text className='text-sm text-gray-400'>
                                            {new Date(
                                                chapter.timeUploaded ??
                                                    new Date(),
                                            ).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <ArrowDownCircle color={'#8e8d96'} />
                                </TouchableOpacity>
                            )}
                        />
                        {/* {data.chapters.chapters.map((chapter) => (
                            <TouchableOpacity
                                key={chapter.title}
                                className='flex-row items-center justify-between py-4'
                                onPress={() => {
                                    router.push(
                                        `/manga-details/${name}/read?chapter=${encodeURIComponent(chapter.title)}`,
                                    )
                                }}
                            >
                                <View className='gap-2'>
                                    <Text className='text-white'>
                                        {chapter.title}
                                    </Text>
                                    <Text className='text-sm text-gray-400'>
                                        {new Date(
                                            chapter.timeUploaded ?? new Date(),
                                        ).toLocaleDateString()}
                                    </Text>
                                </View>
                                <ArrowDownCircle color={'#8e8d96'} />
                            </TouchableOpacity>
                        ))} */}
                    </View>
                </ScrollView>
            </View>

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
