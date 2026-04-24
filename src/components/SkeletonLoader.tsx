import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors, Radius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height, borderRadius, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius ?? Radius.md,
          backgroundColor: Colors.bgCard,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function AnimeCardSkeleton({ width = 130 }: { width?: number }) {
  return (
    <View style={[{ width, marginRight: width === 130 ? 12 : 0 }]}>
      <Skeleton height={190} borderRadius={Radius.md} style={styles.image} />
      <Skeleton height={14} width="90%" style={styles.title} />
      <Skeleton height={11} width="60%" style={styles.meta} />
    </View>
  );
}

export function AnimeRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton height={18} width={160} style={styles.rowTitle} />
      <View style={styles.rowCards}>
        {[1, 2, 3].map((i) => (
          <AnimeCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

export function EpisodeCardSkeleton() {
  return (
    <View style={styles.episodeCard}>
      <Skeleton height={70} width={120} borderRadius={Radius.sm} />
      <View style={styles.episodeInfo}>
        <Skeleton height={13} width="80%" />
        <Skeleton height={11} width="50%" style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
  },
  title: {
    marginTop: 8,
  },
  meta: {
    marginTop: 5,
  },
  row: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  rowTitle: {
    marginBottom: 14,
    borderRadius: Radius.sm,
  },
  rowCards: {
    flexDirection: 'row',
  },
  episodeCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    padding: 10,
  },
  episodeInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
});
