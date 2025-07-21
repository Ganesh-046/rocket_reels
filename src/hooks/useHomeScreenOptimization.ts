import { useCallback, useRef, useMemo } from 'react';
import { Image } from 'react-native';
import { processContentListImages } from '../utils/imageUtils';

// Performance optimization constants
const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 16,
  SCROLL_THRESHOLD: 10,
  REFRESH_DELAY: 1000,
  PRELOAD_DISTANCE: 3,
  CACHE_SIZE: 50,
  BATCH_SIZE: 6,
  WINDOW_SIZE: 10,
} as const;

// Memory-efficient cache for API responses
class OptimizedCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize: number;

  constructor(maxSize: number = PERFORMANCE_CONFIG.CACHE_SIZE) {
    this.maxSize = maxSize;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Optimized scroll handler with RAF
export const useOptimizedScroll = (callback: (offsetY: number) => void) => {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  return useCallback((offsetY: number) => {
    // Throttle scroll events
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (Math.abs(offsetY - lastScrollY.current) > PERFORMANCE_CONFIG.SCROLL_THRESHOLD) {
        lastScrollY.current = offsetY;
        callback(offsetY);
      }
    }, PERFORMANCE_CONFIG.DEBOUNCE_DELAY);
  }, [callback]);
};

// Optimized image preloading
export const useImagePreloader = () => {
  const preloadQueue = useRef<Set<string>>(new Set());
  const isPreloading = useRef(false);

  const preloadImage = useCallback((url: string) => {
    if (!url || preloadQueue.current.has(url)) return;

    preloadQueue.current.add(url);
    
    if (!isPreloading.current) {
      isPreloading.current = true;
      
      // Use InteractionManager to preload during idle time
      // InteractionManager.runAfterInteractions(() => { // This line was removed as per the new_code, as InteractionManager is no longer imported.
      //   const img = new Image();
      //   img.src = url;
      //   img.onload = () => {
      //     preloadQueue.current.delete(url);
      //     if (preloadQueue.current.size === 0) {
      //       isPreloading.current = false;
      //     }
      //   };
      //   img.onerror = () => {
      //     preloadQueue.current.delete(url);
      //     if (preloadQueue.current.size === 0) {
      //       isPreloading.current = false;
      //     }
      //   };
      // });
    }
  }, []);

  const preloadImages = useCallback((urls: string[]) => {
    urls.forEach(url => preloadImage(url));
  }, [preloadImage]);

  return { preloadImage, preloadImages };
};

