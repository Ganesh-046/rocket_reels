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
    } catch (error) {
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
      this.metadata = new Map();
    }
  }

  private saveMetadata() {
    try {
      const serialized = JSON.stringify(Array.from(this.metadata.entries()));
      cacheStorage.set('videoCacheMetadata', serialized);
    } catch (error) {
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

        return videoPath;
      }
    } catch (error) {
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
    } catch (error) {
    }
  }

  private async ensureCacheSpace(): Promise<void> {
    const currentSize = await this.getCacheSize();
    const threshold = this.config.maxSize * this.config.cleanupThreshold;

    if (currentSize > threshold) {
      await this.cleanup();
    }
  }

  // Public cleanup method for external access
  async cleanup(): Promise<void> {
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
        } catch (error) {
        }
      }

      this.saveMetadata();
    } catch (error) {
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const entries = Array.from(this.metadata.values());
      return entries.reduce((total, metadata) => total + metadata.size, 0);
    } catch (error) {
      return 0;
    }
  }

  async getCacheStats(): Promise<{
    totalSize: number;
    videoCount: number;
    oldestVideo: string | null;
    mostAccessed: string | null;
  }> {
    try {
      const entries = Array.from(this.metadata.entries());
      const totalSize = await this.getCacheSize();
      
      let oldestVideo: string | null = null;
      let mostAccessed: string | null = null;
      let oldestTime = Date.now();
      let maxAccessCount = 0;

      for (const [id, metadata] of entries) {
        if (metadata.timestamp < oldestTime) {
          oldestTime = metadata.timestamp;
          oldestVideo = id;
        }
        
        if (metadata.accessCount > maxAccessCount) {
          maxAccessCount = metadata.accessCount;
          mostAccessed = id;
        }
      }

      return {
        totalSize,
        videoCount: entries.length,
        oldestVideo,
        mostAccessed,
      };
    } catch (error) {
      return {
        totalSize: 0,
        videoCount: 0,
        oldestVideo: null,
        mostAccessed: null,
      };
    }
  }

  async clearCache(): Promise<void> {
    try {
      // Remove all cached files
      const entries = Array.from(this.metadata.values());
      const deletePromises = entries.map(async (metadata) => {
        try {
          await RNFS.unlink(metadata.path);
        } catch (error) {
        }
      });

      await Promise.allSettled(deletePromises);
      
      // Clear metadata
      this.metadata.clear();
      this.saveMetadata();
      
    } catch (error) {
    }
  }

  async removeVideo(videoId: string): Promise<void> {
    try {
      const metadata = this.metadata.get(videoId);
      if (metadata) {
        await RNFS.unlink(metadata.path);
        this.metadata.delete(videoId);
        this.saveMetadata();
      }
    } catch (error) {
    }
  }

  // Smart cache management for Instagram-like performance
  async smartCacheManagement(): Promise<void> {
    try {
      const stats = await this.getCacheStats();
      
      // If cache is getting large, perform intelligent cleanup
      if (stats.totalSize > this.config.maxSize * 0.8) {
        
        // Remove least accessed videos first
        const entries = Array.from(this.metadata.entries());
        entries.sort(([, a], [, b]) => a.accessCount - b.accessCount);
        
        // Remove 20% of least accessed videos
        const removeCount = Math.ceil(entries.length * 0.2);
        const toRemove = entries.slice(0, removeCount);
        
        for (const [id] of toRemove) {
          await this.removeVideo(id);
        }
        
      }
    } catch (error) {
    }
  }

  // Preload with priority management
  async preloadWithPriority(videos: Array<{ id: string; url: string; priority: 'high' | 'low' }>): Promise<void> {
    await this.initCache();

    // Sort by priority
    const highPriority = videos.filter(v => v.priority === 'high');
    const lowPriority = videos.filter(v => v.priority === 'low');

    // Preload high priority first
    for (const video of highPriority) {
      await this.cacheVideo(video.url, video.id, 'high');
    }

    // Then preload low priority in background
    const lowPriorityPromises = lowPriority.map(video => 
      this.cacheVideo(video.url, video.id, 'low')
    );

    Promise.allSettled(lowPriorityPromises).then(() => {
    });
  }
}

// Export singleton instance
export const enhancedVideoCache = new EnhancedVideoCache();

// Export types for external use
export type { CacheMetadata, CacheConfig }; 