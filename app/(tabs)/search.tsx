import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { fetchAllAnime } from '@/api/animeApi';
import AnimeCard from '@/components/AnimeCard';
import { AnimeCardSkeleton } from '@/components/SkeletonLoader';
import type { Anime } from '@/types';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller',
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Trending', value: 'popularity' },
  { label: 'Top Rated', value: 'rating' },
];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; sort?: string }>();
  const router = useRouter();

  const [query, setQuery] = useState(params.q || '');
  const [genre, setGenre] = useState('');
  const [sort, setSort] = useState(params.sort || 'newest');
  const [results, setResults] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (
    q: string, g: string, s: string, p: number, append = false
  ) => {
    if (p === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await fetchAllAnime({ search: q, genre: g, sort: s, page: p, limit: 20 });
      const data: Anime[] = res.data || [];
      setResults((prev) => (append ? [...prev, ...data] : data));
      setTotalPages(res.pagination?.pages ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Debounced search when query/genre/sort changes
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      search(query, genre, sort, 1, false);
    }, 400);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, genre, sort]);

  const loadMore = () => {
    if (loadingMore || page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    search(query, genre, sort, next, true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search anime..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={{ marginBottom: 20 }}
      >
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, sort === opt.value && styles.chipActive]}
            onPress={() => setSort(opt.value)}
          >
            <Text style={[styles.chipText, sort === opt.value && styles.chipActiveText]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, genre === g && styles.chipActive]}
            onPress={() => setGenre(genre === g ? '' : g)}
          >
            <Text style={[styles.chipText, genre === g && styles.chipActiveText]}>
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results grid */}
      {loading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <AnimeCardSkeleton key={i} width={170} />
          ))}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => <AnimeCard anime={item} width={170} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={Colors.accent}
                style={{ marginVertical: Spacing.md }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={64} color="#64748b" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
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
  searchWrapper: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#11151c',
    borderRadius: 12,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
      default: {},
    }),
  },
  chips: {
    paddingHorizontal: 16,
    paddingBottom: Spacing.sm,
    gap: 10,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },
  chipActiveText: {
    color: '#000',
  },
  grid: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
    flexGrow: 1,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.base,
    color: '#94a3b8',
  },
});
