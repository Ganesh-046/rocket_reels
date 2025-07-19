import { Platform } from 'react-native';
import { instagramVideoCache } from './instagramOptimizedVideoCache';

// Instagram-style video preloading configuration
const INSTAGRAM_PRELOAD_CONFIG = {
  // Preloading strategy
  preloadDistance: 3, // Preload 3 videos ahead
  preloadBehind: 1, // Keep 1 video behind in memory
  maxConcurrentPreloads: 2,
  
  // Video readiness
  minBufferSize: 2 * 1024 * 1024, // 2MB minimum buffer
  targetBufferSize: 5 * 1024 * 1024, // 5MB target buffer
  maxBufferSize: 10 * 1024 * 1024, // 10MB max buffer
  
  // Performance
  preloadTimeout: 5000, // 5 second timeout
  retryAttempts: 3,
  retryDelay: 1000,
};

interface VideoPreloadState {
  videoId: string;
  videoUrl: string;
  isPreloading: boolean;
  isReady: boolean;
  bufferSize: number;
  lastAccessed: number;
  preloadPromise?: Promise<string>;
  retryCount: number;
}

interface PreloadQueue {
  high: string[];
  medium: string[];
  low: string[];
}

class InstagramStyleVideoPreloader {
  private preloadStates: Map<string, VideoPreloadState> = new Map();
  private preloadQueue: PreloadQueue = { high: [], medium: [], low: [] };
  private isProcessing = false;
  private currentIndex = 0;
  private visibleIndices: Set<number> = new Set();

  constructor() {
    this.startProcessing();
  }

  // Set current viewing index for priority management
  setCurrentIndex(index: number) {
    this.currentIndex = index;
    this.updatePriorities();
  }

  // Set visible indices for aggressive preloading
  setVisibleIndices(indices: Set<number>) {
    this.visibleIndices = indices;
    this.updatePriorities();
  }

  // Add video to preload queue
  addToPreloadQueue(videoId: string, videoUrl: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (this.preloadStates.has(videoId)) {
      return; // Already in queue
    }

    const preloadState: VideoPreloadState = {
      videoId,
      videoUrl,
      isPreloading: false,
      isReady: false,
      bufferSize: 0,
      lastAccessed: Date.now(),
      retryCount: 0,
    };

    this.preloadStates.set(videoId, preloadState);
    this.preloadQueue[priority].push(videoId);
    
    console.log(`📋 Added ${videoId} to ${priority} preload queue`);
  }

  // Get preloaded video URL (blocking until ready)
  async getPreloadedVideo(videoId: string): Promise<string> {
    const state = this.preloadStates.get(videoId);
    
    if (!state) {
      console.warn(`Video ${videoId} not in preload queue`);
      return '';
    }

    if (state.isReady) {
      state.lastAccessed = Date.now();
      return state.videoUrl;
    }

    // If not ready, start preloading immediately
    if (!state.isPreloading) {
      await this.preloadVideo(videoId);
    }

    // Wait for preload to complete
    if (state.preloadPromise) {
      try {
        await state.preloadPromise;
        state.lastAccessed = Date.now();
        return state.videoUrl;
      } catch (error) {
        console.error(`Preload failed for ${videoId}:`, error);
        return state.videoUrl; // Return URL anyway
      }
    }

    return state.videoUrl;
  }

  // Aggressive preloading with multiple strategies
  private async preloadVideo(videoId: string): Promise<void> {
    const state = this.preloadStates.get(videoId);
    if (!state || state.isPreloading) return;

    state.isPreloading = true;
    state.lastAccessed = Date.now();

    const preloadPromise = this.executePreloadStrategy(videoId).then(() => state.videoUrl);
    state.preloadPromise = preloadPromise;

    try {
      await preloadPromise;
      state.isReady = true;
      state.bufferSize = INSTAGRAM_PRELOAD_CONFIG.targetBufferSize;
      console.log(`✅ Video ${videoId} preloaded successfully`);
    } catch (error) {
      console.error(`❌ Preload failed for ${videoId}:`, error);
      state.isPreloading = false;
      
      // Retry logic
      if (state.retryCount < INSTAGRAM_PRELOAD_CONFIG.retryAttempts) {
        state.retryCount++;
        console.log(`🔄 Retrying preload for ${videoId} (attempt ${state.retryCount})`);
        setTimeout(() => this.preloadVideo(videoId), INSTAGRAM_PRELOAD_CONFIG.retryDelay);
      }
    }
  }

