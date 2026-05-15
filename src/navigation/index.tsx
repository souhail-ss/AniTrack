import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, TabParamList } from './types';
import { colors } from '../theme/colors';
import HomeScreen from '../screens/HomeScreen';
import LatestScreen from '../screens/LatestScreen';
import TopScreen from '../screens/TopScreen';
import DetailScreen from '../screens/DetailScreen';
import SearchModal from '../components/SearchModal';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const SEARCH_BTN_SIZE = 46;

function Tabs() {
  const [searchVisible, setSearchVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
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
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, { active: string; inactive: string }> = {
              Home:   { active: 'home',   inactive: 'home-outline' },
              Latest: { active: 'time',   inactive: 'time-outline' },
              Top:    { active: 'trophy', inactive: 'trophy-outline' },
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

      {/* Floating circular search button — top-right, over all tab screens */}
      <View
        style={[styles.searchBtnWrapper, { top: insets.top + 10, right: 16 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity onPress={() => setSearchVisible(true)} activeOpacity={0.82}>
          <LinearGradient
            colors={[...colors.gradients.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.searchBtn}
          >
            <Ionicons name="search" size={21} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBtnWrapper: {
    position: 'absolute',
    zIndex: 100,
  },
  searchBtn: {
    width: SEARCH_BTN_SIZE,
    height: SEARCH_BTN_SIZE,
    borderRadius: SEARCH_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentBright,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
});

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
