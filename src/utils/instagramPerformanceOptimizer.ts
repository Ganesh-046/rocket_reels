import { Platform } from 'react-native';
import { instagramVideoCache } from './instagramOptimizedVideoCache';

// Instagram's performance secrets
const INSTAGRAM_PERFORMANCE_CONFIG = {
  // Video loading
  preloadDistance: 1, // Only preload 1 video ahead (Instagram approach)
  maxConcurrentLoads: 2, // Limit concurrent video loads
  loadTimeout: 3000, // 3 second timeout for video loads
  
  // Memory management
  maxCachedVideos: 10, // Keep only 10 videos in memory
  memoryThreshold: 150 * 1024 * 1024, // 150MB memory limit
  
  // Scrolling optimization
  scrollVelocityThreshold: 30, // Pause videos during fast scrolling
  scrollDebounceTime: 50, // 50ms debounce for scroll events
  
  // Playback optimization
  bufferSize: 1024 * 1024, // 1MB buffer (Instagram uses small buffers)
  seekThreshold: 1000, // 1 second seek threshold
};

interface VideoLoadState {
  id: string;
  isLoading: boolean;
  loadStartTime: number;
  isCached: boolean;
  loadPriority: 'critical' | 'high' | 'low';
}

class InstagramPerformanceOptimizer {
  private activeLoads: Map<string, VideoLoadState> = new Map();
  private loadQueue: Array<{ id: string; url: string; priority: number }> = [];
  private isProcessingQueue = false;
  private memoryUsage = 0;
  private lastMemoryCheck = 0;

  // Instagram-style video loading with priority management
  async loadVideoWithPriority(videoId: string, url: string, priority: 'critical' | 'high' | 'low' = 'high'): Promise<string> {
    // Check if already loading
    if (this.activeLoads.has(videoId)) {
      const loadState = this.activeLoads.get(videoId)!;
      if (loadState.loadPriority === 'critical' || priority === 'critical') {
        loadState.loadPriority = 'critical';
      }
      return url; // Return URL while loading
    }

    // Check memory usage
    await this.checkMemoryUsage();

    // Start loading
    const loadState: VideoLoadState = {
      id: videoId,
      isLoading: true,
      loadStartTime: Date.now(),
      isCached: false,
      loadPriority: priority,
    };

    this.activeLoads.set(videoId, loadState);

    // Queue the load
    const priorityWeight = priority === 'critical' ? 3 : priority === 'high' ? 2 : 1;
    this.queueLoad(videoId, url, priorityWeight);

    return url;
  }

  private queueLoad(videoId: string, url: string, priority: number) {
    this.loadQueue.push({ id: videoId, url, priority });
    this.loadQueue.sort((a, b) => b.priority - a.priority);
    
    if (!this.isProcessingQueue) {
      this.processLoadQueue();
    }
  }

  private async processLoadQueue() {
    if (this.isProcessingQueue || this.loadQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    
    while (this.loadQueue.length > 0 && this.activeLoads.size < INSTAGRAM_PERFORMANCE_CONFIG.maxConcurrentLoads) {
      const load = this.loadQueue.shift();
      if (!load || this.activeLoads.has(load.id)) continue;
      
      // Start loading in background
      this.loadVideoInBackground(load.id, load.url);
    }
    
    this.isProcessingQueue = false;
    
    if (this.loadQueue.length > 0) {
      setTimeout(() => this.processLoadQueue(), 50); // Fast processing
    }
  }

  private async loadVideoInBackground(videoId: string, url: string) {
    const loadState = this.activeLoads.get(videoId);
    if (!loadState) return;

    try {
      // Use Instagram-style cache
      const cachedPath = await instagramVideoCache.getVideoStream(videoId, url);
      
      if (cachedPath !== url) {
        loadState.isCached = true;
        this.memoryUsage += 1024 * 1024; // Estimate 1MB per video
      }
      
      console.log(`⚡ Instagram-style video loaded: ${videoId} (${Date.now() - loadState.loadStartTime}ms)`);
    } catch (error) {
      console.error(`Video load failed: ${videoId}`, error);
    } finally {
      loadState.isLoading = false;
      this.activeLoads.delete(videoId);
    }
  }

  // Instagram-style memory management
  private async checkMemoryUsage() {
    const now = Date.now();
    if (now - this.lastMemoryCheck < 5000) return; // Check every 5 seconds
    
    this.lastMemoryCheck = now;
    
    if (this.memoryUsage > INSTAGRAM_PERFORMANCE_CONFIG.memoryThreshold) {
      await this.cleanupMemory();
    }
  }

  private async cleanupMemory() {
    console.log('🧹 Instagram-style memory cleanup triggered');
    
    // Clear least important videos
    const activeLoads = Array.from(this.activeLoads.entries());
    const lowPriorityLoads = activeLoads
      .filter(([, state]) => state.loadPriority === 'low')
      .sort(([, a], [, b]) => a.loadStartTime - b.loadStartTime);
    
    // Remove oldest low priority loads
    const toRemove = lowPriorityLoads.slice(0, Math.floor(lowPriorityLoads.length / 2));
    
    for (const [videoId] of toRemove) {
      this.activeLoads.delete(videoId);
      this.loadQueue = this.loadQueue.filter(load => load.id !== videoId);
    }
    
    this.memoryUsage = Math.max(0, this.memoryUsage - (toRemove.length * 1024 * 1024));
  }

  // Instagram-style scroll optimization
  shouldPauseDuringScroll(scrollVelocity: number): boolean {
    return Math.abs(scrollVelocity) > INSTAGRAM_PERFORMANCE_CONFIG.scrollVelocityThreshold;
  }

  // Get optimized video source configuration
  getOptimizedVideoConfig() {
    return {
      bufferConfig: {
        minBufferMs: 500, // Very small buffer (Instagram approach)
        maxBufferMs: 2000, // Small max buffer
        bufferForPlaybackMs: 100, // Minimal playback buffer
        bufferForPlaybackAfterRebufferMs: 500,
      },
      maxBitRate: 1000000, // 1Mbps max bitrate
      resizeMode: 'cover' as const,
      repeat: false,
      playInBackground: false,
      playWhenInactive: false,
      ignoreSilentSwitch: 'ignore' as const,
      progressUpdateInterval: 100, // Update progress every 100ms
    };
  }

  // Cancel video loading
  cancelVideoLoad(videoId: string) {
    this.activeLoads.delete(videoId);
    this.loadQueue = this.loadQueue.filter(load => load.id !== videoId);
  }

  // Get loading status
  getLoadingStatus(videoId: string): VideoLoadState | null {
    return this.activeLoads.get(videoId) || null;
  }

  // Get performance stats
  getPerformanceStats() {
    return {
      activeLoads: this.activeLoads.size,
      queueLength: this.loadQueue.length,
      memoryUsage: this.memoryUsage,
      cachedVideos: Array.from(this.activeLoads.values()).filter(state => state.isCached).length,
    };
  }

  // Clear all loads
  clearAllLoads() {
    this.activeLoads.clear();
    this.loadQueue = [];
    this.memoryUsage = 0;
  }
}

export const instagramPerformanceOptimizer = new InstagramPerformanceOptimizer(); 