import { Ionicons } from '@expo/vector-icons'
import * as Application from 'expo-application'
import { Image, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function AboutScreen() {
    return (
        <SafeAreaView className='flex-1 bg-[#121218]'>
            <ScrollView
                className='flex-1'
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <View className='flex-1 p-6'>
                    <View className='mb-8 items-center'>
                        <View className='mb-4 rounded-2xl bg-[#1E1E24] p-4'>
                            <Image
                                source={require('@/assets/images/nekoyomi-logo.png')}
                                className='h-32 w-32'
                                resizeMode='contain'
                            />
                        </View>
                        <Text className='mb-2 text-4xl font-bold text-white'>
                            {Application.applicationName}
                        </Text>
                        <Text className='text-lg text-gray-400'>
                            Version {Application.nativeApplicationVersion}
                        </Text>
                    </View>

                    <View className='gap-4'>
                        <View className='rounded-2xl bg-[#1E1E24] p-6'>
                            <View className='flex-row items-center'>
                                <View className='mr-3 rounded-lg bg-[#60A5FA]/10 p-2'>
                                    <Ionicons
                                        name='information-circle'
                                        size={24}
                                        color='#60A5FA'
                                    />
                                </View>
                                <View>
                                    <Text className='text-lg font-semibold text-white'>
                                        App Information
                                    </Text>
                                    <Text className='text-sm text-gray-400'>
                                        Build {Application.nativeBuildVersion}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className='rounded-2xl bg-[#1E1E24] p-6'>
                            <View className='flex-row items-center'>
                                <View className='mr-3 rounded-lg bg-[#60A5FA]/10 p-2'>
                                    <Ionicons
                                        name='shield-checkmark'
                                        size={24}
                                        color='#60A5FA'
                                    />
                                </View>
                                <View>
                                    <Text className='text-lg font-semibold text-white'>
                                        Privacy Policy
                                    </Text>
                                    <Text className='text-sm text-gray-400'>
                                        Read our privacy practices
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className='rounded-2xl bg-[#1E1E24] p-6'>
                            <View className='flex-row items-center'>
                                <View className='mr-3 rounded-lg bg-[#60A5FA]/10 p-2'>
                                    <Ionicons
                                        name='document-text'
                                        size={24}
                                        color='#60A5FA'
                                    />
                                </View>
                                <View>
                                    <Text className='text-lg font-semibold text-white'>
                                        Terms of Service
                                    </Text>
                                    <Text className='text-sm text-gray-400'>
                                        Read our terms and conditions
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className='mt-8 items-center'>
                        <Text className='text-sm text-gray-500'>
                            © {new Date().getFullYear()}{' '}
                            {Application.applicationName}. All rights reserved.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
