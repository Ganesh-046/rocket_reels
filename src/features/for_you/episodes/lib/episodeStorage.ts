// ============================================================================
// EPISODE STORAGE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// ============================================================================
// 🎬 EPISODE STORAGE KEYS
// ============================================================================

export const EPISODE_STORAGE_KEYS = {
  VIDEO_QUALITY: 'episode_video_quality',
  AUTO_PLAY: 'episode_auto_play',
  LOOP_VIDEOS: 'episode_loop_videos',
  CURRENT_EPISODE: 'episode_current_episode',
  VIEW_HISTORY: 'episode_view_history',
  PROGRESS_DATA: 'episode_progress_data',
  LIKE_STATES: 'episode_like_states',
} as const;

// ============================================================================
// 🎬 EPISODE STORAGE CLASS (In-Memory Implementation)
// ============================================================================

class EpisodeStorage {
  private storage = new Map<string, any>();
  private prefix = 'episode_';

  async set(key: string, value: any): Promise<void> {
    try {
      const prefixedKey = `${this.prefix}${key}`;
      this.storage.set(prefixedKey, value);
      console.log('🎬 EpisodeStorage: Set', key, value);
    } catch (error) {
      console.error('🎬 EpisodeStorage: Set Error', key, error);
    }
  }

  async get<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const prefixedKey = `${this.prefix}${key}`;
      const value = this.storage.get(prefixedKey);
      
      if (value === undefined) {
        return defaultValue || null;
      }
      
      console.log('🎬 EpisodeStorage: Get', key, value);
      return value;
    } catch (error) {
      console.error('🎬 EpisodeStorage: Get Error', key, error);
      return defaultValue || null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      const prefixedKey = `${this.prefix}${key}`;
      this.storage.delete(prefixedKey);
      console.log('🎬 EpisodeStorage: Removed', key);
    } catch (error) {
      console.error('🎬 EpisodeStorage: Remove Error', key, error);
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
      console.log('🎬 EpisodeStorage: Cleared all episode data');
    } catch (error) {
      console.error('🎬 EpisodeStorage: Clear Error', error);
    }
  }

  // Episode-specific methods
  async setVideoQuality(quality: string): Promise<void> {
    await this.set(EPISODE_STORAGE_KEYS.VIDEO_QUALITY, quality);
  }

  async getVideoQuality(): Promise<string> {
    const quality = await this.get<string>(EPISODE_STORAGE_KEYS.VIDEO_QUALITY, '720p');
    return quality || '720p';
  }

  async setAutoPlay(enabled: boolean): Promise<void> {
    await this.set(EPISODE_STORAGE_KEYS.AUTO_PLAY, enabled);
  }

  async getAutoPlay(): Promise<boolean> {
    const autoPlay = await this.get<boolean>(EPISODE_STORAGE_KEYS.AUTO_PLAY, true);
    return autoPlay ?? true;
  }

  async setLoopVideos(enabled: boolean): Promise<void> {
    await this.set(EPISODE_STORAGE_KEYS.LOOP_VIDEOS, enabled);
  }

  async getLoopVideos(): Promise<boolean> {
    const loopVideos = await this.get<boolean>(EPISODE_STORAGE_KEYS.LOOP_VIDEOS, false);
    return loopVideos ?? false;
  }

  async setCurrentEpisode(episodeId: string): Promise<void> {
    await this.set(EPISODE_STORAGE_KEYS.CURRENT_EPISODE, episodeId);
  }

  async getCurrentEpisode(): Promise<string | null> {
    return await this.get<string>(EPISODE_STORAGE_KEYS.CURRENT_EPISODE);
  }

  async setViewHistory(history: Record<string, any>): Promise<void> {
    await this.set(EPISODE_STORAGE_KEYS.VIEW_HISTORY, history);
  }

  async getViewHistory(): Promise<Record<string, any> | null> {
    return await this.get<Record<string, any>>(EPISODE_STORAGE_KEYS.VIEW_HISTORY);
  }

  async setProgressData(progressData: Record<string, any>): Promise<void> {
    await this.set(EPISODE_STORAGE_KEYS.PROGRESS_DATA, progressData);
  }

  async getProgressData(): Promise<Record<string, any> | null> {
    return await this.get<Record<string, any>>(EPISODE_STORAGE_KEYS.PROGRESS_DATA);
  }

  async setLikeStates(likeStates: Record<string, boolean>): Promise<void> {
    await this.set(EPISODE_STORAGE_KEYS.LIKE_STATES, likeStates);
  }

  async getLikeStates(): Promise<Record<string, boolean> | null> {
    return await this.get<Record<string, boolean>>(EPISODE_STORAGE_KEYS.LIKE_STATES);
  }

  // Utility methods
  async hasKey(key: string): Promise<boolean> {
    const prefixedKey = `${this.prefix}${key}`;
    return this.storage.has(prefixedKey);
  }

  async getAllKeys(): Promise<string[]> {
    const keys: string[] = [];
    for (const key of this.storage.keys()) {
      if (key.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  async getSize(): Promise<number> {
    let count = 0;
    for (const key of this.storage.keys()) {
      if (key.startsWith(this.prefix)) {
        count++;
      }
    }
    return count;
  }
}

// Create and export singleton instance
const episodeStorage = new EpisodeStorage();
export default episodeStorage; 