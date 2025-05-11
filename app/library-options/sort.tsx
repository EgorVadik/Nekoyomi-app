import { storage } from '@/lib/storage'
import { SortOptions } from '@/lib/types'
import { ArrowDown, ArrowUp } from 'lucide-react-native'
import React, { useEffect } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useMMKVObject } from 'react-native-mmkv'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const options = [
    {
        label: 'Alphabetically',
        value: 'alphabetical',
    },
    {
        label: 'Last read',
        value: 'lastRead',
    },
    {
        label: 'Total chapters',
        value: 'totalChapters',
    },
    {
        label: 'Unread count',
        value: 'unreadCount',
    },
    {
        label: 'Last updated',
        value: 'lastUpdated',
    },
    {
        label: 'Date added',
        value: 'dateAdded',
    },
] as const

type OptionValue = (typeof options)[number]['value']

export default function LibrarySort() {
    const insets = useSafeAreaInsets()
    const [selected, setSelected] = useMMKVObject<SortOptions>(
        'sort-options',
        storage,
    )

    useEffect(() => {
        if (!selected || Object.values(selected).every((v) => !v)) {
            setSelected({ lastRead: 'desc' })
        }
    }, [selected, setSelected])

    const handleSort = (value: OptionValue) => {
        setSelected((prev) => {
            const currentValue = prev?.[value]
            if (currentValue === 'desc') {
                return { [value]: 'asc' }
            }
            return { [value]: 'desc' }
        })
    }

    return (
        <>
            <View
                style={{
                    paddingBottom: insets.bottom,
                }}
                className='flex-1 gap-3 bg-[#1a1c23] p-5'
            >
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        className='flex-row items-center gap-3'
                        onPress={() => handleSort(option.value)}
                    >
                        {selected?.[option.value] === 'asc' ? (
                            <ArrowUp size={20} color='#a9c8fc' />
                        ) : selected?.[option.value] === 'desc' ? (
                            <ArrowDown size={20} color='#a9c8fc' />
                        ) : (
                            <View style={{ width: 20 }} />
                        )}
                        <Text className='text-base text-white'>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </>
    )
}
