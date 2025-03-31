import { Manga } from '@/lib/types'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export const MangaCard = ({ item }: { item: Manga }) => {
    return (
        <TouchableOpacity className='mb-2 w-1/2 p-1'>
            <View className='relative overflow-hidden rounded-md bg-gray-800'>
                <Image
                    source={{
                        // uri: item.cover,
                        uri: 'https://zjcdn.mangahere.org/store/manga/33018/154.0/cosmpressed/c000.jpg',
                        // headers: {
                        //     Referer: 'https://www.mangakakalot.gg/',
                        // },
                    }}
                    className='aspect-[2/3] w-full'
                    resizeMode='cover'
                    alt={item.cover}
                />
                {/* {item.isNew && (
            <View className='absolute top-2 left-2 bg-yellow-500 rounded-full px-2 py-0.5'>
                <Text className='text-xs font-bold text-black'>
                    NEW!
                </Text>
            </View>
        )} */}
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
