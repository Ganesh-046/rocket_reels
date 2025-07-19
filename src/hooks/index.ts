// Export all hooks
export * from './useAuth';
export * from './useRewards';

// Export content hooks (excluding useWatchHistory to avoid conflict)
export {
  CONTENT_QUERY_KEYS,
  useContentList,
  useTrailerList,
  useContentDetails,
  useSeasonContent,
  useVideoAccess,
  useLatestContent,
  useTopContent,
  useUpcomingContent,
  useCustomizedList,
  useSpecialInterestContent,
  useTargetAudienceContent,
  useBannerData,
  useGenres,
  useSubGenres,
  useLanguages,
} from './useContent';

// Export user interaction hooks (excluding useWatchHistory to avoid conflict)
export {
  USER_INTERACTIONS_QUERY_KEYS,
  useWatchlist,
  useWatchlistIds,
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useLikedContent,
  useLikeDislikeContent,
  useTrailerLikes,
  useLikeTrailer,
  useAddWatchHistory,
  useUpdateViewCount,
} from './useUserInteractions';

// Re-export specific hooks to avoid naming conflicts
export { useWatchHistory as useContentWatchHistory } from './useContent';
export { useWatchHistory as useUserWatchHistory } from './useUserInteractions'; 