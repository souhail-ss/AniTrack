import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

const FAB_SIZE = 62;
// How much of the FAB sits above the dark bar (protrudes into the transparent area)
const PROTRUDE = 26;

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Latest: { active: 'time', inactive: 'time-outline' },
  Top: { active: 'trophy', inactive: 'trophy-outline' },
};

interface Props extends BottomTabBarProps {
  onSearchPress: () => void;
}

export default function CustomTabBar({ state, descriptors, navigation, onSearchPress }: Props) {
  const insets = useSafeAreaInsets();

  const leftRoutes = state.routes.slice(0, 2);  // Home, Latest
  const rightRoutes = state.routes.slice(2);     // Top

  function renderTab(route: (typeof state.routes)[0], globalIndex: number) {
    const { options } = descriptors[route.key];
    const label = String(options.tabBarLabel ?? options.title ?? route.name);
    const isFocused = state.index === globalIndex;
    const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name as any);
      }
    };

    return (
      <TouchableOpacity key={route.key} style={styles.tab} onPress={onPress} activeOpacity={0.7}>
        <Ionicons
          name={(isFocused ? icons.active : icons.inactive) as any}
          size={24}
          color={isFocused ? colors.accentBright : colors.textMuted}
        />
        <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    // paddingTop creates a transparent space above the dark bar where the FAB protrudes
    <View style={[styles.outer, { paddingBottom: insets.bottom || 6 }]}>
      {/* Dark tab bar area */}
      <View style={styles.darkBar}>
        <View style={styles.border} />
        <View style={styles.row}>
          {leftRoutes.map((r, i) => renderTab(r, i))}
          {/* Spacer under the FAB so tab labels don't collide with it */}
          <View style={styles.centerSpacer} />
          {rightRoutes.map((r, i) => renderTab(r, leftRoutes.length + i))}
        </View>
      </View>

      {/* Floating search button — overlaps the border between transparent + dark areas */}
      <View style={styles.fabWrapper} pointerEvents="box-none">
        <TouchableOpacity onPress={onSearchPress} activeOpacity={0.85}>
          <LinearGradient
            colors={[...colors.gradients.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="search" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    // transparent so the app gradient shows behind the protruding FAB area
    backgroundColor: 'transparent',
    paddingTop: PROTRUDE,
    position: 'relative',
  },
  darkBar: {
    backgroundColor: '#12122e',
  },
  border: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    height: 62,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 62,
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  labelActive: {
    color: colors.accentBright,
  },
  centerSpacer: {
    width: FAB_SIZE + 20,
  },
  fabWrapper: {
    position: 'absolute',
    // top: 0 = the very top of the outer container (which starts PROTRUDE px above the dark bar)
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Glow/shadow effect
    shadowColor: colors.accentBright,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 14,
  },
});
