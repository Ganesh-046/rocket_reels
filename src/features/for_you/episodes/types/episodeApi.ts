// ============================================================================
// EPISODE API TYPES - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 🔐 EPISODE API RESPONSE TYPES
// ============================================================================

export interface EpisodeApiResponse<T> {
  status: number;
  message: string;
  data: T;
  hasNext?: boolean;
  page?: number;
  cookies?: Record<string, string>;
}

// ============================================================================
// 🎬 EPISODE CONTENT TYPES
// ============================================================================

export interface EpisodeVideoUrls {
  '1080p'?: string;
  '720p'?: string;
  '480p'?: string;
  '360p'?: string;
  master?: string;
}

export interface EpisodeItem {
  _id: string;
  episodeNo: number;
  language: string;
  status: 'locked' | 'unlocked';
  contentId: string;
  video_urls: EpisodeVideoUrls;
  thumbnail: string;
  like: number;
  isDeleted: boolean;
  isLiked: boolean | null;
}

export interface EpisodeListResponse {
  episodes: EpisodeItem[];
  hasNext: boolean;
  page: number;
  total: number;
}

export interface EpisodeListParams {
  contentId: string;
  page?: number;
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
  episode: EpisodeItem;
  isPlaying: boolean;
  style?: any;
  isScrolling: boolean;
  onPauseStateChange?: (isPaused: boolean) => void;
  externalPauseTrigger: number;
  externalSeekTime: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onWatchNow?: (item: EpisodeItem) => void;
  onLike?: (episodeId: string) => void;
  onShare?: (item: EpisodeItem) => void;
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
      episodes: EpisodeItem[];
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
  processed: EpisodeItem[];
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
  episode: EpisodeItem;
  onPress: () => void;
  style?: any;
}

export interface EpisodeListProps {
  data: EpisodeItem[];
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
  episodes: EpisodeItem[];
  currentEpisode: EpisodeItem | null;
  loading: boolean;
  error: EpisodeError | null;
  hasNext: boolean;
  page: number;
}

export interface EpisodeActions {
  fetchEpisodes: (params?: EpisodeListParams) => Promise<void>;
  refreshEpisodes: () => Promise<void>;
  loadMoreEpisodes: () => Promise<void>;
  setCurrentEpisode: (episode: EpisodeItem | null) => void;
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