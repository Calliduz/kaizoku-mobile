// ─── Kaizoku Mobile Types ────────────────────────────────
// Ported 1:1 from kaizoku-client/src/types/index.ts

export interface Studio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
}

export interface Recommendation {
  id: number;
  title: string;
  coverImage: string;
  averageScore: number;
}

export interface Relation {
  id: number;
  relationType: string;
  title: string;
  coverImage: string;
  status: string;
  format: string;
}

export interface VoiceActor {
  id: number;
  name: string;
  nameNative: string;
  image: string;
}

export interface Character {
  id: number;
  name: string;
  nameNative: string;
  image: string;
  role: 'MAIN' | 'SUPPORTING' | 'BACKGROUND';
  voiceActors: VoiceActor[];
}

export interface Anime {
  _id: string;
  title: string;
  altTitles: string[];
  slug: string;
  anilistId: number | null;
  coverImage: string;
  coverColor: string | null;
  bannerImage: string;
  fanartBackground?: string;
  logo?: string;
  trailer?: {
    id: string;
    site: string;
    thumbnail: string;
    url: string;
  } | null;
  description: string;
  genres: string[];
  tags: string[];
  status:
    | 'RELEASING'
    | 'FINISHED'
    | 'NOT_YET_RELEASED'
    | 'CANCELLED'
    | 'HIATUS'
    | 'UNKNOWN';
  format: string | null;
  totalEpisodes: number;
  latestEpisode?: number;
  episodeDuration: number | null;
  rating: number;
  meanScore: number;
  popularity: number;
  season: string | null;
  seasonYear: number | null;
  startDate: string | null;
  endDate: string | null;
  studios: Studio[];
  characters?: Character[];
  recommendations?: Recommendation[];
  relations?: Relation[];
  source?: string;
  sourceId?: string;
  scrapeSource?: string;
  metaEnriched?: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface Episode {
  _id: string;
  animeId: string;
  number: number;
  title: string;
  sourceEpisodeId: string;
  description?: string;
  seasonNumber?: number;
  thumbnail?: string;
  url: string;
  streamingSources?: StreamingSource[];
}

export interface Subtitle {
  url: string;
  lang: string;
  default?: boolean;
}

export interface StreamingSource {
  url: string;
  quality: string;
  server: string;
  type: 'hls' | 'mp4' | 'webm' | 'iframe' | 'embed';
  audio?: 'sub' | 'dub';
  subtitles?: Subtitle[];
  headers?: Record<string, string>;
  referer?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AnimeListResponse {
  success: boolean;
  data: Anime[];
  pagination: Pagination;
}

export interface SingleAnimeResponse {
  success: boolean;
  data: Anime;
}

export interface EpisodeListResponse {
  success: boolean;
  data: Episode[];
  isScraping?: boolean;
}

export interface SourceResponse {
  success: boolean;
  data: StreamingSource[];
}

export interface HistoryItem {
  anime: Anime;
  episode: Episode;
  watchedAt: number;
  progressMs: number; // milliseconds — MMKV stores numbers better
  progressPercentage: number;
}
