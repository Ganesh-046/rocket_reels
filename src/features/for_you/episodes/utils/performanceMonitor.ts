// ============================================================================
// 🎬 EPISODE PERFORMANCE MONITOR - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import { Platform } from 'react-native';
import enhancedVideoCache from './instagramOptimizedVideoCache';

// Performance metrics interface
interface PerformanceMetrics {
  videoLoadTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  frameRate: number;
  networkLatency: number;
}

// Video performance data interface
interface VideoPerformanceData {
  videoId: string;
  loadStartTime: number;
  loadEndTime: number;
  isCached: boolean;
  fileSize: number;
  playbackErrors: number;
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics: Map<string, VideoPerformanceData> = new Map();
  private startTimes: Map<string, number> = new Map();
  private frameCount = 0;
  private lastFrameTime = Date.now();
  private isMonitoring = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    console.log('🎬 PerformanceMonitor: Initialized');
  }

  // Start tracking video load
  startVideoLoad(videoId: string): void {
    const startTime = Date.now();
    this.startTimes.set(videoId, startTime);
    
    this.metrics.set(videoId, {
      videoId,
      loadStartTime: startTime,
      loadEndTime: 0,
      isCached: false,
      fileSize: 0,
      playbackErrors: 0,
    });

    console.log('🎬 PerformanceMonitor: Started tracking video load:', videoId);
  }

  // End tracking video load
  endVideoLoad(videoId: string, isCached: boolean, fileSize: number = 0): void {
    const endTime = Date.now();
    const metric = this.metrics.get(videoId);
    
    if (metric) {
      const loadTime = endTime - metric.loadStartTime;
      metric.loadEndTime = endTime;
      metric.isCached = isCached;
      metric.fileSize = fileSize;
      
      console.log('🎬 PerformanceMonitor: Video load completed:', {
        videoId,
        loadTime: `${loadTime}ms`,
        isCached,
        fileSize: fileSize > 0 ? `${(fileSize / 1024 / 1024).toFixed(2)}MB` : 'Unknown',
      });
    }
  }

  // Track playback errors
  trackPlaybackError(videoId: string): void {
    const metric = this.metrics.get(videoId);
    if (metric) {
      metric.playbackErrors++;
    }
  }

  // Start frame rate monitoring
  private startFrameRateMonitoring(): void {
    this.isMonitoring = true;
    this.monitorFrameRate();
  }

  private monitorFrameRate(): void {
    if (!this.isMonitoring) return;

    this.frameCount++;
    const currentTime = Date.now();
    
    if (currentTime - this.lastFrameTime >= 1000) { // Every second
      const fps = this.frameCount;
      this.frameCount = 0;
      this.lastFrameTime = currentTime;
      
      if (fps < 50) {
        console.warn('🎬 PerformanceMonitor: Low frame rate detected:', fps);
      }
    }

    requestAnimationFrame(() => this.monitorFrameRate());
  }

  // Get overall performance metrics
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    const cacheStats = await enhancedVideoCache.getCacheStats();
    
    // Calculate cache hit rate
    const totalVideos = this.metrics.size;
    const cachedVideos = Array.from(this.metrics.values()).filter(m => m.isCached).length;
    const cacheHitRate = totalVideos > 0 ? (cachedVideos / totalVideos) * 100 : 0;

    // Calculate average load time
    const loadTimes = Array.from(this.metrics.values())
      .filter(m => m.loadEndTime > 0)
      .map(m => m.loadEndTime - m.loadStartTime);
    
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;

    // Get memory usage (simplified)
    const memoryUsage = this.getMemoryUsage();

    return {
      videoLoadTime: averageLoadTime,
      cacheHitRate,
      memoryUsage,
      frameRate: 60, // Simplified - in real app you'd track actual FPS
      networkLatency: 0, // Would need network monitoring
    };
  }

  // Get memory usage (platform-specific)
  private getMemoryUsage(): number {
    if (Platform.OS === 'ios') {
      // iOS memory usage would require native module
      return 0;
    } else if (Platform.OS === 'android') {
      // Android memory usage would require native module
      return 0;
    }
    return 0;
  }

  // Log performance summary
  async logPerformanceSummary(): Promise<void> {
    const metrics = await this.getPerformanceMetrics();
    
    console.log('🎬 PerformanceMonitor: Performance Summary', {
      'Average Load Time': `${metrics.videoLoadTime.toFixed(2)}ms`,
      'Cache Hit Rate': `${metrics.cacheHitRate.toFixed(1)}%`,
      'Memory Usage': `${metrics.memoryUsage}MB`,
      'Frame Rate': `${metrics.frameRate} FPS`,
      'Total Videos Tracked': this.metrics.size,
    });
  }

  // Clear performance data
  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
    console.log('🎬 PerformanceMonitor: Metrics cleared');
  }

  // Stop monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('🎬 PerformanceMonitor: Monitoring stopped');
  }

  // Event emitter methods
  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('🎬 PerformanceMonitor: Event listener error:', error);
        }
      });
    }
  }

  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

// Export singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
export { PerformanceMonitor }; 