import RNFS from 'react-native-fs';
import MMKVStorage from '../lib/mmkv';
import { Platform } from 'react-native';

// Instagram-style cache configuration
const INSTAGRAM_CACHE_CONFIG = {
  maxSize: 100 * 1024 * 1024, // Reduced to 100MB for better performance
  maxAge: 12 * 60 * 60 * 1000, // 12 hours (shorter retention)
  preloadCount: 1, // Only preload 1 video ahead (reduced from 2)
  cleanupThreshold: 0.8, // 80% threshold (increased from 70%)
  chunkSize: 512 * 1024, // 512KB chunks (reduced from 1MB)
  maxConcurrentDownloads: 1, // Limit to 1 concurrent download (reduced from 2)
};

interface InstagramVideoMetadata {
  id: string;
  url: string;
  path: string;
  size: number;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  quality: 'low' | 'medium' | 'high';
  chunks: string[]; // For progressive loading
  isFullyDownloaded: boolean;
}

class InstagramOptimizedVideoCache {
  private cacheDir: string;
  private metadata: Map<string, InstagramVideoMetadata> = new Map();
  private activeDownloads: Set<string> = new Set();
  private downloadQueue: Array<{ id: string; url: string; priority: number }> = [];
  private isProcessingQueue = false;
  // Removed direct MMKV reference - using centralized MMKVStorage

  constructor() {
    this.cacheDir = `${RNFS.CachesDirectoryPath}/instagram_videos`;
    this.initCache();
  }

  private async initCache() {
    try {
      const dirExists = await RNFS.exists(this.cacheDir);
      if (!dirExists) {
        await RNFS.mkdir(this.cacheDir);
      }
      this.loadMetadata();
      await this.cleanup();
    } catch (error) {
    }
  }

  // Instagram-style progressive video loading
  async getVideoStream(videoId: string, url: string): Promise<string> {
    const metadata = this.metadata.get(videoId);
    
    if (metadata && metadata.isFullyDownloaded) {
      // Fully cached - return immediately
      this.updateAccess(videoId);
      return metadata.path;
    }

    if (metadata && metadata.chunks.length > 0) {
      // Partially cached - return what we have and continue downloading
      this.updateAccess(videoId);
      this.continueProgressiveDownload(videoId, url);
      return metadata.path;
    }

    // Start progressive download
    return this.startProgressiveDownload(videoId, url);
  }

  private async startProgressiveDownload(videoId: string, url: string): Promise<string> {
    const videoPath = `${this.cacheDir}/${videoId}.mp4`;
    
    // Create metadata for progressive loading
    const metadata: InstagramVideoMetadata = {
      id: videoId,
      url,
      path: videoPath,
      size: 0,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 1,
      quality: 'medium',
      chunks: [],
      isFullyDownloaded: false,
    };

    this.metadata.set(videoId, metadata);
    this.saveMetadata();

    // Start background download
    this.queueDownload(videoId, url, 1);
    
    return url; // Return original URL while downloading
  }

  private async continueProgressiveDownload(videoId: string, url: string) {
    if (this.activeDownloads.has(videoId)) return;
    
    this.queueDownload(videoId, url, 2); // Lower priority for continuation
  }

