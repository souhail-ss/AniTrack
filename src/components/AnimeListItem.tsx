import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Anime } from '../types/anime';
import { colors } from '../theme/colors';
import { formatSeason, getTypeLabel } from './AnimeCard';

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';
const IMG_W = 88;
const IMG_H = 124;

interface Props {
  anime: Anime;
  onPress: () => void;
  rank?: number;
  extraBadge?: string;
}

export default function AnimeListItem({ anime, onPress, rank, extraBadge }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageUrl =
    anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url;

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 14, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        }}
        activeOpacity={1}
      >
        <View style={styles.card}>
          {/* Thumbnail */}
          <View style={styles.imgContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              placeholder={{ blurhash: BLURHASH }}
              transition={300}
            />
            {rank !== undefined && (
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{rank}</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {anime.title}
            </Text>

            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{getTypeLabel(anime.type)}</Text>
              </View>
              {anime.score != null && (
                <View style={styles.scoreContainer}>
                  <Text style={styles.star}>★</Text>
                  <Text style={styles.score}>{anime.score.toFixed(1)}</Text>
                </View>
              )}
              {extraBadge ? (
                <View style={styles.extraBadge}>
                  <Text style={styles.extraBadgeText}>{extraBadge}</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.season}>
              {formatSeason(anime.season, anime.year)}
            </Text>

            <Text style={styles.eps}>
              {anime.type === 'Movie'
                ? 'Film'
                : anime.episodes
                ? `${anime.episodes} Episodes`
                : 'Episodes: ?'}
            </Text>

            {anime.studios && anime.studios.length > 0 && (
              <Text style={styles.studio} numberOfLines={1}>
                {anime.studios[0].name}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imgContainer: {
    position: 'relative',
  },
  image: {
    width: IMG_W,
    height: IMG_H,
  },
  rankBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(224, 64, 251, 0.92)',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 34,
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: colors.accentMuted,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(224,64,251,0.25)',
  },
  typeText: {
    color: colors.accentBright,
    fontSize: 11,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    color: colors.star,
    fontSize: 12,
  },
  score: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  extraBadge: {
    backgroundColor: 'rgba(108,63,160,0.3)',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extraBadgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  season: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  eps: {
    color: colors.textMuted,
    fontSize: 11,
  },
  studio: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
