// ============================================================================
// 🎬 TRAILER HOOKS - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================
// 
// This file contains all React hooks for the trailer feature.
// All hooks are designed to be self-contained and portable.
// 
// Usage:
// import { useTrailerList, useTrailerDetails } from './hooks/useTrailers';
// const { data, loading, error } = useTrailerList();
// ============================================================================

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import trailerService from '../services/trailerService';
import { 
  TrailerListParams, 
  TrailerItem, 
  TrailerListResponse,
  TrailerEpisode,
  TrailerVideoQuality,
  TrailerError,
  TrailerViewEvent,
  TrailerInteractionEvent,
} from '../types';

// ============================================================================
// 🎯 QUERY KEYS
// ============================================================================

/**
 * Query keys for trailer-related queries
 */
export const TRAILER_QUERY_KEYS = {
  trailers: 'trailers',
  trailerDetails: 'trailer-details',
  search: 'trailer-search',
  genres: 'trailer-genres',
  trending: 'trailer-trending',
  latest: 'trailer-latest',
  recommendations: 'trailer-recommendations',
} as const;

// ============================================================================
// 🎬 CORE TRAILER HOOKS
// ============================================================================

/**
 * Hook to fetch trailer list
 * @param params - Query parameters
 * @returns Query result with trailer list
 */
export const useTrailerList = (params: TrailerListParams = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.trailers, params],
    queryFn: () => trailerService.getTrailerList(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch trailer details
 * @param trailerId - Trailer ID
 * @returns Query result with trailer details
 */
export const useTrailerDetails = (trailerId: string) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.trailerDetails, trailerId],
    queryFn: () => trailerService.getTrailerDetails(trailerId),
    enabled: !!trailerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook to search trailers
 * @param query - Search query
 * @param params - Additional parameters
 * @returns Query result with search results
 */
export const useTrailerSearch = (query: string, params: TrailerListParams = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.search, query, params],
    queryFn: () => trailerService.searchTrailers(query, params),
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch trailers by genre
 * @param genre - Genre name
 * @param params - Additional parameters
 * @returns Query result with genre-specific trailers
 */
export const useTrailersByGenre = (genre: string, params: TrailerListParams = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.genres, genre, params],
    queryFn: () => trailerService.getTrailersByGenre(genre, params),
    enabled: !!genre,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch trending trailers
 * @param params - Query parameters
 * @returns Query result with trending trailers
 */
export const useTrendingTrailers = (params: TrailerListParams = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.trending, params],
    queryFn: () => trailerService.getTrendingTrailers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch latest trailers
 * @param params - Query parameters
 * @returns Query result with latest trailers
 */
export const useLatestTrailers = (params: TrailerListParams = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.latest, params],
    queryFn: () => trailerService.getLatestTrailers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Hook to fetch trailer recommendations
 * @param trailerId - Base trailer ID
 * @param params - Additional parameters
 * @returns Query result with recommended trailers
 */
export const useTrailerRecommendations = (trailerId: string, params: TrailerListParams = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.recommendations, trailerId, params],
    queryFn: () => trailerService.getTrailerRecommendations(trailerId, params),
    enabled: !!trailerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

// ============================================================================
// 🎯 ANALYTICS AND TRACKING HOOKS
// ============================================================================

/**
 * Hook to track trailer view
 * @returns Mutation for tracking trailer view
 */
export const useTrackTrailerView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (analytics: TrailerViewEvent) => 
      trailerService.trackTrailerView({
        trailerId: analytics.trailerId,
        duration: analytics.duration,
        quality: analytics.quality,
        timestamp: Date.now(),
      }),
    onSuccess: (data, variables) => {
      console.log('🎬 Trailer view tracked successfully:', {
        trailerId: variables.trailerId,
        duration: variables.duration,
      });
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [TRAILER_QUERY_KEYS.trailerDetails, variables.trailerId],
      });
    },
    onError: (error, variables) => {
      console.error('🎬 Failed to track trailer view:', {
        trailerId: variables.trailerId,
        error,
      });
    },
  });
};

/**
 * Hook to track trailer interaction
 * @returns Mutation for tracking trailer interaction
 */
export const useTrackTrailerInteraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (analytics: TrailerInteractionEvent) => 
      trailerService.trackTrailerInteraction({
        trailerId: analytics.trailerId,
        action: analytics.action,
        timestamp: Date.now(),
      }),
    onSuccess: (data, variables) => {
      console.log('🎬 Trailer interaction tracked successfully:', {
        trailerId: variables.trailerId,
        action: variables.action,
      });
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({
        queryKey: [TRAILER_QUERY_KEYS.trailerDetails, variables.trailerId],
      });
    },
    onError: (error, variables) => {
      console.error('🎬 Failed to track trailer interaction:', {
        trailerId: variables.trailerId,
        action: variables.action,
        error,
      });
    },
  });
};

// ============================================================================
// 🎯 UTILITY AND PROCESSING HOOKS
// ============================================================================

/**
 * Hook to process trailer data
 * @param trailerData - Raw trailer data
 * @returns Processed trailer data
 */
