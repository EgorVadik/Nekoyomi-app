import { db } from '@/db'
import migrations from '@/drizzle/migrations'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { Stack } from 'expo-router'
import { Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import './global.css'

const queryClient = new QueryClient()

export default function RootLayout() {
    const { success, error } = useMigrations(db, migrations)

    console.log({ success, error })

    if (error) {
        return (
            <View>
                <Text>Migration error: {error.message}</Text>
            </View>
        )
    }

    if (!success) {
        return (
            <View>
                <Text>Migration is in progress...</Text>
            </View>
        )
    }

    return (
        <GestureHandlerRootView>
            <QueryClientProvider client={queryClient}>
                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                />
            </QueryClientProvider>
        </GestureHandlerRootView>
    )
}