  // Multiple preloading strategies for maximum success rate
  private async executePreloadStrategy(videoId: string): Promise<void> {
    const state = this.preloadStates.get(videoId);
    if (!state) throw new Error('Video state not found');

    // Strategy 1: Instagram cache with aggressive buffering
    try {
      const cachedPath = await instagramVideoCache.getVideoStream(videoId, state.videoUrl);
      if (cachedPath !== state.videoUrl) {
        console.log(`🎯 Strategy 1 success: ${videoId} cached`);
        return;
      }
    } catch (error) {
      console.log(`Strategy 1 failed for ${videoId}:`, error);
    }

    // Strategy 2: Direct fetch with range requests
    try {
      await this.preloadWithRangeRequests(videoId, state.videoUrl);
      console.log(`🎯 Strategy 2 success: ${videoId} range-loaded`);
      return;
    } catch (error) {
      console.log(`Strategy 2 failed for ${videoId}:`, error);
    }

    // Strategy 3: Simple fetch (fallback)
    try {
      await this.preloadWithSimpleFetch(videoId, state.videoUrl);
      console.log(`🎯 Strategy 3 success: ${videoId} simple-loaded`);
      return;
    } catch (error) {
      console.log(`Strategy 3 failed for ${videoId}:`, error);
    }

    throw new Error(`All preload strategies failed for ${videoId}`);
  }

  // Range request preloading (Instagram-style)
  private async preloadWithRangeRequests(videoId: string, videoUrl: string): Promise<void> {
    const response = await fetch(videoUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Instagram/219.0.0.29.118 Android',
      },
    });

    if (!response.ok) throw new Error('HEAD request failed');

    const contentLength = response.headers.get('content-length');
    if (!contentLength) throw new Error('No content length');

    const totalSize = parseInt(contentLength);
    const chunkSize = INSTAGRAM_PRELOAD_CONFIG.minBufferSize;
    const chunks = Math.ceil(totalSize / chunkSize);

    // Preload first few chunks for immediate playback
    const preloadChunks = Math.min(3, chunks);
    const promises = [];

    for (let i = 0; i < preloadChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize - 1, totalSize - 1);
      
      const promise = fetch(videoUrl, {
        headers: {
          'Range': `bytes=${start}-${end}`,
          'User-Agent': 'Instagram/219.0.0.29.118 Android',
        },
      });
      promises.push(promise);
    }

    await Promise.all(promises);
  }

  // Simple fetch preloading (fallback)
  private async preloadWithSimpleFetch(videoId: string, videoUrl: string): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), INSTAGRAM_PRELOAD_CONFIG.preloadTimeout);

    try {
      const response = await fetch(videoUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Instagram/219.0.0.29.118 Android',
        },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // Read first few MB to ensure video is accessible
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let bytesRead = 0;
      const targetBytes = INSTAGRAM_PRELOAD_CONFIG.minBufferSize;

      while (bytesRead < targetBytes) {
        const { done, value } = await reader.read();
        if (done) break;
        bytesRead += value.length;
      }

      reader.releaseLock();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Update priorities based on current index and visibility
  private updatePriorities() {
    // Clear all queues
    this.preloadQueue.high = [];
    this.preloadQueue.medium = [];
    this.preloadQueue.low = [];

    // Re-sort based on current context
    for (const [videoId, state] of this.preloadStates) {
      if (this.visibleIndices.has(this.getIndexFromVideoId(videoId))) {
        this.preloadQueue.high.push(videoId);
      } else if (Math.abs(this.getIndexFromVideoId(videoId) - this.currentIndex) <= 2) {
        this.preloadQueue.medium.push(videoId);
      } else {
        this.preloadQueue.low.push(videoId);
      }
    }
  }

  // Get index from video ID (assuming format: episode-{contentId}-{index})
  private getIndexFromVideoId(videoId: string): number {
    const match = videoId.match(/episode-.*?-(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  // Process preload queue
  private async startProcessing() {
    setInterval(async () => {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        // Process high priority first
        await this.processQueue('high');
        await this.processQueue('medium');
        await this.processQueue('low');
      } finally {
        this.isProcessing = false;
      }
    }, 100); // Check every 100ms
  }

  // Process specific priority queue
  private async processQueue(priority: keyof PreloadQueue) {
    const queue = this.preloadQueue[priority];
    const maxConcurrent = INSTAGRAM_PRELOAD_CONFIG.maxConcurrentPreloads;

    const toProcess = queue.slice(0, maxConcurrent);
    const promises = toProcess.map(videoId => this.preloadVideo(videoId));

    if (promises.length > 0) {
      await Promise.allSettled(promises);
      // Remove processed items from queue
      this.preloadQueue[priority] = queue.slice(maxConcurrent);
    }
  }

  // Cleanup old preload states
  cleanup() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [videoId, state] of this.preloadStates) {
      if (now - state.lastAccessed > maxAge) {
        this.preloadStates.delete(videoId);
        console.log(`🧹 Cleaned up old preload state: ${videoId}`);
      }
    }
  }

  // Get preload statistics
  getStats() {
    const total = this.preloadStates.size;
    const ready = Array.from(this.preloadStates.values()).filter(s => s.isReady).length;
    const preloading = Array.from(this.preloadStates.values()).filter(s => s.isPreloading).length;

    return {
      total,
      ready,
      preloading,
      queueSizes: {
        high: this.preloadQueue.high.length,
        medium: this.preloadQueue.medium.length,
        low: this.preloadQueue.low.length,
      },
    };
  }
}

// Export singleton instance
export const instagramStyleVideoPreloader = new InstagramStyleVideoPreloader(); 