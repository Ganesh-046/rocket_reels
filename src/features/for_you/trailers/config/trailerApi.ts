// ============================================================================
// 🎬 TRAILER API CONFIGURATION - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================
// 
// This file contains all API configuration constants and settings for the trailer feature.
// All configurations are designed to be self-contained and portable.
// 
// Usage:
// import { TRAILER_API_CONFIG, TRAILER_ENDPOINTS } from './config/trailerApi';
// ============================================================================

// ============================================================================
// 🎯 CORE API CONFIGURATION
// ============================================================================

/**
 * Main API configuration for trailer feature
 */
export const TRAILER_API_CONFIG = {
  baseURL: __DEV__ 
    ? 'https://k9456pbd.rocketreel.co.in/api/v1'
    : 'https://k9456pbd.rocketreel.co.in/api/v1',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  enableCaching: true,
  enableLogging: __DEV__,
  enableAnalytics: true,
  userAgent: 'RocketReels-TrailerApp/1.0.0',
} as const;

/**
 * API endpoints for trailer feature
 */
export const TRAILER_ENDPOINTS = {
  trailers: '/content/trailerList',
  trailerDetails: '/content/details',
  search: '/content/trailerList',
  genres: '/content/trailerList',
  analytics: '/content/updateViewCount',
  interactions: '/user/profile/like/trailer',
  recommendations: '/content/trailerList',
  trending: '/content/trailerList',
  latest: '/content/trailerList',
} as const;

/**
 * Cache TTL (Time To Live) settings
 */
export const TRAILER_CACHE_TTL = {
  trailers: 5 * 60 * 1000, // 5 minutes
  trailerDetails: 10 * 60 * 1000, // 10 minutes
  genres: 30 * 60 * 1000, // 30 minutes
  search: 2 * 60 * 1000, // 2 minutes
  analytics: 1 * 60 * 1000, // 1 minute
} as const;

// ============================================================================
// 🎯 HTTP CONFIGURATION
// ============================================================================

/**
 * HTTP methods supported by the API
 */
export const TRAILER_HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

/**
 * Content types for API requests
 */
export const TRAILER_CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
} as const;

/**
 * HTTP status codes
 */
export const TRAILER_HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// 🎯 ERROR CODES AND MESSAGES
// ============================================================================

/**
 * API error codes
 */
export const TRAILER_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  // HTTP Status Codes
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API status messages
 */
export const TRAILER_API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle',
} as const;

/**
 * Default error messages
 */
export const TRAILER_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to access this resource.',
  VALIDATION_ERROR: 'Invalid request data. Please check your input.',
  NOT_FOUND_ERROR: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait before trying again.',
  CACHE_ERROR: 'Cache error occurred. Please try again.',
} as const;

// ============================================================================
// 🎯 CONTENT AND MEDIA CONFIGURATION
// ============================================================================

/**
 * Content type configuration
 */
export const TRAILER_CONTENT_TYPE = {
  MOVIE: 'movie',
  SERIES: 'series',
  DOCUMENTARY: 'documentary',
  SHORT_FILM: 'short_film',
  ANIMATION: 'animation',
} as const;

/**
 * Target audience configuration
 */
export const TRAILER_TARGET_AUDIENCE = {
  ALL_AGES: 'all_ages',
  TEEN: 'teen',
  ADULT: 'adult',
  CHILDREN: 'children',
  FAMILY: 'family',
} as const;

/**
 * Device types for analytics
 */
export const TRAILER_DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
  TV: 'tv',
} as const;

/**
 * Video quality options
 */
export const TRAILER_VIDEO_QUALITIES = {
  AUTO: 'auto',
  HD_1080P: '1080p',
  HD_720P: '720p',
  SD_480P: '480p',
  SD_360P: '360p',
} as const;

// ============================================================================
// 🎯 APP AND VERSION CONFIGURATION
// ============================================================================

/**
 * App version information
 */
export const TRAILER_APP_VERSION = {
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  PLATFORM: 'react-native',
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
} as const;

/**
 * Authentication headers
 */
export const TRAILER_AUTH_HEADERS = {
  AUTHORIZATION: 'Authorization',
  BEARER_PREFIX: 'Bearer ',
  API_KEY: 'X-API-Key',
  CLIENT_ID: 'X-Client-ID',
  USER_AGENT: 'User-Agent',
} as const;

// ============================================================================
// 🎯 ANALYTICS AND TRACKING CONFIGURATION
// ============================================================================

/**
 * Analytics event types
 */
export const TRAILER_ANALYTICS_EVENTS = {
  TRAILER_VIEW: 'trailer_view',
  TRAILER_LIKE: 'trailer_like',
  TRAILER_SHARE: 'trailer_share',
  TRAILER_WATCH: 'trailer_watch',
  TRAILER_SKIP: 'trailer_skip',
  QUALITY_CHANGE: 'quality_change',
  SEARCH_PERFORMED: 'search_performed',
  GENRE_SELECTED: 'genre_selected',
} as const;

/**
 * Performance metrics
 */
export const TRAILER_PERFORMANCE_METRICS = {
  LOAD_TIME: 'load_time',
  PLAYBACK_START: 'playback_start',
  BUFFER_TIME: 'buffer_time',
  ERROR_RATE: 'error_rate',
  CACHE_HIT_RATE: 'cache_hit_rate',
} as const;

// ============================================================================
// 🎯 CACHE AND STORAGE CONFIGURATION
// ============================================================================

/**
 * Cache configuration
 */
export const TRAILER_CACHE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_ENTRIES: 100,
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  PERSISTENCE_KEY: 'trailer_cache',
} as const;

/**
 * Storage keys
 */
export const TRAILER_STORAGE_KEYS = {
  USER_PREFERENCES: 'trailer_user_preferences',
  WATCH_HISTORY: 'trailer_watch_history',
  FAVORITES: 'trailer_favorites',
  SETTINGS: 'trailer_settings',
  ANALYTICS: 'trailer_analytics',
} as const;

// ============================================================================
// 🎯 FEATURE FLAGS AND SETTINGS
// ============================================================================

/**
 * Feature flags
 */
export const TRAILER_FEATURE_FLAGS = {
  ENABLE_AUTO_PLAY: true,
  ENABLE_PRELOADING: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CACHING: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_SOCIAL_SHARING: true,
  ENABLE_QUALITY_SELECTION: true,
} as const;

/**
 * Default settings
 */
export const TRAILER_DEFAULT_SETTINGS = {
  AUTO_PLAY: true,
  LOOP_VIDEOS: false,
  PRELOAD_COUNT: 3,
  QUALITY_PREFERENCE: TRAILER_VIDEO_QUALITIES.AUTO,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_SOCIAL_SHARING: true,
} as const;

// ============================================================================
// 🎬 TRAILER API CONFIGURATION EXPORTS
// ============================================================================

// All constants are automatically exported as they are defined with 'export const'
// This ensures easy access and developer-friendly imports 