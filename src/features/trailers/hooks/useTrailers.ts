// ============================================================================
// TRAILER HOOKS - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import React, { useCallback, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import trailerService, { TrailerService } from '../services/trailerService';
import { 
  TrailerListResponse, 
  TrailerListParams, 
  TrailerItem,
  TrailerEpisode,
  TrailerError,
  TrailerProcessingResult
} from '../types';

// ============================================================================
// 🎯 TRAILER QUERY KEYS
// ============================================================================

export const TRAILER_QUERY_KEYS = {
  TRAILER_LIST: 'trailer_list',
  TRAILER_DETAILS: 'trailer_details',
  TRAILER_SEARCH: 'trailer_search',
  TRAILER_GENRE: 'trailer_genre',
} as const;

// ============================================================================
// 📺 TRAILER LIST HOOKS
// ============================================================================

/**
 * Hook to fetch trailer list with pagination and filters
 */
export const useTrailerList = (params: { adult?: boolean; page?: number } = {}) => {
  console.log('🎬 useTrailerList - Called with params:', params);
  
  const query = useQuery({
    queryKey: [TRAILER_QUERY_KEYS.TRAILER_LIST, params],
    queryFn: () => trailerService.getTrailerList(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  console.log('🎬 useTrailerList - Query result:', {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError
  });
  
  return query;
};

/**
 * Hook to search trailers
 */
export const useTrailerSearch = (query: string, params: { adult?: boolean; page?: number } = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.TRAILER_SEARCH, query, params],
    queryFn: () => trailerService.searchTrailers(query, params),
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get trailers by genre
 */
export const useTrailersByGenre = (genre: string, params: { adult?: boolean; page?: number } = {}) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.TRAILER_GENRE, genre, params],
    queryFn: () => trailerService.getTrailersByGenre(genre, params),
    enabled: !!genre,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

/**
 * Hook to get trailer details
 */
export const useTrailerDetails = (trailerId?: string) => {
  return useQuery({
    queryKey: [TRAILER_QUERY_KEYS.TRAILER_DETAILS, trailerId],
    queryFn: () => trailerService.getTrailerDetails(trailerId!),
    enabled: !!trailerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ============================================================================
// 📊 TRAILER ANALYTICS HOOKS
// ============================================================================

/**
 * Hook to track trailer view
 */
export const useTrackTrailerView = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trailerId, data }: { 
      trailerId: string; 
      data: { duration: number; quality: string; userId?: string; }
    }) => trailerService.trackTrailerView(trailerId, data),
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: [TRAILER_QUERY_KEYS.TRAILER_LIST] });
    },
  });
};

/**
 * Hook to track trailer interaction
 */
export const useTrackTrailerInteraction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ trailerId, action, userId }: { 
      trailerId: string; 
      action: 'like' | 'share' | 'watch_now' | 'skip';
      userId?: string;
    }) => trailerService.trackTrailerInteraction(trailerId, action, userId),
    onSuccess: () => {
      // Invalidate related queries if needed
      queryClient.invalidateQueries({ queryKey: [TRAILER_QUERY_KEYS.TRAILER_LIST] });
    },
  });
};

// ============================================================================
// 🔧 TRAILER UTILITY HOOKS
// ============================================================================

/**
 * Hook to process trailer data for player
 */
