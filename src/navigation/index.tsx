import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, TabParamList } from './types';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import LatestScreen from '../screens/LatestScreen';
import TopScreen from '../screens/TopScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#12122e',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor: colors.accentBright,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            Home: { active: 'home', inactive: 'home-outline' },
            Latest: { active: 'time', inactive: 'time-outline' },
            Top: { active: 'trophy', inactive: 'trophy-outline' },
          };
          const iconSet = icons[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          return (
            <Ionicons
              name={(focused ? iconSet.active : iconSet.inactive) as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Latest" component={LatestScreen} />
      <Tab.Screen name="Top" component={TopScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
