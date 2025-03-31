import { cn } from '@/lib/utils'
import { Picker as RNPicker } from '@react-native-picker/picker'
import { View } from 'react-native'

export function Picker<T>({
    mode = 'dropdown',
    style,
    dropdownIconColor,
    dropdownIconRippleColor,
    className,
    ...props
}: React.ComponentPropsWithoutRef<typeof RNPicker<T>>) {
    return (
        <View className={cn('overflow-hidden rounded-md border', className)}>
            <RNPicker
                mode={mode}
                style={
                    style ?? {
                        backgroundColor: '#45474e',
                    }
                }
                dropdownIconColor={dropdownIconColor ?? '#e5e1e8'}
                dropdownIconRippleColor={dropdownIconRippleColor ?? '#e5e1e8'}
                {...props}
            />
        </View>
    )
}

export const PickerItem = RNPicker.Item
