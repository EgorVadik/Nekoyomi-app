import { getLibrary, updateLibrary } from '@/lib/utils'
import * as Notifications from 'expo-notifications'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundTask from 'expo-background-task'

const BACKGROUND_TASK_IDENTIFIER = 'update-library'

TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
    let notification: string | null = null

    try {
        notification = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Updating Library...',
                autoDismiss: false,
                sticky: true,
            },
            trigger: null,
        })

        const mangaWithUnreadCount = await getLibrary()

        const updates = await Promise.all(
            mangaWithUnreadCount.map((manga) =>
                updateLibrary({
                    title: manga.slug,
                    totalChapters: manga.chapters?.totalChapters ?? 0,
                    savedMangaId: manga.id,
                    chaptersCount: manga.chapters?.chapters.length ?? 0,
                }),
            ),
        )

        const foundChapters = updates.reduce(
            (acc, curr) => acc + (curr?.found ?? 0),
            0,
        )

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Library updated',
                body:
                    foundChapters > 0
                        ? `Found ${foundChapters} new chapters`
                        : 'No new chapters found',
            },
            trigger: null,
        })
    } catch (error) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Failed to update library',
            },
            trigger: null,
        })
    } finally {
        if (notification) {
            await Notifications.dismissNotificationAsync(notification)
        }
    }
})

export const registerUpdateLibraryTask = async () => {
    return await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER)
}

export const unregisterUpdateLibraryTask = async () => {
    return await BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER)
}
