import { storage } from '@/lib/storage'
import type { FilterOptions } from '@/lib/types'
import { View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { useMMKVObject } from 'react-native-mmkv'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const options = [
    {
        label: 'Downloaded',
        value: 'downloaded',
    },
    {
        label: 'Unread',
        value: 'unread',
    },
    {
        label: 'Completed',
        value: 'completed',
    },
] as const

export default function LibraryOptionsModal() {
    const insets = useSafeAreaInsets()
    const [selected, setSelected] = useMMKVObject<FilterOptions[]>(
        'filter-options',
        storage,
    )

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
                        isChecked={selected?.includes(option.value)}
                        useBuiltInState={false}
                        innerIconStyle={{
                            borderColor: selected?.includes(option.value)
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
                            if (!isChecked) {
                                setSelected([...(selected ?? []), option.value])
                            } else {
                                setSelected(
                                    (selected ?? []).filter(
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
