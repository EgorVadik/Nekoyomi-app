import { MangaCard } from '@/components/manga-card'
import { getFilteredMangaListRequest } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { Box } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

export default function LatestScreen() {
    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['manga-latest'],
        queryFn: () =>
            getFilteredMangaListRequest({
                type: 'latest',
            }),
        refetchOnMount: false,
    })

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <ActivityIndicator size='large' color='#ffffff' />
            </View>
        )
    }

    if (data == null || data.length === 0) {
        return (
            <View className='flex-1 items-center justify-center gap-2 bg-[#121218]'>
                <Box size={48} color='#ffffff' opacity={0.5} />
                <Text className='text-lg font-semibold text-white'>
                    No manga found
                </Text>
                <Text className='px-4 text-center text-gray-400'>
                    We couldn't find any manga in the popular section.{'\n'}
                    Pull down to refresh and try again.
                </Text>
            </View>
        )
    }

    return (
        <View className='flex-1 bg-[#121218]'>
            <FlatList
                data={data}
                renderItem={({ item }) => <MangaCard item={item} />}
                keyExtractor={(item) => item.title}
                numColumns={2}
                contentContainerStyle={{ padding: 8 }}
                onRefresh={refetch}
                refreshing={isRefetching}
            />
        </View>
    )
}
