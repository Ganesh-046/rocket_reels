import { enhancedVideoCache } from './enhancedVideoCache';
import { performanceMonitor } from './performanceMonitor';

interface PrefetchItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  priority: 'high' | 'medium' | 'low';
  index: number;
}

interface PrefetchConfig {
  preloadCount: number;
  preloadDistance: number;
  maxConcurrent: number;
  enableThumbnailPreload: boolean;
  enableVideoPreload: boolean;
}

class PrefetchManager {
  private config: PrefetchConfig;
  private prefetchQueue: PrefetchItem[] = [];
  private activePrefetches: Set<string> = new Set();
  private isProcessing = false;
  private currentIndex = 0;

  constructor(config: Partial<PrefetchConfig> = {}) {
    this.config = {
      preloadCount: 5, // Increased for better coverage
      preloadDistance: 1, // Reduced for faster response
      maxConcurrent: 3, // Increased for faster loading
      enableThumbnailPreload: true,
      enableVideoPreload: true,
      ...config,
    };
  }

  // Update current viewing index and trigger prefetch
  updateCurrentIndex(index: number, items: PrefetchItem[]): void {
    this.currentIndex = index;
    this.schedulePrefetch(items);
  }

  // Schedule prefetch for upcoming items
  private schedulePrefetch(items: PrefetchItem[]): void {
    if (!this.config.enableVideoPreload) return;

    const startIndex = Math.max(0, this.currentIndex - this.config.preloadDistance);
    const endIndex = Math.min(
      items.length - 1,
      this.currentIndex + this.config.preloadCount + this.config.preloadDistance
    );

    // Clear old prefetch queue
    this.prefetchQueue = [];

    // Add items to prefetch queue with priority
    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      if (!item || this.activePrefetches.has(item.id)) continue;

      const distance = Math.abs(i - this.currentIndex);
      const priority = this.getPriority(distance);
      
      this.prefetchQueue.push({
        ...item,
        priority,
        index: i,
      });
    }

    // Sort by priority and distance
    this.prefetchQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
      }
      return Math.abs(a.index - this.currentIndex) - Math.abs(b.index - this.currentIndex);
    });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processPrefetchQueue();
    }
  }

  private getPriority(distance: number): 'high' | 'medium' | 'low' {
    if (distance <= 1) return 'high';
    if (distance <= 2) return 'medium'; // Reduced distance for faster response
    return 'low';
  }

  private getPriorityWeight(priority: 'high' | 'medium' | 'low'): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
    }
  }

  // Process prefetch queue with concurrency control
  private async processPrefetchQueue(): Promise<void> {
    if (this.isProcessing || this.prefetchQueue.length === 0) return;

    this.isProcessing = true;

    while (this.prefetchQueue.length > 0 && this.activePrefetches.size < this.config.maxConcurrent) {
      const item = this.prefetchQueue.shift();
      if (!item || this.activePrefetches.has(item.id)) continue;

      this.activePrefetches.add(item.id);
      
      // Start prefetch in background
      this.prefetchItem(item).finally(() => {
        this.activePrefetches.delete(item.id);
      });
    }

    this.isProcessing = false;

    // Continue processing if there are more items
    if (this.prefetchQueue.length > 0) {
      setTimeout(() => this.processPrefetchQueue(), 100);
    }
  }

  // Prefetch individual item
  private async prefetchItem(item: PrefetchItem): Promise<void> {
    try {
      performanceMonitor.startVideoLoad(item.id);

      // Prefetch video
      if (this.config.enableVideoPreload) {
        const priority = item.priority === 'medium' ? 'low' : item.priority;
        await enhancedVideoCache.cacheVideo(item.videoUrl, item.id, priority);
      }

      // Prefetch thumbnail (if enabled and available)
      if (this.config.enableThumbnailPreload && item.thumbnailUrl) {
        await this.prefetchThumbnail(item.thumbnailUrl, item.id);
      }

      performanceMonitor.endVideoLoad(item.id, true);
      
    } catch (error) {
      performanceMonitor.trackPlaybackError(item.id);
    }
  }

  // Prefetch thumbnail image
  private async prefetchThumbnail(thumbnailUrl: string, videoId: string): Promise<void> {
    try {
      // Simple image prefetch - in a real app you'd use a proper image cache
      const response = await fetch(thumbnailUrl, {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'max-age=3600',
        },
      });
      
      if (response.ok) {
      }
    } catch (error) {
    }
  }

  // Cancel prefetch for specific item
  cancelPrefetch(videoId: string): void {
    this.prefetchQueue = this.prefetchQueue.filter(item => item.id !== videoId);
    this.activePrefetches.delete(videoId);
  }

  // Clear all prefetch operations
  clearPrefetchQueue(): void {
    this.prefetchQueue = [];
    this.activePrefetches.clear();
    this.isProcessing = false;
  }

  // Get prefetch status
  getPrefetchStatus(): {
    queueLength: number;
    activeCount: number;
    isProcessing: boolean;
  } {
    return {
      queueLength: this.prefetchQueue.length,
      activeCount: this.activePrefetches.size,
      isProcessing: this.isProcessing,
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<PrefetchConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const prefetchManager = new PrefetchManager();

// Export types
export type { PrefetchItem, PrefetchConfig };
