import { MaterialTopTab } from '@/components/material-top-tabs'
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from '@gorhom/bottom-sheet'
import { Portal, PortalProvider } from '@gorhom/portal'
import { router } from 'expo-router'
import { useMemo, useRef, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function LibraryOptionsLayout() {
    const bottomSheetRef = useRef<BottomSheet>(null)
    const insets = useSafeAreaInsets()
    const [view, setView] = useState<'filter' | 'sort'>('filter')

    return (
        <PortalProvider>
            <Portal>
                <BottomSheet
                    ref={bottomSheetRef}
                    enablePanDownToClose
                    enableContentPanningGesture={false}
                    index={0}
                    onClose={router.back}
                    snapPoints={[view === 'filter' ? '23%' : '35%']}
                    backdropComponent={(props) => (
                        <BottomSheetBackdrop
                            {...props}
                            appearsOnIndex={0}
                            disappearsOnIndex={-1}
                        />
                    )}
                    backgroundStyle={{ backgroundColor: '#1a1c23' }}
                    bottomInset={insets.bottom}
                    handleIndicatorStyle={{
                        backgroundColor: '#908d94',
                    }}
                >
                    <BottomSheetView
                        className={'flex-1 px-4'}
                        style={{
                            paddingBottom: insets.bottom + 10,
                        }}
                    >
                        <MaterialTopTab
                            backBehavior='none'
                            screenListeners={{
                                focus: (e) => {
                                    if (e.target?.includes('index')) {
                                        setView('filter')
                                    } else {
                                        setView('sort')
                                    }
                                },
                            }}
                            screenOptions={{
                                tabBarStyle: {
                                    elevation: 0,
                                    backgroundColor: '#1a1c23',
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#2a2c33',
                                },
                                tabBarLabelStyle: {
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                },
                                tabBarIndicatorStyle: {
                                    backgroundColor: '#a9c8fc',
                                    height: 2,
                                    borderRadius: 10,
                                },
                                tabBarActiveTintColor: '#a9c8fc',
                                tabBarInactiveTintColor: '#e5e5e5',
                            }}
                        >
                            <MaterialTopTab.Screen
                                name='index'
                                options={{
                                    title: 'Filter',
                                }}
                            />
                            <MaterialTopTab.Screen
                                name='sort'
                                options={{
                                    title: 'Sort',
                                }}
                            />
                        </MaterialTopTab>
                    </BottomSheetView>
                </BottomSheet>
            </Portal>
        </PortalProvider>
    )
}
