import React, { useState } from 'react'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

const options = [
    {
        label: 'Alphabetically',
        value: 'alphabetically',
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
]

export default function LibrarySort() {
    const insets = useSafeAreaInsets()
    const [selected, setSelected] = useState<string[]>([])

    return (
        <>
            <View
                style={{
                    paddingBottom: insets.bottom,
                }}
                className='flex-1 gap-3 bg-[#1a1c23] p-5'
            >
                {options.map((option) => (
                    <BouncyCheckbox
                        key={option.value}
                        text={option.label}
                        textStyle={{
                            color: 'white',
                            textDecorationLine: 'none',
                        }}
                        innerIconStyle={{
                            borderColor: selected.includes(option.value)
                                ? '#a9c8fc'
                                : '#fff',
                            borderWidth: 2,
                            borderRadius: 3,
                            width: 20,
                            height: 20,
                        }}
                        iconStyle={{
                            borderRadius: 3,
                            width: 20,
                            height: 20,
                        }}
                        fillColor='#a9c8fc'
                        onPress={(isChecked) => {
                            if (isChecked) {
                                setSelected([...selected, option.value])
                            } else {
                                setSelected(
                                    selected.filter(
                                        (item) => item !== option.value,
                                    ),
                                )
                            }
                        }}
                    />
                ))}
            </View>
        </>
    )
}
