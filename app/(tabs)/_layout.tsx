import { CustomModal } from '@/components/ui/custom-modal'
import { db } from '@/db'
import { HistoryTable } from '@/db/schema'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tabs, router } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import {
    Book,
    Clock,
    Compass,
    ListFilter,
    MoreHorizontal,
    MoreVertical,
    Search,
    Settings,
    Trash2,
    X,
} from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import {
    BackHandler,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native'
import {
    SafeAreaProvider,
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context'

export default function TabsLayout() {
    const queryClient = useQueryClient()
    const insets = useSafeAreaInsets()
    const [showClearDialog, setShowClearDialog] = useState(false)
    const [isSearchActive, setIsSearchActive] = useState(false)

    const { mutate: clearHistory, isPending } = useMutation({
        mutationFn: async () => {
            await db.delete(HistoryTable)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['history'] })
            ToastAndroid.show('History cleared', ToastAndroid.SHORT)
            setShowClearDialog(false)
        },
    })

    const handleClearHistory = () => {
        setShowClearDialog(true)
    }

    const handleSearch = (text: string) => {
        queryClient.setQueryData(
            ['history'],
            (old: {
                original: {
                    title: string
                    data: (typeof HistoryTable.$inferSelect)[]
                }[]
                grouped: {
                    title: string
                    data: (typeof HistoryTable.$inferSelect)[]
                }[]
            }) => {
                return {
                    ...old,
                    grouped: old.original.map((group) => ({
                        ...group,
                        data: group.data.filter((item) =>
                            item.mangaTitle
                                .toLowerCase()
                                .includes(text.toLowerCase()),
                        ),
                    })),
                }
            },
        )
    }

    useEffect(() => {
        const handler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (isSearchActive) {
                    setIsSearchActive(false)
                    handleSearch('')
                    return true
                }
                return false
            },
        )

        return () => {
            handler.remove()
        }
    }, [isSearchActive])

    return (
        <>
            <SafeAreaProvider>
                <StatusBar style='light' />

                <Tabs
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#121218',
                            elevation: 0,
                            shadowOpacity: 0,
                            borderBottomWidth: 0,
                        },
                        headerTintColor: '#ffffff',
                        headerRight: () => (
                            <View className='mr-4 flex-row gap-5'>
                                <TouchableOpacity>
                                    <Search size={24} color={'white'} />
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <ListFilter size={24} color={'white'} />
                                </TouchableOpacity>

                                <TouchableOpacity>
                                    <MoreVertical size={24} color={'white'} />
                                </TouchableOpacity>
                            </View>
                        ),
                    }}
                    tabBar={(props) => <CustomTabBar {...props} />}
                >
                    <Tabs.Screen
                        name='index'
                        options={{
                            title: 'Library',
                        }}
                    />
                    <Tabs.Screen
                        name='updates'
                        options={{
                            title: 'Updates',
                        }}
                    />
                    <Tabs.Screen
                        name='history'
                        options={{
                            title: 'History',
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
                                                placeholderTextColor={'white'}
                                                className='h-full flex-1 p-4 text-xl text-white'
                                                autoFocus
                                                cursorColor={'white'}
                                                onChangeText={handleSearch}
                                            />
                                        ) : (
                                            <Text className='text-2xl font-semibold text-white'>
                                                History
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
                                                <X size={24} color={'white'} />
                                            ) : (
                                                <Search
                                                    size={24}
                                                    color={'white'}
                                                />
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleClearHistory}
                                        >
                                            <Trash2 size={24} color={'white'} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name='browse'
                        options={{
                            title: 'Browse',
                            headerRight: () => (
                                <View className='mr-4 flex-row gap-5'>
                                    <TouchableOpacity
                                        onPress={() => router.push('/search')}
                                    >
                                        <Search size={24} color={'white'} />
                                    </TouchableOpacity>

                                    {/* <TouchableOpacity>
                                        <ListFilter size={24} color={'white'} />
                                    </TouchableOpacity>
    
                                    <TouchableOpacity>
                                        <MoreVertical size={24} color={'white'} />
                                    </TouchableOpacity> */}
                                </View>
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name='more'
                        options={{
                            title: 'More',
                        }}
                    />
                </Tabs>
            </SafeAreaProvider>
            <StatusBar style='light' />

            <CustomModal
                visible={showClearDialog}
                onClose={() => setShowClearDialog(false)}
                title='Remove everything'
                description='Are you sure? All history will be lost.'
                confirmText='OK'
                onConfirm={clearHistory}
                isPending={isPending}
            />
        </>
    )
}

interface TabBarItemProps {
    icon: React.ReactNode
    label: string
    isActive: boolean
    onPress: () => void
}

const TabBarItem = ({ icon, label, isActive, onPress }: TabBarItemProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            className='flex-1 items-center justify-center py-2'
        >
            <View className='flex items-center gap-2'>
                {React.cloneElement(icon as React.ReactElement, {
                    size: 24,
                    color: isActive ? '#dbe1f7' : '#c5c5cf',
                    opacity: isActive ? 1 : 0.8,
                    strokeWidth: 2,
                })}
                <Text
                    className={'text-sm font-semibold'}
                    style={{
                        color: isActive ? '#dbe1f7' : '#c5c5cf',
                        opacity: isActive ? 1 : 0.8,
                    }}
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
    const tabs = [
        {
            label: 'Library',
            icon: <Book />,
            route: 'index',
        },
        {
            label: 'Updates',
            icon: <Settings />,
            route: 'updates',
        },
        {
            label: 'History',
            icon: <Clock />,
            route: 'history',
        },
        {
            label: 'Browse',
            icon: <Compass />,
            route: 'browse',
        },
        {
            label: 'More',
            icon: <MoreHorizontal />,
            route: 'more',
        },
    ]

    return (
        <SafeAreaView edges={['bottom']} className='bg-[#23252e] py-1'>
            <View className='flex-row border-t border-gray-800'>
                {tabs.map((tab, index) => (
                    <TabBarItem
                        key={tab.route}
                        icon={tab.icon}
                        label={tab.label}
                        isActive={state.index === index}
                        onPress={() => navigation.navigate(tab.route)}
                    />
                ))}
            </View>
        </SafeAreaView>
    )
}
