import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationEventMap,
    MaterialTopTabNavigationOptions,
} from '@react-navigation/material-top-tabs'
import { ParamListBase, TabNavigationState } from '@react-navigation/native'
import { withLayoutContext } from 'expo-router'

const { Navigator } = createMaterialTopTabNavigator()

export const MaterialTopTab = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator)
