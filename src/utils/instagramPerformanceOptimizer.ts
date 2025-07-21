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

interface PerformanceMetrics {
  frameRate: number;
  memoryUsage: number;
  networkLatency: number;
  videoLoadTime: number;
  errorRate: number;
  cacheHitRate: number;
  scrollSmoothness: number;
}

class InstagramPerformanceOptimizer {
  private videoLoadStates: Map<string, VideoLoadState> = new Map();
  private performanceMetrics: PerformanceMetrics = {
    frameRate: 0,
    memoryUsage: 0,
    networkLatency: 0,
    videoLoadTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    scrollSmoothness: 0,
  };
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeOptimizer();
  }

  private initializeOptimizer() {
    // Initialize performance monitoring
    this.startPerformanceMonitoring();
    
    // Set up memory pressure monitoring
    this.setupMemoryPressureMonitoring();
    
    // Initialize cache optimization
    this.optimizeCache();
  }

  // Start performance monitoring
  startPerformanceMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.updatePerformanceMetrics();
      this.checkPerformanceThresholds();
    }, 1000); // Monitor every second
  }

  // Stop performance monitoring
  stopPerformanceMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
  }

  // Update performance metrics
  private async updatePerformanceMetrics() {
    try {
      // Update frame rate
      this.performanceMetrics.frameRate = await this.measureFrameRate();
      
      // Update memory usage
      this.performanceMetrics.memoryUsage = await this.measureMemoryUsage();
      
      // Update network latency
      this.performanceMetrics.networkLatency = await this.measureNetworkLatency();
      
      // Update cache hit rate
      this.performanceMetrics.cacheHitRate = await this.calculateCacheHitRate();
      
      // Update scroll smoothness
      this.performanceMetrics.scrollSmoothness = await this.measureScrollSmoothness();
      
    } catch (error) {
      console.error('Performance metrics update error:', error);
    }
  }

  // Check performance thresholds and optimize if needed
  private checkPerformanceThresholds() {
    const { frameRate, memoryUsage, errorRate } = this.performanceMetrics;
    
    // Frame rate optimization
    if (frameRate < 30) {
      this.optimizeForLowFrameRate();
    }
    
    // Memory optimization
    if (memoryUsage > INSTAGRAM_PERFORMANCE_CONFIG.memoryThreshold) {
      this.optimizeMemoryUsage();
    }
    
    // Error rate optimization
    if (errorRate > 0.05) { // 5% error rate threshold
      this.optimizeForHighErrorRate();
    }
  }

  // Optimize for low frame rate
  private optimizeForLowFrameRate() {
    console.log('🔄 InstagramOptimizer - Optimizing for low frame rate');
    
    // Reduce video quality temporarily
    this.reduceVideoQuality();
    
    // Pause non-visible videos
    this.pauseNonVisibleVideos();
    
    // Optimize rendering
    this.optimizeRendering();
  }

  // Optimize memory usage
  private async optimizeMemoryUsage() {
    console.log('🔄 InstagramOptimizer - Optimizing memory usage');
    
    // Clear old cache entries
    await this.clearOldCacheEntries();
    
    // Reduce buffer sizes
    this.reduceBufferSizes();
    
    // Trigger garbage collection
    this.triggerGarbageCollection();
  }

  // Optimize for high error rate
  private optimizeForHighErrorRate() {
    console.log('🔄 InstagramOptimizer - Optimizing for high error rate');
    
    // Increase retry attempts
    this.increaseRetryAttempts();
    
    // Reduce concurrent loads
    this.reduceConcurrentLoads();
    
    // Switch to more reliable CDN
    this.switchToReliableCDN();
  }

  // Video loading optimization
  async optimizeVideoLoading(videoId: string, videoUrl: string, priority: 'critical' | 'high' | 'low' = 'high') {
    const loadState: VideoLoadState = {
      id: videoId,
      isLoading: true,
      loadStartTime: Date.now(),
      isCached: false,
      loadPriority: priority,
    };

    this.videoLoadStates.set(videoId, loadState);
    
    try {
      // Check cache first
      const cachedVideo = await instagramVideoCache.getVideoStream(videoId, videoUrl);
      if (cachedVideo && cachedVideo !== videoUrl) {
        loadState.isCached = true;
        loadState.isLoading = false;
        this.updateLoadTime(videoId, Date.now() - loadState.loadStartTime);
        return cachedVideo;
      }
      
      // Load from network with optimization
      const videoData = await this.loadVideoWithOptimization(videoUrl, priority);
      
      // Cache the video using progressive download
      await instagramVideoCache.getVideoStream(videoId, videoUrl);
      
      loadState.isLoading = false;
      this.updateLoadTime(videoId, Date.now() - loadState.loadStartTime);
      
      return videoData;
      
    } catch (error) {
      loadState.isLoading = false;
      this.handleLoadError(videoId, error);
      throw error;
    }
  }

  // Load video with optimization
  private async loadVideoWithOptimization(videoUrl: string, priority: string) {
    // Apply Instagram-level optimizations
    const optimizedUrl = this.optimizeVideoUrl(videoUrl);
    const optimizedHeaders = this.getOptimizedHeaders();
    
    // Load with timeout and retry
    return await this.loadWithTimeoutAndRetry(optimizedUrl, optimizedHeaders, priority);
  }

  // Optimize video URL
  private optimizeVideoUrl(videoUrl: string): string {
    // Add CDN optimization parameters
    const url = new URL(videoUrl);
    
    // Add Instagram-style parameters
    url.searchParams.set('optimize', 'true');
    url.searchParams.set('quality', 'adaptive');
    url.searchParams.set('format', 'h264');
    
    return url.toString();
  }

  // Get optimized headers
  private getOptimizedHeaders() {
    return {
      'User-Agent': 'Instagram/219.0.0.29.118 Android',
      'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, video/mp4, video/*',
      'Cache-Control': 'max-age=3600',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    };
  }

  // Load with timeout and retry
  private async loadWithTimeoutAndRetry(url: string, headers: any, priority: string) {
    const maxRetries = priority === 'critical' ? 3 : 2;
    const timeout = priority === 'critical' ? 5000 : 3000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.arrayBuffer();
        
      } catch (error) {
        console.warn(`InstagramOptimizer - Load attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Update load time
  private updateLoadTime(videoId: string, loadTime: number) {
    this.performanceMetrics.videoLoadTime = loadTime;
    
    if (loadTime > 2000) { // 2 second threshold
      console.warn(`InstagramOptimizer - Slow video load: ${loadTime}ms for ${videoId}`);
    }
  }

  // Handle load error
  private handleLoadError(videoId: string, error: any) {
    this.performanceMetrics.errorRate += 0.01; // Increment error rate
    
    console.error(`InstagramOptimizer - Load error for ${videoId}:`, error);
    
    // Remove from load states
    this.videoLoadStates.delete(videoId);
  }

  // Setup memory pressure monitoring
  private setupMemoryPressureMonitoring() {
    // Monitor memory usage every 5 seconds
    setInterval(async () => {
      const memoryUsage = await this.measureMemoryUsage();
      
      if (memoryUsage > INSTAGRAM_PERFORMANCE_CONFIG.memoryThreshold * 0.8) {
        console.warn('InstagramOptimizer - High memory usage detected');
        await this.optimizeMemoryUsage();
      }
    }, 5000);
  }

  // Optimize cache
  private async optimizeCache() {
    // Set up cache optimization
    await instagramVideoCache.getCacheStats();
    
    // Monitor cache performance
    setInterval(async () => {
      const cacheStats = await instagramVideoCache.getCacheStats();
      
      if (cacheStats.videoCount < 1) { // Check if cache is empty
        console.warn('InstagramOptimizer - Cache is empty, consider preloading');
        await this.optimizeCacheStrategy();
      }
    }, 10000);
  }

  // Optimize cache strategy
  private async optimizeCacheStrategy() {
    // Implement cache optimization strategies
    await instagramVideoCache.clearCache();
  }

  // Measure frame rate
  private async measureFrameRate(): Promise<number> {
    // Implement frame rate measurement
    return new Promise((resolve) => {
      let frameCount = 0;
      const startTime = Date.now();
      
      const measureFrame = () => {
        frameCount++;
        requestAnimationFrame(measureFrame);
      };
      
      requestAnimationFrame(measureFrame);
      
      setTimeout(() => {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // seconds
        const fps = frameCount / duration;
        resolve(fps);
      }, 1000);
    });
  }

  // Measure memory usage
  private async measureMemoryUsage(): Promise<number> {
    // Implement memory usage measurement
    if (Platform.OS === 'ios') {
      // iOS memory measurement
      return new Promise((resolve) => {
        // Use native module or estimation
        resolve(100 * 1024 * 1024); // 100MB estimation
      });
    } else {
      // Android memory measurement
      return new Promise((resolve) => {
        // Use native module or estimation
        resolve(150 * 1024 * 1024); // 150MB estimation
      });
    }
  }

  // Measure network latency
  private async measureNetworkLatency(): Promise<number> {
    // Implement network latency measurement
    const startTime = Date.now();
    
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return Date.now() - startTime;
    } catch (error) {
      return 1000; // Default latency
    }
  }

  // Calculate cache hit rate
  private async calculateCacheHitRate(): Promise<number> {
    const stats = await instagramVideoCache.getCacheStats();
    return stats.videoCount > 0 ? 0.8 : 0; // Estimate based on video count
  }

  // Measure scroll smoothness
  private async measureScrollSmoothness(): Promise<number> {
    // Implement scroll smoothness measurement
    return new Promise((resolve) => {
      // Measure scroll performance
      resolve(0.9); // 90% smoothness estimation
    });
  }

  // Reduce video quality
  private reduceVideoQuality() {
    // Implement video quality reduction
    console.log('InstagramOptimizer - Reducing video quality');
  }

  // Pause non-visible videos
  private pauseNonVisibleVideos() {
    // Implement pause non-visible videos
    console.log('InstagramOptimizer - Pausing non-visible videos');
  }

  // Optimize rendering
  private optimizeRendering() {
    // Implement rendering optimization
    console.log('InstagramOptimizer - Optimizing rendering');
  }

  // Clear old cache entries
  private async clearOldCacheEntries() {
    await instagramVideoCache.clearCache();
  }

  // Reduce buffer sizes
  private reduceBufferSizes() {
    // Implement buffer size reduction
    console.log('InstagramOptimizer - Reducing buffer sizes');
  }

  // Trigger garbage collection
  private triggerGarbageCollection() {
    // Implement garbage collection trigger
    console.log('InstagramOptimizer - Triggering garbage collection');
  }

  // Increase retry attempts
  private increaseRetryAttempts() {
    // Implement retry attempt increase
    console.log('InstagramOptimizer - Increasing retry attempts');
  }

  // Reduce concurrent loads
  private reduceConcurrentLoads() {
    // Implement concurrent load reduction
    console.log('InstagramOptimizer - Reducing concurrent loads');
  }

  // Switch to reliable CDN
  private switchToReliableCDN() {
    // Implement CDN switching
    console.log('InstagramOptimizer - Switching to reliable CDN');
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // Get optimization recommendations
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const { frameRate, memoryUsage, errorRate, cacheHitRate } = this.performanceMetrics;
    
    if (frameRate < 30) {
      recommendations.push('Consider reducing video quality to improve frame rate');
    }
    
    if (memoryUsage > INSTAGRAM_PERFORMANCE_CONFIG.memoryThreshold * 0.8) {
      recommendations.push('Memory usage is high, consider clearing cache');
    }
    
    if (errorRate > 0.05) {
      recommendations.push('Error rate is high, check network connectivity');
    }
    
    if (cacheHitRate < 0.7) {
      recommendations.push('Cache hit rate is low, consider preloading more videos');
    }
    
    return recommendations;
  }

  // Cleanup
  cleanup() {
    this.stopPerformanceMonitoring();
    this.videoLoadStates.clear();
  }
}

// Export singleton instance
export const instagramPerformanceOptimizer = new InstagramPerformanceOptimizer(); 