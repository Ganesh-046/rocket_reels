import { useCallback, useRef, useEffect } from 'react';
import { instagramPerformanceOptimizer } from '../utils/instagramPerformanceOptimizer';
import { instagramVideoCache } from '../utils/instagramOptimizedVideoCache';

interface PerformanceMetrics {
  videoLoadTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  activeLoads: number;
  queueLength: number;
}

export const useInstagramPerformance = (videoId: string) => {
  const metricsRef = useRef<PerformanceMetrics>({
    videoLoadTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    activeLoads: 0,
    queueLength: 0,
  });

  const loadStartTimeRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);

  // Start tracking video load performance
  const startTracking = useCallback(() => {
    if (isTrackingRef.current) return;
    
    isTrackingRef.current = true;
    loadStartTimeRef.current = Date.now();
    
  }, [videoId]);

  // End tracking and calculate metrics
  const endTracking = useCallback(async () => {
    if (!isTrackingRef.current) return;
    
    const loadTime = Date.now() - loadStartTimeRef.current;
    const stats = instagramPerformanceOptimizer.getPerformanceStats();
    const cacheStats = await instagramVideoCache.getCacheStats();
    
    metricsRef.current = {
      videoLoadTime: loadTime,
      cacheHitRate: cacheStats.fullyDownloaded / Math.max(cacheStats.videoCount, 1) * 100,
      memoryUsage: stats.memoryUsage,
      activeLoads: stats.activeLoads,
      queueLength: stats.queueLength,
    };
    
    isTrackingRef.current = false;
    
      loadTime: `${loadTime}ms`,
      cacheHitRate: `${metricsRef.current.cacheHitRate.toFixed(1)}%`,
      memoryUsage: `${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      activeLoads: stats.activeLoads,
      queueLength: stats.queueLength,
    });
  }, [videoId]);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metricsRef.current };
  }, []);

  // Check if performance is optimal
  const isPerformanceOptimal = useCallback(() => {
    const metrics = metricsRef.current;
    return (
      metrics.videoLoadTime < 1000 && // Load time under 1 second
      metrics.cacheHitRate > 70 && // Cache hit rate above 70%
      metrics.memoryUsage < 100 * 1024 * 1024 && // Memory under 100MB
      metrics.activeLoads < 3 && // Less than 3 active loads
      metrics.queueLength < 5 // Queue length under 5
    );
  }, []);

  // Auto-track when component mounts/unmounts
  useEffect(() => {
    startTracking();
    
    return () => {
      endTracking();
    };
  }, [startTracking, endTracking]);

  return {
    startTracking,
    endTracking,
    getMetrics,
    isPerformanceOptimal,
  };
}; 