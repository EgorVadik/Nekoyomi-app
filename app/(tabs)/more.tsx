import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, router } from 'expo-router'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { applicationName } from 'expo-application'

export default function MoreScreen() {
    const insets = useSafeAreaInsets()

    return (
        <ScrollView
            className='flex-1 bg-[#121218]'
            style={{
                paddingTop: insets.top,
            }}
        >
            <LinearGradient colors={['#121218', '#1a1a24']} className='flex-1'>
                <View className='p-5'>
                    {/* Header */}
                    <View className='mb-10'>
                        <View className='mb-3 flex-row items-center justify-between'>
                            <Text className='text-3xl font-bold text-white'>
                                More
                            </Text>
                        </View>
                        <Text className='text-base text-gray-400'>
                            Manage your app settings and preferences
                        </Text>
                    </View>

                    {/* Settings Section */}
                    <View className='mb-10'>
                        <View className='mb-4 flex-row items-center justify-between'>
                            <Text className='text-sm font-medium tracking-wider text-gray-400'>
                                SETTINGS
                            </Text>
                            <View className='h-8 w-8 items-center justify-center rounded-full bg-[#2A2A32]'>
                                <Ionicons
                                    name='cog-outline'
                                    size={16}
                                    color='#666'
                                />
                            </View>
                        </View>
                        <View className='gap-3'>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='settings-outline'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        App Settings
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Customize your app experience
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='notifications-outline'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        Notifications
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Manage your alerts
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='moon-outline'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        Dark Mode
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Toggle theme settings
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* About Section */}
                    <View className='mb-10'>
                        <View className='mb-4 flex-row items-center justify-between'>
                            <Text className='text-sm font-medium tracking-wider text-gray-400'>
                                ABOUT
                            </Text>
                            <View className='h-8 w-8 items-center justify-center rounded-full bg-[#2A2A32]'>
                                <Ionicons
                                    name='information-circle-outline'
                                    size={16}
                                    color='#666'
                                />
                            </View>
                        </View>
                        <View className='gap-3'>
                            <TouchableOpacity
                                onPress={() => router.push('/about')}
                                className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'
                            >
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='information-circle-outline'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        About App
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Learn more about the app
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='help-circle-outline'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        Help & Support
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Get assistance and FAQs
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='shield-checkmark-outline'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        Privacy Policy
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Read our privacy terms
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Social Links */}
                    <View>
                        <View className='mb-4 flex-row items-center justify-between'>
                            <Text className='text-sm font-medium tracking-wider text-gray-400'>
                                CONNECT WITH US
                            </Text>
                            <View className='h-8 w-8 items-center justify-center rounded-full bg-[#2A2A32]'>
                                <Ionicons
                                    name='share-social-outline'
                                    size={16}
                                    color='#666'
                                />
                            </View>
                        </View>
                        <View className='gap-3'>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='logo-github'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        GitHub
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        View our source code
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='logo-discord'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        Discord
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Join our community
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity className='flex-row items-center rounded-2xl border border-[#2A2A32] bg-[#1E1E24] p-5 shadow-lg'>
                                <View className='rounded-xl bg-[#2A2A32] p-3'>
                                    <Ionicons
                                        name='mail-outline'
                                        size={22}
                                        color='white'
                                    />
                                </View>
                                <View className='ml-4 flex-1'>
                                    <Text className='text-base font-medium text-white'>
                                        Contact Us
                                    </Text>
                                    <Text className='mt-1 text-xs text-gray-400'>
                                        Get in touch with us
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer */}
                    <View className='mb-5 mt-10 items-center'>
                        <Text className='text-xs text-gray-500'>
                            © {new Date().getFullYear()} {applicationName}. All
                            rights reserved.
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </ScrollView>
    )
}
