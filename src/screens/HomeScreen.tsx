import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import AnimeCard from '../components/AnimeCard';
import AnimeListItem from '../components/AnimeListItem';
import SkeletonCard from '../components/SkeletonCard';
import SkeletonListItem from '../components/SkeletonListItem';
import ErrorState from '../components/ErrorState';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [trending, setTrending] = useState<Anime[]>([]);
  const [seasonal, setSeasonal] = useState<Anime[]>([]);
  const [popular, setPopular] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const trendingRes = await jikanApi.getTrending();
      if (!mounted.current) return;
      setTrending(trendingRes.data);

      const seasonalRes = await jikanApi.getThisSeason();
      if (!mounted.current) return;
      setSeasonal(seasonalRes.data.slice(0, 10));

      const popularRes = await jikanApi.getMostPopular();
      if (!mounted.current) return;
      setPopular(popularRes.data.slice(0, 10));
    } catch {
      if (mounted.current) setError('Failed to load. Check your connection.');
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goDetail = (anime: Anime) =>
    navigation.navigate('Detail', { id: anime.mal_id, title: anime.title });

  if (error && trending.length === 0 && !loading) {
    return (
      <LinearGradient colors={[...colors.gradients.background]} style={styles.fill}>
        <SafeAreaView style={styles.fill}>
          <StatusBar style="light" />
          <ErrorState message={error} onRetry={() => loadData()} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[...colors.gradients.background]} style={styles.fill}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>
        <ScrollView
          style={styles.scroll}
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
          {/* App Header */}
          <View style={styles.header}>
            <Text style={styles.appName}>
              {'Ani'}
              <Text style={styles.appNameAccent}>{'Track'}</Text>
            </Text>
            <Text style={styles.tagline}>Discover your next obsession</Text>
          </View>

          {/* ── Trending Now ── */}
          <SectionHeader title="Trending Now" emoji="🔥" subtitle="Live airing" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hScroll}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : trending.map((a) => (
                  <AnimeCard key={a.mal_id} anime={a} onPress={() => goDetail(a)} />
                ))}
          </ScrollView>

          {/* ── This Season ── */}
          <SectionHeader title="This Season" emoji="🌸" />
          <View style={styles.listSection}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)
              : seasonal.map((a) => (
                  <AnimeListItem key={a.mal_id} anime={a} onPress={() => goDetail(a)} />
                ))}
          </View>

          {/* ── Most Popular ── */}
          <SectionHeader title="Most Popular All Time" emoji="👑" />
          <View style={styles.listSection}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonListItem key={i} />)
              : popular.map((a) => (
                  <AnimeListItem key={a.mal_id} anime={a} onPress={() => goDetail(a)} />
                ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SectionHeader({
  title,
  emoji,
  subtitle,
}: {
  title: string;
  emoji?: string;
  subtitle?: string;
}) {
  return (
    <View style={sectionStyles.container}>
      <View style={sectionStyles.left}>
        {emoji ? <Text style={sectionStyles.emoji}>{emoji}</Text> : null}
        <Text style={sectionStyles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={sectionStyles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
    marginTop: 28,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 18,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  appName: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  appNameAccent: {
    color: colors.accentBright,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
  hScroll: {
    paddingLeft: 20,
    paddingRight: 6,
  },
  listSection: {
    paddingHorizontal: 20,
  },
});
