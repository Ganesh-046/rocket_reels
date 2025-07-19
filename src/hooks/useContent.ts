import { useQuery } from '@tanstack/react-query';
import contentService from '../services/content.service';
import {
  ContentItem,
  ContentDetail,
  Season,
  VideoAccess,
  WatchHistory,
  Banner,
  Genre,
  SubGenre,
  Language,
  ContentListParams,
  PaginationParams,
} from '../types/api';

// Query Keys
export const CONTENT_QUERY_KEYS = {
  CONTENT_LIST: 'content_list',
  TRAILER_LIST: 'trailer_list',
  CONTENT_DETAILS: 'content_details',
  SEASON_CONTENT: 'season_content',
  VIDEO_ACCESS: 'video_access',
  WATCH_HISTORY: 'watch_history',
  LATEST_CONTENT: 'latest_content',
  TOP_CONTENT: 'top_content',
  UPCOMING_CONTENT: 'upcoming_content',
  CUSTOMIZED_LIST: 'customized_list',
  SPECIAL_INTEREST: 'special_interest',
  TARGET_AUDIENCE: 'target_audience',
  BANNER_DATA: 'banner_data',
  GENRES: 'genres',
  SUBGENRES: 'sub_genres',
  LANGUAGES: 'languages',
} as const;

// Content List Hooks
export const useContentList = (params: ContentListParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.CONTENT_LIST, params],
    queryFn: () => contentService.getContentList(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useTrailerList = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.TRAILER_LIST, params],
    queryFn: () => contentService.getTrailerList(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Content Details Hooks
export const useContentDetails = (id?: string, userId?: string, token?: string) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.CONTENT_DETAILS, id, userId, token],
    queryFn: () => contentService.getContentDetails(id!, userId, token),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useSeasonContent = (id?: string) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.SEASON_CONTENT, id],
    queryFn: () => contentService.getSeasonContent(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useVideoAccess = (episodeId?: string) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.VIDEO_ACCESS, episodeId],
    queryFn: () => contentService.getVideoAccess(episodeId!),
    enabled: !!episodeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useWatchHistory = (contentId?: string) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.WATCH_HISTORY, contentId],
    queryFn: () => contentService.getWatchHistory(contentId!),
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Content Discovery Hooks
export const useLatestContent = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.LATEST_CONTENT, params],
    queryFn: () => contentService.getLatestContent(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useTopContent = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.TOP_CONTENT, params],
    queryFn: () => contentService.getTopContent(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useUpcomingContent = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.UPCOMING_CONTENT, params],
    queryFn: () => contentService.getUpcomingContent(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useCustomizedList = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.CUSTOMIZED_LIST, params],
    queryFn: () => contentService.getCustomizedList(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

export const useSpecialInterestContent = () => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.SPECIAL_INTEREST],
    queryFn: () => contentService.getSpecialInterestContent(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useTargetAudienceContent = (params: PaginationParams = {}) => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.TARGET_AUDIENCE, params],
    queryFn: () => contentService.getTargetAudienceContent(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Static Content Hooks
export const useBannerData = () => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.BANNER_DATA],
    queryFn: () => contentService.getBannerData(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useGenres = () => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.GENRES],
    queryFn: () => contentService.getGenres(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useSubGenres = () => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.SUBGENRES],
    queryFn: () => contentService.getSubGenres(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useLanguages = () => {
  return useQuery({
    queryKey: [CONTENT_QUERY_KEYS.LANGUAGES],
    queryFn: () => contentService.getLanguages(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}; 