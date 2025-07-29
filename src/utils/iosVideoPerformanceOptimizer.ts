import { Platform } from 'react-native';

// iOS-specific performance configuration
const IOS_PERFORMANCE_CONFIG = {
  // Ultra-fast buffer configuration for iOS
  bufferConfig: {
    minBufferMs: 100, // Reduced for faster start
    maxBufferMs: 1000, // Reduced for memory efficiency
    bufferForPlaybackMs: 50, // Reduced for immediate playback
    bufferForPlaybackAfterRebufferMs: 200, // Reduced for faster recovery
  },
  
  // iOS-specific video properties
  videoProperties: {
    allowsExternalPlayback: false,
    automaticallyWaitsToMinimizeStalling: false, // Disabled for faster start
    playInBackground: false,
    playWhenInactive: false,
    ignoreSilentSwitch: "ignore",
    audioOnly: false,
    useTextureView: false,
    bufferType: 'surface',
    progressUpdateInterval: 100, // Reduced for smoother progress
    reportBandwidth: false, // Disabled to save resources
  },
  
  // Network optimization for iOS
  networkConfig: {
    maxBitRate: 2000000, // 2Mbps for better quality
    minLoadRetryCount: 1, // Reduced retry count
    shouldCache: true,
    headers: {
      'User-Agent': 'RocketReel/1.0 iOS',
      'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, video/mp4, video/*',
      'Cache-Control': 'max-age=3600',
      'Accept-Encoding': 'gzip, deflate',
      'Range': 'bytes=0-', // Support for range requests
    },
  },
  
  // Memory management for iOS
  memoryConfig: {
    maxCachedVideos: 5, // Reduced for iOS memory constraints
    cleanupThreshold: 0.7, // 70% memory usage triggers cleanup
    preloadDistance: 1, // Only preload 1 video ahead
  },
};

class IOSVideoPerformanceOptimizer {
  private static instance: IOSVideoPerformanceOptimizer;
  private performanceMetrics: Map<string, any> = new Map();
  private isLowEndDevice: boolean = false;

  static getInstance(): IOSVideoPerformanceOptimizer {
    if (!IOSVideoPerformanceOptimizer.instance) {
      IOSVideoPerformanceOptimizer.instance = new IOSVideoPerformanceOptimizer();
    }
    return IOSVideoPerformanceOptimizer.instance;
  }

  constructor() {
    this.detectDevicePerformance();
  }

  private detectDevicePerformance() {
    if (Platform.OS !== 'ios') return;

    // Detect low-end iOS devices
    const { width, height } = require('react-native').Dimensions.get('window');
    const screenSize = width * height;
    
    // Consider devices with smaller screens as low-end for video performance
    this.isLowEndDevice = screenSize < 2000000; // Less than 2M pixels
    
    console.log('🔍 iOS Device Performance:', {
      screenSize,
      isLowEndDevice: this.isLowEndDevice,
      width,
      height,
    });
  }

  // Get optimized video configuration for iOS
  getOptimizedVideoConfig(): any {
    const baseConfig = {
      ...IOS_PERFORMANCE_CONFIG.videoProperties,
      bufferConfig: this.getOptimizedBufferConfig(),
      ...IOS_PERFORMANCE_CONFIG.networkConfig,
    };

    // Apply low-end device optimizations
    if (this.isLowEndDevice) {
      return {
        ...baseConfig,
        bufferConfig: {
          minBufferMs: 50,
          maxBufferMs: 500,
          bufferForPlaybackMs: 25,
          bufferForPlaybackAfterRebufferMs: 100,
        },
        maxBitRate: 1000000, // 1Mbps for low-end devices
        progressUpdateInterval: 200, // Less frequent updates
      };
    }

    return baseConfig;
  }

  // Get optimized buffer configuration
  getOptimizedBufferConfig(): any {
    if (this.isLowEndDevice) {
      return {
        minBufferMs: 50,
        maxBufferMs: 500,
        bufferForPlaybackMs: 25,
        bufferForPlaybackAfterRebufferMs: 100,
      };
    }

    return IOS_PERFORMANCE_CONFIG.bufferConfig;
  }

  // Get optimized video source configuration
  getOptimizedVideoSource(videoUrl: string, episodeId?: string): any {
    const config = this.getOptimizedVideoConfig();
    
    return {
      uri: videoUrl,
      type: videoUrl.includes('.m3u8') ? 'm3u8' : undefined,
      headers: {
        ...config.headers,
        'X-iOS-Optimized': 'true',
        'X-Episode-ID': episodeId || '',
      },
      shouldCache: config.shouldCache,
      minLoadRetryCount: config.minLoadRetryCount,
      maxBitRate: config.maxBitRate,
    };
  }

  // Track performance metrics
  trackVideoLoad(episodeId: string, loadStartTime: number) {
    const loadTime = Date.now() - loadStartTime;
    
    this.performanceMetrics.set(episodeId, {
      loadTime,
      timestamp: Date.now(),
      isLowEndDevice: this.isLowEndDevice,
    });

    console.log('📊 iOS Video Load Performance:', {
      episodeId,
      loadTime: `${loadTime}ms`,
      isLowEndDevice: this.isLowEndDevice,
    });
  }

  // Get performance recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.isLowEndDevice) {
      recommendations.push('Using low-end device optimizations');
      recommendations.push('Reduced buffer sizes for faster start');
      recommendations.push('Lower bitrate for better performance');
    }

    // Check average load times
    const loadTimes = Array.from(this.performanceMetrics.values())
      .map(metric => metric.loadTime)
      .filter(time => time > 0);

    if (loadTimes.length > 0) {
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      
      if (avgLoadTime > 1000) {
        recommendations.push('High load times detected - consider reducing video quality');
      } else if (avgLoadTime < 500) {
        recommendations.push('Excellent load times - performance is optimal');
      }
    }

    return recommendations;
  }

  // Get memory management settings
  getMemoryConfig(): any {
    return IOS_PERFORMANCE_CONFIG.memoryConfig;
  }

  // Check if device needs aggressive optimizations
  needsAggressiveOptimizations(): boolean {
    return this.isLowEndDevice;
  }

  // Get iOS-specific video player props
  getIOSVideoPlayerProps(): any {
    return {
      // iOS-specific optimizations
      allowsExternalPlayback: false,
      automaticallyWaitsToMinimizeStalling: false,
      playInBackground: false,
      playWhenInactive: false,
      ignoreSilentSwitch: "ignore",
      audioOnly: false,
      useTextureView: false,
      bufferType: 'surface',
      
      // Performance optimizations
      progressUpdateInterval: this.isLowEndDevice ? 200 : 100,
      reportBandwidth: false,
      preventsDisplaySleepDuringVideoPlayback: true,
      
      // Buffer configuration
      bufferConfig: this.getOptimizedBufferConfig(),
    };
  }

  // Get performance summary
  getPerformanceSummary(): any {
    const metrics = Array.from(this.performanceMetrics.values());
    const avgLoadTime = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length 
      : 0;

    return {
      totalVideos: metrics.length,
      averageLoadTime: Math.round(avgLoadTime),
      isLowEndDevice: this.isLowEndDevice,
      recommendations: this.getPerformanceRecommendations(),
    };
  }

  // Clear performance metrics
  clearMetrics(): void {
    this.performanceMetrics.clear();
  }
}

export default IOSVideoPerformanceOptimizer.getInstance(); 