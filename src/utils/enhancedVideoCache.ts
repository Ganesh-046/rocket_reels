import RNFS from 'react-native-fs';
import { MMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

// Initialize MMKV for cache metadata
const cacheStorage = new MMKV();

interface CacheMetadata {
  id: string;
  url: string;
  path: string;
  size: number;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
}

interface CacheConfig {
  maxSize: number; // in bytes (default: 500MB)
  maxAge: number; // in milliseconds (default: 7 days)
  preloadCount: number; // number of videos to preload
  cleanupThreshold: number; // percentage of max size to trigger cleanup
}

class EnhancedVideoCache {
  private cacheDir: string;
  private metadata: Map<string, CacheMetadata> = new Map();
  private config: CacheConfig;
  private isInitialized = false;
  private cleanupPromise: Promise<void> | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 500 * 1024 * 1024, // 500MB
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      preloadCount: 3,
      cleanupThreshold: 0.8, // 80%
      ...config,
    };

    this.cacheDir = `${RNFS.CachesDirectoryPath}/videos`;
    this.initCache();
  }

  private async initCache() {
    if (this.isInitialized) return;

    try {
      // Create cache directory if it doesn't exist
      const dirExists = await RNFS.exists(this.cacheDir);
      if (!dirExists) {
        await RNFS.mkdir(this.cacheDir);
      }

      // Load metadata from MMKV
      this.loadMetadata();

      // Perform initial cleanup
      await this.cleanup();

      this.isInitialized = true;
      console.log('🎬 Enhanced video cache initialized');
    } catch (error) {
      console.error('Failed to initialize video cache:', error);
    }
  }

  private loadMetadata() {
    try {
      const saved = cacheStorage.getString('videoCacheMetadata');
      if (saved) {
        const parsed = JSON.parse(saved) as [string, CacheMetadata][];
        this.metadata = new Map(parsed);
      }
    } catch (error) {
      console.error('Failed to load cache metadata:', error);
      this.metadata = new Map();
    }
  }

  private saveMetadata() {
    try {
      const serialized = JSON.stringify(Array.from(this.metadata.entries()));
      cacheStorage.set('videoCacheMetadata', serialized);
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }

  async getCachedVideo(videoId: string): Promise<string | null> {
    await this.initCache();

    try {
      const metadata = this.metadata.get(videoId);
      if (!metadata) return null;

      // Check if file exists
      const exists = await RNFS.exists(metadata.path);
      if (!exists) {
        this.metadata.delete(videoId);
        this.saveMetadata();
        return null;
      }

      // Update access metadata
      metadata.lastAccessed = Date.now();
      metadata.accessCount++;
      this.saveMetadata();

      return metadata.path;
    } catch (error) {
      console.error('Error checking cached video:', error);
      return null;
    }
  }

  async cacheVideo(videoUrl: string, videoId: string, priority: 'high' | 'low' = 'low'): Promise<string> {
    await this.initCache();

    try {
      // Check if already cached
      const cachedPath = await this.getCachedVideo(videoId);
      if (cachedPath) {
        return cachedPath;
      }

      // Check cache size and cleanup if needed
      await this.ensureCacheSpace();

      const videoPath = `${this.cacheDir}/${videoId}.mp4`;
      
      // Download with optimized settings
      const downloadResult = await RNFS.downloadFile({
        fromUrl: videoUrl,
        toFile: videoPath,
        background: true,
        discretionary: priority === 'low',
        progress: (res) => {
          const progressPercent = (res.bytesWritten / res.contentLength) * 100;
          if (progressPercent % 25 === 0) { // Log every 25%
            console.log(`📥 Downloading ${videoId}: ${progressPercent.toFixed(0)}%`);
          }
        },
        headers: {
          'Cache-Control': 'max-age=3600',
          'Accept-Encoding': 'gzip, deflate',
          'User-Agent': 'RocketReels/1.0',
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        // Get file size
        const stats = await RNFS.stat(videoPath);
        
        // Save metadata
        const metadata: CacheMetadata = {
          id: videoId,
          url: videoUrl,
          path: videoPath,
          size: stats.size,
          timestamp: Date.now(),
          lastAccessed: Date.now(),
          accessCount: 1,
        };

        this.metadata.set(videoId, metadata);
        this.saveMetadata();

        console.log(`✅ Video cached: ${videoId} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        return videoPath;
      }
    } catch (error) {
      console.error('Video caching error:', error);
    }

    return videoUrl; // Fallback to original URL
  }

  async preloadVideos(videos: Array<{ id: string; url: string }>): Promise<void> {
    await this.initCache();

    const preloadPromises = videos.map(video => 
      this.cacheVideo(video.url, video.id, 'low')
    );

    try {
      await Promise.allSettled(preloadPromises);
      console.log(`🚀 Preloaded ${videos.length} videos`);
    } catch (error) {
      console.error('Preload error:', error);
    }
  }

  private async ensureCacheSpace(): Promise<void> {
    const currentSize = await this.getCacheSize();
    const threshold = this.config.maxSize * this.config.cleanupThreshold;

    if (currentSize > threshold) {
      console.log(`🧹 Cache cleanup triggered (${(currentSize / 1024 / 1024).toFixed(2)}MB > ${(threshold / 1024 / 1024).toFixed(2)}MB)`);
      await this.cleanup();
    }
  }

  private async cleanup(): Promise<void> {
    if (this.cleanupPromise) {
      return this.cleanupPromise;
    }

    this.cleanupPromise = this.performCleanup();
    await this.cleanupPromise;
    this.cleanupPromise = null;
  }

  private async performCleanup(): Promise<void> {
    try {
      const now = Date.now();
      const entries = Array.from(this.metadata.entries());
      
      // Sort by access count and last accessed time (LRU)
      entries.sort(([, a], [, b]) => {
        if (a.accessCount !== b.accessCount) {
          return a.accessCount - b.accessCount;
        }
        return a.lastAccessed - b.lastAccessed;
      });

      let currentSize = await this.getCacheSize();
      const targetSize = this.config.maxSize * 0.7; // Reduce to 70% of max size

      for (const [id, metadata] of entries) {
        if (currentSize <= targetSize) break;

        try {
          await RNFS.unlink(metadata.path);
          this.metadata.delete(id);
          currentSize -= metadata.size;
          console.log(`🗑️ Cleaned up video: ${id}`);
        } catch (error) {
          console.error(`Failed to cleanup video ${id}:`, error);
        }
      }

      this.saveMetadata();
      console.log(`🧹 Cache cleanup completed. Size: ${(currentSize / 1024 / 1024).toFixed(2)}MB`);
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      let totalSize = 0;
      for (const metadata of this.metadata.values()) {
        totalSize += metadata.size;
      }
      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  async getCacheStats(): Promise<{
    totalSize: number;
    videoCount: number;
    oldestVideo: string | null;
    mostAccessed: string | null;
  }> {
    const totalSize = await this.getCacheSize();
    const videoCount = this.metadata.size;

    let oldestVideo: string | null = null;
    let mostAccessed: string | null = null;
    let oldestTime = Date.now();
    let maxAccess = 0;

    for (const [id, metadata] of this.metadata.entries()) {
      if (metadata.timestamp < oldestTime) {
        oldestTime = metadata.timestamp;
        oldestVideo = id;
      }
      if (metadata.accessCount > maxAccess) {
        maxAccess = metadata.accessCount;
        mostAccessed = id;
      }
    }

    return {
      totalSize,
      videoCount,
      oldestVideo,
      mostAccessed,
    };
  }

  async clearCache(): Promise<void> {
    try {
      // Delete all cached files
      const files = await RNFS.readDir(this.cacheDir);
      const deletePromises = files
        .filter(file => file.name.endsWith('.mp4'))
        .map(file => RNFS.unlink(file.path));
      
      await Promise.allSettled(deletePromises);
      
      // Clear metadata
      this.metadata.clear();
      this.saveMetadata();
      
      console.log('🗑️ Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async removeVideo(videoId: string): Promise<void> {
    try {
      const metadata = this.metadata.get(videoId);
      if (metadata) {
        await RNFS.unlink(metadata.path);
        this.metadata.delete(videoId);
        this.saveMetadata();
        console.log(`🗑️ Removed video from cache: ${videoId}`);
      }
    } catch (error) {
      console.error(`Error removing video ${videoId}:`, error);
    }
  }
}

// Export singleton instance
export const enhancedVideoCache = new EnhancedVideoCache();

// Export types for external use
export type { CacheMetadata, CacheConfig }; 