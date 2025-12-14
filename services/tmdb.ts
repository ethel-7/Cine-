import { ApiResponse, Movie, MovieDetail } from '../types';

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Helper to get configuration
export const getApiKey = (): string | null => {
  return localStorage.getItem('tmdb_api_key');
};

export const setApiKey = (key: string) => {
  localStorage.setItem('tmdb_api_key', key);
};

export const hasApiKey = (): boolean => {
  return !!getApiKey();
};

const fetchFromApi = async <T>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key missing');
  }

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`);
  
  if (!response.ok) {
    if (response.status === 401) throw new Error('Invalid API Key');
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const tmdb = {
  getTrending: async (timeWindow: 'day' | 'week' = 'day'): Promise<ApiResponse<Movie>> => {
    return fetchFromApi<ApiResponse<Movie>>(`/trending/movie/${timeWindow}`);
  },

  getPopular: async (page = 1): Promise<ApiResponse<Movie>> => {
    return fetchFromApi<ApiResponse<Movie>>('/movie/popular', { page: page.toString() });
  },

  getTopRated: async (page = 1): Promise<ApiResponse<Movie>> => {
    return fetchFromApi<ApiResponse<Movie>>('/movie/top_rated', { page: page.toString() });
  },

  getUpcoming: async (page = 1): Promise<ApiResponse<Movie>> => {
    return fetchFromApi<ApiResponse<Movie>>('/movie/upcoming', { page: page.toString() });
  },

  searchMovies: async (query: string, page = 1): Promise<ApiResponse<Movie>> => {
    return fetchFromApi<ApiResponse<Movie>>('/search/movie', { query, page: page.toString() });
  },

  getMovieDetails: async (movieId: number): Promise<MovieDetail> => {
    return fetchFromApi<MovieDetail>(`/movie/${movieId}`, {
      append_to_response: 'videos,credits,similar',
    });
  },

  getImageUrl: (path: string | null, size: 'w500' | 'original' = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }
};
