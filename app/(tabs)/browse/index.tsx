import { MangaCard } from '@/components/manga-card'
import { getFilteredMangaListRequest } from '@/lib/api'
import { filterAtom } from '@/lib/atoms'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { Box } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

export default function PopularScreen() {
    const filters = useAtomValue(filterAtom)
    console.log(filters)

    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch,
        isRefetching,
    } = useInfiniteQuery({
        initialPageParam: 1,
        queryKey: ['manga-popular', filters],
        queryFn: ({ pageParam = 1 }) =>
            getFilteredMangaListRequest({
                type: 'popular',
                page: pageParam,
                ...filters,
            }),
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.nextPage : undefined,
        refetchOnMount: false,
    })

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <ActivityIndicator size='large' color='#ffffff' />
            </View>
        )
    }

    if (
        data == null ||
        data.pages.length === 0 ||
        data.pages.some((page) => page.data.length === 0)
    ) {
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
                data={data.pages.flatMap((page) => page.data)}
                renderItem={({ item }) => <MangaCard item={item} />}
                keyExtractor={(item, idx) => `${item.slug}-${idx}`}
                numColumns={2}
                contentContainerStyle={{ padding: 8 }}
                onRefresh={refetch}
                refreshing={isRefetching}
                onEndReached={() => {
                    if (hasNextPage) {
                        fetchNextPage()
                    }
                }}
                scrollsToTop={true}
                onEndReachedThreshold={1}
                ListFooterComponent={() =>
                    isFetchingNextPage ? (
                        <ActivityIndicator
                            size='small'
                            color='#ffffff'
                            className='mb-5'
                        />
                    ) : null
                }
            />
        </View>
    )
}
