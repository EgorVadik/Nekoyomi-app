import '@/app/global.css'
import { db } from '@/db'
import migrations from '@/drizzle/migrations'
import * as Task from '@/lib/background-task'
import { verifyDownloads } from '@/lib/download'
import { PortalHost } from '@rn-primitives/portal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import * as Notifications from 'expo-notifications'
import { router, Stack, usePathname } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { Search, X } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { AppState, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const queryClient = new QueryClient()

SplashScreen.preventAutoHideAsync()
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})

export default function RootLayout() {
    const pathname = usePathname()
    const { success, error } = useMigrations(db, migrations)
    const [isSearchActive, setIsSearchActive] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const insets = useSafeAreaInsets()

    const handleSearch = (text: string) => {
        setSearchQuery(text)
    }

    useEffect(() => {
        if (success || error) {
            SplashScreen.hide()
        }
    }, [success, error])

    useEffect(() => {
        const requestPermission = async () => {
            await Notifications.requestPermissionsAsync()
            await verifyDownloads()
        }

        requestPermission()
        Task.registerUpdateLibraryTask()

        const subscription = AppState.addEventListener(
            'change',
            async (nextAppState) => {
                if (nextAppState === 'active') {
                    await verifyDownloads()
                }
            },
        )

        return () => {
            subscription.remove()
        }
    }, [])

    return (
        <>
            <GestureHandlerRootView>
                <QueryClientProvider client={queryClient}>
                    <Stack
                        screenOptions={{
                            headerShown: false,
                        }}
                    >
                        <Stack.Screen name='(tabs)' />
                        <Stack.Screen name='manga-details/[name]' />
                        <Stack.Screen name='about' />
                        <Stack.Screen
                            name='search'
                            options={{
                                presentation: 'modal',
                                animation: 'fade_from_bottom',
                                headerShown: true,
                                headerTransparent: true,
                                header: () => (
                                    <View
                                        style={{
                                            height: 90.6,
                                            paddingTop: insets.top,
                                        }}
                                        className='w-full flex-1 flex-row items-center justify-between gap-2 px-4'
                                    >
                                        <View className='h-full flex-1 flex-row items-center gap-2'>
                                            {isSearchActive ? (
                                                <TextInput
                                                    placeholder='Search...'
                                                    placeholderTextColor={
                                                        'white'
                                                    }
                                                    className='h-full flex-1 p-4 text-xl text-white'
                                                    autoFocus
                                                    cursorColor={'white'}
                                                    onChangeText={handleSearch}
                                                    onSubmitEditing={() => {
                                                        router.setParams({
                                                            searchQuery,
                                                        })
                                                    }}
                                                />
                                            ) : (
                                                <Text className='text-2xl font-semibold text-white'>
                                                    {searchQuery || 'Search'}
                                                </Text>
                                            )}
                                        </View>

                                        <View className='flex-row gap-5'>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setIsSearchActive(
                                                        !isSearchActive,
                                                    )
                                                    if (isSearchActive) {
                                                        handleSearch('')
                                                    }
                                                }}
                                            >
                                                {isSearchActive ? (
                                                    <X
                                                        size={24}
                                                        color={'white'}
                                                    />
                                                ) : (
                                                    <Search
                                                        size={24}
                                                        color={'white'}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ),
                            }}
                        />
                        <Stack.Screen
                            name='library-options'
                            options={{
                                presentation: 'transparentModal',
                                // sheetAllowedDetents:
                                //     pathname === '/library-options'
                                //         ? [0.5]
                                //         : [0.75],
                                // sheetGrabberVisible: true,
                                // contentStyle: {
                                //     backgroundColor: '#1a1c23',
                                // },
                                // sheetCornerRadius: 12,
                            }}
                        />
                    </Stack>
                </QueryClientProvider>
            </GestureHandlerRootView>
            <PortalHost />
        </>
    )
}
