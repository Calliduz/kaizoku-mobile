import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchAnimeById,
  fetchEpisodes,
  fetchEpisodeSources,
  fetchEpisodeById,
} from '@/api/animeApi';
import KaizokuPlayer from '@/components/KaizokuPlayer';
import ServerSelector from '@/components/ServerSelector';
import EpisodeCard from '@/components/EpisodeCard';
import { EpisodeCardSkeleton } from '@/components/SkeletonLoader';
import { useHistoryStore } from '@/store/useHistoryStore';
import type { Anime, Episode, StreamingSource } from '@/types';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

const LOADING_MESSAGES = [
  'Initializing playback engine...',
  'Bypassing Cloudflare filters...',
  'Hunting for high-quality mirrors...',
  'Optimizing stream buffer...',
  'Almost ready for departure...',
];

export default function PlayerScreen() {
  const { id, episodeId } = useLocalSearchParams<{ id: string; episodeId: string }>();
  const router = useRouter();
  const { addToHistory, updateProgress } = useHistoryStore();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [sources, setSources] = useState<StreamingSource[]>([]);
  const [currentSource, setCurrentSource] = useState<StreamingSource | null>(null);

  const [loadingData, setLoadingData] = useState(true);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ── Load anime + episodes ────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoadingData(true);
        const [animeRes, epsRes] = await Promise.all([
          fetchAnimeById(id),
          fetchEpisodes(id),
        ]);
        setAnime(animeRes.data);
        const eps: Episode[] = epsRes.data || [];
        setEpisodes(eps);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingData(false);
      }
    })();
  }, [id]);

  // ── Set current episode ──────────────────────────────────
  useEffect(() => {
    if (episodes.length === 0 || !episodeId) return;
    if (episodeId === 'first') {
      const sorted = [...episodes].sort((a, b) => a.number - b.number);
      setCurrentEpisode(sorted[0]);
    } else {
      const found = episodes.find((e) => e._id === episodeId);
      if (found) setCurrentEpisode(found);
    }
  }, [episodes, episodeId]);

  // ── Load sources when episode changes ───────────────────
  useEffect(() => {
    if (!currentEpisode) return;
    let mounted = true;
    (async () => {
      setLoadingSources(true);
      try {
        const res = await fetchEpisodeSources(currentEpisode._id);
        if (mounted) {
          const valid = (res.data || []).filter((s: StreamingSource) => s?.url);
          setSources(valid);
          setCurrentSource(valid[0] || null);
        }
      } catch (e) {
        console.error('[Player] Source fetch failed:', e);
      } finally {
        if (mounted) setLoadingSources(false);
      }
    })();
    return () => { mounted = false; };
  }, [currentEpisode?._id]);

  // ── Loading message rotator ─────────────────────────────
  useEffect(() => {
    if (!loadingSources) { setLoadingMsgIdx(0); return; }
    const t = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(t);
  }, [loadingSources]);

  // ── Save to watch history ───────────────────────────────
  useEffect(() => {
    if (anime && currentEpisode) {
      addToHistory(anime, currentEpisode, 0, 0);
    }
  }, [anime?._id, currentEpisode?._id]);

  const handleProgress = useCallback(
    (progressMs: number, progressPercentage: number) => {
      if (anime) {
        updateProgress(anime._id, progressMs, progressPercentage);
      }
    },
    [anime?._id],
  );

  const handleRefreshSources = useCallback(async () => {
    if (!currentEpisode) return;
    setLoadingSources(true);
    try {
      const res = await fetchEpisodeSources(currentEpisode._id, true);
      const valid = (res.data || []).filter((s: StreamingSource) => s?.url);
      setSources(valid);
      setCurrentSource(valid[0] || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSources(false);
    }
  }, [currentEpisode?._id]);

  const handleNextEpisode = useCallback(() => {
    if (!currentEpisode || !anime) return;
    const sorted = [...episodes].sort((a, b) => a.number - b.number);
    const idx = sorted.findIndex((e) => e._id === currentEpisode._id);
    if (idx >= 0 && idx < sorted.length - 1) {
      router.replace(`/player/${anime._id}/${sorted[idx + 1]._id}` as any);
    }
  }, [episodes, currentEpisode, anime]);

  const handleEpisodeSelect = (ep: Episode) => {
    if (!anime) return;
    router.replace(`/player/${anime._id}/${ep._id}` as any);
  };

  // ── Loading state ───────────────────────────────────────
  if (loadingData) {
    return (
      <View style={styles.root}>
        <View style={styles.playerPlaceholder}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </View>
    );
  }

  if (error || !anime) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Anime not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {/* ── Video Player ─────────────────────────────── */}
      {loadingSources ? (
        <View style={styles.playerPlaceholder}>
          {/* Backdrop */}
          <Image
            source={{ uri: anime.bannerImage || anime.coverImage }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <View style={styles.playerLoadingOverlay}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingMsg}>
              {LOADING_MESSAGES[loadingMsgIdx]}
            </Text>
            <TouchableOpacity onPress={handleRefreshSources} style={styles.refreshPill}>
              <Text style={styles.refreshPillText}>Taking too long? Force Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : currentSource ? (
        <KaizokuPlayer
          source={currentSource}
          title={`${anime.title} • Ep ${currentEpisode?.number ?? ''}`}
          onProgress={handleProgress}
          onEnd={handleNextEpisode}
        />
      ) : (
        <View style={styles.playerPlaceholder}>
          <View style={styles.playerLoadingOverlay}>
            <Text style={styles.noSourceIcon}>📭</Text>
            <Text style={styles.noSourceText}>No streaming sources found</Text>
            <TouchableOpacity onPress={handleRefreshSources} style={styles.retryBtn}>
              <Text style={styles.retryText}>🔄 Force Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Below Player ─────────────────────────────── */}
      <SafeAreaView style={styles.belowPlayer} edges={['bottom']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Back + Server Selector bar */}
          <View style={styles.controlBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.serverRow}>
              {sources.length > 0 && (
                <ServerSelector
                  sources={sources}
                  currentSource={currentSource}
                  onSelect={setCurrentSource}
                />
              )}
              <TouchableOpacity onPress={handleRefreshSources} style={styles.refreshBtn}>
                <Ionicons name="refresh" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Episode info */}
          <View style={styles.episodeInfo}>
            <View style={styles.coverMeta}>
              <Image
                source={{ uri: anime.coverImage }}
                style={[styles.miniCover, { borderRadius: Radius.sm }]}
                contentFit="cover"
              />
              <View style={styles.metaText}>
                {anime.logo ? (
                  <Image
                    source={{ uri: anime.logo }}
                    style={styles.logo}
                    contentFit="contain"
                  />
                ) : (
                  <Text style={styles.animeTitle} numberOfLines={1}>
                    {anime.title}
                  </Text>
                )}
                <Text style={styles.epBadge}>
                  {currentEpisode?.seasonNumber
                    ? `Season ${currentEpisode.seasonNumber} · `
                    : ''}
                  Episode {currentEpisode?.number ?? '—'}
                </Text>
                {currentEpisode?.title && (
                  <Text style={styles.epTitle} numberOfLines={1}>
                    {currentEpisode.title}
                  </Text>
                )}
              </View>
            </View>
            {currentEpisode?.description && (
              <Text style={styles.epDesc} numberOfLines={3}>
                {currentEpisode.description}
              </Text>
            )}
          </View>

          {/* Episode List */}
          <View style={styles.episodeListSection}>
            <Text style={styles.sectionTitle}>
              Episodes <Text style={{ color: Colors.accent }}>({episodes.length})</Text>
            </Text>
            {episodes.map((ep) => (
              <EpisodeCard
                key={ep._id}
                episode={ep}
                isActive={ep._id === currentEpisode?._id}
                fallbackImage={anime.bannerImage || anime.coverImage}
                onPress={handleEpisodeSelect}
                variant="compact"
              />
            ))}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  playerPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  playerLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  loadingMsg: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  refreshPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
  },
  refreshPillText: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
  },
  noSourceIcon: { fontSize: 40 },
  noSourceText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 3,
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  retryText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: '#000',
  },
  belowPlayer: {
    flex: 1,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  refreshBtn: {
    padding: Spacing.xs + 2,
  },
  episodeInfo: {
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coverMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  miniCover: {
    width: 52,
    height: 72,
    borderRadius: Radius.sm,
  },
  metaText: {
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  logo: {
    height: 30,
    width: '70%',
  },
  animeTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  epBadge: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  epTitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  epDesc: {
    fontSize: Typography.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  episodeListSection: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
