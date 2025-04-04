import { MangaCard } from '@/components/manga-card'
import { searchMangaRequest } from '@/lib/api'
import { useHeaderHeight } from '@react-navigation/elements'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useGlobalSearchParams } from 'expo-router'
import { Box } from 'lucide-react-native'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'

export default function SearchScreen() {
    const { searchQuery } = useGlobalSearchParams()
    const isEnabled =
        typeof searchQuery === 'string' && searchQuery.trim() !== ''
    const headerHeight = useHeaderHeight()
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
        queryKey: ['search', searchQuery],
        queryFn: ({ pageParam = 1 }) =>
            searchMangaRequest({
                query: searchQuery as string,
                page: pageParam,
            }),
        getNextPageParam: (lastPage) =>
            lastPage.hasNextPage ? lastPage.nextPage : undefined,
        enabled: isEnabled,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
    })

    if (isLoading) {
        return (
            <View className='flex-1 items-center justify-center bg-[#121218]'>
                <ActivityIndicator size='large' color='#ffffff' />
            </View>
        )
    }

    if (
        !isEnabled ||
        data == null ||
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
        <View
            className='flex-1 bg-[#121218]'
            style={{ paddingTop: headerHeight }}
        >
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
