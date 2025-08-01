import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import userInteractionsService from '../services/user-interactions.service';
import {
  ContentItem,
  WatchHistory,
} from '../types/api';
import MMKVStorage from '../lib/mmkv';

// Query Keys
export const USER_INTERACTIONS_QUERY_KEYS = {
  WATCHLIST: 'watchlist',
  WATCHLIST_IDS: 'watchlist_ids',
  LIKED_CONTENT: 'liked_content',
  TRAILER_LIKES: 'trailer_likes',
  WATCH_HISTORY: 'watch_history',
} as const;

// Watchlist Hooks
export const useWatchlist = (userId?: string) => {
  return useQuery({
    queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCHLIST, userId],
    queryFn: () => userInteractionsService.getWatchlist(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useWatchlistIds = (userId?: string) => {
  return useQuery({
    queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCHLIST_IDS, userId],
    queryFn: () => userInteractionsService.getWatchlistIds(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, contentId }: { userId: string; contentId: string }) =>
      userInteractionsService.addToWatchlist(userId, contentId),
    onSuccess: (response, variables) => {
      if (response.status) {
        // Update local MMKV storage
        MMKVStorage.addToWatchlist(variables.contentId);
        
        // Invalidate and refetch watchlist queries
        queryClient.invalidateQueries({
          queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCHLIST, variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCHLIST_IDS, variables.userId],
        });
      }
    },
    onError: (error) => {
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, contentId }: { userId: string; contentId: string }) =>
      userInteractionsService.removeFromWatchlist(userId, contentId),
    onSuccess: (response, variables) => {
      if (response.status) {
        // Update local MMKV storage
        MMKVStorage.removeFromWatchlist(variables.contentId);
        
        // Invalidate and refetch watchlist queries
        queryClient.invalidateQueries({
          queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCHLIST, variables.userId],
        });
        queryClient.invalidateQueries({
          queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCHLIST_IDS, variables.userId],
        });
      }
    },
    onError: (error) => {
    },
  });
};

// Like/Dislike Hooks
export const useLikedContent = (userId?: string) => {
  return useQuery({
    queryKey: [USER_INTERACTIONS_QUERY_KEYS.LIKED_CONTENT, userId],
    queryFn: () => userInteractionsService.getLikedContent(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLikeDislikeContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, episodeId }: { userId: string; episodeId: string }) =>
      userInteractionsService.likeDislikeContent(userId, episodeId),
    onSuccess: (response, variables) => {
      if (response.status) {
        // Invalidate and refetch liked content
        queryClient.invalidateQueries({
          queryKey: [USER_INTERACTIONS_QUERY_KEYS.LIKED_CONTENT, variables.userId],
        });
      }
    },
    onError: (error) => {
    },
  });
};

export const useTrailerLikes = (userId?: string) => {
  return useQuery({
    queryKey: [USER_INTERACTIONS_QUERY_KEYS.TRAILER_LIKES, userId],
    queryFn: () => userInteractionsService.getTrailerLikes(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useLikeTrailer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, contentId }: { userId: string; contentId: string }) =>
      userInteractionsService.likeTrailer(userId, contentId),
    onSuccess: (response, variables) => {
      if (response.status) {
        // Invalidate and refetch trailer likes
        queryClient.invalidateQueries({
          queryKey: [USER_INTERACTIONS_QUERY_KEYS.TRAILER_LIKES, variables.userId],
        });
      }
    },
    onError: (error) => {
    },
  });
};

// Watch History Hooks
export const useWatchHistory = (contentId?: string) => {
  return useQuery({
    queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCH_HISTORY, contentId],
    queryFn: () => userInteractionsService.getWatchHistory(contentId!),
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAddWatchHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      contentId: string;
      episodeId?: string;
      duration: number;
      progress: number;
    }) => userInteractionsService.addWatchHistory(data),
    onSuccess: (response, variables) => {
      if (response.status) {
        // Update local MMKV storage
        MMKVStorage.updateWatchProgress(
          variables.contentId,
          variables.episodeId || variables.contentId,
          variables.progress
        );
        
        // Invalidate and refetch watch history
        queryClient.invalidateQueries({
          queryKey: [USER_INTERACTIONS_QUERY_KEYS.WATCH_HISTORY, variables.contentId],
        });
      }
    },
    onError: (error) => {
    },
  });
};

export const useUpdateViewCount = () => {
  return useMutation({
    mutationFn: (contentId: string) => userInteractionsService.updateViewCount(contentId),
    onError: (error) => {
    },
  });
}; 