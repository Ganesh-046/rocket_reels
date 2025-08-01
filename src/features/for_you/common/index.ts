// ============================================================================
// FOR YOU COMMON EXPORTS
// ============================================================================
// 
// This file exports all shared components and utilities for the for_you feature.
// These can be used by both episodes and trailers features.
// 
// Usage:
// import { SimpleInstagramVideoPlayer, ApiInterceptor } from '../common';
// ============================================================================

// Shared API Interceptor
export { ApiInterceptor, HTTP_METHODS, CONTENT_TYPES, CACHE_TTL, ERROR_CODES } from './api-interceptor';
export type { ApiResponse, ApiConfig, StorageInterface, RequestConfig, ApiError } from './api-interceptor';

// Shared Video Player Component
export { default as SimpleInstagramVideoPlayer } from './SimpleInstagramVideoPlayer.js';

// Re-export types for convenience
export type { 
  ApiResponse as CommonApiResponse,
  ApiConfig as CommonApiConfig,
  StorageInterface as CommonStorageInterface,
  RequestConfig as CommonRequestConfig,
  ApiError as CommonApiError,
} from './api-interceptor'; 