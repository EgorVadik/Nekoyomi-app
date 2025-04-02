import { Manga } from '@/lib/types'
// import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Text, TouchableOpacity, View, Image } from 'react-native'

export const MangaCard = ({ item }: { item: Manga }) => {
    return (
        <TouchableOpacity
            className='mb-2 w-1/2 p-1'
            onPress={() => {
                router.push(`/manga-details/${encodeURIComponent(item.slug)}`)
            }}
        >
            <View className='relative overflow-hidden rounded-md bg-gray-800'>
                <Image
                    source={{
                        uri: item.cover,
                        // uri: 'https://zjcdn.mangahere.org/store/manga/33018/154.0/cosmpressed/c000.jpg',
                        headers: {
                            Referer: 'https://www.mangakakalot.gg/',
                        },
                    }}
                    className='aspect-[2/3] w-full'
                    resizeMode='cover'
                    alt={item.cover}
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
