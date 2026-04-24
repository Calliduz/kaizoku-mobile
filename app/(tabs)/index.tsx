import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  fetchAllAnime,
  fetchTop100,
  fetchAiringSchedule,
} from '@/api/animeApi';
import AnimeRow from '@/components/AnimeRow';
import { AnimeRowSkeleton, Skeleton } from '@/components/SkeletonLoader';
import { useHistoryStore } from '@/store/useHistoryStore';
import type { Anime } from '@/types';
import { Colors, Spacing, Typography, Radius } from '@/constants/theme';
import { Feather, Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Spotlight Carousel ───────────────────────────────────────────────────────
function SpotlightCarousel({ items }: { items: Anime[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);

  const onViewRef = useRef((info: any) => {
    if (info.viewableItems.length > 0) {
      setIdx(info.viewableItems[0].index);
    }
  });
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

  if (items.length === 0) return null;

  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_W}
        snapToAlignment="center"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onViewableItemsChanged={onViewRef.current}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item: current }) => {
          const bgImage = current.fanartBackground || current.bannerImage || current.coverImage;
          return (
            <View style={{ width: SCREEN_W, height: 280 }}>
              <ImageBackground
                source={{ uri: bgImage }}
                style={styles.carouselBg}
                imageStyle={{ opacity: 0.55 }}
              >
                {/* Full overlay gradient */}
                <LinearGradient
                  colors={['transparent', 'rgba(5,7,10,0.6)', Colors.bgPrimary]}
                  style={StyleSheet.absoluteFill}
                />
                {/* Top dark fade */}
                <LinearGradient
                  colors={['rgba(5,7,10,0.3)', 'transparent']}
                  style={styles.carouselTopGrad}
                />
                {/* Content gradient at bottom */}
                <LinearGradient
                  colors={['transparent', '#0f172a']}
                  style={styles.carouselContent}
                >
                  <View style={styles.carouselBody}>
                    <Image
                      source={{ uri: current.coverImage }}
                      style={[styles.carouselPoster, { borderRadius: Radius.md }]}
                      contentFit="cover"
                    />
                    <View style={styles.carouselInfo}>
                      <Text style={styles.carouselTitle} numberOfLines={2}>
                        {current.title}
                      </Text>

                      <View style={styles.chipRow}>
                        {current.rating > 0 && (
                          <View style={styles.chipGold}>
                            <Text style={styles.chipGoldText}>
                              ★ {(current.rating / 10).toFixed(1)}
                            </Text>
                          </View>
                        )}
                        {current.format && (
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>
                              {current.format.replace(/_/g, ' ')}
                            </Text>
                          </View>
                        )}
                        {current.status === 'RELEASING' && (
                          <View style={[styles.chip, styles.chipGreen]}>
                            <Text style={styles.chipText}>ON AIR</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.carouselDesc} numberOfLines={3}>
                        {current.description?.replace(/<[^>]*>/g, '')}
                      </Text>

                      <View style={styles.carouselActions}>
                        <TouchableOpacity
                          style={styles.btnWatch}
                          onPress={() => router.push(`/anime/${current._id}/watch/first` as any)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.btnWatchText}>▶  Watch Now</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnInfo}
                          onPress={() => router.push(`/anime/${current._id}`)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.btnInfoText}>ⓘ  Details</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          );
        }}
      />
      {/* Pagination dots — below the swiper, never over buttons */}
      <View style={styles.dots}>
        {items.map((_, i) => (
          <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { items: historyItems, _hydrated } = useHistoryStore();

  const [spotlight, setSpotlight] = useState<Anime[]>([]);
  const [latest, setLatest] = useState<Anime[]>([]);
  const [trending, setTrending] = useState<Anime[]>([]);
  const [topRated, setTopRated] = useState<Anime[]>([]);
  const [top100, setTop100] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [spotRes, latestRes, trendRes, ratedRes, topRes] = await Promise.all([
        fetchAllAnime({ sort: 'popular', limit: 8, page: 1 }),
        fetchAllAnime({ sort: 'newest', limit: 15, page: 1 }),
        fetchAllAnime({ sort: 'popularity', limit: 15, page: 1 }),
        fetchAllAnime({ sort: 'rating', limit: 15, page: 1 }),
        fetchTop100(),
      ]);
      setSpotlight(spotRes.data || []);
      setLatest(latestRes.data || []);
      setTrending(trendRes.data || []);
      setTopRated(ratedRes.data || []);
      setTop100((topRes.data || []).slice(0, 12));
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const continueWatching = _hydrated
    ? historyItems.map((h) => h.anime)
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Feather name="anchor" size={24} color={Colors.accent} />
          <Text style={styles.logo}>
            KAIZOKU
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* Spotlight Carousel */}
        {loading ? (
          <Skeleton width={SCREEN_W} height={280} style={styles.carouselSkeleton} />
        ) : (
          <SpotlightCarousel items={spotlight} />
        )}

        <View style={styles.rows}>
          {/* Continue Watching */}
          {continueWatching.length > 0 && (
            <AnimeRow
              title="Continue Watching"
              animes={continueWatching}
              loading={false}
            />
          )}

          {/* Content Rows */}
          {loading ? (
            <>
              <AnimeRowSkeleton />
              <AnimeRowSkeleton />
              <AnimeRowSkeleton />
            </>
          ) : (
            <>
              <AnimeRow
                title="Latest Releases"
                animes={latest}
                onSeeAll={() => router.push('/search?sort=newest')}
              />
              <AnimeRow
                title="Trending Now"
                animes={trending}
                onSeeAll={() => router.push('/search?sort=popularity')}
              />
              <AnimeRow
                title="Top Rated"
                animes={topRated}
                onSeeAll={() => router.push('/search?sort=rating')}
              />
              <AnimeRow
                title="AniList Top 100"
                animes={top100}
                isExternal={true}
              />
            </>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="wifi-outline" size={64} color="#64748b" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadData} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    fontSize: Typography.xl,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
    letterSpacing: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {},
  // ── Carousel ──
  carouselContainer: {
    width: SCREEN_W,
    height: 280,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  carouselBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  carouselTopGrad: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  carouselContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  carouselBody: {
    flexDirection: 'row',
    gap: Spacing.sm + 4,
    alignItems: 'flex-end',
  },
  carouselPoster: {
    width: 80,
    height: 115,
    borderRadius: Radius.md,
  },
  carouselInfo: {
    flex: 1,
    gap: Spacing.xs + 2,
  },
  carouselTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.black,
    color: '#fff',
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
  },
  chipGold: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,202,40,0.2)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,202,40,0.4)',
  },
  chipGreen: {
    backgroundColor: 'rgba(16,185,129,0.2)',
  },
  chipText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },
  chipGoldText: {
    fontSize: Typography.xs,
    color: Colors.accent,
    fontWeight: Typography.bold,
  },
  carouselDesc: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  carouselActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  btnWatch: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  btnWatchText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#000',
  },
  btnInfo: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnInfoText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: '#fff',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginTop: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.accent,
  },
  // ── Content ──
  rows: {
    paddingTop: Spacing.xs,
  },
  carouselSkeleton: {
    marginBottom: Spacing.lg,
  },
  errorBox: {
    flex: 1,
    margin: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: Typography.base,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  retryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#000',
  },
});
