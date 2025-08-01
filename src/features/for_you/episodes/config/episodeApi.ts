// ============================================================================
// EPISODE API CONFIGURATION - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 🎬 EPISODE API CONFIG
// ============================================================================

export const EPISODE_API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'https://k9456pbd.rocketreel.co.in/api/v1'
    : 'https://k9456pbd.rocketreel.co.in/api/v1',
  TIMEOUT: 30000, // 30 seconds
  AUTH_TIMEOUT: 45000, // Special timeout for auth requests
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ============================================================================
// 🎯 EPISODE API ENDPOINTS
// ============================================================================

export const EPISODE_ENDPOINTS = {
  // Content
  CONTENT: {
    EPISODE_LIST: '/content/episodes',
    EPISODE_DETAILS: '/content/episode/details',
    UPDATE_VIEW_COUNT: '/content/updateViewCount',
  },

  // User Interactions
  USER_INTERACTIONS: {
    EPISODE_LIKE: '/user/profile/like/episode',
    GET_EPISODE_LIKES: '/user/profile/like/allEpisode',
  },
} as const;

// ============================================================================
// ⏱️ EPISODE CACHE TTL (Time To Live)
// ============================================================================

export const EPISODE_CACHE_TTL = {
  VIDEO_CONTENT: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  STATIC_CONTENT: 30 * 60 * 1000, // 30 minutes
  AUTH_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// ============================================================================
// 🔧 EPISODE HTTP METHODS
// ============================================================================

export const EPISODE_HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// ============================================================================
// 📋 EPISODE CONTENT TYPES
// ============================================================================

export const EPISODE_CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

// ============================================================================
// ⚠️ EPISODE ERROR CODES
// ============================================================================

export const EPISODE_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// 📊 EPISODE API RESPONSE STATUS
// ============================================================================

export const EPISODE_API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// ============================================================================
// 🎬 EPISODE CONTENT TYPES
// ============================================================================

export const EPISODE_CONTENT_TYPE = {
  MOVIE: 'movie',
  SERIES: 'series',
  EPISODE: 'episode',
} as const;

// ============================================================================
// 🎯 EPISODE TARGET AUDIENCE
// ============================================================================

export const EPISODE_TARGET_AUDIENCE = {
  KIDS: 'kids',
  TEEN: 'teen',
  ADULT: 'adult',
  FAMILY: 'family',
} as const;

// ============================================================================
// 🔧 EPISODE DEVICE TYPES
// ============================================================================

export const EPISODE_DEVICE_TYPES = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
} as const;

// ============================================================================
// 🎬 EPISODE VIDEO QUALITIES
// ============================================================================

export const EPISODE_VIDEO_QUALITIES = {
  MASTER: 'master',
  HD_1080P: '1080p',
  HD_720P: '720p',
  SD_480P: '480p',
  SD_360P: '360p',
} as const;

// ============================================================================
// 📱 EPISODE APP VERSIONS
// ============================================================================

export const EPISODE_APP_VERSION = '1.0.0';

// ============================================================================
// 🔐 EPISODE AUTHENTICATION
// ============================================================================

export const EPISODE_AUTH_HEADERS = {
  PUBLIC_REQUEST: 'public-request',
  ACCESS_TOKEN: 'accesstoken',
  DEVICE_TYPE: 'device-type',
  APP_VERSION: 'app-version',
} as const; 