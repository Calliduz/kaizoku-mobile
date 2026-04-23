import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { Anime } from '@/types';
import { Colors, Radius, Typography, Spacing } from '@/constants/theme';

interface AnimeCardProps {
  anime: Anime;
  isExternal?: boolean;
  width?: number;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function AnimeCard({ anime, isExternal = false, width = 130 }: AnimeCardProps) {
  const router = useRouter();
  const displayEpisodes = anime.latestEpisode ?? anime.totalEpisodes;

  const handlePress = () => {
    if (isExternal) {
      router.push(`/search?q=${encodeURIComponent(anime.title)}`);
    } else {
      router.push(`/anime/${anime._id}`);
    }
  };

  return (
    <AnimatedTouchableOpacity
      entering={FadeIn.duration(400)}
      style={[styles.wrapper, { width }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.imageWrapper, { width }]}>
        <Image
          source={{ uri: anime.coverImage }}
          style={[styles.image, { width }]}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I' }}
        />
        <LinearGradient
          colors={['transparent', 'rgba(5,7,10,0.8)']}
          style={styles.gradient}
        />

        {/* Badges */}
        <View style={styles.badges}>
          {anime.rating > 0 && (
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>
                ★ {(anime.rating / 10).toFixed(1)}
              </Text>
            </View>
          )}
          {displayEpisodes > 0 && (
            <View style={styles.epBadge}>
              <Text style={styles.epText}>{displayEpisodes} EP</Text>
            </View>
          )}
        </View>

        {/* Play overlay icon */}
        <View style={styles.playHint}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {anime.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[anime.format?.replace(/_/g, ' '), anime.seasonYear]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </View>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginRight: Spacing.sm + 4,
  },
  imageWrapper: {
    height: 190,
    borderRadius: Radius.md,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
  },
  image: {
    height: 190,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  badges: {
    position: 'absolute',
    top: 6,
    right: 6,
    gap: 4,
    alignItems: 'flex-end',
  },
  ratingBadge: {
    backgroundColor: 'rgba(255, 202, 40, 0.9)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  ratingText: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: '#000',
  },
  epBadge: {
    backgroundColor: 'rgba(5, 7, 10, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  epText: {
    fontSize: 9,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  playHint: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    opacity: 0.8,
  },
  playIcon: {
    fontSize: 14,
    color: '#fff',
  },
  info: {
    marginTop: Spacing.xs + 2,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  meta: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
