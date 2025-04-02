import { Stack } from 'expo-router'

export default function MangaDetailsLayout() {
    return (
        <Stack
            screenOptions={{
                headerTransparent: true,
                headerTintColor: 'white',
            }}
        >
            <Stack.Screen
                name='index'
                options={{
                    headerTitle: '',
                }}
            />
            <Stack.Screen
                name='read'
                options={{
                    headerTitle: '',
                    headerBackVisible: false,
                }}
            />
        </Stack>
    )
}
