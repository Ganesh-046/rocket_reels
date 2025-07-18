const BASE_URL = process.env.API_BASE_URL || 'https://api.rocketreels.com';

export const endpoints = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    signup: `${BASE_URL}/auth/signup`,
    refresh: `${BASE_URL}/auth/refresh`,
    logout: `${BASE_URL}/auth/logout`,
    profile: `${BASE_URL}/auth/profile`,
  },
  reels: {
    feed: `${BASE_URL}/reels/feed`,
    trending: `${BASE_URL}/reels/trending`,
    user: `${BASE_URL}/reels/user`,
    like: `${BASE_URL}/reels/like`,
    comment: `${BASE_URL}/reels/comment`,
    share: `${BASE_URL}/reels/share`,
  },
  upload: {
    video: `${BASE_URL}/upload/video`,
    thumbnail: `${BASE_URL}/upload/thumbnail`,
    progress: `${BASE_URL}/upload/progress`,
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
