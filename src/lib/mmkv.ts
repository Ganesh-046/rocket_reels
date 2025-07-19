import { MMKV } from 'react-native-mmkv';
import { MMKVData } from '../types/api';

// Initialize MMKV storage
export const storage = new MMKV({
  id: 'rocket-reels-storage',
  encryptionKey: 'rocket-reels-encryption-key',
});

// Storage keys
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  WATCHLIST: 'watchlist',
  LIKED_CONTENT: 'liked_content',
  WATCH_HISTORY: 'watch_history',
  SETTINGS: 'settings',
  CACHE: 'cache',
  AUTH_DATA: 'auth_data',
  PROFILE_LIST: 'profile_list',
  BALANCE: 'balance',
  CHECK_IN_STREAK: 'check_in_streak',
  UNLOCKED_EPISODES: 'unlocked_episodes',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  RECHARGE_PLANS: 'recharge_plans',
  GENRES: 'genres',
  LANGUAGES: 'languages',
  COUNTRIES: 'countries',
  BANNERS: 'banners',
} as const;

// MMKV Storage Class
class MMKVStorage {
  // User Data
  static getUser(): MMKVData['user'] | null {
    try {
      const user = storage.getString(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  }

  static setUser(user: MMKVData['user']): void {
    try {
      storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user to storage:', error);
    }
  }

  static removeUser(): void {
    storage.delete(STORAGE_KEYS.USER);
  }

  // Token
  static getToken(): string | null {
    return storage.getString(STORAGE_KEYS.TOKEN) || null;
  }

  static setToken(token: string): void {
    storage.set(STORAGE_KEYS.TOKEN, token);
  }

  static removeToken(): void {
    storage.delete(STORAGE_KEYS.TOKEN);
  }

  // Watchlist
  static getWatchlist(): string[] {
    try {
      const watchlist = storage.getString(STORAGE_KEYS.WATCHLIST);
      return watchlist ? JSON.parse(watchlist) : [];
    } catch (error) {
      console.error('Error getting watchlist from storage:', error);
      return [];
    }
  }

  static setWatchlist(watchlist: string[]): void {
    try {
      storage.set(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error setting watchlist to storage:', error);
    }
  }

  static addToWatchlist(contentId: string): void {
    const watchlist = this.getWatchlist();
    if (!watchlist.includes(contentId)) {
      watchlist.push(contentId);
      this.setWatchlist(watchlist);
    }
  }

  static removeFromWatchlist(contentId: string): void {
    const watchlist = this.getWatchlist();
    const filteredWatchlist = watchlist.filter(id => id !== contentId);
    this.setWatchlist(filteredWatchlist);
  }

  // Liked Content
  static getLikedContent(): string[] {
    try {
      const likedContent = storage.getString(STORAGE_KEYS.LIKED_CONTENT);
      return likedContent ? JSON.parse(likedContent) : [];
    } catch (error) {
      console.error('Error getting liked content from storage:', error);
      return [];
    }
  }

  static setLikedContent(likedContent: string[]): void {
    try {
      storage.set(STORAGE_KEYS.LIKED_CONTENT, JSON.stringify(likedContent));
    } catch (error) {
      console.error('Error setting liked content to storage:', error);
    }
  }

  static toggleLikedContent(contentId: string): void {
    const likedContent = this.getLikedContent();
    const index = likedContent.indexOf(contentId);
    if (index > -1) {
      likedContent.splice(index, 1);
    } else {
      likedContent.push(contentId);
    }
    this.setLikedContent(likedContent);
  }

  // Watch History
  static getWatchHistory(): MMKVData['watchHistory'] {
    try {
      const history = storage.getString(STORAGE_KEYS.WATCH_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting watch history from storage:', error);
      return [];
    }
  }

  static setWatchHistory(history: MMKVData['watchHistory']): void {
    try {
      storage.set(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.error('Error setting watch history to storage:', error);
    }
  }

  static updateWatchProgress(contentId: string, episodeId: string, progress: number): void {
    const history = this.getWatchHistory();
    const existingIndex = history.findIndex(
      item => item.contentId === contentId && item.episodeId === episodeId
    );

    const watchData = {
      _id: existingIndex > -1 ? history[existingIndex]._id : `${contentId}_${episodeId}_${Date.now()}`,
      contentId,
      episodeId,
      duration: 0, // Will be updated by API
      progress,
      lastWatchedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    if (existingIndex > -1) {
      history[existingIndex] = { ...history[existingIndex], ...watchData };
    } else {
      history.push(watchData);
    }

    this.setWatchHistory(history);
  }

  // Settings
  static getSettings(): MMKVData['settings'] {
    try {
      const settings = storage.getString(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {
        isAdult: false,
        language: 'en',
        quality: '720p',
      };
    } catch (error) {
      console.error('Error getting settings from storage:', error);
      return {
        isAdult: false,
        language: 'en',
        quality: '720p',
      };
    }
  }

  static setSettings(settings: Partial<MMKVData['settings']>): void {
    try {
      const currentSettings = this.getSettings();
      const newSettings = { ...currentSettings, ...settings };
      storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error setting settings to storage:', error);
    }
  }

  // Cache Management
  static getCache<T>(key: string): T | null {
    try {
      const cacheData = storage.getString(`${STORAGE_KEYS.CACHE}_${key}`);
      if (!cacheData) return null;

      const parsed = JSON.parse(cacheData);
      const now = Date.now();

      // Check if cache is expired
      if (now - parsed.timestamp > parsed.ttl) {
        this.removeCache(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.error('Error getting cache from storage:', error);
      return null;
    }
  }

  static setCache<T>(key: string, data: T, ttl: number): void {
    try {
      const cacheData = {
        data,
        ttl,
        timestamp: Date.now(),
      };
      storage.set(`${STORAGE_KEYS.CACHE}_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache to storage:', error);
    }
  }

  static removeCache(key: string): void {
    storage.delete(`${STORAGE_KEYS.CACHE}_${key}`);
  }

  static clearCache(): void {
    const keys = storage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE));
    cacheKeys.forEach(key => storage.delete(key));
  }

  // Generic Storage Methods
  static get<T>(key: string): T | null {
    try {
      const data = storage.getString(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  static set<T>(key: string, data: T): void {
    try {
      storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
    }
  }

  static remove(key: string): void {
    storage.delete(key);
  }

  static clear(): void {
    storage.clearAll();
  }

  // Auth Data
  static getAuthData(): { user: MMKVData['user']; token: string } | null {
    try {
      const authData = storage.getString(STORAGE_KEYS.AUTH_DATA);
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Error getting auth data from storage:', error);
      return null;
    }
  }

  static setAuthData(user: MMKVData['user'], token: string): void {
    try {
      const authData = { user, token };
      storage.set(STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
    } catch (error) {
      console.error('Error setting auth data to storage:', error);
    }
  }

  static removeAuthData(): void {
    storage.delete(STORAGE_KEYS.AUTH_DATA);
  }

  // Balance
  static getBalance(): number {
    try {
      const balance = storage.getString(STORAGE_KEYS.BALANCE);
      return balance ? JSON.parse(balance) : 0;
    } catch (error) {
      console.error('Error getting balance from storage:', error);
      return 0;
    }
  }

  static setBalance(balance: number): void {
    try {
      storage.set(STORAGE_KEYS.BALANCE, JSON.stringify(balance));
    } catch (error) {
      console.error('Error setting balance to storage:', error);
    }
  }

  // Check-in Streak
  static getCheckInStreak(): number {
    try {
      const streak = storage.getString(STORAGE_KEYS.CHECK_IN_STREAK);
      return streak ? JSON.parse(streak) : 0;
    } catch (error) {
      console.error('Error getting check-in streak from storage:', error);
      return 0;
    }
  }

  static setCheckInStreak(streak: number): void {
    try {
      storage.set(STORAGE_KEYS.CHECK_IN_STREAK, JSON.stringify(streak));
    } catch (error) {
      console.error('Error setting check-in streak to storage:', error);
    }
  }

  // Utility Methods
  static getAllKeys(): string[] {
    return storage.getAllKeys();
  }

  static contains(key: string): boolean {
    return storage.contains(key);
  }

  static getSize(): number {
    return storage.size;
  }
}

export default MMKVStorage;
