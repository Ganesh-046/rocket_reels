// ============================================================================
// TRAILER FEATURE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 📁 TRAILER FEATURE EXPORTS
// ============================================================================

// Types
export * from './types';

// Services
export { default as trailerService, TrailerService } from './services/trailerService';

// Store
export { useTrailerVideoQualityStore } from './store/trailerVideoQualityStore';
export type { TrailerVideoQuality } from './store/trailerVideoQualityStore';

// Storage
export { default as trailerStorage, TrailerStorage } from './lib/trailerStorage';

// Config
export { TRAILER_API_CONFIG, TRAILER_ENDPOINTS, TRAILER_CACHE_TTL } from './config/trailerApi';

// Theme
export { useTrailerTheme, useTrailerThemedStyles } from './hooks/useTrailerTheme';
export type { TrailerTheme, TrailerThemeColors } from './hooks/useTrailerTheme';

// Components
export { default as TrailerEmptyMessage } from './components/TrailerEmptyMessage';
export { default as TrailerActivityLoader } from './components/TrailerActivityLoader';

// API
export { default as trailerApiInterceptor } from './lib/trailerApiInterceptor';

// Hooks
export {
  useTrailerList,
  useTrailerSearch,
  useTrailersByGenre,
  useTrailerDetails,
  useTrackTrailerView,
  useTrackTrailerInteraction,
  useTrailerProcessor,
  useTrailerQuality,
  useBestTrailerQuality,
  useTrailerPlayerState,
  useTrailerListState,
  TRAILER_QUERY_KEYS,
} from './hooks/useTrailers';

// Components
export { default as TrailerVideoPlayer } from './components/TrailerVideoPlayer';

// Screens
export { default as TrailerScreen } from './screens/TrailerScreen';

// Utils
export {
  getTrailerDimensions,
  getTrailerLayout,
  getTrailerQualityOptions,
  getBestTrailerQuality,
  hasHDQuality,
  processTrailerData,
  filterTrailersByGenre,
  searchTrailers,
  trackTrailerView,
  trackTrailerInteraction,
  getDefaultTrailerConfig,
  validateTrailerConfig,
  debounce,
  throttle,
  memoize,
} from './utils/trailerUtils';

// ============================================================================
// 🎬 TRAILER FEATURE CONFIGURATION
// ============================================================================

export const TRAILER_FEATURE_CONFIG = {
  name: 'Trailer Feature',
  version: '1.0.0',
  description: 'Completely independent and portable trailer feature',
  dependencies: [
    'react-native-video',
    'react-native-linear-gradient',
    '@tanstack/react-query',
    '@react-navigation/native',
    'react-native-safe-area-context',
  ],
  features: [
    'HD Video Playback',
    'Quality Selection',
    'Analytics Tracking',
    'Responsive Design',
    'Performance Optimization',
    'Caching',
    'Error Handling',
  ],
} as const;

// ============================================================================
// 🚀 TRAILER FEATURE SETUP
// ============================================================================

/**
 * Initialize trailer feature with custom configuration
 */
export const initializeTrailerFeature = (config?: {
  baseURL?: string;
  timeout?: number;
  enableAnalytics?: boolean;
  cacheEnabled?: boolean;
}) => {
  console.log('🎬 Initializing Trailer Feature...');
  
  // Apply custom configuration if provided
  if (config) {
    // Configuration logic here
    console.log('🎬 Trailer Feature configured with:', config);
  }
  
  console.log('🎬 Trailer Feature initialized successfully!');
  
  return {
    version: TRAILER_FEATURE_CONFIG.version,
    features: TRAILER_FEATURE_CONFIG.features,
  };
};

/**
 * Check if trailer feature is properly configured
 */
export const isTrailerFeatureReady = (): boolean => {
  // Add validation logic here
  return true;
};

// ============================================================================
// 📋 TRAILER FEATURE USAGE GUIDE
// ============================================================================

/**
 * Example usage of the trailer feature:
 * 
 * 1. Import the feature:
 *    import { TrailerScreen, useTrailerList } from './features/trailers';
 * 
 * 2. Use in navigation:
 *    <Tab.Screen name="Trailers" component={TrailerScreen} />
 * 
 * 3. Use hooks in components:
 *    const { data, isLoading } = useTrailerList();
 * 
 * 4. Use utilities:
 *    import { processTrailerData } from './features/trailers';
 *    const processedData = processTrailerData(rawData);
 * 
 * 5. Customize service:
 *    import { TrailerService } from './features/trailers';
 *    const customService = new TrailerService({ baseURL: 'your-api-url' });
 */ 