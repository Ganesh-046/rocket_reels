import { useVideoStore } from '../store/videoStore';

interface VideoQueueItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  isVisible: boolean;
}

class VideoQueue {
  private queue: Map<string, VideoQueueItem> = new Map();
  private maxQueueSize = 20;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  // Add video to queue
  addVideo(id: string, priority: 'high' | 'medium' | 'low' = 'medium', isVisible: boolean = false): void {
    this.queue.set(id, {
      id,
      priority,
      timestamp: Date.now(),
      isVisible,
    });

    // Cleanup if queue is too large
    if (this.queue.size > this.maxQueueSize) {
      this.cleanup();
    }
  }

  // Update video visibility
  updateVisibility(id: string, isVisible: boolean): void {
    const item = this.queue.get(id);
    if (item) {
      item.isVisible = isVisible;
      item.timestamp = Date.now();
    }
  }

  // Get videos by priority
  getVideosByPriority(priority: 'high' | 'medium' | 'low'): string[] {
    return Array.from(this.queue.values())
      .filter(item => item.priority === priority)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.id);
  }

  // Get visible videos
  getVisibleVideos(): string[] {
    return Array.from(this.queue.values())
      .filter(item => item.isVisible)
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(item => item.id);
  }

  // Remove video from queue
  removeVideo(id: string): void {
    this.queue.delete(id);
  }

  // Cleanup old videos
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [id, item] of this.queue.entries()) {
      if (now - item.timestamp > maxAge && !item.isVisible) {
        this.queue.delete(id);
      }
    }
  }

  // Start cleanup interval
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 30 * 1000); // Cleanup every 30 seconds
  }

  // Stop cleanup interval
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Get queue stats
  getStats(): { total: number; visible: number; highPriority: number } {
    const visible = this.getVisibleVideos().length;
    const highPriority = this.getVideosByPriority('high').length;
    
    return {
      total: this.queue.size,
      visible,
      highPriority,
    };
  }

  // Clear all videos
  clear(): void {
    this.queue.clear();
  }
}

// Export singleton instance
export const videoQueue = new VideoQueue(); 