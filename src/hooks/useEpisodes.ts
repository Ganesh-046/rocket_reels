import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import contentService from '../services/content.service';

interface Episode {
  _id: string;
  episodeNo: number;
  language: string;
  status: 'locked' | 'unlocked';
  contentId: string;
  video_urls: {
    '1080p': string;
    '720p': string;
    '480p': string;
    '360p': string;
    master: string;
  };
  thumbnail: string;
  like: number;
  isDeleted: boolean;
  isLiked: boolean | null;
}

interface ContentDetailResponse {
  _id: string;
  title: string;
  description: string;
  genres: Array<{ _id: string; name: string; slug: string }>;
  type: string;
  releasingDate: string;
  maturityRating: string;
  isFavourite: boolean | null;
  adsCount: number;
  favourites: number;
  coinsPerEpisode: number;
  languages: Array<{ label: string; value: string }>;
  episodes: {
    [language: string]: Episode[];
  };
}

interface UnlockedEpisode {
  episodeId: string;
  unlockType: string;
  unlockedAt: string;
}

export const useEpisodes = (contentId: string, userId?: string, token?: string) => {
  const queryClient = useQueryClient();

  console.log('🔗 useEpisodes Hook - Initialized:', {
    contentId,
    userId: userId ? 'Present' : 'Not provided',
    token: token ? 'Present' : 'Not provided'
  });

  // Get content details with episodes
  const {
    data: contentDetails,
    isLoading: contentLoading,
    error: contentError,
    refetch: refetchContent,
  } = useQuery({
    queryKey: ['content-details', contentId, userId],
    queryFn: async () => {
      console.log('📡 useEpisodes - Fetching content details:', { contentId, userId });
      try {
        const result = await contentService.getContentDetailsWithEpisodes(contentId, userId, token);
        console.log('✅ useEpisodes - Content details fetched successfully:', {
          contentId,
          hasData: !!result.data,
          episodesCount: result.data?.episodes ? Object.keys(result.data.episodes).length : 0,
          hasCookies: !!result.cookies
        });
        
        // 🔑 CRITICAL: Log cookies for video authentication
        if (result.cookies) {
          console.log('🍪 useEpisodes - Found cookies for video authentication:', result.cookies);
        }
        
        return result;
      } catch (error) {
        console.error('❌ useEpisodes - Error fetching content details:', {
          contentId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    },
    enabled: !!contentId,
  });

  // Get unlocked episodes
  const {
    data: unlockedEpisodes,
    isLoading: unlockedLoading,
    error: unlockedError,
    refetch: refetchUnlocked,
  } = useQuery({
    queryKey: ['unlocked-episodes', contentId],
    queryFn: () => contentService.getUnlockedEpisodes(contentId),
    enabled: !!contentId,
  });

  // Unlock episode with coins
  const unlockWithCoinsMutation = useMutation({
    mutationFn: (data: { episodeId: string; userId: string; coins: number }) =>
      contentService.unlockEpisodeWithCoins(data),
    onSuccess: () => {
      // Invalidate and refetch unlocked episodes
      queryClient.invalidateQueries({ queryKey: ['unlocked-episodes', contentId] });
    },
  });

  // Unlock episode with ads
  const unlockWithAdsMutation = useMutation({
    mutationFn: (data: { episodeId: string; userId: string; adType: string }) =>
      contentService.unlockEpisodeWithAds(data),
    onSuccess: () => {
      // Invalidate and refetch unlocked episodes
      queryClient.invalidateQueries({ queryKey: ['unlocked-episodes', contentId] });
    },
  });

  // Process episodes data
  const processEpisodesData = useCallback((contentData: any) => {
    console.log('🔄 useEpisodes - Processing episodes data:', {
      hasContentData: !!contentData,
      hasEpisodes: !!contentData?.episodes,
      episodesKeys: contentData?.episodes ? Object.keys(contentData.episodes) : []
    });

    if (!contentData?.episodes) {
      console.log('⚠️ useEpisodes - No episodes data available');
      return { episodes: [], languages: [], defaultLanguage: null };
    }

    const languages = Object.keys(contentData.episodes);
    const defaultLanguage = languages[0];
    const episodes = defaultLanguage ? contentData.episodes[defaultLanguage] : [];

    console.log('✅ useEpisodes - Processed episodes data:', {
      languages,
      defaultLanguage,
      episodesCount: episodes.length
    });

    return {
      episodes,
      languages,
      defaultLanguage,
      contentInfo: {
        id: contentData._id,
        title: contentData.title,
        description: contentData.description,
        genre: contentData.genres?.[0]?.name || 'Unknown',
        language: contentData.languages?.[0]?.label || 'Unknown',
        type: contentData.type,
        releasingDate: contentData.releasingDate,
        isFavourite: contentData.isFavourite || false,
        adsCount: contentData.adsCount,
        favourites: contentData.favourites,
        coinsPerEpisode: contentData.coinsPerEpisode,
      },
    };
  }, []);

  // Get processed episodes data
  const { episodes, languages, defaultLanguage, contentInfo } = processEpisodesData(contentDetails?.data);

  // Check if episode is unlocked
  const isEpisodeUnlocked = useCallback(
    (episodeId: string) => {
      return unlockedEpisodes?.data?.some((episode: UnlockedEpisode) => episode.episodeId === episodeId) || false;
    },
    [unlockedEpisodes]
  );

  // Unlock episode with coins
  const unlockEpisodeWithCoins = useCallback(
    async (episodeId: string, coins: number) => {
      if (!userId) throw new Error('User ID is required');
      
      return unlockWithCoinsMutation.mutateAsync({
        episodeId,
        userId,
        coins,
      });
    },
    [userId, unlockWithCoinsMutation]
  );

  // Unlock episode with ads
  const unlockEpisodeWithAds = useCallback(
    async (episodeId: string, adType: string = 'rewarded') => {
      if (!userId) throw new Error('User ID is required');
      
      return unlockWithAdsMutation.mutateAsync({
        episodeId,
        userId,
        adType,
      });
    },
    [userId, unlockWithAdsMutation]
  );

  return {
    // Data
    episodes,
    languages,
    defaultLanguage,
    contentInfo,
    unlockedEpisodes: unlockedEpisodes?.data || [],
    
    // 🔑 CRITICAL: Return cookies for video authentication
    videoAuthCookies: contentDetails?.cookies,
    
    // Loading states
    contentLoading,
    unlockedLoading,
    isUnlockingWithCoins: unlockWithCoinsMutation.isPending,
    isUnlockingWithAds: unlockWithAdsMutation.isPending,
    
    // Error states
    contentError,
    unlockedError,
    unlockWithCoinsError: unlockWithCoinsMutation.error,
    unlockWithAdsError: unlockWithAdsMutation.error,
    
    // Actions
    refetchContent,
    refetchUnlocked,
    unlockEpisodeWithCoins,
    unlockEpisodeWithAds,
    isEpisodeUnlocked,
  };
}; 