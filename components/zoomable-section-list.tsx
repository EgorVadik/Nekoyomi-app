import React, { useRef, useState, useCallback, useMemo } from 'react'
import {
    SectionList,
    SectionListProps,
    LayoutChangeEvent,
    SectionListData,
    ViewStyle,
    StyleSheet,
} from 'react-native'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    runOnJS,
    useAnimatedReaction,
} from 'react-native-reanimated'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'

// Constants
const ANIMATOR_DURATION_TIME = 200
const MIN_RATE = 0.5
const DEFAULT_RATE = 1
const MAX_SCALE_RATE = 3

interface ZoomableSectionListProps<ItemT, SectionT>
    extends SectionListProps<ItemT, SectionT> {
    doubleTapZoom?: boolean
    zoomOutDisabled?: boolean
    onTap?: (event: any) => void
    onLongTap?: (event: any) => boolean
    containerStyle?: ViewStyle
}

export function ZoomableSectionList<ItemT, SectionT>({
    doubleTapZoom = true,
    zoomOutDisabled = false,
    onTap,
    onLongTap,
    containerStyle,
    ...sectionListProps
}: ZoomableSectionListProps<ItemT, SectionT>) {
    // Refs
    const sectionListRef = useRef<SectionList<ItemT, SectionT>>(null)
    const scrollEnabled = useRef(true)
    const doubleTapTimer = useRef<number | null>(null)
    const longPressTimer = useRef<number | null>(null)
    const lastTapTimestamp = useRef(0)

    // State
    const [containerWidth, setContainerWidth] = useState(0)
    const [containerHeight, setContainerHeight] = useState(0)
    const [originalHeight, setOriginalHeight] = useState(0)
    const [isZooming, setIsZooming] = useState(false)
    const [isDoubleTapping, setIsDoubleTapping] = useState(false)
    const [isQuickScaling, setIsQuickScaling] = useState(false)
    const [atFirstPosition, setAtFirstPosition] = useState(true)
    const [atLastPosition, setAtLastPosition] = useState(false)

    // Animated values
    const scale = useSharedValue(DEFAULT_RATE)
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)

    // Derived values
    const halfWidth = containerWidth / 2
    const halfHeight = containerHeight / 2
    const minRate = zoomOutDisabled ? DEFAULT_RATE : MIN_RATE

    // Helper functions
    const getPositionX = useCallback(
        (positionX: number): number => {
            if (scale.value < 1) {
                return 0
            }
            const maxPositionX = halfWidth * (scale.value - 1)
            return Math.max(-maxPositionX, Math.min(positionX, maxPositionX))
        },
        [halfWidth],
    )

    const getPositionY = useCallback(
        (positionY: number): number => {
            if (scale.value < 1) {
                return originalHeight / 2 - halfHeight
            }
            const maxPositionY = halfHeight * (scale.value - 1)
            return Math.max(-maxPositionY, Math.min(positionY, maxPositionY))
        },
        [halfHeight, originalHeight],
    )

    // Zoom animation function
    const zoom = useCallback(
        (
            fromRate: number,
            toRate: number,
            fromX: number,
            toX: number,
            fromY: number,
            toY: number,
        ) => {
            runOnJS(setIsZooming)(true)

            scale.value = withTiming(toRate, {
                duration: ANIMATOR_DURATION_TIME,
            })
            translateX.value = withTiming(toX, {
                duration: ANIMATOR_DURATION_TIME,
            })
            translateY.value = withTiming(toY, {
                duration: ANIMATOR_DURATION_TIME,
            })

            // Update scroll enabled state
            runOnJS(() => {
                scrollEnabled.current = toRate <= 1
                setIsZooming(false)
            })
        },
        [],
    )

    // Scale handling
    const onScale = useCallback(
        (scaleFactor: number) => {
            let newScale = scale.value * scaleFactor
            newScale = Math.max(minRate, Math.min(newScale, MAX_SCALE_RATE))

            scale.value = newScale

            // Adjust position
            if (newScale !== DEFAULT_RATE) {
                const newX = getPositionX(translateX.value)
                const newY = getPositionY(translateY.value)
                translateX.value = newX
                translateY.value = newY
            } else {
                translateX.value = 0
                translateY.value = 0
            }

            // Enable/disable scrolling based on scale
            runOnJS(() => {
                scrollEnabled.current = newScale <= 1
            })
        },
        [minRate, getPositionX, getPositionY],
    )

    const onScaleEnd = useCallback(() => {
        if (scale.value < minRate) {
            zoom(scale.value, minRate, translateX.value, 0, translateY.value, 0)
        }
    }, [minRate, zoom])

    // Double tap handler
    const handleDoubleTap = useCallback(
        (event: any) => {
            if (!isZooming && doubleTapZoom) {
                if (scale.value !== DEFAULT_RATE) {
                    zoom(
                        scale.value,
                        DEFAULT_RATE,
                        translateX.value,
                        0,
                        translateY.value,
                        0,
                    )
                } else {
                    const toScale = 2
                    const locationX = event.x
                    const locationY = event.y
                    const toX = (halfWidth - locationX) * (toScale - 1)
                    const toY = (halfHeight - locationY) * (toScale - 1)
                    zoom(DEFAULT_RATE, toScale, 0, toX, 0, toY)
                }
            }
        },
        [isZooming, doubleTapZoom, halfWidth, halfHeight, zoom],
    )

    // Gestures
    const tapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onStart((event) => {
            runOnJS(handleDoubleTap)(event)
        })

    const singleTapGesture = Gesture.Tap().onStart((event) => {
        if (onTap) {
            runOnJS(onTap)(event)
        }
    })

    const longPressGesture = Gesture.LongPress().onStart((event) => {
        if (onLongTap) {
            runOnJS(onLongTap)(event)
        }
    })

    const panGesture = Gesture.Pan()
        .onStart(() => {
            if (doubleTapTimer.current) {
                clearTimeout(doubleTapTimer.current)
                doubleTapTimer.current = null
            }
        })
        .onUpdate((event) => {
            if (scale.value > 1) {
                const newX = getPositionX(translateX.value + event.translationX)
                const newY = getPositionY(translateY.value + event.translationY)
                translateX.value = newX
                translateY.value = newY
            }
        })
        .onEnd((event) => {
            if (scale.value > 1) {
                const velocityX = event.velocityX
                const velocityY = event.velocityY
                const distanceTimeFactor = 0.4

                if (velocityX !== 0) {
                    const dx = (distanceTimeFactor * velocityX) / 2
                    const newX = getPositionX(translateX.value + dx)
                    translateX.value = withSpring(newX, {
                        velocity: velocityX,
                        damping: 20,
                    })
                }

                if (velocityY !== 0 && (atFirstPosition || atLastPosition)) {
                    const dy = (distanceTimeFactor * velocityY) / 2
                    const newY = getPositionY(translateY.value + dy)
                    translateY.value = withSpring(newY, {
                        velocity: velocityY,
                        damping: 20,
                    })
                }
            }
        })

    const pinchGesture = Gesture.Pinch()
        .onUpdate((event) => {
            onScale(event.scale)
        })
        .onEnd(() => {
            onScaleEnd()
        })

    const composed = Gesture.Simultaneous(
        Gesture.Exclusive(tapGesture, singleTapGesture, longPressGesture),
        Gesture.Simultaneous(panGesture, pinchGesture),
    )

    // Handle layout changes
    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const { width, height } = event.nativeEvent.layout
            setContainerWidth(width)
            setContainerHeight(height)

            if (originalHeight === 0) {
                setOriginalHeight(height)
            }
        },
        [originalHeight],
    )

    // Handle scroll events
    const onScroll = useCallback(
        (event: any) => {
            const { contentOffset, contentSize, layoutMeasurement } =
                event.nativeEvent

            setAtFirstPosition(contentOffset.y <= 0)
            setAtLastPosition(
                contentOffset.y + layoutMeasurement.height >=
                    contentSize.height,
            )

            if (sectionListProps.onScroll) {
                sectionListProps.onScroll(event)
            }
        },
        [sectionListProps.onScroll],
    )

    // Animated style
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
    }))

    return (
        <GestureHandlerRootView style={[styles.container, containerStyle]}>
            <GestureDetector gesture={composed}>
                <Animated.View
                    style={[styles.container, animatedStyle]}
                    onLayout={onLayout}
                >
                    <SectionList
                        ref={sectionListRef}
                        {...sectionListProps}
                        scrollEnabled={scrollEnabled.current}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                    />
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

export default ZoomableSectionList
