import React, { PropsWithChildren, useCallback } from 'react'
import { Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const MIN_SCALE = 1
const MAX_SCALE = 3.0
const SPRING_CONFIG = {
    damping: 20,
    stiffness: 100,
}
const ZOOM_SPRING_CONFIG = {
    damping: 12,
    stiffness: 120,
    mass: 0.5,
    restSpeedThreshold: 0.5,
}

type ZoomableListProps = PropsWithChildren<{
    onTap?: (event: any) => void
    doubleTapZoom?: boolean
}>

export const ZoomableList: React.FC<ZoomableListProps> = ({
    children,
    onTap,
    doubleTapZoom = true,
}) => {
    const scale = useSharedValue(MIN_SCALE)
    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const savedScale = useSharedValue(MIN_SCALE)

    const constrainScale = (value: number) => {
        'worklet'
        return Math.min(Math.max(value, MIN_SCALE), MAX_SCALE)
    }

    const constrainTranslateX = useCallback(
        (value: number) => {
            'worklet'
            if (scale.value <= 1) return 0
            const maxTranslateX = (SCREEN_WIDTH / 2) * (scale.value - 1)
            return Math.min(Math.max(value, -maxTranslateX), maxTranslateX)
        },
        [scale],
    )

    const constrainTranslateY = useCallback(
        (value: number) => {
            'worklet'
            if (scale.value <= 1) return 0
            const maxTranslateY = (SCREEN_HEIGHT / 2) * (scale.value - 1)
            return Math.min(Math.max(value, -maxTranslateY), maxTranslateY)
        },
        [scale],
    )

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            'worklet'
            savedScale.value = scale.value
        })
        .onChange((event) => {
            'worklet'
            const scaleMultiplier = 1.2
            const newScale = constrainScale(
                savedScale.value * (1 + (event.scale - 1) * scaleMultiplier),
            )
            const centerX = event.focalX ?? SCREEN_WIDTH / 2
            const centerY = event.focalY ?? SCREEN_HEIGHT / 2

            if (newScale !== scale.value) {
                const focalX = centerX - SCREEN_WIDTH / 2
                const focalY = centerY - SCREEN_HEIGHT / 2
                const scaleDiff = newScale / scale.value

                scale.value = newScale
                if (scale.value > 1) {
                    translateX.value = constrainTranslateX(
                        (translateX.value + focalX * (1 - scaleDiff)) *
                            scaleDiff,
                    )
                    translateY.value = constrainTranslateY(
                        (translateY.value + focalY * (1 - scaleDiff)) *
                            scaleDiff,
                    )
                }
            }
        })
        .onEnd(() => {
            'worklet'
            if (scale.value < MIN_SCALE) {
                scale.value = withSpring(MIN_SCALE, ZOOM_SPRING_CONFIG)
                translateX.value = withSpring(0, ZOOM_SPRING_CONFIG)
                translateY.value = withSpring(0, ZOOM_SPRING_CONFIG)
            } else if (scale.value > MAX_SCALE) {
                scale.value = withSpring(MAX_SCALE, ZOOM_SPRING_CONFIG)
            }
        })

    const panGesture = Gesture.Pan()
        .averageTouches(true)
        .onChange((event) => {
            'worklet'
            const speedMultiplier = 1.4
            translateX.value = constrainTranslateX(
                translateX.value + event.changeX * speedMultiplier,
            )
            translateY.value = constrainTranslateY(
                translateY.value + event.changeY * speedMultiplier,
            )
        })
        .onEnd((event) => {
            'worklet'
            const velocityThreshold = 100
            if (
                Math.abs(event.velocityX) > velocityThreshold ||
                Math.abs(event.velocityY) > velocityThreshold
            ) {
                const velocityMultiplier = 0.5
                translateX.value = withSpring(
                    constrainTranslateX(
                        translateX.value + event.velocityX * velocityMultiplier,
                    ),
                    {
                        ...SPRING_CONFIG,
                        velocity: event.velocityX,
                    },
                )
                translateY.value = withSpring(
                    constrainTranslateY(
                        translateY.value + event.velocityY * velocityMultiplier,
                    ),
                    {
                        ...SPRING_CONFIG,
                        velocity: event.velocityY,
                    },
                )
            }
        })

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(250)
        .onEnd((event) => {
            'worklet'
            if (!doubleTapZoom) return

            const isZoomedIn = scale.value > 1.5
            if (!isZoomedIn) {
                const targetScale = 2.0
                const x = event.x ?? SCREEN_WIDTH / 2
                const y = event.y ?? SCREEN_HEIGHT / 2

                scale.value = withSpring(targetScale, ZOOM_SPRING_CONFIG)
                translateX.value = withSpring(
                    (SCREEN_WIDTH / 2 - x) * (targetScale - 1),
                    ZOOM_SPRING_CONFIG,
                )
                translateY.value = withSpring(
                    (SCREEN_HEIGHT / 2 - y) * (targetScale - 1),
                    ZOOM_SPRING_CONFIG,
                )
            } else {
                scale.value = withSpring(MIN_SCALE, ZOOM_SPRING_CONFIG)
                translateX.value = withSpring(0, ZOOM_SPRING_CONFIG)
                translateY.value = withSpring(0, ZOOM_SPRING_CONFIG)
            }
        })

    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(1)
        .onEnd((event, success) => {
            if (success && onTap) {
                runOnJS(onTap)(event)
            }
        })
        .requireExternalGestureToFail(doubleTap)

    const combinedGesture = Gesture.Race(
        pinchGesture,
        Gesture.Exclusive(
            Gesture.Simultaneous(singleTap, doubleTap),
            panGesture,
        ),
    )

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }))

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={animatedStyles}>{children}</Animated.View>
        </GestureDetector>
    )
}
