import { useCallback, useRef, useEffect, useState } from 'react';
import { advancedVideoOptimizer } from '../utils/advancedVideoOptimizer';
import { hardwareAcceleratedScroll } from '../utils/hardwareAcceleratedScroll';
import { instagramVideoCache } from '../utils/instagramOptimizedVideoCache';

interface AdvancedPerformanceMetrics {
  videoLoadTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  activeChunks: number;
  texturePoolSize: number;
  networkType: string;
  isConnected: boolean;
  isFast: boolean;
  scrollVelocity: number;
  isScrolling: boolean;
  frameRate: number;
  bufferSize: number;
}

interface PerformanceAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
}

export const useAdvancedPerformance = (videoId: string) => {
  const [metrics, setMetrics] = useState<AdvancedPerformanceMetrics>({
    videoLoadTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    activeChunks: 0,
    texturePoolSize: 0,
    networkType: 'unknown',
    isConnected: false,
    isFast: false,
    scrollVelocity: 0,
    isScrolling: false,
    frameRate: 60,
    bufferSize: 0,
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isOptimal, setIsOptimal] = useState(true);
  
  const loadStartTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(Date.now());
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    loadStartTimeRef.current = Date.now();
    frameCountRef.current = 0;
    lastFrameTimeRef.current = Date.now();
    
    console.log(`📊 Started advanced performance monitoring for video: ${videoId}`);
  }, [videoId]);

  // End performance monitoring and calculate metrics
  const endMonitoring = useCallback(async () => {
    const loadTime = Date.now() - loadStartTimeRef.current;
    
    // Get all performance stats
    const videoStats = advancedVideoOptimizer.getPerformanceStats();
    const scrollStats = hardwareAcceleratedScroll.getPerformanceStats();
    const cacheStats = await instagramVideoCache.getCacheStats();
    
    // Calculate frame rate
    const currentTime = Date.now();
    const timeDiff = currentTime - lastFrameTimeRef.current;
    const frameRate = timeDiff > 0 ? (frameCountRef.current / timeDiff) * 1000 : 60;
    
    const newMetrics: AdvancedPerformanceMetrics = {
      videoLoadTime: loadTime,
      cacheHitRate: cacheStats.fullyDownloaded / Math.max(cacheStats.videoCount, 1) * 100,
      memoryUsage: videoStats.memoryUsage,
      activeChunks: videoStats.activeChunks,
      texturePoolSize: videoStats.texturePoolSize,
      networkType: videoStats.networkType,
      isConnected: videoStats.isConnected,
      isFast: videoStats.isFast,
      scrollVelocity: scrollStats.currentVelocity.y,
      isScrolling: scrollStats.isScrolling,
      frameRate: Math.round(frameRate),
      bufferSize: ADVANCED_PERFORMANCE_CONFIG.bufferSize,
    };
    
    setMetrics(newMetrics);
    
    // Check if performance is optimal
    const optimal = checkPerformanceOptimal(newMetrics);
    setIsOptimal(optimal);
    
    // Add alerts for performance issues
    addPerformanceAlerts(newMetrics);
    
    console.log(`📊 Advanced performance metrics for ${videoId}:`, {
      loadTime: `${loadTime}ms`,
      cacheHitRate: `${newMetrics.cacheHitRate.toFixed(1)}%`,
      memoryUsage: `${(newMetrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      frameRate: `${newMetrics.frameRate} FPS`,
      scrollVelocity: `${Math.abs(newMetrics.scrollVelocity).toFixed(1)}`,
      isOptimal: optimal,
    });
  }, [videoId]);

  // Check if performance is optimal
  const checkPerformanceOptimal = useCallback((metrics: AdvancedPerformanceMetrics): boolean => {
    return (
      metrics.videoLoadTime < 1000 && // Load time under 1 second
      metrics.cacheHitRate > 70 && // Cache hit rate above 70%
      metrics.memoryUsage < 100 * 1024 * 1024 && // Memory under 100MB
      metrics.frameRate >= 50 && // Frame rate above 50 FPS
      metrics.activeChunks < 5 && // Less than 5 active chunks
      metrics.texturePoolSize < 8 // Less than 8 textures in pool
    );
  }, []);

  // Add performance alerts
  const addPerformanceAlerts = useCallback((metrics: AdvancedPerformanceMetrics) => {
    const newAlerts: PerformanceAlert[] = [];
    
    if (metrics.videoLoadTime > 2000) {
      newAlerts.push({
        type: 'warning',
        message: `Slow video loading: ${metrics.videoLoadTime}ms`,
        timestamp: Date.now(),
      });
    }
    
    if (metrics.cacheHitRate < 50) {
      newAlerts.push({
        type: 'warning',
        message: `Low cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%`,
        timestamp: Date.now(),
      });
    }
    
    if (metrics.memoryUsage > 150 * 1024 * 1024) {
      newAlerts.push({
        type: 'error',
        message: `High memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        timestamp: Date.now(),
      });
    }
    
    if (metrics.frameRate < 45) {
      newAlerts.push({
        type: 'error',
        message: `Low frame rate: ${metrics.frameRate} FPS`,
        timestamp: Date.now(),
      });
    }
    
    if (newAlerts.length > 0) {
      setAlerts(prev => [...prev, ...newAlerts].slice(-10)); // Keep last 10 alerts
    }
  }, []);

  // Update frame count for FPS calculation
  const updateFrameCount = useCallback(() => {
    frameCountRef.current++;
  }, []);

  // Get current metrics
  const getMetrics = useCallback(() => {
    return { ...metrics };
  }, [metrics]);

  // Get performance alerts
  const getAlerts = useCallback(() => {
    return [...alerts];
  }, [alerts]);

  // Clear alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get performance recommendations
  const getRecommendations = useCallback(() => {
    const recommendations: string[] = [];
    
    if (metrics.videoLoadTime > 1000) {
      recommendations.push('Consider reducing video quality or implementing better caching');
    }
    
    if (metrics.cacheHitRate < 70) {
      recommendations.push('Increase cache size or improve prefetching strategy');
    }
    
    if (metrics.memoryUsage > 100 * 1024 * 1024) {
      recommendations.push('Implement more aggressive memory cleanup');
    }
    
    if (metrics.frameRate < 50) {
      recommendations.push('Reduce video quality or optimize rendering pipeline');
    }
    
    return recommendations;
  }, [metrics]);

  // Start continuous monitoring
  useEffect(() => {
    startMonitoring();
    
    // Start continuous monitoring interval
    monitoringIntervalRef.current = setInterval(() => {
      updateFrameCount();
    }, 16); // 60 FPS monitoring
    
    return () => {
      endMonitoring();
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [startMonitoring, endMonitoring, updateFrameCount]);

  return {
    metrics,
    alerts,
    isOptimal,
    startMonitoring,
    endMonitoring,
    updateFrameCount,
    getMetrics,
    getAlerts,
    clearAlerts,
    getRecommendations,
  };
};

// Configuration for advanced performance
const ADVANCED_PERFORMANCE_CONFIG = {
  bufferSize: 1024 * 1024, // 1MB
  maxMemoryUsage: 150 * 1024 * 1024, // 150MB
  targetFrameRate: 60,
  targetLoadTime: 1000, // 1 second
  targetCacheHitRate: 70, // 70%
}; 