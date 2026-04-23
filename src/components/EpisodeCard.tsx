import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import type { Episode } from '@/types';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

interface EpisodeCardProps {
  episode: Episode;
  isActive?: boolean;
  fallbackImage?: string;
  onPress: (ep: Episode) => void;
  variant?: 'default' | 'compact';
}

export default function EpisodeCard({
  episode,
  isActive = false,
  fallbackImage,
  onPress,
  variant = 'default',
}: EpisodeCardProps) {
  const isCompact = variant === 'compact';

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.active, isCompact && styles.compact]}
      onPress={() => onPress(episode)}
      activeOpacity={0.75}
    >
      {/* Thumbnail */}
      <View style={[styles.thumbWrapper, isCompact && styles.thumbCompact]}>
        <Image
          source={{ uri: episode.thumbnail || fallbackImage }}
          style={styles.thumb}
          contentFit="cover"
          transition={200}
        />
        {/* Play overlay */}
        <View style={styles.thumbOverlay}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
        {isActive && (
          <View style={styles.nowPlayingTag}>
            <Text style={styles.nowPlayingText}>PLAYING</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.number}>
          {episode.seasonNumber ? `S${episode.seasonNumber}·` : ''}EP {episode.number}
        </Text>
        <Text style={styles.title} numberOfLines={isCompact ? 1 : 2}>
          {episode.title || `Episode ${episode.number}`}
        </Text>
        {!isCompact && episode.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {episode.description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs + 2,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  active: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(255, 202, 40, 0.07)',
  },
  compact: {
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  thumbWrapper: {
    width: 130,
    height: 75,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.bgSecondary,
  },
  thumbCompact: {
    width: 100,
    height: 60,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  playIcon: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  nowPlayingTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  nowPlayingText: {
    fontSize: 8,
    fontWeight: Typography.black,
    color: '#000',
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  number: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  description: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
});
