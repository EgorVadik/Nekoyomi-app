import { Manga } from '@/lib/types'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'

export const MangaCard = ({
    item,
    inLibrary = false,
    unReadChaptersCount = null,
}: {
    item: Manga
    inLibrary?: boolean
    unReadChaptersCount?: number | null
}) => {
    return (
        <TouchableOpacity
            className='mb-2 p-1'
            onPress={() => {
                router.push({
                    pathname: `/manga-details/[name]`,
                    params: {
                        name: `${encodeURIComponent(item.slug)}`,
                        inLibrary: inLibrary ? 'true' : undefined,
                    },
                })
            }}
        >
            <View className='relative overflow-hidden rounded-md bg-gray-800'>
                {unReadChaptersCount != null && unReadChaptersCount > 0 && (
                    <View className='absolute left-2 top-2 z-10 flex-row items-center gap-1 rounded bg-[#bfc5db] p-1'>
                        <Text className='text-xs font-semibold text-black'>
                            {unReadChaptersCount}
                        </Text>
                    </View>
                )}
                <Image
                    source={{
                        uri: item.cover,
                        headers: {
                            Referer: 'https://www.mangakakalot.gg/',
                        },
                    }}
                    className='aspect-[2/3] w-full'
                    resizeMode='cover'
                    alt={item.title}
                />
                <LinearGradient
                    className='absolute bottom-0 left-0 right-0 flex h-14 items-start justify-end p-2'
                    colors={[
                        'rgba(0, 0, 0, 0)',
                        'rgba(0, 0, 0, 0.2)',
                        'rgba(0, 0, 0, 0.5)',
                        'rgba(0, 0, 0, 0.7)',
                    ]}
                >
                    <Text
                        className='text-sm font-medium text-white'
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    )
}
