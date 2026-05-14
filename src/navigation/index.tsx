import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RootStackParamList, TabParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import LatestScreen from '../screens/LatestScreen';
import TopScreen from '../screens/TopScreen';
import DetailScreen from '../screens/DetailScreen';
import CustomTabBar from '../components/CustomTabBar';
import SearchModal from '../components/SearchModal';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function Tabs() {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <CustomTabBar {...props} onSearchPress={() => setSearchVisible(true)} />
        )}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Latest" component={LatestScreen} />
        <Tab.Screen name="Top" component={TopScreen} />
      </Tab.Navigator>

      <SearchModal visible={searchVisible} onClose={() => setSearchVisible(false)} />
    </>
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
