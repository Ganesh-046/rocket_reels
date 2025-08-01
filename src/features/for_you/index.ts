// ============================================================================
// FOR YOU FEATURE - COMPLETE FEATURE BUNDLE
// ============================================================================
// 
// This is the main entry point for the for_you feature which includes:
// - Episodes feature (video episodes)
// - Trailers feature (movie trailers)
// - Shared components and utilities
// 
// Usage:
// import { episodes, trailers, SimpleInstagramVideoPlayer } from './features/for_you';
// ============================================================================

// ============================================================================
// 🎬 SHARED COMPONENTS AND UTILITIES
// ============================================================================

// Shared API Interceptor
export { ApiInterceptor, HTTP_METHODS, CONTENT_TYPES, CACHE_TTL, ERROR_CODES } from './common';
export type { ApiResponse, ApiConfig, StorageInterface, RequestConfig, ApiError } from './common';

// Shared Video Player Component
export { SimpleInstagramVideoPlayer } from './common';

// ============================================================================
// 🎬 EPISODES FEATURE
// ============================================================================

// Episodes Screens
export { default as EpisodePlayerScreen } from './episodes/screens/EpisodePlayerScreen';

// Episodes Components
export { default as EpisodeActivityLoader } from './episodes/components/EpisodeActivityLoader';
export { default as EpisodeEmptyMessage } from './episodes/components/EpisodeEmptyMessage';

// Episodes Services
export { default as episodeService } from './episodes/services/episodeService';
export { default as contentService } from './episodes/services/content.service';
export { default as userInteractionsService } from './episodes/services/user-interactions.service';

// Episodes Store
export { useVideoQualityStore } from './episodes/store/videoQualityStore';
export { useVideoStore } from './episodes/store/videoStore';
export { useAuthStore } from './episodes/store/auth.store';

// Episodes Lib
export { default as episodeApiInterceptor } from './episodes/lib/episodeApiInterceptor';
export { default as episodeStorage } from './episodes/lib/episodeStorage';
export { default as mmkvStorage } from './episodes/lib/mmkv';

// Episodes Config
export { API_CONFIG, ENDPOINTS } from './episodes/config/api';
export { EPISODE_API_CONFIG, EPISODE_ENDPOINTS, EPISODE_CACHE_TTL } from './episodes/config/episodeApi';

// ============================================================================
// 🎬 TRAILERS FEATURE
// ============================================================================

// Trailers Screens
export { default as TrailerScreen } from './trailers/screens/TrailerScreen';

// Trailers Components
export { default as TrailerActivityLoader } from './trailers/components/TrailerActivityLoader';
export { default as TrailerEmptyMessage } from './trailers/components/TrailerEmptyMessage';
export { default as TrailerVideoPlayer } from './trailers/components/TrailerVideoPlayer';

// Trailers Services
export { default as trailerService } from './trailers/services/trailerService';

// Trailers Store
export { useTrailerVideoQualityStore } from './trailers/store/trailerVideoQualityStore';

// Trailers Lib
export { default as trailerApiInterceptor } from './trailers/lib/trailerApiInterceptor';
export { default as trailerStorage } from './trailers/lib/trailerStorage';

// Trailers Config
export { TRAILER_API_CONFIG, TRAILER_ENDPOINTS, TRAILER_CACHE_TTL } from './trailers/config/trailerApi';

// ============================================================================
// 🎯 FEATURE EXPORTS
// ============================================================================

