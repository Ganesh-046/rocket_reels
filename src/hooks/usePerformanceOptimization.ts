import { useCallback, useRef, useEffect, useMemo } from 'react';
import { InteractionManager, Platform } from 'react-native';
import { useVideoStore } from '../store/videoStore';
import { prefetchManager } from '../utils/prefetch';
import { performanceMonitor } from '../utils/performanceMonitor';

interface PerformanceConfig {
  enablePrefetch: boolean;
  enableMemoryOptimization: boolean;
  enableScrollOptimization: boolean;
  maxCachedVideos: number;
  prefetchDistance: number;
}

interface UsePerformanceOptimizationReturn {
  // Memory management
  cleanupUnusedVideos: () => void;
  optimizeMemory: () => void;
  
  // Scroll optimization
  handleScrollOptimization: (currentIndex: number, totalItems: number) => void;
  debounceScroll: (callback: () => void, delay?: number) => void;
  
  // Visibility management
  handleVisibilityChange: (index: number, isVisible: boolean) => void;
  updateActiveVideo: (index: number, videoId: string) => void;
  
  // Performance monitoring
  startPerformanceTracking: () => void;
  endPerformanceTracking: () => void;
  
  // Cache management
  clearCache: () => void;
  getCacheStats: () => Promise<any>;
}

export const usePerformanceOptimization = (
  config: Partial<PerformanceConfig> = {}
): UsePerformanceOptimizationReturn => {
  const {
    enablePrefetch = true,
    enableMemoryOptimization = true,
    enableScrollOptimization = true,
    maxCachedVideos = 10,
    prefetchDistance = 3,
  } = config;

  // Refs for performance tracking
  const lastScrollTime = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const performanceStartTime = useRef(0);
  const isTracking = useRef(false);

  // Video store
  const { clearCache: clearVideoCache, videos } = useVideoStore();

  // Memoized config for performance
  const memoizedConfig = useMemo(() => ({
    enablePrefetch,
    enableMemoryOptimization,
    enableScrollOptimization,
    maxCachedVideos,
    prefetchDistance,
  }), [enablePrefetch, enableMemoryOptimization, enableScrollOptimization, maxCachedVideos, prefetchDistance]);

  // Memory cleanup function
  const cleanupUnusedVideos = useCallback(() => {
    if (!memoizedConfig.enableMemoryOptimization) return;

    InteractionManager.runAfterInteractions(() => {
      const videoEntries = Array.from(videos.entries());
      
      if (videoEntries.length > maxCachedVideos) {
        // Sort by last accessed time and remove oldest
        const sortedVideos = videoEntries.sort(([, a], [, b]) => {
          const aTime = a.lastAccessed || 0;
          const bTime = b.lastAccessed || 0;
          return aTime - bTime;
        });

        // Remove oldest videos beyond the limit
        const videosToRemove = sortedVideos.slice(0, videoEntries.length - maxCachedVideos);
        
        videosToRemove.forEach(([videoId]) => {
          // This would be handled by the video store cleanup
          console.log(`🧹 Cleaning up video: ${videoId}`);
        });
      }
    });
  }, [videos, memoizedConfig.enableMemoryOptimization, maxCachedVideos]);

  // Memory optimization
  const optimizeMemory = useCallback(() => {
    if (!memoizedConfig.enableMemoryOptimization) return;

    // Run memory optimization after interactions
    InteractionManager.runAfterInteractions(() => {
      // Clear unused video cache
      cleanupUnusedVideos();
      
      // Trigger garbage collection on Android
      if (Platform.OS === 'android') {
        // In a real app, you might use a native module to trigger GC
        console.log('🔄 Triggering memory optimization');
      }
      
      // Log memory usage
      performanceMonitor.logPerformanceSummary();
    });
  }, [memoizedConfig.enableMemoryOptimization, cleanupUnusedVideos]);

  // Scroll optimization with debouncing
  const handleScrollOptimization = useCallback((currentIndex: number, totalItems: number) => {
    if (!memoizedConfig.enableScrollOptimization) return;

    const now = Date.now();
    if (now - lastScrollTime.current < 100) return; // Debounce scroll events
    
    lastScrollTime.current = now;

    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce scroll optimization
    scrollTimeoutRef.current = setTimeout(() => {
      // Optimize based on scroll position
      if (currentIndex > totalItems * 0.8) {
        // Near end of list, start prefetching more content
        console.log('📜 Near end of list, triggering prefetch');
      }
      
      // Cleanup old videos if scrolled significantly
      if (currentIndex > 20) {
        cleanupUnusedVideos();
      }
    }, 200);
  }, [memoizedConfig.enableScrollOptimization, cleanupUnusedVideos]);

  // Debounced scroll handler
  const debounceScroll = useCallback((callback: () => void, delay: number = 100) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(callback, delay);
  }, []);

  // Visibility change handler
  const handleVisibilityChange = useCallback((index: number, isVisible: boolean) => {
    if (!memoizedConfig.enablePrefetch) return;

    if (isVisible) {
      // Start prefetching when item becomes visible
      performanceMonitor.startVideoLoad(`item-${index}`);
      
      // Update prefetch manager
      prefetchManager.updateCurrentIndex(index, []);
    } else {
      // Stop tracking when item becomes invisible
      performanceMonitor.endVideoLoad(`item-${index}`, false);
    }
  }, [memoizedConfig.enablePrefetch]);

  // Update active video
  const updateActiveVideo = useCallback((index: number, videoId: string) => {
    // Update current video in store
    // This would be handled by the video store
    console.log(`🎬 Active video changed: ${videoId} at index ${index}`);
  }, []);

  // Performance tracking
  const startPerformanceTracking = useCallback(() => {
    if (isTracking.current) return;
    
    isTracking.current = true;
    performanceStartTime.current = Date.now();
    console.log('📊 Performance tracking started');
  }, []);

  const endPerformanceTracking = useCallback(() => {
    if (!isTracking.current) return;
    
    isTracking.current = false;
    const duration = Date.now() - performanceStartTime.current;
    console.log(`📊 Performance tracking ended. Duration: ${duration}ms`);
    
    // Log performance summary
    performanceMonitor.logPerformanceSummary();
  }, []);

  // Cache management
  const clearCache = useCallback(() => {
    clearVideoCache();
    prefetchManager.clearPrefetchQueue();
    console.log('🗑️ Cache cleared');
  }, [clearVideoCache]);

  const getCacheStats = useCallback(async () => {
    try {
      const stats = await performanceMonitor.getPerformanceMetrics();
      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      if (isTracking.current) {
        endPerformanceTracking();
      }
    };
  }, [endPerformanceTracking]);

  // Periodic memory optimization
  useEffect(() => {
    if (!memoizedConfig.enableMemoryOptimization) return;

    const interval = setInterval(() => {
      optimizeMemory();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [memoizedConfig.enableMemoryOptimization, optimizeMemory]);

  return {
    cleanupUnusedVideos,
    optimizeMemory,
    handleScrollOptimization,
    debounceScroll,
    handleVisibilityChange,
    updateActiveVideo,
    startPerformanceTracking,
    endPerformanceTracking,
    clearCache,
    getCacheStats,
  };
}; 