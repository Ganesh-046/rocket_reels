// ============================================================================
// 🎬 TRAILER FEATURE TYPES - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================
// 
// This file contains all TypeScript types and interfaces for the trailer feature.
// All types are designed to be self-contained and portable.
// 
// Usage:
// import { TrailerItem, TrailerListResponse } from './types';
// ============================================================================

// ============================================================================
// 🎯 CORE TRAILER TYPES
// ============================================================================

/**
 * Represents video quality options for trailers
 */
export type TrailerVideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p';

/**
 * Video URLs for different quality levels
 */
export interface TrailerVideoUrls {
  master?: string;
  '1080p'?: string;
  '720p'?: string;
  '480p'?: string;
  '360p'?: string;
}

/**
 * Media information for a trailer
 */
export interface TrailerMedia {
  video_urls: TrailerVideoUrls;
  thumbnail?: string;
  posterImage?: string;
  backdropImage?: string;
}

/**
 * URL structure for trailer content
 */
export interface TrailerUrl {
  video?: string;
  media?: TrailerMedia;
}

/**
 * Target audience information
 */
export interface TrailerTargetAudience {
  name: string;
  description?: string;
  ageGroup?: string;
  interests?: string[];
}

/**
 * Genre information
 */
export interface TrailerGenre {
  name: string;
  slug: string;
  description?: string;
}

/**
 * Main trailer item structure
 */
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
  duration?: number;
  views?: number;
  likes?: number;
  isLiked?: boolean;
}

/**
 * API response structure for trailer list
 */
export interface TrailerListResponse {
  data: {
    trailers: TrailerItem[];
  };
  total?: number;
  page?: number;
  limit?: number;
}

/**
 * Parameters for trailer list requests
 */
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

/**
 * Extended trailer item for player functionality
 */
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
  isLiked?: boolean;
}

/**
 * Player state management
 */
export interface TrailerPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  quality: TrailerVideoQuality;
  showControls: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Props for trailer player component
 */
export interface TrailerPlayerProps {
  episode: TrailerEpisode;
  isPlaying: boolean;
  style?: any;
  isScrolling?: boolean;
  onPauseStateChange?: (isPaused: boolean) => void;
  externalPauseTrigger?: number;
  externalSeekTime?: number;
  onProgress?: (currentTime: number, duration: number) => void;
  onWatchNow?: (item: TrailerEpisode) => void;
  onLike?: (trailerId: string) => void;
  onShare?: (item: TrailerEpisode) => void;
}

// ============================================================================
// 🎯 TRAILER SCREEN TYPES
// ============================================================================

/**
 * Props for trailer screen component
 */
export interface TrailerScreenProps {
  navigation: any;
  route?: any;
}

/**
 * State for trailer screen
 */
export interface TrailerScreenState {
  trailers: TrailerEpisode[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  currentIndex: number;
  hasMore: boolean;
}

// ============================================================================
// 🔧 TRAILER UTILITY TYPES
// ============================================================================

/**
 * Video quality configuration
 */
export interface TrailerQuality {
  label: string;
  value: TrailerVideoQuality;
  url?: string;
}

/**
 * Data processing result
 */
export interface TrailerProcessingResult {
  processed: TrailerEpisode[];
  total: number;
  hasMore: boolean;
}

/**
 * Error structure
 */
export interface TrailerError {
  message: string;
  code?: string;
  details?: any;
}

// ============================================================================
// 📊 TRAILER ANALYTICS TYPES
// ============================================================================

/**
 * View tracking event
 */
export interface TrailerViewEvent {
  trailerId: string;
  userId?: string;
  timestamp: number;
  duration: number;
  quality: TrailerVideoQuality;
}

/**
 * Interaction tracking event
 */
export interface TrailerInteractionEvent {
  trailerId: string;
  userId?: string;
  action: 'like' | 'share' | 'favorite' | 'watch';
  timestamp: number;
}

// ============================================================================
// 🎨 TRAILER UI TYPES
// ============================================================================

/**
 * Props for trailer card component
 */
export interface TrailerCardProps {
  trailer: TrailerEpisode;
  onPress?: (trailer: TrailerEpisode) => void;
  onLike?: (trailerId: string) => void;
  onShare?: (trailer: TrailerEpisode) => void;
}

/**
 * Props for trailer list component
 */
export interface TrailerListProps {
  data: TrailerEpisode[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onItemPress?: (item: TrailerEpisode, index: number) => void;
  error?: TrailerError;
}

// ============================================================================
// 🔄 TRAILER STATE TYPES
// ============================================================================

/**
 * Global trailer state
 */
export interface TrailerState {
  trailers: TrailerEpisode[];
  currentTrailer: TrailerEpisode | null;
  loading: boolean;
  error: TrailerError | null;
  hasMore: boolean;
}

/**
 * Trailer actions interface
 */
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

/**
 * Trailer configuration
 */
export interface TrailerConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  cacheEnabled: boolean;
  cacheTTL: number;
  enableAnalytics: boolean;
}

/**
 * API endpoints configuration
 */
export interface TrailerEndpoints {
  trailers: string;
  trailerDetails: string;
  search: string;
  genres: string;
}

// ============================================================================
// 📱 TRAILER RESPONSIVE TYPES
// ============================================================================

/**
 * Screen dimensions
 */
export interface TrailerDimensions {
  width: number;
  height: number;
  isLargeDevice: boolean;
  isTablet: boolean;
}

/**
 * Layout configuration
 */
export interface TrailerLayout {
  columns: number;
  spacing: number;
  aspectRatio: number;
}

// ============================================================================
// 🎬 TRAILER FEATURE EXPORTS
// ============================================================================

// All types are automatically exported as they are defined as interfaces
// This ensures type safety and developer-friendly imports 