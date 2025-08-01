// ============================================================================
// EPISODE TYPES - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 🎬 EPISODE CONTENT TYPES
// ============================================================================

export interface Episode {
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

export interface EpisodeListResponse {
  episodes: Episode[];
  hasNext: boolean;
  page: number;
  total: number;
}

export interface EpisodeListParams {
  contentId: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// 🎯 EPISODE PLAYER TYPES
// ============================================================================

export interface EpisodePlayerState {
  playPause: boolean;
  currentIndex: number;
  controller: boolean;
  duration: number;
  progress: number;
  loading: boolean;
}

export interface EpisodePlayerProps {
  episode: Episode;
  isPlaying: boolean;
  style?: any;
  isScrolling: boolean;
  onPauseStateChange?: (isPaused: boolean) => void;
  externalPauseTrigger: number;
  externalSeekTime: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onWatchNow?: (item: Episode) => void;
  onLike?: (episodeId: string) => void;
  onShare?: (item: Episode) => void;
}

// ============================================================================
// 🎯 EPISODE SCREEN TYPES
// ============================================================================

export interface EpisodePlayerScreenProps {
  navigation: any;
  route: {
    params: {
      contentId: string;
      contentName: string;
      episodes: Episode[];
      initialIndex?: number;
    };
  };
}

export interface EpisodeScreenState {
  playPause: boolean;
  currentIndex: number;
  controller: boolean;
  duration: number;
  progress: number;
  loading: boolean;
}

// ============================================================================
// 🔧 EPISODE UTILITY TYPES
// ============================================================================

export interface EpisodeQuality {
  label: string;
  value: string;
  url: string;
}

export interface EpisodeProcessingResult {
  processed: Episode[];
  total: number;
  hdCount: number;
  sdCount: number;
}

export interface EpisodeError {
  message: string;
  code?: string;
  retry?: () => void;
}

// ============================================================================
// 📊 EPISODE ANALYTICS TYPES
// ============================================================================

export interface EpisodeViewEvent {
  episodeId: string;
  title: string;
  duration: number;
  quality: string;
  timestamp: string;
}

export interface EpisodeInteractionEvent {
  episodeId: string;
  action: 'like' | 'share' | 'watch_now' | 'skip';
  timestamp: string;
}

// ============================================================================
// 🎬 EPISODE UI COMPONENT TYPES
// ============================================================================

export interface EpisodeCardProps {
  episode: Episode;
  onPress: () => void;
  style?: any;
}

export interface EpisodeListProps {
  data: Episode[];
  onRefresh?: () => void;
  onLoadMore?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  error?: EpisodeError;
}

// ============================================================================
// 🎯 EPISODE STATE MANAGEMENT TYPES
// ============================================================================

export interface EpisodeState {
  episodes: Episode[];
  currentEpisode: Episode | null;
  loading: boolean;
  error: EpisodeError | null;
  hasNext: boolean;
  page: number;
}

export interface EpisodeActions {
  fetchEpisodes: (params?: EpisodeListParams) => Promise<void>;
  refreshEpisodes: () => Promise<void>;
  loadMoreEpisodes: () => Promise<void>;
  setCurrentEpisode: (episode: Episode | null) => void;
  clearError: () => void;
}

// ============================================================================
// ⚙️ EPISODE CONFIGURATION TYPES
// ============================================================================

export interface EpisodeConfig {
  autoPlay: boolean;
  loopVideos: boolean;
  preloadCount: number;
  qualityPreference: 'hd' | 'sd' | 'auto';
  enableAnalytics: boolean;
  cacheEnabled: boolean;
  cacheSize: number;
}

export interface EpisodeEndpoints {
  list: string;
  details: string;
  analytics: string;
}

// ============================================================================
// 📐 EPISODE LAYOUT TYPES
// ============================================================================

export interface EpisodeDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isLandscape: boolean;
  isTablet: boolean;
}

export interface EpisodeLayout {
  columns: number;
  itemHeight: number;
  spacing: number;
  padding: number;
}

// ============================================================================
// 🔧 EPISODE API REQUEST TYPES
// ============================================================================

export interface EpisodeApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface EpisodeApiCacheConfig {
  cacheKey: string;
  cacheTTL: number;
}

export interface EpisodeApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
}

// ============================================================================
// 🎬 EPISODE PROGRESS TYPES
// ============================================================================

export interface EpisodeProgress {
  progress: number;
  duration: number;
  actualDuration: number;
  isSeeking: boolean;
  seekPosition: number;
  showProgressBar: boolean;
  isPaused: boolean;
  externalPauseTrigger: number;
  externalSeekTime: number | null;
  lastSeekTime: number | null;
  durationChangeCount: number;
}

export interface EpisodeProgressMap {
  [episodeId: string]: EpisodeProgress;
}

// ============================================================================
// 🎯 EPISODE MODAL TYPES
// ============================================================================

export interface EpisodeModalProps {
  visible: boolean;
  onClose: () => void;
  episodes: Episode[];
  currentEpisodeId: string;
  onEpisodePress: (episode: Episode, index: number) => void;
  userProfileInfo?: any;
  episodeUnlockedLists?: string[];
}

export interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onSignIn: () => void;
  onMaybeLater: () => void;
  isUserLoggedIn: boolean;
}

// ============================================================================
// 🎬 EPISODE VIDEO QUALITY TYPES
// ============================================================================

export interface EpisodeVideoQuality {
  label: string;
  value: string;
  url: string;
}

export interface EpisodeVideoUrls {
  '1080p'?: string;
  '720p'?: string;
  '480p'?: string;
  '360p'?: string;
  master?: string;
}

// ============================================================================
// 🎯 EPISODE USER INTERACTION TYPES
// ============================================================================

export interface EpisodeLikeRequest {
  userId: string;
  episodeId: string;
}

export interface EpisodeLikeResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface EpisodeUser {
  _id: string;
  isSubscriber?: boolean;
  yearlySubscriber?: boolean;
  weeklySubscriber?: boolean;
}

// ============================================================================
// 🎬 EPISODE PERFORMANCE TYPES
// ============================================================================

export interface EpisodePerformanceMetrics {
  fps: number;
  memoryUsage: number;
  scrollVelocity: number;
  cacheHitRate: number;
  loadTime: number;
}

export interface EpisodePerformanceConfig {
  enableThrottling: boolean;
  throttleInterval: number;
  enableMemoryOptimization: boolean;
  maxCachedEpisodes: number;
  enableScrollOptimization: boolean;
} 