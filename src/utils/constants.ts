// API Constants
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.rocketreels.com',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  CONTENT: {
    HOME: '/content/home',
    DISCOVER: '/content/discover',
    SEARCH: '/content/search',
    DETAILS: '/content/details',
    EPISODES: '/content/episodes',
    GENRES: '/content/genres',
  },
  USER: {
    PROFILE: '/user/profile',
    WATCHLIST: '/user/watchlist',
    HISTORY: '/user/history',
    PREFERENCES: '/user/preferences',
  },
  REELS: {
    FEED: '/reels/feed',
    UPLOAD: '/reels/upload',
    LIKE: '/reels/like',
    COMMENT: '/reels/comment',
    SHARE: '/reels/share',
  },
} as const;

// Theme Colors
export const themeColors = {
  PRIMARYWHITE: '#FFFFFF',
  PRIMARYBLACK: '#000000',
  PRIMARYBG: '#7D2537',
  PRIMARYGRAY: '#808080',
  PRIMARYLIGHTBLACK: '#333333',
  PRIMARYLIGHTBLACKONE: '#666666',
  PRIMARYWHITEFOUR: 'rgba(255, 255, 255, 0.1)',
  TRANSPARENT: 'transparent'
} as const;

// Font Constants
export const APP_FONT_BOLD = 'Montserrat-Bold';
export const APP_FONT_MEDIUM = 'Montserrat-Medium';
export const APP_FONT_REGULAR = 'Montserrat-Regular';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PUSH_NOTIFICATIONS: 'push_notifications',
  VIDEO_QUALITY: 'video_quality',
  AUTO_PLAY: 'auto_play',
  SUBTITLES: 'subtitles',
} as const;

// App Constants
export const APP_CONSTANTS = {
  APP_NAME: 'Rocket Reels',
  APP_VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  SUPPORT_EMAIL: 'support@rocketreels.com',
  PRIVACY_POLICY_URL: 'https://rocketreels.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://rocketreels.com/terms',
} as const;

// Video Constants
export const VIDEO_CONSTANTS = {
  QUALITIES: {
    AUTO: 'auto',
    LOW: '240p',
    MEDIUM: '480p',
    HIGH: '720p',
    HD: '1080p',
    UHD: '4K',
  },
  FORMATS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_CODECS: ['h264', 'h265', 'vp9', 'av1'],
} as const;

// Image Constants
export const IMAGE_CONSTANTS = {
  FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  THUMBNAIL_SIZES: {
    SMALL: { width: 150, height: 150 },
    MEDIUM: { width: 300, height: 300 },
    LARGE: { width: 500, height: 500 },
  },
} as const;

// Validation Constants
export const VALIDATION_CONSTANTS = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    ALLOWED_CHARS: /^[a-zA-Z0-9_]+$/,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
} as const;

// Pagination Constants
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Animation Constants
export const ANIMATION_CONSTANTS = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: {
    NO_INTERNET: 'No internet connection. Please check your network settings.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'Resource not found.',
  },
  VALIDATION: {
    REQUIRED: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PASSWORD: 'Password must be at least 8 characters long.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_URL: 'Please enter a valid URL.',
  },
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
    EMAIL_EXISTS: 'An account with this email already exists.',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  },
  UPLOAD: {
    FILE_TOO_LARGE: 'File size is too large.',
    INVALID_FILE_TYPE: 'Invalid file type.',
    UPLOAD_FAILED: 'Upload failed. Please try again.',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in.',
    REGISTER_SUCCESS: 'Account created successfully.',
    LOGOUT_SUCCESS: 'Successfully logged out.',
    PASSWORD_RESET: 'Password reset email sent.',
  },
  PROFILE: {
    UPDATED: 'Profile updated successfully.',
    PASSWORD_CHANGED: 'Password changed successfully.',
  },
  CONTENT: {
    ADDED_TO_WATCHLIST: 'Added to watchlist.',
    REMOVED_FROM_WATCHLIST: 'Removed from watchlist.',
    LIKED: 'Content liked.',
    UNLIKED: 'Content unliked.',
  },
  UPLOAD: {
    SUCCESS: 'Upload completed successfully.',
  },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_DARK_MODE: true,
  ENABLE_MULTI_LANGUAGE: true,
} as const; 