// ============================================================================
// TRAILER STORAGE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 🎬 TRAILER STORAGE KEYS
// ============================================================================

export const TRAILER_STORAGE_KEYS = {
  VIDEO_QUALITY: 'trailer_video_quality',
  AUTO_PLAY: 'trailer_auto_play',
  LOOP_VIDEOS: 'trailer_loop_videos',
  CURRENT_TRAILER: 'trailer_current_trailer',
  VIEW_HISTORY: 'trailer_view_history',
} as const;

// ============================================================================
// 🎬 TRAILER STORAGE CLASS (In-Memory Implementation)
// ============================================================================

class TrailerStorage {
  private storage = new Map<string, any>();
  private prefix = 'trailer_';

  async set(key: string, value: any): Promise<void> {
    try {
      const prefixedKey = `${this.prefix}${key}`;
      this.storage.set(prefixedKey, value);
      console.log('🎬 TrailerStorage: Set', key, value);
    } catch (error) {
      console.error('🎬 TrailerStorage: Set Error', key, error);
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const prefixedKey = `${this.prefix}${key}`;
      const value = this.storage.get(prefixedKey);
      
      if (value === undefined) {
        return defaultValue || null;
      }
      
      console.log('🎬 TrailerStorage: Get', key, value);
      return value;
    } catch (error) {
      console.error('🎬 TrailerStorage: Get Error', key, error);
      return defaultValue || null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const prefixedKey = `${this.prefix}${key}`;
      this.storage.delete(prefixedKey);
      console.log('🎬 TrailerStorage: Removed', key);
    } catch (error) {
      console.error('🎬 TrailerStorage: Remove Error', key, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keysToDelete: string[] = [];
      for (const key of this.storage.keys()) {
        if (key.startsWith(this.prefix)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => this.storage.delete(key));
      console.log('🎬 TrailerStorage: Cleared all trailer data');
    } catch (error) {
      console.error('🎬 TrailerStorage: Clear Error', error);
    }
  }

  // Trailer-specific methods
  async setVideoQuality(quality: string): Promise<void> {
    await this.set(TRAILER_STORAGE_KEYS.VIDEO_QUALITY, quality);
  }

  async getVideoQuality(): Promise<string> {
    const quality = await this.get<string>(TRAILER_STORAGE_KEYS.VIDEO_QUALITY, '720p');
    return quality || '720p';
  }

  async setAutoPlay(enabled: boolean): Promise<void> {
    await this.set(TRAILER_STORAGE_KEYS.AUTO_PLAY, enabled);
  }

  async getAutoPlay(): Promise<boolean> {
    const autoPlay = await this.get<boolean>(TRAILER_STORAGE_KEYS.AUTO_PLAY, true);
    return autoPlay ?? true;
  }

  async setLoopVideos(enabled: boolean): Promise<void> {
    await this.set(TRAILER_STORAGE_KEYS.LOOP_VIDEOS, enabled);
  }

  async getLoopVideos(): Promise<boolean> {
    const loopVideos = await this.get<boolean>(TRAILER_STORAGE_KEYS.LOOP_VIDEOS, false);
    return loopVideos ?? false;
  }
}

const trailerStorage = new TrailerStorage();

export { TrailerStorage, trailerStorage as default }; 