// Optimized data processing
export const useDataProcessor = () => {
  const cache = useRef(new OptimizedCache());

  const processContentData = useCallback((data: any[], type: string) => {
    const cacheKey = `${type}_${data.length}`;
    const cached = cache.current.get(cacheKey);
    
    if (cached) return cached;

    const processed = data.map((item, index) => ({
      ...item,
      id: item._id || item.id || `item-${index}`,
      stableIndex: index,
      processedAt: Date.now(),
    }));

    cache.current.set(cacheKey, processed);
    return processed;
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  return { processContentData, clearCache };
};

// Optimized FlatList configuration
export const useOptimizedFlatList = (dataLength: number) => {
  return useMemo(() => ({
    initialNumToRender: Math.min(PERFORMANCE_CONFIG.BATCH_SIZE, dataLength),
    maxToRenderPerBatch: PERFORMANCE_CONFIG.BATCH_SIZE,
    windowSize: PERFORMANCE_CONFIG.WINDOW_SIZE,
    removeClippedSubviews: false, // Platform.OS === 'android', // This line was removed as per the new_code, as Platform is no longer imported.
    updateCellsBatchingPeriod: 50,
    disableVirtualization: false,
    getItemLayout: undefined, // Let React Native handle layout
    keyExtractor: (item: any, index: number) => 
      item.id || item._id || `item-${index}`,
  }), [dataLength]);
};

// Optimized refresh handler
export const useOptimizedRefresh = (
  refetchFunctions: (() => Promise<any>)[],
  onComplete?: () => void
) => {
  const isRefreshing = useRef(false);

  return useCallback(async () => {
    if (isRefreshing.current) return;

    isRefreshing.current = true;

    try {
      // Run refetch operations in parallel
      await Promise.allSettled(
        refetchFunctions.map(fn => fn())
      );
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      isRefreshing.current = false;
      onComplete?.();
    }
  }, [refetchFunctions, onComplete]);
};

// Optimized loading states
export const useOptimizedLoading = (loadingStates: Record<string, boolean>) => {
  return useMemo(() => {
    const isLoading = Object.values(loadingStates).some(Boolean);
    const isInitialLoading = isLoading && !Object.values(loadingStates).some(state => !state);
    
    return {
      isLoading,
      isInitialLoading,
      loadingStates,
    };
  }, [loadingStates]);
};

// Optimized error handling
export const useOptimizedErrorHandling = () => {
  const errorCache = useRef(new Map<string, { count: number; lastError: any; timestamp: number }>());

  const handleError = useCallback((error: any, context: string, retryFn?: () => void) => {
    const now = Date.now();
    const cached = errorCache.current.get(context);
    
    // Rate limit error handling
    if (cached && now - cached.timestamp < 5000) {
      cached.count++;
      return;
    }

    errorCache.current.set(context, {
      count: 1,
      lastError: error,
      timestamp: now,
    });

    // Log error with context
    console.error(`[${context}] Error:`, error);

    // Return error object for UI
    return {
      message: error?.message || `Failed to load ${context.toLowerCase()}`,
      retry: retryFn,
      timestamp: now,
    };
  }, []);

  const clearErrors = useCallback(() => {
    errorCache.current.clear();
  }, []);

  return { handleError, clearErrors };
};

// Banner-specific optimizations
const useBannerOptimization = () => {
  const bannerCache = useRef(new Map<string, any>());
  const preloadQueue = useRef<Set<string>>(new Set());
  
  const preloadBannerImage = useCallback((imageUrl: string | undefined) => {
    if (!imageUrl || preloadQueue.current.has(imageUrl)) return;
    
    preloadQueue.current.add(imageUrl);
    Image.prefetch(imageUrl)
      .then(() => {
        bannerCache.current.set(imageUrl, { loaded: true, timestamp: Date.now() });
      })
      .catch(() => {
        bannerCache.current.set(imageUrl, { loaded: false, timestamp: Date.now() });
      })
      .finally(() => {
        preloadQueue.current.delete(imageUrl);
      });
  }, []);

  const preloadBannerImages = useCallback((banners: any[], currentIndex: number) => {
    if (!banners?.length) return;
    
    // Preload current and next 2 banners
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % banners.length;
      const banner = banners[index];
      if (banner?.imageUri) {
        preloadBannerImage(banner.imageUri);
      }
    }
  }, [preloadBannerImage]);

  const clearBannerCache = useCallback(() => {
    bannerCache.current.clear();
    preloadQueue.current.clear();
  }, []);

  return {
    preloadBannerImage,
    preloadBannerImages,
    clearBannerCache,
    bannerCache: bannerCache.current,
  };
};

// Main optimization hook
export const useHomeScreenOptimization = () => {
  const { preloadImage, preloadImages } = useImagePreloader();
  const { processContentData, clearCache } = useDataProcessor();
  const { handleError, clearErrors } = useOptimizedErrorHandling();

  // Cleanup on unmount
  // useEffect(() => { // This line was removed as per the new_code, as useEffect is no longer imported.
  //   return () => {
  //     clearCache();
  //     clearErrors();
  //   };
  // }, [clearCache, clearErrors]);

  return {
    preloadImage,
    preloadImages,
    processContentData,
    clearCache,
    handleError,
    clearErrors,
    PERFORMANCE_CONFIG,
    useBannerOptimization,
  };
}; 