export const useTrailerProcessor = () => {
  const processTrailerData = useCallback((trailerData: TrailerListResponse): TrailerProcessingResult => {
    // Fix: Use correct property name for trailer list
    const trailerItems = trailerData?.data;
    
    if (!trailerItems || !Array.isArray(trailerItems) || trailerItems.length === 0) {
      return {
        processed: [],
        total: 0,
        hdCount: 0,
        sdCount: 0,
      };
    }

    let hdCount = 0;
    let sdCount = 0;

    const processed = trailerItems
      .map((item: TrailerItem, index: number) => {
        // Extract video URL from the complex trailerUrl structure - Prioritize HD
        let videoUrl = '';
        let videoUrls: any = {};
        
        // Get all available video URLs
        if (item.trailerUrl?.media?.video_urls) {
          videoUrls = item.trailerUrl.media.video_urls;
        }
        
        // Prioritize HD qualities in order: 1080p > 720p > master > 480p > 360p
        if (videoUrls['1080p']) {
          videoUrl = videoUrls['1080p'];
          hdCount++;
        } else if (videoUrls['720p']) {
          videoUrl = videoUrls['720p'];
          hdCount++;
        } else if (videoUrls.master) {
          videoUrl = videoUrls.master;
          sdCount++;
        } else if (videoUrls['480p']) {
          videoUrl = videoUrls['480p'];
          sdCount++;
        } else if (videoUrls['360p']) {
          videoUrl = videoUrls['360p'];
          sdCount++;
        } else if (item.trailerUrl?.video) {
          videoUrl = item.trailerUrl.video;
          sdCount++;
        }

        // Extract thumbnail
        let thumbnail = '';
        if (item.trailerUrl?.media?.thumbnail) {
          thumbnail = item.trailerUrl.media.thumbnail;
        } else if (item.backdropImage) {
          thumbnail = item.backdropImage;
        }

        // Only include items with valid video URLs
        if (!videoUrl) {
          return null;
        }
        
        // Log HD trailer detection
        const isHD = videoUrl.includes('1080p') || videoUrl.includes('720p');
        if (isHD) {
          console.log('🎬 HD Trailer detected:', {
            title: item.title,
            quality: videoUrl.includes('1080p') ? '1080p' : '720p',
            url: videoUrl
          });
        }

        // Convert to episode format for player
        return {
          _id: item._id || `trailer-${index}`,
          title: item.title || 'Untitled',
          description: item.description || '',
          video_urls: {
            master: videoUrl,
            '1080p': videoUrls['1080p'] || videoUrl,
            '720p': videoUrls['720p'] || videoUrl,
            '480p': videoUrls['480p'] || videoUrl,
            '360p': videoUrls['360p'] || videoUrl,
          },
          video_url: videoUrl,
          thumbnail: thumbnail,
          backdropImage: item.backdropImage,
          // Additional fields for UI
          likes: item.favourites || 0,
          author: item.targetAudience?.name || 'Unknown',
          duration: 15,
          views: '1K',
          genres: item.genres || [],
          releasingDate: item.releasingDate,
          targetAudience: item.targetAudience,
          trailerUrl: item.trailerUrl,
          contentId: item.contentId,
        } as TrailerEpisode;
      })
      .filter(Boolean) as TrailerEpisode[];

    return {
      processed,
      total: processed.length,
      hdCount,
      sdCount,
    };
  }, []);

  return { processTrailerData };
};

/**
 * Hook to get trailer quality options
 */
export const useTrailerQuality = (trailer: TrailerEpisode) => {
  const qualityOptions = useMemo(() => {
    const options = [];
    
    if (trailer.video_urls['1080p']) {
      options.push({ label: '1080p', value: '1080p', url: trailer.video_urls['1080p'] });
    }
    if (trailer.video_urls['720p']) {
      options.push({ label: '720p', value: '720p', url: trailer.video_urls['720p'] });
    }
    if (trailer.video_urls.master) {
      options.push({ label: 'Master', value: 'master', url: trailer.video_urls.master });
    }
    if (trailer.video_urls['480p']) {
      options.push({ label: '480p', value: '480p', url: trailer.video_urls['480p'] });
    }
    if (trailer.video_urls['360p']) {
      options.push({ label: '360p', value: '360p', url: trailer.video_urls['360p'] });
    }
    
    return options;
  }, [trailer]);

  return qualityOptions;
};

/**
 * Hook to get best quality URL for trailer
 */
export const useBestTrailerQuality = (trailer: TrailerEpisode) => {
  const bestQualityUrl = useMemo(() => {
    // Prioritize HD qualities
    if (trailer.video_urls['1080p']) {
      return trailer.video_urls['1080p'];
    }
    if (trailer.video_urls['720p']) {
      return trailer.video_urls['720p'];
    }
    if (trailer.video_urls.master) {
      return trailer.video_urls.master;
    }
    if (trailer.video_urls['480p']) {
      return trailer.video_urls['480p'];
    }
    if (trailer.video_urls['360p']) {
      return trailer.video_urls['360p'];
    }
    
    return trailer.video_url;
  }, [trailer]);

  return bestQualityUrl;
};

// ============================================================================
// 🎯 TRAILER STATE MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook to manage trailer player state
 */
export const useTrailerPlayerState = () => {
  const [state, setState] = useState({
    playPause: true,
    currentIndex: 0,
    controller: true,
    duration: 0,
    progress: 0,
    loading: false,
  });

  const updateState = useCallback((updater: any) => {
    setState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      return { ...prevState, ...newState };
    });
  }, []);

  return { state, updateState };
};

/**
 * Hook to manage trailer list state
 */
export const useTrailerListState = () => {
  const [state, setState] = useState({
    trailers: [] as TrailerEpisode[],
    currentTrailer: null as TrailerEpisode | null,
    loading: false,
    error: null as TrailerError | null,
    hasNext: false,
    page: 1,
  });

  const updateState = useCallback((updater: any) => {
    setState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      return { ...prevState, ...newState };
    });
  }, []);

  return { state, updateState };
}; 