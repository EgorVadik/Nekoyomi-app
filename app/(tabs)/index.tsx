import { MangaCard } from '@/components/manga-card'
import { getFilteredMangaListRequest } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { FlatList, View } from 'react-native'

export default function LibraryScreen() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['filteredMangaList', { type: 'latest' }],
        queryFn: () =>
            getFilteredMangaListRequest({
                type: 'latest',
            }),
    })

    return (
        <View className='flex-1 bg-[#121218]'>
            <FlatList
                data={data}
                renderItem={({ item }) => <MangaCard item={item} />}
                keyExtractor={(item) => item.title}
                numColumns={2}
                contentContainerStyle={{ padding: 8 }}
            />
        </View>
    )
}
