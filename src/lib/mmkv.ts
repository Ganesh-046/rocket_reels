import { MMKV } from 'react-native-mmkv';
import { UserProfile } from '../types/api';

// Global initialization guard
let isReactNativeReady = false;

export const setReactNativeReady = (ready: boolean = true) => {
  isReactNativeReady = ready;
  console.log('[MMKV] React Native ready state:', ready);
};

// Lazy initialization of MMKV storage
let storageInstance: MMKV | null = null;

const getStorage = (): MMKV => {
  if (!isReactNativeReady) {
    console.warn('[MMKV] React Native not ready yet, delaying MMKV initialization');
    throw new Error('React Native is not ready yet. Please wait for initialization.');
  }
  
  if (!storageInstance) {
    try {
      console.log('[MMKV] Initializing MMKV storage...');
      storageInstance = new MMKV({
        id: 'rocket-reels-storage',
        encryptionKey: 'rocket-reels-encryption-key',
      });
      console.log('[MMKV] MMKV storage initialized successfully');
    } catch (error) {
      console.warn('[MMKV] MMKV initialization failed:', error);
      throw new Error('MMKV not available - React Native may not be ready');
    }
  }
  return storageInstance;
};

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
  static getUser(): UserProfile | null {
    try {
      const storage = getStorage();
      const user = storage.getString(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.warn('[MMKV] Failed to get user:', error);
      return null;
    }
  }

  static setUser(user: UserProfile): void {
    try {
      const storage = getStorage();
      storage.set(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.warn('[MMKV] Failed to set user:', error);
    }
  }

  static removeUser(): void {
    try {
      const storage = getStorage();
      storage.delete(STORAGE_KEYS.USER);
    } catch (error) {
      console.warn('[MMKV] Failed to remove user:', error);
    }
  }

  // Token Management
  static getToken(): string | null {
    try {
      const storage = getStorage();
      return storage.getString(STORAGE_KEYS.TOKEN) || null;
    } catch (error) {
      console.warn('[MMKV] Failed to get token:', error);
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      const storage = getStorage();
      storage.set(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.warn('[MMKV] Failed to set token:', error);
    }
  }

  static removeToken(): void {
    try {
      const storage = getStorage();
      storage.delete(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.warn('[MMKV] Failed to remove token:', error);
    }
  }

  // Auth Data (Combined user and token)
  static getAuthData(): { user: UserProfile; token: string } | null {
    try {
      const storage = getStorage();
      const authData = storage.getString(STORAGE_KEYS.AUTH_DATA);
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.warn('[MMKV] Failed to get auth data:', error);
      return null;
    }
  }

  static setAuthData(user: UserProfile, token: string): void {
    try {
      const storage = getStorage();
      const authData = { user, token };
      storage.set(STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
      // Also store individually for backward compatibility
      this.setUser(user);
      this.setToken(token);
    } catch (error) {
      console.warn('[MMKV] Failed to set auth data:', error);
    }
  }

  static removeAuthData(): void {
    try {
      const storage = getStorage();
      storage.delete(STORAGE_KEYS.AUTH_DATA);
      this.removeUser();
      this.removeToken();
    } catch (error) {
      console.warn('[MMKV] Failed to remove auth data:', error);
    }
  }

  // Generic storage methods
  static get(key: string): any {
    try {
      const storage = getStorage();
      const value = storage.getString(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`[MMKV] Failed to get key "${key}":`, error);
      return null;
    }
  }

  static set(key: string, value: any): void {
    try {
      const storage = getStorage();
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[MMKV] Failed to set key "${key}":`, error);
    }
  }

  static remove(key: string): void {
    try {
      const storage = getStorage();
      storage.delete(key);
    } catch (error) {
      console.warn(`[MMKV] Failed to remove key "${key}":`, error);
    }
  }

  // Watchlist Management
  static getWatchlist(): string[] {
    try {
      const storage = getStorage();
      const watchlist = storage.getString(STORAGE_KEYS.WATCHLIST);
      return watchlist ? JSON.parse(watchlist) : [];
    } catch (error) {
      console.warn('[MMKV] Failed to get watchlist:', error);
      return [];
    }
  }

  static setWatchlist(watchlist: string[]): void {
    try {
      const storage = getStorage();
      storage.set(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch (error) {
      console.warn('[MMKV] Failed to set watchlist:', error);
    }
  }

  static addToWatchlist(contentId: string): void {
    try {
      const watchlist = this.getWatchlist();
      if (!watchlist.includes(contentId)) {
        watchlist.push(contentId);
        this.setWatchlist(watchlist);
      }
    } catch (error) {
      console.warn('[MMKV] Failed to add to watchlist:', error);
    }
  }

  static removeFromWatchlist(contentId: string): void {
    try {
      const watchlist = this.getWatchlist();
      const filtered = watchlist.filter(id => id !== contentId);
      this.setWatchlist(filtered);
    } catch (error) {
      console.warn('[MMKV] Failed to remove from watchlist:', error);
    }
  }

  // Liked Content Management
  static getLikedContent(): string[] {
    try {
      const storage = getStorage();
      const liked = storage.getString(STORAGE_KEYS.LIKED_CONTENT);
      return liked ? JSON.parse(liked) : [];
    } catch (error) {
      console.warn('[MMKV] Failed to get liked content:', error);
      return [];
    }
  }

  static setLikedContent(liked: string[]): void {
    try {
      const storage = getStorage();
      storage.set(STORAGE_KEYS.LIKED_CONTENT, JSON.stringify(liked));
    } catch (error) {
      console.warn('[MMKV] Failed to set liked content:', error);
    }
  }

  static addLikedContent(contentId: string): void {
    try {
      const liked = this.getLikedContent();
      if (!liked.includes(contentId)) {
        liked.push(contentId);
        this.setLikedContent(liked);
      }
    } catch (error) {
      console.warn('[MMKV] Failed to add liked content:', error);
    }
  }

  static removeLikedContent(contentId: string): void {
    try {
      const liked = this.getLikedContent();
      const filtered = liked.filter(id => id !== contentId);
      this.setLikedContent(filtered);
    } catch (error) {
      console.warn('[MMKV] Failed to remove liked content:', error);
    }
  }

  // Watch History Management
  static getWatchHistory(): string[] {
    try {
      const storage = getStorage();
      const history = storage.getString(STORAGE_KEYS.WATCH_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.warn('[MMKV] Failed to get watch history:', error);
      return [];
    }
  }

  static setWatchHistory(history: string[]): void {
    try {
      const storage = getStorage();
      storage.set(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(history));
    } catch (error) {
      console.warn('[MMKV] Failed to set watch history:', error);
    }
  }

  static addToWatchHistory(contentId: string): void {
    try {
      const history = this.getWatchHistory();
      // Remove if already exists (to move to front)
      const filtered = history.filter(id => id !== contentId);
      // Add to beginning
      filtered.unshift(contentId);
      // Keep only last 100 items
      const limited = filtered.slice(0, 100);
      this.setWatchHistory(limited);
    } catch (error) {
      console.warn('[MMKV] Failed to add to watch history:', error);
    }
  }

  // Watch Progress Management
  static updateWatchProgress(contentId: string, episodeId: string, progress: number): void {
    try {
      const storage = getStorage();
      const progressKey = `watchProgress_${contentId}_${episodeId}`;
      const progressData = {
        contentId,
        episodeId,
        progress,
        timestamp: Date.now(),
      };
      storage.set(progressKey, JSON.stringify(progressData));
    } catch (error) {
      console.warn('[MMKV] Failed to update watch progress:', error);
    }
  }

  static getWatchProgress(contentId: string, episodeId: string): number {
    try {
      const storage = getStorage();
      const progressKey = `watchProgress_${contentId}_${episodeId}`;
      const progressData = storage.getString(progressKey);
      if (progressData) {
        const parsed = JSON.parse(progressData);
        return parsed.progress || 0;
      }
      return 0;
    } catch (error) {
      console.warn('[MMKV] Failed to get watch progress:', error);
      return 0;
    }
  }

  // Settings Management
  static getSettings(): any {
    try {
      const storage = getStorage();
      const settings = storage.getString(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.warn('[MMKV] Failed to get settings:', error);
      return {};
    }
  }

  static setSettings(settings: any): void {
    try {
      const storage = getStorage();
      storage.set(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.warn('[MMKV] Failed to set settings:', error);
    }
  }

  static updateSettings(updates: any): void {
    try {
      const settings = this.getSettings();
      const updated = { ...settings, ...updates };
      this.setSettings(updated);
    } catch (error) {
      console.warn('[MMKV] Failed to update settings:', error);
    }
  }

  // Cache Management
  static getCache(key: string): any {
    try {
      const storage = getStorage();
      const cacheKey = `${STORAGE_KEYS.CACHE}_${key}`;
      const cached = storage.getString(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is expired
        if (data.expiry && Date.now() > data.expiry) {
          storage.delete(cacheKey);
          return null;
        }
        return data.value;
      }
      return null;
    } catch (error) {
      console.warn(`[MMKV] Failed to get cache for key "${key}":`, error);
      return null;
    }
  }

  static setCache(key: string, value: any, ttl: number = 3600000): void {
    try {
      const storage = getStorage();
      const cacheKey = `${STORAGE_KEYS.CACHE}_${key}`;
      const cacheData = {
        value,
        expiry: Date.now() + ttl,
      };
      storage.set(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn(`[MMKV] Failed to set cache for key "${key}":`, error);
    }
  }

  static removeCache(key: string): void {
    try {
      const storage = getStorage();
      const cacheKey = `${STORAGE_KEYS.CACHE}_${key}`;
      storage.delete(cacheKey);
    } catch (error) {
      console.warn(`[MMKV] Failed to remove cache for key "${key}":`, error);
    }
  }

  static clearCache(): void {
    try {
      const storage = getStorage();
      const keys = storage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE));
      cacheKeys.forEach(key => storage.delete(key));
    } catch (error) {
      console.warn('[MMKV] Failed to clear cache:', error);
    }
  }

  // Get storage size (approximate)
  static getSize(): number {
    try {
      const storage = getStorage();
      const keys = storage.getAllKeys();
      let totalSize = 0;
      
      keys.forEach(key => {
        const value = storage.getString(key);
        if (value) {
          totalSize += key.length + value.length;
        }
      });
      
      return totalSize;
    } catch (error) {
      console.warn('[MMKV] Failed to get storage size:', error);
      return 0;
    }
  }

  // Clear all data
  static clearAll(): void {
    try {
      const storage = getStorage();
      storage.clearAll();
    } catch (error) {
      console.warn('[MMKV] Failed to clear all MMKV data:', error);
    }
  }
}

export default MMKVStorage;
