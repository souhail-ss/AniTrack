import axios from 'axios';
import { Anime, JikanResponse } from '../types/anime';

const client = axios.create({
  baseURL: 'https://api.jikan.moe/v4',
  timeout: 15000,
});

// Queue-based rate limiter: max ~2.5 req/sec (400ms gap)
let requestChain: Promise<void> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  requestChain = requestChain.then(async () => {
    try {
      const result = await fn();
      resolve(result);
    } catch (e) {
      reject(e);
    }
    await new Promise<void>((r) => setTimeout(r, 400));
  });

  return promise;
}

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return enqueue(async () => {
    const { data } = await client.get<T>(path, { params });
    return data;
  });
}

export const jikanApi = {
  getTrending: () =>
    get<JikanResponse<Anime[]>>('/top/anime', { filter: 'airing', limit: 15 }),

  getThisSeason: () =>
    get<JikanResponse<Anime[]>>('/seasons/now', { limit: 20 }),

  getMostPopular: () =>
    get<JikanResponse<Anime[]>>('/top/anime', { filter: 'bypopularity', limit: 20 }),

  getCurrentlyAiring: () =>
    get<JikanResponse<Anime[]>>('/top/anime', { filter: 'airing', limit: 25 }),

  getAnimeDetail: (id: number) =>
    get<JikanResponse<Anime>>(`/anime/${id}/full`),

  searchAnime: (query: string) =>
    get<JikanResponse<Anime[]>>('/anime', { q: query, limit: 6, sfw: true }),
};
