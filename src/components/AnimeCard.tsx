import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Anime } from '../types/anime';
import { colors } from '../theme/colors';

const CARD_WIDTH = 150;
const CARD_HEIGHT = 225;

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

export function formatSeason(season: string | null, year: number | null): string {
  if (!season && !year) return 'Unknown';
  const s = season ? season.charAt(0).toUpperCase() + season.slice(1) : '';
  return [s, year].filter(Boolean).join(' ');
}

export function getTypeLabel(type: string | null): string {
  if (!type) return '?';
  if (type === 'Movie') return 'Film';
  return type;
}

interface Props {
  anime: Anime;
  onPress: () => void;
}

export default function AnimeCard({ anime, onPress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageUrl =
    anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url;

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.94, { damping: 14, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 300 });
        }}
        activeOpacity={1}
      >
        <View style={styles.card}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            placeholder={{ blurhash: BLURHASH }}
            transition={300}
          />

          <LinearGradient
            colors={['transparent', 'rgba(13,13,43,0.7)', '#0D0D2B']}
            style={styles.gradient}
          />

          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{getTypeLabel(anime.type)}</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={2}>
              {anime.title}
            </Text>
            <View style={styles.scoreRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.score}>
                {anime.score != null ? anime.score.toFixed(1) : 'N/A'}
              </Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.eps}>
                {anime.type === 'Movie'
                  ? 'Film'
                  : anime.episodes
                  ? `${anime.episodes} ep`
                  : '? ep'}
              </Text>
            </View>
            <Text style={styles.season}>
              {formatSeason(anime.season, anime.year)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginRight: 14,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT * 0.62,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(108, 63, 160, 0.88)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(224,64,251,0.4)',
  },
  typeText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  star: {
    color: colors.star,
    fontSize: 11,
    marginRight: 2,
  },
  score: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  dot: {
    color: colors.textMuted,
    fontSize: 11,
    marginRight: 4,
  },
  eps: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  season: {
    color: colors.textMuted,
    fontSize: 10,
  },
});
