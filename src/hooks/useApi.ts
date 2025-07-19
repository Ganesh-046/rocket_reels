// ============================================================================
// COMPREHENSIVE REACT QUERY HOOKS FOR ROCKET REELS OTT APPLICATION
// ============================================================================

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiService from '../services/api.service';
import {
  // Authentication Types
  LoginSignupResponse,
  UserProfile,
  ActiveCountry,
  LoginRequest,
  OTPVerificationRequest,
  SignupRequest,
  
  // Content Types
  ContentListResponse,
  ContentDetailResponse,
  TrailerListResponse,
  LatestContentResponse,
  TopContentResponse,
  UpcomingContentResponse,
  CustomizedContentResponse,
  BannerItem,
  ContentListRequest,
  
  // Rewards Types
  BalanceResponse,
  CheckInDay,
  SubscriptionPlan,
  RechargePlan,
  RechargeHistoryItem,
  RewardCoinHistoryItem,
  UnlockedEpisode,
  
  // Watchlist Types
  WatchlistItem,
  VideoData,
  WatchlistRequest,
  LikeDislikeRequest,
  WatchHistoryRequest,
  UnlockEpisodeRequest,
  
  // Static Data Types
  Genre,
  Language,
  
  // Common Types
  ApiResponse,
  DailyCheckInRequest,
  PurchaseSubscriptionRequest,
  RechargeRequest,
} from '../types/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const queryKeys = {
  // Authentication
  auth: {
    profile: (userId: string) => ['auth', 'profile', userId],
    countries: ['auth', 'countries'],
  },
  
  // Content
  content: {
    list: (params: ContentListRequest) => ['content', 'list', params],
    detail: (contentId: string) => ['content', 'detail', contentId],
    trailers: (params: any) => ['content', 'trailers', params],
    latest: (params: any) => ['content', 'latest', params],
    top: (params: any) => ['content', 'top', params],
    upcoming: (params: any) => ['content', 'upcoming', params],
    customized: (params: any) => ['content', 'customized', params],
    banners: ['content', 'banners'],
    genres: ['content', 'genres'],
    languages: ['content', 'languages'],
    search: (query: string, params: any) => ['content', 'search', query, params],
    byGenre: (genre: string, params: any) => ['content', 'genre', genre, params],
    related: (contentId: string, params: any) => ['content', 'related', contentId, params],
  },
  
  // Watchlist & Interactions
  watchlist: {
    list: (userId: string) => ['watchlist', 'list', userId],
    liked: (userId: string) => ['watchlist', 'liked', userId],
    trailerLikes: (userId: string) => ['watchlist', 'trailer-likes', userId],
    history: (contentId: string) => ['watchlist', 'history', contentId],
    unlocked: (userId: string) => ['watchlist', 'unlocked', userId],
  },
  
  // Rewards & Subscriptions
  rewards: {
    balance: (userId: string) => ['rewards', 'balance', userId],
    checkInList: ['rewards', 'check-in-list'],
    subscriptionPlans: ['rewards', 'subscription-plans'],
    vipPlans: ['rewards', 'vip-plans'],
    rechargeList: ['rewards', 'recharge-list'],
    rechargeHistory: (userId: string) => ['rewards', 'recharge-history', userId],
    rewardHistory: (userId: string) => ['rewards', 'reward-history', userId],
    adsCount: (userId: string) => ['rewards', 'ads-count', userId],
  },
} as const;

// ============================================================================
// 🔐 AUTHENTICATION HOOKS
// ============================================================================

export const useUser = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<UserProfile>>
) => {
  return useQuery({
    queryKey: queryKeys.auth.profile(userId),
    queryFn: () => apiService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useCountries = (
  options?: UseQueryOptions<ApiResponse<ActiveCountry[]>>
) => {
  return useQuery({
    queryKey: queryKeys.auth.countries,
    queryFn: () => apiService.getActiveCountries(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useLogin = (
  options?: UseMutationOptions<ApiResponse<LoginSignupResponse>, Error, LoginRequest>
) => {
  return useMutation({
    mutationFn: (data: LoginRequest) => apiService.login(data),
    ...options,
  });
};

export const useOTPVerification = (
  options?: UseMutationOptions<ApiResponse<LoginSignupResponse>, Error, OTPVerificationRequest>
) => {
  return useMutation({
    mutationFn: (data: OTPVerificationRequest) => apiService.verifyOTP(data),
    ...options,
  });
};

export const useSignup = (
  options?: UseMutationOptions<ApiResponse<LoginSignupResponse>, Error, SignupRequest>
) => {
  return useMutation({
    mutationFn: (data: SignupRequest) => apiService.signup(data),
    ...options,
  });
};

export const useUpdateUser = (
  options?: UseMutationOptions<ApiResponse<UserProfile>, Error, { userId: string; data: Partial<UserProfile> }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }) => apiService.updateUserProfile(userId, data),
    onSuccess: (data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId) });
    },
    ...options,
  });
};

