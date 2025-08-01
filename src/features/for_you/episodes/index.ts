// ============================================================================
// EPISODES FEATURE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 🎬 EPISODE TYPES
// ============================================================================

export * from './types';

// ============================================================================
// 🎯 EPISODE CONFIGURATION
// ============================================================================

export {
  EPISODE_API_CONFIG,
  EPISODE_ENDPOINTS,
  EPISODE_CACHE_TTL,
  EPISODE_HTTP_METHODS,
  EPISODE_CONTENT_TYPES,
  EPISODE_ERROR_CODES,
  EPISODE_API_STATUS,
  EPISODE_CONTENT_TYPE,
  EPISODE_TARGET_AUDIENCE,
  EPISODE_DEVICE_TYPES,
  EPISODE_VIDEO_QUALITIES,
  EPISODE_APP_VERSION,
  EPISODE_AUTH_HEADERS,
} from './config/episodeApi';

// ============================================================================
// 🔧 EPISODE SERVICES & UTILITIES
// ============================================================================

export { default as episodeService } from './services/episodeService';
export { default as episodeApiInterceptor } from './lib/episodeApiInterceptor';
export { default as episodeStorage } from './lib/episodeStorage';

// ============================================================================
// 🎬 EPISODE HOOKS
// ============================================================================

export {
  useEpisodes,
} from './hooks/useEpisodes';

// ============================================================================
// 🎬 EPISODE COMPONENTS
// ============================================================================

export { default as EpisodeActivityLoader } from './components/EpisodeActivityLoader';
export { default as EpisodeEmptyMessage } from './components/EpisodeEmptyMessage';
// SimpleInstagramVideoPlayer is now in the common folder
export { default as VideoQualitySelector } from './components/common/VideoQualitySelector';
export { default as PlayerIcon } from './components/common/PlayerIcon';
export { default as EpisodesModal } from './components/common/EpisodesModal';
export { default as SubscriptionModal } from './components/common/SubscriptionModal';

// ============================================================================
// 🎬 EPISODE SCREENS
// ============================================================================

export { default as EpisodePlayerScreen } from './screens/EpisodePlayerScreen';

 