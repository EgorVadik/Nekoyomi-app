import { Picker, PickerItem } from '@/components/ui/picker'
import { filterAtom } from '@/lib/atoms'
import { GENRES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Stack, usePathname, useRouter } from 'expo-router'
import { useAtom } from 'jotai'
import { Clock, Heart, ListFilter } from 'lucide-react-native'
import { useCallback, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function BrowseLayout() {
    const router = useRouter()
    const pathname = usePathname()
    const bottomSheetRef = useRef<BottomSheet>(null)
    const [order, setOrder] = useState<'Latest' | 'Newest' | 'Top read'>(
        'Latest',
    )
    const [status, setStatus] = useState<'All' | 'Ongoing' | 'Completed'>('All')
    const [category, setCategory] = useState<(typeof GENRES)[number]>('All')
    const [filters, setFilters] = useAtom(filterAtom)

    const handleSnapPress = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const handleReset = () => {
        setFilters({
            filter: undefined,
            genre: null,
        })
    }

    const handleFilter = () => {
        const _order = order.split(' ').at(0)?.toLowerCase() as
            | 'latest'
            | 'newest'
            | 'top'
        const _status = status.toLowerCase() as 'all' | 'ongoing' | 'completed'

        setFilters({
            filter: `${_order}-${_status}`,
            genre: category,
        })
    }

    return (
        <View className='flex-1 bg-[#121218]'>
            <View className='flex-row items-center gap-2 px-2 py-3'>
                <TouchableOpacity
                    className={cn(
                        'flex-row items-center rounded-xl border border-[#797882] bg-[#1F1F29] px-4 py-2',
                        pathname === '/browse' &&
                            filters.genre == null &&
                            'border-[#3f4657] bg-[#3f4657]',
                    )}
                    onPress={() => {
                        setFilters({
                            filter: undefined,
                            genre: null,
                        })
                        pathname === '/browse'
                            ? null
                            : router.replace('/browse')
                    }}
                >
                    <Heart
                        size={16}
                        color={
                            pathname === '/browse' && filters.genre == null
                                ? '#dbe1f7'
                                : '#FFFFFF'
                        }
                        fill={
                            pathname === '/browse' && filters.genre == null
                                ? '#dbe1f7'
                                : 'none'
                        }
                    />
                    <Text
                        className={cn(
                            'ml-2 font-medium text-white',
                            pathname === '/browse' &&
                                filters.genre == null &&
                                'text-[#dbe1f7]',
                        )}
                    >
                        Popular
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={cn(
                        'flex-row items-center rounded-xl border border-[#797882] bg-[#1F1F29] px-4 py-2',
                        pathname === '/browse/latest' &&
                            filters.genre == null &&
                            'border-[#3f4657] bg-[#3f4657]',
                    )}
                    onPress={() => {
                        setFilters({
                            filter: undefined,
                            genre: null,
                        })
                        pathname === '/browse/latest'
                            ? null
                            : router.replace('/browse/latest')
                    }}
                >
                    <Clock
                        size={16}
                        color={
                            pathname === '/browse/latest' &&
                            filters.genre == null
                                ? '#dbe1f7'
                                : '#FFFFFF'
                        }
                    />
                    <Text
                        className={cn(
                            'ml-2 font-medium text-white',
                            pathname === '/browse/latest' &&
                                filters.genre == null &&
                                'text-[#dbe1f7]',
                        )}
                    >
                        Latest
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSnapPress}
                    className={cn(
                        'flex-row items-center rounded-xl border border-[#797882] bg-[#1F1F29] px-4 py-2',
                        (filters.genre != null || filters.filter != null) &&
                            'border-[#3f4657] bg-[#3f4657]',
                    )}
                >
                    <ListFilter
                        size={16}
                        color={
                            filters.genre != null || filters.filter != null
                                ? '#dbe1f7'
                                : '#FFFFFF'
                        }
                    />
                    <Text
                        className={cn(
                            'ml-2 font-medium text-white',
                            (filters.genre != null || filters.filter != null) &&
                                'text-[#dbe1f7]',
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
                        <TouchableOpacity onPress={handleReset}>
                            <Text className='font-bold text-[#a9c8fc]'>
                                Reset
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleFilter}
                            className='rounded-full bg-[#a9c8fc] px-6 py-3'
                        >
                            <Text className='font-medium text-black'>
                                Filter
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            >
                <BottomSheetView className='flex-1 bg-[#1a1c23] p-4'>
                    <FilterSelect
                        label='Order by'
                        value='Latest'
                        options={['Latest', 'Newest', 'Top read']}
                        onSelect={(value) =>
                            setOrder(value as 'Latest' | 'Newest' | 'Top read')
                        }
                    />

                    <FilterSelect
                        label='Status'
                        value='All'
                        options={['All', 'Ongoing', 'Completed']}
                        onSelect={(value) =>
                            setStatus(value as 'All' | 'Ongoing' | 'Completed')
                        }
                    />

                    <FilterSelect
                        label='Category'
                        value={filters.genre ?? 'All'}
                        options={GENRES as unknown as string[]}
                        onSelect={(value) =>
                            setCategory(value as (typeof GENRES)[number])
                        }
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
        <View className='relative my-4'>
            <Text className='absolute -top-3 left-3 z-10 bg-[#1F1F29] px-1 text-sm font-medium text-[#e5e1e8]'>
                {label}
            </Text>
            <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onSelect(itemValue)}
                className='rounded border border-[#e5e1e8]'
            >
                {options.map((option) => (
                    <PickerItem
                        key={option}
                        label={option}
                        value={option}
                        color='#fff'
                        style={{
                            backgroundColor: '#45474e',
                            width: '100%',
                        }}
                    />
                ))}
            </Picker>
        </View>
    )
}
