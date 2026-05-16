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

export default function TopScreen() {
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
      const res = await jikanApi.getMostPopular();
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
            <Text style={styles.screenTitle}>
              {'Top '}
              <Text style={styles.screenTitleAccent}>Anime</Text>
            </Text>
            <Text style={styles.screenSub}>Ranked by global popularity</Text>
          </View>

          {/* Top 3 podium label */}
          {!loading && anime.length > 0 && (
            <View style={styles.podiumHint}>
              <LinearGradient
                colors={['rgba(108,63,160,0.2)', 'rgba(224,64,251,0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.podiumBanner}
              >
                <Text style={styles.podiumText}>🏆 Hall of Fame · Top 20</Text>
              </LinearGradient>
            </View>
          )}

          <View style={styles.listPad}>
            {loading
              ? Array.from({ length: 10 }).map((_, i) => <SkeletonListItem key={i} />)
              : anime.map((a, index) => (
                  <AnimeListItem
                    key={`${a.mal_id}-${index}`}
                    anime={a}
                    onPress={() => goDetail(a)}
                    rank={index + 1}
                  />
                ))}
          </View>
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
  screenTitleAccent: {
    color: colors.accentBright,
  },
  screenSub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    fontStyle: 'italic',
  },
  podiumHint: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 12,
  },
  podiumBanner: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  podiumText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  listPad: {
    paddingHorizontal: 20,
  },
});
