const BASE_URL = process.env.API_BASE_URL || 'https://k9456pbd.rocketreel.co.in/api/v1';

export const endpoints = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    signup: `${BASE_URL}/auth/signup`,
    refresh: `${BASE_URL}/auth/refresh`,
    logout: `${BASE_URL}/auth/logout`,
    profile: `${BASE_URL}/auth/profile`,
  },
  content: {
    // Core content endpoints
    LIST: `${BASE_URL}/content/list`,
    DETAILS: `${BASE_URL}/content/details`,
    PROMOTIONAL: `${BASE_URL}/content/promotional`,
    TOP_TEN: `${BASE_URL}/content/topTen`,
    NEW_RELEASES: `${BASE_URL}/content/newReleases`,
    UPCOMING: `${BASE_URL}/content/upcomingContent`,
    CUSTOMIZED_LIST: `${BASE_URL}/content/customizedList`,
    TRAILER_LIST: `${BASE_URL}/content/trailerList`,
    
    // Genre and language endpoints
    GENRE_LIST: `${BASE_URL}/content/genre/list`,
    LANGUAGE_LIST: `${BASE_URL}/content/language/list`,
    
    // Search and filter endpoints
    SEARCH: `${BASE_URL}/content/search`,
    BY_GENRE: `${BASE_URL}/content/byGenre`,
    RELATED: `${BASE_URL}/content/related`,
    
    // Watch history
    ADD_WATCH_HISTORY: `${BASE_URL}/content/watchHistory`,
    WATCH_HISTORY: `${BASE_URL}/content/watchHistory`,
  },
  user: {
    PROFILE: `${BASE_URL}/user/byId`,
    UPDATE: `${BASE_URL}/user/update`,
    UPDATE_PUBLIC: `${BASE_URL}/user/updateUser`,
    DELETE: `${BASE_URL}/user/delete`,
    COUNTRIES: `${BASE_URL}/user/countries`,
  },
  userInteractions: {
    GET_WATCHLIST: `${BASE_URL}/user/watchlist`,
    ADD_TO_WATCHLIST: `${BASE_URL}/user/watchlist/add`,
    REMOVE_FROM_WATCHLIST: `${BASE_URL}/user/watchlist/remove`,
    LIKE_DISLIKE: `${BASE_URL}/user/likeDislike`,
    GET_LIKED_CONTENT: `${BASE_URL}/user/likedContent`,
    TRAILER_LIKE: `${BASE_URL}/user/trailerLike`,
    GET_TRAILER_LIKES: `${BASE_URL}/user/trailerLikes`,
  },
  rewards: {
    BALANCE: `${BASE_URL}/rewards/balance`,
    CHECK_IN_LIST: `${BASE_URL}/rewards/checkInList`,
    DAILY_CHECK_IN: `${BASE_URL}/rewards/dailyCheckIn`,
    SUBSCRIPTION_PLANS: `${BASE_URL}/rewards/subscriptionPlans`,
    VIP_PLANS: `${BASE_URL}/rewards/vipPlans`,
    RECHARGE_LIST: `${BASE_URL}/rewards/rechargeList`,
    CREATE_RECHARGE: `${BASE_URL}/rewards/createRecharge`,
    RECHARGE_HISTORY: `${BASE_URL}/rewards/rechargeHistory`,
    REWARD_HISTORY: `${BASE_URL}/rewards/rewardHistory`,
    ADS_COUNT: `${BASE_URL}/rewards/adsCount`,
    UPDATE_AD_STATUS: `${BASE_URL}/rewards/updateAdStatus`,
    UNLOCK_EPISODE_COINS: `${BASE_URL}/rewards/unlockEpisodeCoins`,
    UNLOCK_EPISODE_ADS: `${BASE_URL}/rewards/unlockEpisodeAds`,
    UNLOCKED_EPISODES: `${BASE_URL}/rewards/unlockedEpisodes`,
  },
  upload: {
    FILE: `${BASE_URL}/upload/file`,
  },
  analytics: {
    TRACK_EVENT: `${BASE_URL}/analytics/trackEvent`,
    TRACK_CONTENT_VIEW: `${BASE_URL}/analytics/trackContentView`,
    TRACK_PURCHASE: `${BASE_URL}/analytics/trackPurchase`,
  },
  reels: {
    feed: `${BASE_URL}/reels/feed`,
    trending: `${BASE_URL}/reels/trending`,
    user: `${BASE_URL}/reels/user`,
    like: `${BASE_URL}/reels/like`,
    comment: `${BASE_URL}/reels/comment`,
    share: `${BASE_URL}/reels/share`,
  },
  discover: {
    categories: `${BASE_URL}/discover/categories`,
    search: `${BASE_URL}/discover/search`,
    trending: `${BASE_URL}/discover/trending`,
  },
  profile: {
    user: `${BASE_URL}/profile/user`,
    update: `${BASE_URL}/profile/update`,
    stats: `${BASE_URL}/profile/stats`,
    followers: `${BASE_URL}/profile/followers`,
    following: `${BASE_URL}/profile/following`,
  },
};