export const useTrailerProcessor = (trailerData: any) => {
  const processTrailerData = (data: any): TrailerEpisode[] => {
    if (!data?.data?.trailers) {
      console.warn('🎬 No trailer data found in response');
      return [];
    }

    return data.data.trailers.map((trailer: any) => ({
      _id: trailer._id,
      title: trailer.title,
      description: trailer.description || '',
      video_urls: trailer.trailerUrl?.media?.video_urls || {},
      video_url: trailer.trailerUrl?.video || trailer.trailerUrl?.media?.video_urls?.master || '',
      thumbnail: trailer.trailerUrl?.media?.thumbnail || trailer.posterImage || '',
      backdropImage: trailer.backdropImage || trailer.trailerUrl?.media?.backdropImage || '',
      likes: trailer.favourites || 0,
      author: trailer.author || 'Unknown',
      duration: trailer.duration || 0,
      views: trailer.views || '0',
      genres: trailer.genres || [],
      releasingDate: trailer.releasingDate,
      targetAudience: trailer.targetAudience,
      trailerUrl: trailer.trailerUrl,
      contentId: trailer.contentId,
      isLiked: trailer.isLiked || false,
    }));
  };

  return {
    processedTrailers: processTrailerData(trailerData),
    totalCount: trailerData?.data?.total || 0,
    hasMore: trailerData?.data?.hasNext || false,
  };
};

/**
 * Hook to get video quality options
 * @param videoUrls - Video URLs object
 * @returns Available quality options
 */
export const useTrailerQuality = (videoUrls: any) => {
  const getQualityOptions = (): TrailerVideoQuality[] => {
    const qualities: TrailerVideoQuality[] = ['auto'];
    
    if (videoUrls?.['1080p']) qualities.push('1080p');
    if (videoUrls?.['720p']) qualities.push('720p');
    if (videoUrls?.['480p']) qualities.push('480p');
    if (videoUrls?.['360p']) qualities.push('360p');
    
    return qualities;
  };

  const getBestQuality = (): TrailerVideoQuality => {
    if (videoUrls?.['1080p']) return '1080p';
    if (videoUrls?.['720p']) return '720p';
    if (videoUrls?.['480p']) return '480p';
    if (videoUrls?.['360p']) return '360p';
    return 'auto';
  };

  return {
    qualityOptions: getQualityOptions(),
    bestQuality: getBestQuality(),
    hasHDQuality: !!(videoUrls?.['1080p'] || videoUrls?.['720p']),
    hasSDQuality: !!(videoUrls?.['480p'] || videoUrls?.['360p']),
  };
};

/**
 * Hook to get best video quality
 * @param videoUrls - Video URLs object
 * @returns Best available quality
 */
export const useBestTrailerQuality = (videoUrls: any) => {
  const { bestQuality } = useTrailerQuality(videoUrls);
  return bestQuality;
};

// ============================================================================
// 🎯 STATE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook to manage trailer player state
 * @param initialState - Initial player state
 * @returns Player state and actions
 */
export const useTrailerPlayerState = (initialState = {
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  quality: 'auto' as TrailerVideoQuality,
  showControls: false,
  isLoading: false,
  error: null as string | null,
}) => {
  const [state, setState] = React.useState(initialState);

  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const play = () => updateState({ isPlaying: true, isPaused: false });
  const pause = () => updateState({ isPlaying: false, isPaused: true });
  const stop = () => updateState({ 
    isPlaying: false, 
    isPaused: false, 
    currentTime: 0 
  });
  
  const seek = (time: number) => updateState({ currentTime: time });
  const setDuration = (duration: number) => updateState({ duration });
  const setQuality = (quality: TrailerVideoQuality) => updateState({ quality });
  const showControls = () => updateState({ showControls: true });
  const hideControls = () => updateState({ showControls: false });
  const setLoading = (isLoading: boolean) => updateState({ isLoading });
  const setError = (error: string | null) => updateState({ error });

  return {
    ...state,
    actions: {
      play,
      pause,
      stop,
      seek,
      setDuration,
      setQuality,
      showControls,
      hideControls,
      setLoading,
      setError,
      updateState,
    },
  };
};

/**
 * Hook to manage trailer list state
 * @param initialState - Initial list state
 * @returns List state and actions
 */
export const useTrailerListState = (initialState = {
  trailers: [] as TrailerEpisode[],
  loading: false,
  refreshing: false,
  error: null as string | null,
  currentIndex: 0,
  hasMore: false,
}) => {
  const [state, setState] = React.useState(initialState);

  const updateState = (updates: Partial<typeof state>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setTrailers = (trailers: TrailerEpisode[]) => updateState({ trailers });
  const addTrailers = (newTrailers: TrailerEpisode[]) => 
    updateState({ trailers: [...state.trailers, ...newTrailers] });
  const setLoading = (loading: boolean) => updateState({ loading });
  const setRefreshing = (refreshing: boolean) => updateState({ refreshing });
  const setError = (error: string | null) => updateState({ error });
  const setCurrentIndex = (index: number) => updateState({ currentIndex: index });
  const setHasMore = (hasMore: boolean) => updateState({ hasMore });

  return {
    ...state,
    actions: {
      setTrailers,
      addTrailers,
      setLoading,
      setRefreshing,
      setError,
      setCurrentIndex,
      setHasMore,
      updateState,
    },
  };
};

// ============================================================================
// 🎬 TRAILER HOOKS EXPORTS
// ============================================================================

// All hooks are automatically exported as they are defined
// This ensures easy access and developer-friendly imports 