// ============================================================================
// TRAILER FEATURE TYPES - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 📺 TRAILER API TYPES
// ============================================================================

export interface TrailerVideoUrls {
  master?: string;
  '1080p'?: string;
  '720p'?: string;
  '480p'?: string;
  '360p'?: string;
}

export interface TrailerMedia {
  video_urls: TrailerVideoUrls;
  thumbnail?: string;
}

export interface TrailerUrl {
  video?: string;
  media?: TrailerMedia;
}

export interface TrailerTargetAudience {
  name: string;
  description?: string;
}

export interface TrailerGenre {
  _id: string;
  name: string;
  slug: string;
}

export interface TrailerItem {
  _id: string;
  title: string;
  description?: string;
  backdropImage?: string;
  posterImage?: string;
  trailerUrl: TrailerUrl;
  genres?: TrailerGenre[];
  targetAudience?: TrailerTargetAudience;
  releasingDate?: string;
  favourites?: number;
  contentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrailerListResponse {
  data: {
    trailers: TrailerItem[];
  };
  hasNext: boolean;
  page: number;
  total: number;
}

export interface TrailerListParams {
  adult?: boolean;
  page?: number;
  limit?: number;
  genre?: string;
  search?: string;
}

// ============================================================================
// 🎬 TRAILER PLAYER TYPES
// ============================================================================

export interface TrailerEpisode {
  _id: string;
  title: string;
  description: string;
  video_urls: TrailerVideoUrls;
  video_url: string;
  thumbnail?: string;
  backdropImage?: string;
  likes: number;
  author: string;
  duration: number;
  views: string;
  genres: TrailerGenre[];
  releasingDate?: string;
  targetAudience?: TrailerTargetAudience;
  trailerUrl: TrailerUrl;
  contentId?: string;
}

export interface TrailerPlayerState {
  playPause: boolean;
  currentIndex: number;
  controller: boolean;
  duration: number;
  progress: number;
  loading: boolean;
}

export interface TrailerPlayerProps {
  episode: TrailerEpisode;
  isPlaying: boolean;
  style?: any;
  isScrolling: boolean;
  onPauseStateChange?: (isPaused: boolean) => void;
  externalPauseTrigger: number;
  externalSeekTime: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onWatchNow?: (item: TrailerEpisode) => void;
  onLike?: (trailerId: string) => void;
  onShare?: (item: TrailerEpisode) => void;
}

// ============================================================================
// 🎯 TRAILER SCREEN TYPES
// ============================================================================

export interface TrailerScreenProps {
  navigation: any;
}

export interface TrailerScreenState {
  playPause: boolean;
  currentIndex: number;
  controller: boolean;
  duration: number;
  progress: number;
  loading: boolean;
}

// ============================================================================
// 🔧 TRAILER UTILITY TYPES
// ============================================================================

export interface TrailerQuality {
  label: string;
  value: string;
  url: string;
}

export interface TrailerProcessingResult {
  processed: TrailerEpisode[];
  total: number;
  hdCount: number;
  sdCount: number;
}

export interface TrailerError {
  message: string;
  code?: string;
  retry?: () => void;
}

// ============================================================================
// 📊 TRAILER ANALYTICS TYPES
// ============================================================================

export interface TrailerViewEvent {
  trailerId: string;
  title: string;
  duration: number;
  quality: string;
  timestamp: string;
}

export interface TrailerInteractionEvent {
  trailerId: string;
  action: 'like' | 'share' | 'watch_now' | 'skip';
  timestamp: string;
}

// ============================================================================
// 🎨 TRAILER UI TYPES
// ============================================================================

export interface TrailerCardProps {
  trailer: TrailerEpisode;
  onPress: () => void;
  style?: any;
}

export interface TrailerListProps {
  data: TrailerEpisode[];
  onRefresh?: () => void;
  onLoadMore?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  error?: TrailerError;
}

// ============================================================================
// 🔄 TRAILER STATE TYPES
// ============================================================================

export interface TrailerState {
  trailers: TrailerEpisode[];
  currentTrailer: TrailerEpisode | null;
  loading: boolean;
  error: TrailerError | null;
  hasNext: boolean;
  page: number;
}

export interface TrailerActions {
  fetchTrailers: (params?: TrailerListParams) => Promise<void>;
  refreshTrailers: () => Promise<void>;
  loadMoreTrailers: () => Promise<void>;
  setCurrentTrailer: (trailer: TrailerEpisode | null) => void;
  clearError: () => void;
}

// ============================================================================
// 🎯 TRAILER CONFIG TYPES
// ============================================================================

export interface TrailerConfig {
  autoPlay: boolean;
  loopVideos: boolean;
  preloadCount: number;
  qualityPreference: 'hd' | 'sd' | 'auto';
  enableAnalytics: boolean;
  cacheEnabled: boolean;
  cacheSize: number;
}

export interface TrailerEndpoints {
  list: string;
  details: string;
  analytics: string;
}

// ============================================================================
// 📱 TRAILER RESPONSIVE TYPES
// ============================================================================

export interface TrailerDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  isLandscape: boolean;
  isTablet: boolean;
}

export interface TrailerLayout {
  columns: number;
  itemHeight: number;
  spacing: number;
  padding: number;
}

// ============================================================================
// 🎬 TRAILER FEATURE EXPORTS
// ============================================================================

// All types are automatically exported as they are defined as interfaces 