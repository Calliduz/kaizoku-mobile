import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import AnimeCard from './AnimeCard';
import { AnimeCardSkeleton } from './SkeletonLoader';
import type { Anime } from '@/types';
import { Colors, Spacing, Typography } from '@/constants/theme';

interface AnimeRowProps {
  title: string;
  animes: Anime[];
  loading?: boolean;
  isExternal?: boolean;
  onSeeAll?: () => void;
}

export default function AnimeRow({
  title,
  animes,
  loading = false,
  isExternal = false,
  onSeeAll,
}: AnimeRowProps) {
  return (
    <View style={styles.container}>
      {/* Row header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.accentBar} />
          <Text style={styles.title}>{title}</Text>
        </View>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.skeletonRow}>
          {[1, 2, 3].map((i) => (
            <AnimeCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={animes}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <AnimeCard anime={item} isExternal={isExternal} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing['2xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm + 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentBar: {
    width: 3,
    height: 18,
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  title: {
    marginLeft: 8,
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  seeAll: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
  list: {
    paddingHorizontal: Spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
});
