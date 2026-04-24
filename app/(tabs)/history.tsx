import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useHistoryStore } from '@/store/useHistoryStore';
import type { HistoryItem } from '@/types';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

function HistoryCard({ item, onPress, onRemove }: {
  item: HistoryItem;
  onPress: () => void;
  onRemove: () => void;
}) {
  const timeAgo = (() => {
    const diff = Date.now() - item.watchedAt;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'Just now';
  })();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.thumbWrapper}>
        <Image
          source={{ uri: item.anime.coverImage }}
          style={styles.thumb}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(5,7,10,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        {/* Progress bar */}
        {item.progressPercentage > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${item.progressPercentage}%` }]} />
          </View>
        )}
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.animeTitle} numberOfLines={1}>
          {item.anime.title}
        </Text>
        <Text style={styles.episodeLabel}>
          {item.episode.seasonNumber
            ? `S${item.episode.seasonNumber} `
            : ''}Ep {item.episode.number}
        </Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>

      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const { items, _hydrated, removeFromHistory, clearHistory } = useHistoryStore();

  const handleClearAll = () => {
    Alert.alert('Clear History', 'Remove all watch history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearHistory },
    ]);
  };

  if (!_hydrated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="time" size={28} color={Colors.accent} />
            <Text style={styles.headerText}>Watch History</Text>
          </View>

          {items.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearBtn}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {items.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="film-outline" size={64} color="#64748b" />
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyText}>
            Episodes you watch will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.anime._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <HistoryCard
              item={item}
              onPress={() =>
                router.push(`/anime/${item.anime._id}/watch/${item.episode._id}` as any)
              }
              onRemove={() => removeFromHistory(item.anime._id)}
            />
          )}
          ListFooterComponent={<View style={{ height: 90 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#11151c',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#f8f9fa',
    marginLeft: 12,
  },
  clearBtn: {
    fontSize: Typography.sm,
    color: Colors.danger,
    fontWeight: Typography.semibold,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  thumbWrapper: {
    width: 100,
    height: 70,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  cardInfo: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: 'center',
    gap: 2,
  },
  animeTitle: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  episodeLabel: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
  timeAgo: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  removeBtn: {
    padding: Spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm + 4,
  },
  removeIcon: {
    fontSize: 14,
    color: Colors.textMuted,
  },
});
