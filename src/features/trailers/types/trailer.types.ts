export interface Trailer {
  _id: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: number;
  video_urls: {
    '1080p': string;
    '720p': string;
    '480p': string;
    '360p': string;
    master: string;
  };
  contentId: string;
  episodeNo?: number;
  language: string;
  genre: string;
  releaseDate?: string;
  rating?: number;
  viewCount?: number;
  likeCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  status: 'locked' | 'unlocked';
  createdAt: string;
  updatedAt: string;
}

export interface TrailerPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  quality: '1080p' | '720p' | '480p' | '360p' | 'auto';
  showControls: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export interface TrailerListState {
  trailers: Trailer[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  currentPage: number;
  hasMore: boolean;
  refreshing: boolean;
}

export interface TrailerFilters {
  genre?: string;
  language?: string;
  quality?: string;
  duration?: 'short' | 'medium' | 'long';
  sortBy?: 'newest' | 'popular' | 'rating' | 'title';
}

export interface TrailerPlayerProps {
  trailer: Trailer;
  isPlaying: boolean;
  style?: any;
  isScrolling?: boolean;
  onPauseStateChange?: (isPaused: boolean) => void;
  externalPauseTrigger?: number;
  externalSeekTime?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onWatchNow?: (trailer: Trailer) => void;
  onLike?: (trailerId: string) => void;
  onShare?: (trailer: Trailer) => void;
  onError?: (error: string) => void;
}

export interface TrailerCardProps {
  trailer: Trailer;
  onPress?: (trailer: Trailer) => void;
  onLike?: (trailerId: string) => void;
  onShare?: (trailer: Trailer) => void;
  style?: any;
}

export interface TrailerListProps {
  trailers: Trailer[];
  onTrailerPress?: (trailer: Trailer) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  style?: any;
}

export interface TrailerControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  showControls: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onQualityChange?: (quality: string) => void;
  onFullscreen?: () => void;
  onBack?: () => void;
  style?: any;
}

export interface TrailerServiceResponse {
  success: boolean;
  data?: Trailer[] | Trailer;
  message?: string;
  error?: string;
}

export interface TrailerCacheItem {
  id: string;
  url: string;
  quality: string;
  timestamp: number;
  size: number;
}

export interface TrailerOptimizationConfig {
  preloadEnabled: boolean;
  maxPreloadCount: number;
  preloadDistance: number;
  instantPlayEnabled: boolean;
  aggressivePreloading: boolean;
  cacheEnabled: boolean;
  maxCacheSize: number;
} 