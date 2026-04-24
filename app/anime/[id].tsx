import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchAnimeById, fetchEpisodes } from '@/api/animeApi';
import EpisodeCard from '@/components/EpisodeCard';
import { EpisodeCardSkeleton } from '@/components/SkeletonLoader';
import type { Anime, Episode } from '@/types';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_H = 260;

export default function AnimeDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandDesc, setExpandDesc] = useState(false);

  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [animeRes, epsRes] = await Promise.all([
        fetchAnimeById(id),
        fetchEpisodes(id),
      ]);
      setAnime(animeRes.data);
      setEpisodes(epsRes.data || []);
      setIsScraping(!!epsRes.isScraping);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll for episodes if scraping
  useEffect(() => {
    if (!isScraping || episodes.length > 0 || !id) return;
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetchEpisodes(id);
        if (res.data?.length > 0) {
          setEpisodes(res.data);
          setIsScraping(!!res.isScraping);
          if (!res.isScraping && pollInterval.current) {
            clearInterval(pollInterval.current);
          }
        }
      } catch {}
    }, 3000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [isScraping, episodes.length, id]);

  const handleWatchFirst = () => {
    if (!anime || episodes.length === 0) return;
    const sorted = [...episodes].sort((a, b) => a.number - b.number);
    router.push(`/player/${anime._id}/${sorted[0]._id}` as any);
  };

  const handleEpisodeSelect = (ep: Episode) => {
    if (!anime) return;
    router.push(`/player/${anime._id}/${ep._id}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !anime) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.loadingCenter}>
          <Text style={styles.errorText}>{error || 'Anime not found'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bgImage = anime.fanartBackground || anime.bannerImage || anime.coverImage;
  const cleanDesc = anime.description?.replace(/<[^>]*>/g, '') || '';
  const statusColors: Record<string, string> = {
    RELEASING: '#10b981',
    FINISHED: Colors.textMuted,
    NOT_YET_RELEASED: Colors.accentSecondary,
    CANCELLED: Colors.danger,
  };
  const statusColor = statusColors[anime.status] || Colors.textMuted;

  return (
    <View style={styles.root}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <View style={styles.hero}>
        <Image
          source={{ uri: bgImage }}
          style={styles.heroBg}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(5,7,10,0.2)', 'rgba(5,7,10,0.6)', Colors.bgPrimary]}
          style={StyleSheet.absoluteFill}
        />
        {/* Back button */}
        <SafeAreaView edges={['top']} style={styles.heroTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* ── Content ──────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      >
        {/* Top info row */}
        <View style={styles.topInfo}>
          <Image
            source={{ uri: anime.coverImage }}
            style={[styles.poster, { borderRadius: Radius.md }]}
            contentFit="cover"
          />
          <View style={styles.meta}>
            <Text style={styles.title}>{anime.title}</Text>

            {/* Chips */}
            <View style={styles.chips}>
              {anime.rating > 0 && (
                <View style={styles.chipGold}>
                  <Text style={styles.chipGoldText}>★ {(anime.rating / 10).toFixed(1)}</Text>
                </View>
              )}
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {anime.format?.replace(/_/g, ' ') || 'Unknown'}
                </Text>
              </View>
              <View style={[styles.chip, { borderColor: statusColor }]}>
                <Text style={[styles.chipText, { color: statusColor }]}>
                  {anime.status}
                </Text>
              </View>
              {anime.seasonYear && (
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{anime.seasonYear}</Text>
                </View>
              )}
            </View>

            <Text style={styles.episodes}>
              {episodes.length} Episodes
            </Text>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.watchBtn, episodes.length === 0 && styles.watchBtnDisabled]}
                onPress={handleWatchFirst}
                activeOpacity={0.8}
                disabled={episodes.length === 0}
              >
                <Text style={styles.watchBtnText}>▶  Watch Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synopsis</Text>
          <TouchableOpacity onPress={() => setExpandDesc((e) => !e)}>
            <Text style={styles.desc} numberOfLines={expandDesc ? undefined : 4}>
              {cleanDesc}
            </Text>
            <Text style={styles.readMore}>
              {expandDesc ? 'Show less ▲' : 'Read more ▼'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Genres */}
        {anime.genres?.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreRow}
          >
            {anime.genres.map((g) => (
              <View key={g} style={styles.genreChip}>
                <Text style={styles.genreText}>{g}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Studios + Info */}
        <View style={styles.infoRow}>
          {anime.studios?.[0] && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Studio</Text>
              <Text style={styles.infoValue}>{anime.studios[0].name}</Text>
            </View>
          )}
          {anime.season && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Season</Text>
              <Text style={styles.infoValue}>
                {anime.season} {anime.seasonYear}
              </Text>
            </View>
          )}
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Source</Text>
            <Text style={styles.infoValue}>{anime.scrapeSource || '—'}</Text>
          </View>
        </View>

        {/* Episodes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Episodes{' '}
            <Text style={{ color: Colors.accent }}>({episodes.length})</Text>
          </Text>

          {isScraping && episodes.length === 0 && (
            <View style={styles.scrapingBadge}>
              <ActivityIndicator size="small" color={Colors.accent} />
              <Text style={styles.scrapingText}>Discovering episodes...</Text>
            </View>
          )}

          {episodes.length > 0
            ? episodes.map((ep) => (
                <EpisodeCard
                  key={ep._id}
                  episode={ep}
                  fallbackImage={bgImage}
                  onPress={handleEpisodeSelect}
                />
              ))
            : !isScraping && (
                <Text style={styles.noEpisodes}>No episodes available yet.</Text>
              )}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  loadingCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  // ── Hero ──
  hero: {
    width: SCREEN_W,
    height: HERO_H,
    position: 'absolute',
    top: 0,
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
  },
  heroTop: {
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(5,7,10,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Scroll ──
  scroll: {
    flex: 1,
    marginTop: HERO_H - 50,
  },
  scrollContent: {
    paddingTop: 0,
  },
  topInfo: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    alignItems: 'flex-end',
  },
  poster: {
    width: 100,
    height: 145,
    borderRadius: Radius.md,
    marginTop: -50,
  },
  meta: {
    flex: 1,
    gap: Spacing.xs + 2,
    paddingTop: Spacing.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipGold: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,202,40,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,202,40,0.4)',
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
  episodes: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  watchBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 3,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  watchBtnDisabled: {
    opacity: 0.4,
  },
  watchBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#000',
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  desc: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  readMore: {
    fontSize: Typography.sm,
    color: Colors.accent,
    marginTop: Spacing.xs,
    fontWeight: Typography.semibold,
  },
  genreRow: {
    paddingHorizontal: Spacing.md,
    gap: 6,
    marginTop: 12,
  },
  genreChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 5,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genreText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    marginTop: 16,
    gap: Spacing.md,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  infoValue: {
    fontSize: Typography.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.semibold,
  },
  scrapingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,202,40,0.08)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,202,40,0.2)',
    marginBottom: Spacing.sm,
  },
  scrapingText: {
    fontSize: Typography.sm,
    color: Colors.accent,
    fontWeight: Typography.semibold,
  },
  noEpisodes: {
    fontSize: Typography.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
  retryText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: '#000',
  },
});