// Import values for use in object literals
import EpisodePlayerScreen from './episodes/screens/EpisodePlayerScreen';
import EpisodeActivityLoader from './episodes/components/EpisodeActivityLoader';
import EpisodeEmptyMessage from './episodes/components/EpisodeEmptyMessage';
import episodeService from './episodes/services/episodeService';
import contentService from './episodes/services/content.service';
import userInteractionsService from './episodes/services/user-interactions.service';
import { useVideoQualityStore } from './episodes/store/videoQualityStore';
import { useVideoStore } from './episodes/store/videoStore';
import { useAuthStore } from './episodes/store/auth.store';
import episodeApiInterceptor from './episodes/lib/episodeApiInterceptor';
import episodeStorage from './episodes/lib/episodeStorage';
import mmkvStorage from './episodes/lib/mmkv';
import { API_CONFIG, ENDPOINTS } from './episodes/config/api';
import { EPISODE_API_CONFIG, EPISODE_ENDPOINTS, EPISODE_CACHE_TTL } from './episodes/config/episodeApi';

import TrailerScreen from './trailers/screens/TrailerScreen';
import TrailerActivityLoader from './trailers/components/TrailerActivityLoader';
import TrailerEmptyMessage from './trailers/components/TrailerEmptyMessage';
import TrailerVideoPlayer from './trailers/components/TrailerVideoPlayer';
import trailerService from './trailers/services/trailerService';
import { useTrailerVideoQualityStore } from './trailers/store/trailerVideoQualityStore';
import trailerApiInterceptor from './trailers/lib/trailerApiInterceptor';
import trailerStorage from './trailers/lib/trailerStorage';
import { TRAILER_API_CONFIG, TRAILER_ENDPOINTS, TRAILER_CACHE_TTL } from './trailers/config/trailerApi';

import { SimpleInstagramVideoPlayer } from './common';
import { ApiInterceptor, HTTP_METHODS, CONTENT_TYPES, CACHE_TTL, ERROR_CODES } from './common';
import type { ApiResponse, ApiConfig, StorageInterface, RequestConfig, ApiError } from './common';

// Export complete feature objects
export const episodes = {
  // Screens
  screens: {
    EpisodePlayerScreen,
  },
  // Components
  components: {
    EpisodeActivityLoader,
    EpisodeEmptyMessage,
  },
  // Services
  services: {
    episodeService,
    contentService,
    userInteractionsService,
  },
  // Store
  store: {
    useVideoQualityStore,
    useVideoStore,
    useAuthStore,
  },
  // Lib
  lib: {
    episodeApiInterceptor,
    episodeStorage,
    mmkvStorage,
  },
  // Config
  config: {
    API_CONFIG,
    ENDPOINTS,
    EPISODE_API_CONFIG,
    EPISODE_ENDPOINTS,
    EPISODE_CACHE_TTL,
  },
};

export const trailers = {
  // Screens
  screens: {
    TrailerScreen,
  },
  // Components
  components: {
    TrailerActivityLoader,
    TrailerEmptyMessage,
    TrailerVideoPlayer,
  },
  // Services
  services: {
    trailerService,
  },
  // Store
  store: {
    useTrailerVideoQualityStore,
  },
  // Lib
  lib: {
    trailerApiInterceptor,
    trailerStorage,
  },
  // Config
  config: {
    TRAILER_API_CONFIG,
    TRAILER_ENDPOINTS,
    TRAILER_CACHE_TTL,
  },
};

export const common = {
  // Shared Components
  components: {
    SimpleInstagramVideoPlayer,
  },
  // Shared API Interceptor
  api: {
    ApiInterceptor,
    HTTP_METHODS,
    CONTENT_TYPES,
    CACHE_TTL,
    ERROR_CODES,
  },
  // Shared Types
  types: {
    // Types are available for import but not as runtime values
    ApiResponse: 'ApiResponse',
    ApiConfig: 'ApiConfig',
    StorageInterface: 'StorageInterface',
    RequestConfig: 'RequestConfig',
    ApiError: 'ApiError',
  },
};

// ============================================================================
// 🎯 DEFAULT EXPORTS
// ============================================================================

// Default export for the entire for_you feature
export default {
  episodes,
  trailers,
  common,
  // Convenience exports
  SimpleInstagramVideoPlayer,
  ApiInterceptor,
}; 