// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'https://k9456pbd.rocketreel.co.in/api/v1'
    : 'https://k9456pbd.rocketreel.co.in/api/v1',
  TIMEOUT: 30000, // Increased from 10s to 30s
  AUTH_TIMEOUT: 45000, // Special timeout for auth requests
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// API Endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: '/user/signup',
    LOGIN: '/user/login',
    VERIFY_EMAIL: '/user/verifyMail',
    VERIFY_OTP: '/user/verifyOtp',
    RESET_PASSWORD: '/user/resetPassword',
    UPDATE_USER: '/user/updateUser',
    CONFIRM_PASSWORD: '/user/confirmPassword',
    UPDATE_PROFILE: '/user/update',
    DELETE_ACCOUNT: '/user/delete',
    UPDATE_FCM_TOKEN: '/user/updatetoken',
    GET_USER_INFO: '/user/byId',
    GET_PROFILE_LIST: '/user/profile/listProfiles',
    GET_PROFILE_BY_ID: '/user/profile/getProfileById',
    UPDATE_USER_PROFILE: '/user/profile/update',
    GET_ACTIVE_COUNTRIES: '/content/activeCountries',
  },

  // Content
  CONTENT: {
    LIST: '/content/list',
    TRAILER_LIST: '/content/trailerList',
    DETAILS: '/content/details',
    SEASON_LIST: '/content/season/list',
    VIDEO_ACCESS: '/content/video-access',
    WATCH_HISTORY: '/content/getWatchHistory',
    UPDATE_VIEW_COUNT: '/content/updateViewCount',
    ADD_WATCH_HISTORY: '/content/addWatchHistory',
    NEW_RELEASES: '/content/newReleases',
    TOP_TEN: '/content/topTen',
    UPCOMING: '/content/upcomingContent',
    CUSTOMIZED_LIST: '/content/customizedList',
    SPECIAL_INTEREST: '/content/specialInterest/list',
    TARGET_AUDIENCE: '/content/targetAudience/list',
    PROMOTIONAL: '/content/promotional',
    GENRE_LIST: '/content/genre/list',
    SUBGENRE_LIST: '/content/subgenre/list',
    LANGUAGE_LIST: '/content/language/list',
  },

  // User Interactions
  USER_INTERACTIONS: {
    GET_WATCHLIST: '/user/profile/getWatchList',
    GET_WATCHLIST_IDS: '/user/profile/getWatchListId',
    ADD_TO_WATCHLIST: '/user/profile/addToWatchlist',
    REMOVE_FROM_WATCHLIST: '/user/profile/removeFromWatchlist',
    LIKE_DISLIKE: '/user/profile/likedContent',
    GET_LIKED_CONTENT: '/user/profile/getlikedContentId',
    TRAILER_LIKE: '/user/profile/like/trailer',
    GET_TRAILER_LIKES: '/user/profile/like/allTrailer',
  },

  // Rewards
  REWARDS: {
    CHECK_IN_LIST: '/rewards/check-in/list',
    DAILY_CHECK_IN: '/rewards/dailyCheck-In/update-checkInStreak',
    BENEFITS: '/rewards/benefits/benefitList',
    BALANCE: '/rewards/getBalance',
    REWARD_HISTORY: '/rewards/rewardCoins/reward-history',
    ADS_COUNT: '/rewards/adRewards/adsCount',
    UPDATE_AD_STATUS: '/rewards/adRewards/ad-status',
    UNLOCK_COINS: '/rewards/unlockEpisodes/unlock/coins',
    UNLOCK_ADS: '/rewards/unlockEpisodes/unlock/ads',
    UNLOCKED_EPISODES: '/rewards/unlockEpisodes/list',
    GET_UNLOCKED_EPISODE: '/rewards/unlockEpisodes/getEpisodes',
  },

  // Subscription
  SUBSCRIPTION: {
    PLANS: '/subscription/plan/list',
    CREATE_ORDER: '/subscription/payment/createOrder',
    PURCHASE: '/confirm-payment/plan-purchase',
    VIP_SUBSCRIPTIONS: '/rewards/subscription/subscriptionlist',
  },

  // Recharge
  RECHARGE: {
    LIST: '/subscription/recharge/recharge-list',
    CREATE: '/rewards/recharge/create-recharge',
    UPDATE_STATUS: '/rewards/recharge/update/recharge-status',
    HISTORY: '/rewards/recharge/transactionHistory',
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

// Cache TTL (Time To Live) in milliseconds
export const CACHE_TTL = {
  VIDEO_CONTENT: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  STATIC_CONTENT: 30 * 60 * 1000, // 30 minutes
  AUTH_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Device Types
export const DEVICE_TYPES = {
  ANDROID: 'android',
  IOS: 'ios',
  WEB: 'web',
} as const;

// Content Types
export const CONTENT_TYPE = {
  MOVIE: 'movie',
  SERIES: 'series',
  TRAILER: 'trailer',
} as const;

// Target Audience
export const TARGET_AUDIENCE = {
  KIDS: 'kids',
  TEEN: 'teen',
  ADULT: 'adult',
  FAMILY: 'family',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  RECHARGE: 'recharge',
  SUBSCRIPTION: 'subscription',
  REWARD: 'reward',
  UNLOCK: 'unlock',
} as const;

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

// Unlock Methods
export const UNLOCK_METHODS = {
  COINS: 'coins',
  ADS: 'ads',
  SUBSCRIPTION: 'subscription',
} as const; 