  private queueDownload(videoId: string, url: string, priority: number) {
    this.downloadQueue.push({ id: videoId, url, priority });
    this.downloadQueue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessingQueue) {
      this.processDownloadQueue();
    }
  }

  private async processDownloadQueue() {
    if (this.isProcessingQueue || this.downloadQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.downloadQueue.length > 0 && this.activeDownloads.size < INSTAGRAM_CACHE_CONFIG.maxConcurrentDownloads) {
      const download = this.downloadQueue.shift();
      if (!download || this.activeDownloads.has(download.id)) continue;
      
      this.activeDownloads.add(download.id);
      
      try {
        await this.downloadVideo(download.id, download.url);
      } catch (error) {
      } finally {
        this.activeDownloads.delete(download.id);
      }
    }
    
    this.isProcessingQueue = false;
    
    if (this.downloadQueue.length > 0) {
      setTimeout(() => this.processDownloadQueue(), 100);
    }
  }

  private async downloadVideo(videoId: string, url: string) {
    const metadata = this.metadata.get(videoId);
    if (!metadata) return;

    try {
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: metadata.path,
        background: true,
        discretionary: true,
        headers: {
          'User-Agent': 'Instagram/219.0.0.29.118 Android',
          'Accept': 'video/mp4,video/*,*/*;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
        },
      }).promise;

      if (downloadResult.statusCode === 200) {
        const stats = await RNFS.stat(metadata.path);
        metadata.size = stats.size;
        metadata.isFullyDownloaded = true;
        metadata.lastAccessed = Date.now();
        this.saveMetadata();
        
      }
    } catch (error) {
    }
  }

  // Instagram-style smart preloading - less aggressive
  async smartPreload(videos: Array<{ id: string; url: string }>): Promise<void> {
    // Only preload the next 1 video (reduced from 2)
    const videosToPreload = videos.slice(0, 1);
    
    for (const video of videosToPreload) {
      if (!this.metadata.has(video.id)) {
        this.queueDownload(video.id, video.url, 0); // Low priority
      }
    }
  }

  private updateAccess(videoId: string) {
    const metadata = this.metadata.get(videoId);
    if (metadata) {
      metadata.lastAccessed = Date.now();
      metadata.accessCount++;
      this.saveMetadata();
    }
  }

  private async cleanup() {
    const entries = Array.from(this.metadata.entries());
    const currentSize = entries.reduce((sum, [, meta]) => sum + meta.size, 0);
    
    if (currentSize > INSTAGRAM_CACHE_CONFIG.maxSize * INSTAGRAM_CACHE_CONFIG.cleanupThreshold) {
      // Instagram-style cleanup: remove least accessed videos
      entries.sort(([, a], [, b]) => a.accessCount - b.accessCount);
      
      const targetSize = INSTAGRAM_CACHE_CONFIG.maxSize * 0.5; // Reduce to 50%
      let newSize = currentSize;
      
      for (const [id, metadata] of entries) {
        if (newSize <= targetSize) break;
        
        try {
          await RNFS.unlink(metadata.path);
          this.metadata.delete(id);
          newSize -= metadata.size;
        } catch (error) {
        }
      }
      
      this.saveMetadata();
    }
  }

  private loadMetadata() {
    try {
      const saved = MMKVStorage.get('instagramVideoMetadata');
      if (saved) {
        const parsed = saved as [string, InstagramVideoMetadata][];
        this.metadata = new Map(parsed);
      }
    } catch (error) {
      this.metadata = new Map();
    }
  }

  private saveMetadata() {
    try {
      const serialized = Array.from(this.metadata.entries());
      MMKVStorage.set('instagramVideoMetadata', serialized);
    } catch (error) {
    }
  }

  async getCacheStats() {
    const entries = Array.from(this.metadata.entries());
    const totalSize = entries.reduce((sum, [, meta]) => sum + meta.size, 0);
    const fullyDownloaded = entries.filter(([, meta]) => meta.isFullyDownloaded).length;
    
    return {
      totalSize,
      videoCount: entries.length,
      fullyDownloaded,
      activeDownloads: this.activeDownloads.size,
      queueLength: this.downloadQueue.length,
    };
  }

  async clearCache(): Promise<void> {
    try {
      const files = await RNFS.readDir(this.cacheDir);
      const deletePromises = files.map(file => RNFS.unlink(file.path));
      await Promise.all(deletePromises);
      this.metadata.clear();
      this.saveMetadata();
      this.activeDownloads.clear();
      this.downloadQueue = [];
    } catch (error) {
    }
  }
}

export const instagramVideoCache = new InstagramOptimizedVideoCache(); 