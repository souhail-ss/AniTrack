import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { jikanApi } from '../api/jikan';
import { Anime } from '../types/anime';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { formatSeason, getTypeLabel } from '../components/AnimeCard';
import ErrorState from '../components/ErrorState';

type DetailRoute = RouteProp<RootStackParamList, 'Detail'>;

const { width: SCREEN_W } = Dimensions.get('window');
const HEADER_H = 360;
const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

function StatusBadge({ status }: { status: string }) {
  const isAiring = status === 'Currently Airing';
  const isUpcoming = status === 'Not yet aired';
  const bg = isAiring
    ? 'rgba(76,175,80,0.2)'
    : isUpcoming
    ? 'rgba(33,150,243,0.2)'
    : 'rgba(96,96,96,0.2)';
  const border = isAiring
    ? 'rgba(76,175,80,0.5)'
    : isUpcoming
    ? 'rgba(33,150,243,0.5)'
    : 'rgba(96,96,96,0.4)';
  const textColor = isAiring ? '#81C784' : isUpcoming ? '#64B5F6' : colors.textSecondary;
  const dot = isAiring ? '● ' : '';
  return (
    <View style={[statusStyles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[statusStyles.text, { color: textColor }]}>
        {dot}{status}
      </Text>
    </View>
  );
}

const statusStyles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
  },
  text: { fontSize: 12, fontWeight: '700' },
});

function GenreChip({ label }: { label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Text style={chipStyles.text}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    backgroundColor: colors.accentMuted,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(224,64,251,0.3)',
    margin: 4,
  },
  text: { color: colors.accentBright, fontSize: 12, fontWeight: '600' },
});

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text style={infoRowStyles.value}>{value}</Text>
    </View>
  );
}

const infoRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(108,63,160,0.2)',
  },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  value: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
});

export default function DetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<DetailRoute>();
  const insets = useSafeAreaInsets();
  const { id } = route.params;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contentOpacity = useSharedValue(0);
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const loadDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await jikanApi.getAnimeDetail(id);
      setAnime(res.data);
      contentOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    } catch {
      setError('Failed to load details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const openTrailer = () => {
    if (!anime?.trailer) return;
    const url =
      anime.trailer.url ||
      (anime.trailer.youtube_id
        ? `https://www.youtube.com/watch?v=${anime.trailer.youtube_id}`
        : null);
    if (url) Linking.openURL(url);
  };

  const hasTrailer =
    anime?.trailer?.url != null || anime?.trailer?.youtube_id != null;

  const imageUrl =
    anime?.images?.jpg?.large_image_url || anime?.images?.jpg?.image_url;

  return (
    <View style={styles.fill}>
      <StatusBar style="light" />

      {loading && (
        <LinearGradient colors={[...colors.gradients.background]} style={styles.fill}>
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color={colors.accentBright} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </LinearGradient>
      )}

      {error && !loading && (
        <LinearGradient colors={[...colors.gradients.background]} style={styles.fill}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[styles.backBtn, { top: insets.top + 12 }]}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <ErrorState message={error} onRetry={loadDetail} />
        </LinearGradient>
      )}

      {anime && !loading && (
        <Animated.View style={[styles.fill, contentStyle]}>
          <ScrollView
            style={styles.fill}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          >
            {/* Hero Image Header */}
            <View style={styles.heroContainer}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.heroImage}
                contentFit="cover"
                placeholder={{ blurhash: BLURHASH }}
                transition={400}
              />
              <LinearGradient
                colors={['transparent', 'rgba(13,13,43,0.5)', '#0D0D2B']}
                style={styles.heroGradient}
              />

              {/* Back Button */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.backBtn, { top: insets.top + 12 }]}
              >
                <View style={styles.backBtnInner}>
                  <Ionicons name="arrow-back" size={20} color="#fff" />
                </View>
              </TouchableOpacity>

              {/* Score overlay */}
              {anime.score != null && (
                <View style={styles.scoreOverlay}>
                  <Text style={styles.scoreStar}>★</Text>
                  <Text style={styles.scoreValue}>{anime.score.toFixed(1)}</Text>
                  <Text style={styles.scoreMax}>/10</Text>
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Japanese Title */}
              {anime.title_japanese && (
                <Text style={styles.titleJp}>{anime.title_japanese}</Text>
              )}

              {/* English / Romaji Title */}
              <Text style={styles.titleMain}>
                {anime.title_english || anime.title}
              </Text>

              {/* Badges Row */}
              <View style={styles.badgesRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>
                    {getTypeLabel(anime.type)}
                  </Text>
                </View>
                <StatusBadge status={anime.status} />
              </View>

              {/* Info Table */}
              <View style={styles.infoTable}>
                <InfoRow
                  label="Season"
                  value={formatSeason(anime.season, anime.year)}
                />
                <InfoRow
                  label="Episodes"
                  value={
                    anime.type === 'Movie'
                      ? 'Film'
                      : anime.episodes != null
                      ? `${anime.episodes}`
                      : 'Unknown'
                  }
                />
                {anime.duration && (
                  <InfoRow label="Duration" value={anime.duration} />
                )}
                {anime.studios && anime.studios.length > 0 && (
                  <InfoRow
                    label="Studio"
                    value={anime.studios.map((s) => s.name).join(', ')}
                  />
                )}
                {anime.rating && (
                  <InfoRow label="Rating" value={anime.rating} />
                )}
                {anime.rank != null && (
                  <InfoRow label="MAL Rank" value={`#${anime.rank}`} />
                )}
              </View>

              {/* Synopsis */}
              {anime.synopsis && (
                <>
                  <Text style={styles.sectionLabel}>Synopsis</Text>
                  <Text style={styles.synopsis}>{anime.synopsis}</Text>
                </>
              )}

              {/* Genres */}
              {anime.genres && anime.genres.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>Genres</Text>
                  <View style={styles.chipsWrap}>
                    {anime.genres.map((g) => (
                      <GenreChip key={g.mal_id} label={g.name} />
                    ))}
                    {anime.themes?.map((t) => (
                      <GenreChip key={`t-${t.mal_id}`} label={t.name} />
                    ))}
                  </View>
                </>
              )}

              {/* Trailer Button */}
              {hasTrailer && (
                <TouchableOpacity
                  onPress={openTrailer}
                  activeOpacity={0.85}
                  style={styles.trailerWrap}
                >
                  <LinearGradient
                    colors={['#6C3FA0', '#E040FB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.trailerBtn}
                  >
                    <Ionicons name="play-circle" size={22} color="#fff" />
                    <Text style={styles.trailerBtnText}>Watch Trailer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: { color: colors.textSecondary, fontSize: 15 },
  heroContainer: {
    width: SCREEN_W,
    height: HEADER_H,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_W,
    height: HEADER_H,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    top: HEADER_H * 0.35,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  backBtnInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(13,13,43,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreOverlay: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(13,13,43,0.75)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  scoreStar: { color: colors.star, fontSize: 18 },
  scoreValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  scoreMax: { color: colors.textMuted, fontSize: 14 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
  },
  titleJp: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  titleMain: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: 'rgba(108,63,160,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  infoTable: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  synopsis: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -4,
    marginBottom: 28,
  },
  trailerWrap: {
    marginTop: 4,
    borderRadius: 28,
    overflow: 'hidden',
  },
  trailerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    borderRadius: 28,
  },
  trailerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
