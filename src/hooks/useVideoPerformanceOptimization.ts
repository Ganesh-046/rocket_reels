import { useCallback, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

interface VideoPerformanceConfig {
  enableThrottling?: boolean;
  throttleInterval?: number;
  enableMemoryOptimization?: boolean;
  maxCachedEpisodes?: number;
  enableScrollOptimization?: boolean;
}

export const useVideoPerformanceOptimization = (config: VideoPerformanceConfig = {}) => {
  const {
    enableThrottling = true,
    throttleInterval = 500,
    enableMemoryOptimization = true,
    maxCachedEpisodes = 5,
    enableScrollOptimization = true,
  } = config;

  const lastUpdateTime = useRef(0);
  const cachedEpisodes = useRef<Set<string>>(new Set());
  const scrollVelocity = useRef(0);
  const lastScrollTime = useRef(0);

  // Throttle function for performance optimization
  const throttledUpdate = useCallback((callback: () => void) => {
    if (!enableThrottling) {
      callback();
      return;
    }

    const now = Date.now();
    if (now - lastUpdateTime.current >= throttleInterval) {
      lastUpdateTime.current = now;
      callback();
    }
  }, [enableThrottling, throttleInterval]);

  // Memory optimization for episode cache
  const optimizeMemory = useCallback(() => {
    if (!enableMemoryOptimization) return;

    InteractionManager.runAfterInteractions(() => {
      if (cachedEpisodes.current.size > maxCachedEpisodes) {
        // Remove oldest episodes from cache
        const episodesArray = Array.from(cachedEpisodes.current);
        const episodesToRemove = episodesArray.slice(0, episodesArray.length - maxCachedEpisodes);
        
        episodesToRemove.forEach(episodeId => {
          cachedEpisodes.current.delete(episodeId);
        });
      }
    });
  }, [enableMemoryOptimization, maxCachedEpisodes]);

  // Scroll velocity calculation for optimization
  const updateScrollVelocity = useCallback((currentTime: number) => {
    if (!enableScrollOptimization) return;

    const timeDiff = currentTime - lastScrollTime.current;
    if (timeDiff > 0) {
      scrollVelocity.current = 1000 / timeDiff; // pixels per second
    }
    lastScrollTime.current = currentTime;
  }, [enableScrollOptimization]);

  // Check if scrolling is too fast
  const isScrollingTooFast = useCallback(() => {
    return enableScrollOptimization && scrollVelocity.current > 50; // 50 pixels per second threshold
  }, [enableScrollOptimization]);

  // Add episode to cache
  const addToCache = useCallback((episodeId: string) => {
    cachedEpisodes.current.add(episodeId);
    optimizeMemory();
  }, [optimizeMemory]);

  // Remove episode from cache
  const removeFromCache = useCallback((episodeId: string) => {
    cachedEpisodes.current.delete(episodeId);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cachedEpisodes.current.clear();
    };
  }, []);

  return {
    throttledUpdate,
    optimizeMemory,
    updateScrollVelocity,
    isScrollingTooFast,
    addToCache,
    removeFromCache,
    cachedEpisodes: cachedEpisodes.current,
  };
}; 