export const useDeleteAccount = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, string>
) => {
  return useMutation({
    mutationFn: (userId: string) => apiService.deleteAccount(userId),
    ...options,
  });
};

// ============================================================================
// 📺 CONTENT HOOKS
// ============================================================================

export const useContentList = (
  params: ContentListRequest,
  options?: UseQueryOptions<ApiResponse<ContentListResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.list(params),
    queryFn: () => apiService.getContentList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useContentDetails = (
  contentId: string,
  options?: UseQueryOptions<ApiResponse<ContentDetailResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.detail(contentId),
    queryFn: () => apiService.getContentDetails(contentId),
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useTrailerList = (
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<TrailerListResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.trailers(params),
    queryFn: () => apiService.getTrailerList(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useLatestContent = (
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<LatestContentResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.latest(params),
    queryFn: () => apiService.getLatestContent(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useTopContent = (
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<TopContentResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.top(params),
    queryFn: () => apiService.getTopContent(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useUpcomingContent = (
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<UpcomingContentResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.upcoming(params),
    queryFn: () => apiService.getUpcomingContent(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useCustomizedContent = (
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<CustomizedContentResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.customized(params),
    queryFn: () => apiService.getCustomizedContent(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useBannerData = (
  options?: UseQueryOptions<ApiResponse<BannerItem[]>>
) => {
  return useQuery({
    queryKey: queryKeys.content.banners,
    queryFn: () => apiService.getBannerData(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

export const useGenres = (
  options?: UseQueryOptions<ApiResponse<Genre[]>>
) => {
  return useQuery({
    queryKey: queryKeys.content.genres,
    queryFn: () => apiService.getGenres(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useLanguages = (
  options?: UseQueryOptions<ApiResponse<Language[]>>
) => {
  return useQuery({
    queryKey: queryKeys.content.languages,
    queryFn: () => apiService.getLanguages(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useSearchContent = (
  query: string,
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<ContentListResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.search(query, params),
    queryFn: () => apiService.searchContent(query, params),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useContentByGenre = (
  genre: string,
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<ContentListResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.byGenre(genre, params),
    queryFn: () => apiService.getContentByGenre(genre, params),
    enabled: !!genre,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useRelatedContent = (
  contentId: string,
  params: { page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<ContentListResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.content.related(contentId, params),
    queryFn: () => apiService.getRelatedContent(contentId, params),
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// ============================================================================
// 📺 WATCHLIST & INTERACTIONS HOOKS
// ============================================================================

export const useWatchlist = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<WatchlistItem[]>>
) => {
  return useQuery({
    queryKey: queryKeys.watchlist.list(userId),
    queryFn: () => apiService.getWatchlist(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useAddToWatchlist = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, WatchlistRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: WatchlistRequest) => apiService.addToWatchlist(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.list(variables.userId) });
    },
    ...options,
  });
};

export const useRemoveFromWatchlist = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, WatchlistRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: WatchlistRequest) => apiService.removeFromWatchlist(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.list(variables.userId) });
    },
    ...options,
  });
};

export const useLikeDislikeContent = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, LikeDislikeRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LikeDislikeRequest) => apiService.likeDislikeContent(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.liked(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.detail(variables.episodeId) });
    },
    ...options,
  });
};

export const useLikedContent = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<string[]>>
) => {
  return useQuery({
    queryKey: queryKeys.watchlist.liked(userId),
    queryFn: () => apiService.getLikedContent(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useTrailerLikes = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<string[]>>
) => {
  return useQuery({
    queryKey: queryKeys.watchlist.trailerLikes(userId),
    queryFn: () => apiService.getTrailerLikes(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

export const useLikeTrailer = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, { userId: string; trailerId: string }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, trailerId }) => apiService.likeTrailer(userId, trailerId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.trailerLikes(variables.userId) });
    },
    ...options,
  });
};

export const useAddWatchHistory = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, WatchHistoryRequest>
) => {
  return useMutation({
    mutationFn: (data: WatchHistoryRequest) => apiService.addWatchHistory(data),
    ...options,
  });
};

export const useWatchHistory = (
  contentId: string,
  options?: UseQueryOptions<ApiResponse<VideoData>>
) => {
  return useQuery({
    queryKey: queryKeys.watchlist.history(contentId),
    queryFn: () => apiService.getWatchHistory(contentId),
    enabled: !!contentId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

export const useUpdateViewCount = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, string>
) => {
  return useMutation({
    mutationFn: (contentId: string) => apiService.updateViewCount(contentId),
    ...options,
  });
};

export const useUnlockedEpisodes = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<UnlockedEpisode[]>>
) => {
  return useQuery({
    queryKey: queryKeys.watchlist.unlocked(userId),
    queryFn: () => apiService.getUnlockedEpisodes(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// ============================================================================
// 🎁 REWARDS & SUBSCRIPTION HOOKS
// ============================================================================

export const useBalance = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<BalanceResponse>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.balance(userId),
    queryFn: () => apiService.getBalance(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

export const useCheckInList = (
  options?: UseQueryOptions<ApiResponse<CheckInDay[]>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.checkInList,
    queryFn: () => apiService.getCheckInList(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useDailyCheckIn = (
  options?: UseMutationOptions<ApiResponse<{ message: string; coins: number }>, Error, DailyCheckInRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DailyCheckInRequest) => apiService.dailyCheckIn(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.balance(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.rewardHistory(variables.userId) });
    },
    ...options,
  });
};

export const useSubscriptionPlans = (
  options?: UseQueryOptions<ApiResponse<SubscriptionPlan[]>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.subscriptionPlans,
    queryFn: () => apiService.getSubscriptionPlans(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useVIPSubscriptions = (
  options?: UseQueryOptions<ApiResponse<SubscriptionPlan[]>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.vipPlans,
    queryFn: () => apiService.getVIPSubscriptions(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const usePurchaseSubscription = (
  options?: UseMutationOptions<ApiResponse<{ message: string; orderId: string }>, Error, PurchaseSubscriptionRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PurchaseSubscriptionRequest) => apiService.purchaseSubscription(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.balance(variables.userId) });
    },
    ...options,
  });
};

export const useRechargeList = (
  options?: UseQueryOptions<ApiResponse<RechargePlan[]>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.rechargeList,
    queryFn: () => apiService.getRechargeList(),
    staleTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

export const useCreateRecharge = (
  options?: UseMutationOptions<ApiResponse<{ message: string; orderId: string }>, Error, RechargeRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RechargeRequest) => apiService.createRecharge(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.rechargeHistory(variables.userId) });
    },
    ...options,
  });
};

export const useRechargeHistory = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<RechargeHistoryItem[]>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.rechargeHistory(userId),
    queryFn: () => apiService.getRechargeHistory(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useRewardHistory = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<RewardCoinHistoryItem[]>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.rewardHistory(userId),
    queryFn: () => apiService.getRewardHistory(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useAdsCount = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<{ adsCount: number }>>
) => {
  return useQuery({
    queryKey: queryKeys.rewards.adsCount(userId),
    queryFn: () => apiService.getAdsCount(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

export const useUpdateAdStatus = (
  options?: UseMutationOptions<ApiResponse<{ message: string; coins: number }>, Error, { userId: string; adId: string; completed: boolean }>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiService.updateAdStatus(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.balance(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.adsCount(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.rewardHistory(variables.userId) });
    },
    ...options,
  });
};

export const useUnlockEpisodeWithCoins = (
  options?: UseMutationOptions<ApiResponse<{ message: string; coinsSpent: number }>, Error, UnlockEpisodeRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UnlockEpisodeRequest) => apiService.unlockEpisodeWithCoins(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.balance(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.unlocked(variables.userId) });
    },
    ...options,
  });
};

export const useUnlockEpisodeWithAds = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, UnlockEpisodeRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UnlockEpisodeRequest) => apiService.unlockEpisodeWithAds(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist.unlocked(variables.userId) });
    },
    ...options,
  });
};

// ============================================================================
// 🔧 UTILITY HOOKS
// ============================================================================

export const useUploadFile = (
  options?: UseMutationOptions<ApiResponse<{ url: string }>, Error, { file: any; type: 'image' | 'video' }>
) => {
  return useMutation({
    mutationFn: ({ file, type }) => apiService.uploadFile(file, type),
    ...options,
  });
};

// ============================================================================
// 📊 ANALYTICS HOOKS
// ============================================================================

export const useTrackEvent = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, { eventName: string; userId: string; properties: Record<string, any> }>
) => {
  return useMutation({
    mutationFn: (data) => apiService.trackEvent(data),
    ...options,
  });
};

export const useTrackContentView = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, { userId: string; contentId: string; episodeId?: string; duration: number; progress: number }>
) => {
  return useMutation({
    mutationFn: (data) => apiService.trackContentView(data),
    ...options,
  });
};

export const useTrackPurchase = (
  options?: UseMutationOptions<ApiResponse<{ message: string }>, Error, { userId: string; productId: string; amount: number; currency: string; success: boolean }>
) => {
  return useMutation({
    mutationFn: (data) => apiService.trackPurchase(data),
    ...options,
  });
}; 