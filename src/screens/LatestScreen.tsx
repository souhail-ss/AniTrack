import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { jikanApi } from '../api/jikan';
import { Anime } from '../types/anime';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import AnimeListItem from '../components/AnimeListItem';
import SkeletonListItem from '../components/SkeletonListItem';
import ErrorState from '../components/ErrorState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DAY_ORDER = [
  'Mondays',
  'Tuesdays',
  'Wednesdays',
  'Thursdays',
  'Fridays',
  'Saturdays',
  'Sundays',
  'Unknown',
];

function getTodayKey(): string {
  const days = [
    'Sundays',
    'Mondays',
    'Tuesdays',
    'Wednesdays',
    'Thursdays',
    'Fridays',
    'Saturdays',
  ];
  return days[new Date().getDay()];
}

function groupByDay(anime: Anime[]): Record<string, Anime[]> {
  const groups: Record<string, Anime[]> = {};
  for (const a of anime) {
    const day = a.broadcast?.day || 'Unknown';
    if (!groups[day]) groups[day] = [];
    groups[day].push(a);
  }
  return groups;
}

export default function LatestScreen() {
  const navigation = useNavigation<Nav>();
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await jikanApi.getCurrentlyAiring();
      setAnime(res.data);
    } catch {
      setError('Failed to load. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goDetail = (a: Anime) =>
    navigation.navigate('Detail', { id: a.mal_id, title: a.title });

  if (error && anime.length === 0 && !loading) {
    return (
      <LinearGradient colors={[...colors.gradients.background]} style={styles.fill}>
        <SafeAreaView style={styles.fill}>
          <StatusBar style="light" />
          <ErrorState message={error} onRetry={() => loadData()} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const today = getTodayKey();
  const grouped = groupByDay(anime);

  const orderedDays = DAY_ORDER.filter(
    (d) => grouped[d] && grouped[d].length > 0,
  );

  return (
    <LinearGradient colors={[...colors.gradients.background]} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor={colors.accentBright}
              colors={[colors.accentBright]}
            />
          }
        >
          {/* Screen Header */}
          <View style={styles.header}>
            <Text style={styles.screenTitle}>Currently Airing</Text>
            <Text style={styles.screenSub}>Sorted by broadcast day</Text>
          </View>

          {loading ? (
            <View style={styles.listPad}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonListItem key={i} />
              ))}
            </View>
          ) : (
            orderedDays.map((day) => {
              const isToday = day === today;
              return (
                <View key={day} style={styles.dayGroup}>
                  <View style={styles.dayHeaderRow}>
                    <View
                      style={[
                        styles.dayDot,
                        isToday && styles.dayDotToday,
                      ]}
                    />
                    <Text
                      style={[
                        styles.dayLabel,
                        isToday && styles.dayLabelToday,
                      ]}
                    >
                      {isToday ? `${day} · Today` : day}
                    </Text>
                  </View>
                  <View style={styles.listPad}>
                    {grouped[day].map((a) => (
                      <AnimeListItem
                        key={a.mal_id}
                        anime={a}
                        onPress={() => goDetail(a)}
                        extraBadge={
                          a.broadcast?.time ? a.broadcast.time : undefined
                        }
                      />
                    ))}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  screenSub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
  dayGroup: {
    marginTop: 22,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  dayDotToday: {
    backgroundColor: colors.accentBright,
    shadowColor: colors.accentBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  dayLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dayLabelToday: {
    color: colors.accentBright,
  },
  listPad: {
    paddingHorizontal: 20,
  },
});
