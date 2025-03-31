import { cn } from '@/lib/utils'
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Stack, usePathname, useRouter } from 'expo-router'
import { Clock, Heart, ListFilter } from 'lucide-react-native'
import { useCallback, useRef } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function BrowseLayout() {
    const router = useRouter()
    const pathname = usePathname()
    const bottomSheetRef = useRef<BottomSheet>(null)

    const handleSnapPress = useCallback((index: number) => {
        bottomSheetRef.current?.expand()
    }, [])

    return (
        <View className='flex-1 bg-[#121218]'>
            <View className='flex-row items-center gap-2 px-2 py-3'>
                <TouchableOpacity
                    className={cn(
                        'flex-row items-center rounded-xl border border-[#797882] bg-[#1F1F29] px-4 py-2',
                        pathname === '/browse' &&
                            'border-[#3f4657] bg-[#3f4657]',
                    )}
                    onPress={() =>
                        pathname === '/browse'
                            ? null
                            : router.replace('/browse')
                    }
                >
                    <Heart
                        size={16}
                        color={pathname === '/browse' ? '#dbe1f7' : '#FFFFFF'}
                        fill={pathname === '/browse' ? '#dbe1f7' : 'none'}
                    />
                    <Text
                        className={cn(
                            'ml-2 font-medium text-white',
                            pathname === '/browse' && 'text-[#dbe1f7]',
                        )}
                    >
                        Popular
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={cn(
                        'flex-row items-center rounded-xl border border-[#797882] bg-[#1F1F29] px-4 py-2',
                        pathname === '/browse/latest' &&
                            'border-[#3f4657] bg-[#3f4657]',
                    )}
                    onPress={() =>
                        pathname === '/browse/latest'
                            ? null
                            : router.replace('/browse/latest')
                    }
                >
                    <Clock
                        size={16}
                        color={
                            pathname === '/browse/latest'
                                ? '#dbe1f7'
                                : '#FFFFFF'
                        }
                    />
                    <Text
                        className={cn(
                            'ml-2 font-medium text-white',
                            pathname === '/browse/latest' && 'text-[#dbe1f7]',
                        )}
                    >
                        Latest
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleSnapPress(0)}
                    className={cn(
                        'flex-row items-center rounded-xl border border-[#797882] bg-[#1F1F29] px-4 py-2',
                        pathname === '/browse/filter' &&
                            'border-[#3f4657] bg-[#3f4657]',
                    )}
                >
                    <ListFilter
                        size={16}
                        color={
                            pathname === '/browse/filter'
                                ? '#dbe1f7'
                                : '#FFFFFF'
                        }
                    />
                    <Text
                        className={cn(
                            'ml-2 font-medium text-white',
                            pathname === '/browse/filter' && 'text-[#dbe1f7]',
                        )}
                    >
                        Filter
                    </Text>
                </TouchableOpacity>
            </View>

            <Stack>
                <Stack.Screen
                    name='index'
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name='latest'
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>

            <BottomSheet
                ref={bottomSheetRef}
                enableDynamicSizing
                enablePanDownToClose
                index={-1}
                backdropComponent={(props) => (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                    />
                )}
                backgroundStyle={{ backgroundColor: '#1a1c23' }}
                handleComponent={() => (
                    <View className='flex-row items-center justify-between rounded-t-2xl border-b border-[#2e2d33] bg-[#121218] px-4 py-2'>
                        <TouchableOpacity>
                            <Text className='font-bold text-[#a9c8fc]'>
                                Reset
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity className='rounded-full bg-[#a9c8fc] px-6 py-3'>
                            <Text className='font-medium text-black'>
                                Filter
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            >
                <BottomSheetView className='flex-1 bg-[#1a1c23] p-4'>
                    <Text className='mb-4 text-xl font-semibold text-white'>
                        Filters
                    </Text>

                    <FilterSelect
                        label='Order by'
                        value='Latest'
                        options={['Latest', 'Newest', 'Top read']}
                        onSelect={(value) => console.log(value)}
                    />

                    <FilterSelect
                        label='Status'
                        value='ALL'
                        options={['ALL', 'Ongoing', 'Completed']}
                        onSelect={(value) => console.log(value)}
                    />

                    <FilterSelect
                        label='Category'
                        value='ALL'
                        options={[
                            'ALL',
                            'Action',
                            'Romance',
                            'Comedy',
                            'Drama',
                        ]}
                        onSelect={(value) => console.log(value)}
                    />
                </BottomSheetView>
            </BottomSheet>
        </View>
    )
}

type FilterSelectProps = {
    label: string
    value: string
    options: string[]
    onSelect: (value: string) => void
}

function FilterSelect({ label, value, options, onSelect }: FilterSelectProps) {
    return (
        <View className='mb-4'>
            <Text className='mb-2 text-sm text-white'>{label}</Text>
            <TouchableOpacity
                className='rounded-lg border border-[#797882] bg-[#1F1F29] p-3'
                onPress={() => {
                    const currentIndex = options.indexOf(value)
                    const nextIndex = (currentIndex + 1) % options.length
                    onSelect(options[nextIndex])
                }}
            >
                <Text className='text-white'>{value}</Text>
            </TouchableOpacity>
        </View>
    )
}
