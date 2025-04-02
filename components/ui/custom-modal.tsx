import { cn } from '@/lib/utils'
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import Animated, {
    FadeIn,
    FadeInDown,
    FadeOut,
    FadeOutUp,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type CustomModalProps = {
    visible: boolean
    onClose: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    isPending?: boolean
}

export function CustomModal({
    visible,
    onClose,
    title,
    description,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    isPending = false,
}: CustomModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType='none'
            onRequestClose={onClose}
        >
            <View className='flex-1 items-center justify-center'>
                <AnimatedPressable
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    className='absolute inset-0 bg-black/50'
                    onPress={onClose}
                />
                <Animated.View
                    entering={FadeInDown.duration(200)}
                    exiting={FadeOutUp.duration(200)}
                    className={cn('w-[80%] rounded-3xl bg-[#23252e] p-7')}
                >
                    <View className='mb-6 gap-2'>
                        <Text className='text-2xl font-medium text-white'>
                            {title}
                        </Text>
                        <Text className='mt-2 text-gray-400'>
                            {description}
                        </Text>
                    </View>
                    <View className='flex-row justify-end gap-3'>
                        <TouchableOpacity
                            onPress={onClose}
                            className='rounded-lg px-4 py-2'
                        >
                            <Text className='font-semibold text-[#a8c3ef]'>
                                {cancelText}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            disabled={isPending}
                            className='rounded-lg px-4 py-2'
                        >
                            <Text className='font-semibold text-[#a8c3ef]'>
                                {isPending ? (
                                    <ActivityIndicator
                                        size={20}
                                        color={'#a8c3ef'}
                                    />
                                ) : (
                                    confirmText
                                )}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}
