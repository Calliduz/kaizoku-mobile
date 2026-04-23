import client from './client';

/**
 * Kaizoku API endpoints — mirrors kaizoku-client/src/api/animeApi.ts exactly.
 */

export async function fetchAllAnime(params: Record<string, any> = {}): Promise<any> {
  return client.get('/anime', { params });
}

export async function fetchAnimeById(id: string): Promise<any> {
  return client.get(`/anime/${id}`);
}

export async function fetchEpisodes(animeId: string): Promise<any> {
  return client.get(`/anime/${animeId}/episodes`);
}

export async function fetchEpisodeById(id: string): Promise<any> {
  return client.get(`/episodes/${id}`);
}

export async function fetchEpisodeSources(
  episodeId: string,
  refresh = false,
): Promise<any> {
  return client.get(`/episodes/${episodeId}/sources`, { params: { refresh } });
}

export async function triggerScrape(
  query: string,
  fetchEpisodes = false,
): Promise<any> {
  return client.post('/scrape', { query, fetchEpisodes });
}

export async function fetchSuggestions(query: string): Promise<any> {
  return client.get('/anime/search/suggest', { params: { query } });
}

export async function fetchAnimeLogo(id: string): Promise<any> {
  return client.get(`/anime/${id}/logo`);
}

export async function fetchTop100(): Promise<any> {
  return client.get('/anime/top-100');
}

export async function fetchAiringSchedule(): Promise<any> {
  return client.get('/anime/airing-schedule');
}
