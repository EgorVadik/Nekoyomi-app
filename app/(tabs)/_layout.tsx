import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { Tabs } from 'expo-router'
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
} from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'

export default function TabsLayout() {
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
                            <View className='mr-2 flex-row gap-5'>
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
                        }}
                    />
                    <Tabs.Screen
                        name='browse'
                        options={{
                            title: 'Browse',
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
