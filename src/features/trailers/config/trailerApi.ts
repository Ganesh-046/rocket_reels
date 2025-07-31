// ============================================================================
// TRAILER API CONFIGURATION - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// �� TRAILER API CONFIG
// ============================================================================

export const TRAILER_API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'https://k9456pbd.rocketreel.co.in/api/v1'
    : 'https://k9456pbd.rocketreel.co.in/api/v1',
  TIMEOUT: 30000, // 30 seconds
  AUTH_TIMEOUT: 45000, // Special timeout for auth requests
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ============================================================================
// 🎯 TRAILER API ENDPOINTS
// ============================================================================

export const TRAILER_ENDPOINTS = {
  // Content
  CONTENT: {
    TRAILER_LIST: '/content/trailerList',
    DETAILS: '/content/details',
    UPDATE_VIEW_COUNT: '/content/updateViewCount',
  },

  // User Interactions
  USER_INTERACTIONS: {
    TRAILER_LIKE: '/user/profile/like/trailer',
    GET_TRAILER_LIKES: '/user/profile/like/allTrailer',
  },
} as const;

// ============================================================================
// ⏱️ TRAILER CACHE TTL (Time To Live)
// ============================================================================

export const TRAILER_CACHE_TTL = {
  VIDEO_CONTENT: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  STATIC_CONTENT: 30 * 60 * 1000, // 30 minutes
  AUTH_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// ============================================================================
// 🔧 TRAILER HTTP METHODS
// ============================================================================

export const TRAILER_HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// ============================================================================
// 📋 TRAILER CONTENT TYPES
// ============================================================================

export const TRAILER_CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

// ============================================================================
// ⚠️ TRAILER ERROR CODES
// ============================================================================

export const TRAILER_ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// 📊 TRAILER API RESPONSE STATUS
// ============================================================================

export const TRAILER_API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// ============================================================================
// 🎬 TRAILER CONTENT TYPES
// ============================================================================

export const TRAILER_CONTENT_TYPE = {
  MOVIE: 'movie',
  SERIES: 'series',
  TRAILER: 'trailer',
} as const;

// ============================================================================
// 🎯 TRAILER TARGET AUDIENCE
// ============================================================================

export const TRAILER_TARGET_AUDIENCE = {
  KIDS: 'kids',
  TEEN: 'teen',
  ADULT: 'adult',
  FAMILY: 'family',
} as const;

// ============================================================================
// 🔧 TRAILER DEVICE TYPES
// ============================================================================

export const TRAILER_DEVICE_TYPES = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
} as const;

// ============================================================================
// 🎬 TRAILER VIDEO QUALITIES
// ============================================================================

export const TRAILER_VIDEO_QUALITIES = {
  MASTER: 'master',
  HD_1080P: '1080p',
  HD_720P: '720p',
  SD_480P: '480p',
  SD_360P: '360p',
} as const;

// ============================================================================
// 📱 TRAILER APP VERSIONS
// ============================================================================

export const TRAILER_APP_VERSION = '1.0.0';

// ============================================================================
// 🔐 TRAILER AUTHENTICATION
// ============================================================================

export const TRAILER_AUTH_HEADERS = {
  PUBLIC_REQUEST: 'public-request',
  ACCESS_TOKEN: 'accesstoken',
  DEVICE_TYPE: 'device-type',
  APP_VERSION: 'app-version',
} as const; 