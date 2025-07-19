import { Platform } from 'react-native';
import { instagramScrollOptimizer } from './instagramScrollOptimizer';

// Hardware acceleration configuration
const HARDWARE_SCROLL_CONFIG = {
  // Scroll thresholds
  velocityThreshold: 30,
  fastScrollThreshold: 50,
  inertialScrollDuration: 300,
  
  // Performance optimizations
  frameRate: 60,
  batchSize: 3,
  debounceTime: 16, // 60fps = 16ms
  
  // Memory management
  maxVelocityHistory: 10,
  cleanupInterval: 5000, // 5 seconds
};

interface ScrollVelocity {
  x: number;
  y: number;
  timestamp: number;
}

interface ScrollPrediction {
  willStopAt: number;
  estimatedTime: number;
  confidence: number;
}

class HardwareAcceleratedScroll {
  private velocityHistory: ScrollVelocity[] = [];
  private lastScrollPosition = { x: 0, y: 0 };
  private lastScrollTime = 0;
  private isScrolling = false;
  private scrollDirection: 'up' | 'down' | 'none' = 'none';
  private predictionTimeout: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  // Main scroll handler with hardware acceleration
  handleScroll = (scrollY: number, scrollX: number = 0, timestamp: number = Date.now()) => {
    // Calculate velocity
    const timeDiff = timestamp - this.lastScrollTime;
    const scrollDiffY = scrollY - this.lastScrollPosition.y;
    const scrollDiffX = scrollX - this.lastScrollPosition.x;
    
    if (timeDiff > 0) {
      const velocityY = scrollDiffY / timeDiff;
      const velocityX = scrollDiffX / timeDiff;
      
      this.updateVelocityHistory({ x: velocityX, y: velocityY, timestamp });
      this.updateScrollDirection(velocityY);
      
      // Update state
      this.lastScrollPosition = { x: scrollX, y: scrollY };
      this.lastScrollTime = timestamp;
      this.isScrolling = true;
      
      // Predict scroll behavior
      this.predictScrollBehavior();
      
      // Clear existing timeout
      if (this.predictionTimeout) {
        clearTimeout(this.predictionTimeout);
      }
      
      // Set timeout for scroll end detection
      this.predictionTimeout = setTimeout(() => {
        this.isScrolling = false;
        this.scrollDirection = 'none';
      }, HARDWARE_SCROLL_CONFIG.inertialScrollDuration);
    }
  };

  private updateVelocityHistory(velocity: ScrollVelocity): void {
    this.velocityHistory.push(velocity);
    
    // Keep only recent velocities
    if (this.velocityHistory.length > HARDWARE_SCROLL_CONFIG.maxVelocityHistory) {
      this.velocityHistory.shift();
    }
  }

  private updateScrollDirection(velocityY: number): void {
    if (Math.abs(velocityY) < 5) {
      this.scrollDirection = 'none';
    } else if (velocityY > 0) {
      this.scrollDirection = 'down';
    } else {
      this.scrollDirection = 'up';
    }
  }

  private predictScrollBehavior(): ScrollPrediction | null {
    if (this.velocityHistory.length < 3) return null;
    
    // Calculate average velocity
    const recentVelocities = this.velocityHistory.slice(-3);
    const avgVelocityY = recentVelocities.reduce((sum, v) => sum + v.y, 0) / recentVelocities.length;
    
    // Predict when scrolling will stop
    const deceleration = 0.95; // 5% deceleration per frame
    const framesToStop = Math.log(5 / Math.abs(avgVelocityY)) / Math.log(deceleration);
    const estimatedTime = framesToStop * (1000 / HARDWARE_SCROLL_CONFIG.frameRate);
    
    return {
      willStopAt: this.lastScrollPosition.y + (avgVelocityY * estimatedTime / 1000),
      estimatedTime,
      confidence: Math.min(1, Math.abs(avgVelocityY) / 100),
    };
  }

  // Check if videos should be paused
  shouldPauseVideos(): boolean {
    const currentVelocity = this.getCurrentVelocity();
    return (
      this.isScrolling &&
      Math.abs(currentVelocity.y) > HARDWARE_SCROLL_CONFIG.velocityThreshold
    );
  }

  // Check if scrolling is fast
  isScrollingFast(): boolean {
    const currentVelocity = this.getCurrentVelocity();
    return Math.abs(currentVelocity.y) > HARDWARE_SCROLL_CONFIG.fastScrollThreshold;
  }

  // Get current velocity
  getCurrentVelocity(): ScrollVelocity {
    if (this.velocityHistory.length === 0) {
      return { x: 0, y: 0, timestamp: Date.now() };
    }
    
    // Return the most recent velocity
    return this.velocityHistory[this.velocityHistory.length - 1];
  }

  // Get scroll direction
  getScrollDirection(): 'up' | 'down' | 'none' {
    return this.scrollDirection;
  }

  // Get scroll state
  getScrollState() {
    return {
      isScrolling: this.isScrolling,
      direction: this.scrollDirection,
      velocity: this.getCurrentVelocity(),
      position: this.lastScrollPosition,
    };
  }

  // Optimized scroll configuration for FlatList
  getOptimizedScrollConfig() {
    return {
      scrollEventThrottle: HARDWARE_SCROLL_CONFIG.debounceTime,
      showsVerticalScrollIndicator: false,
      pagingEnabled: true,
      snapToInterval: undefined, // Will be set by parent
      snapToAlignment: 'start' as const,
      decelerationRate: 'fast' as const,
      removeClippedSubviews: Platform.OS === 'android',
      maxToRenderPerBatch: HARDWARE_SCROLL_CONFIG.batchSize,
      windowSize: 5,
      initialNumToRender: 1,
      updateCellsBatchingPeriod: HARDWARE_SCROLL_CONFIG.debounceTime,
      // Platform-specific optimizations
      ...(Platform.OS === 'ios' ? {
        automaticallyAdjustContentInsets: false,
        automaticallyAdjustKeyboardInsets: false,
      } : {
        overScrollMode: 'never' as const,
        nestedScrollEnabled: false,
      }),
    };
  }

  // Hardware acceleration hints
  getHardwareAccelerationHints() {
    return {
      useHardwareAcceleration: true,
      enableOverScroll: false,
      optimizeForPerformance: true,
      reduceMotion: false,
    };
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      isScrolling: this.isScrolling,
      velocityHistoryLength: this.velocityHistory.length,
      currentVelocity: this.getCurrentVelocity(),
      scrollDirection: this.scrollDirection,
      lastScrollTime: this.lastScrollTime,
    };
  }

  // Cleanup
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, HARDWARE_SCROLL_CONFIG.cleanupInterval);
  }

  private cleanup(): void {
    // Remove old velocity entries
    const now = Date.now();
    this.velocityHistory = this.velocityHistory.filter(
      velocity => now - velocity.timestamp < 1000 // Keep only last second
    );
  }

  // Dispose
  dispose(): void {
    if (this.predictionTimeout) {
      clearTimeout(this.predictionTimeout);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.velocityHistory = [];
  }
}

export const hardwareAcceleratedScroll = new HardwareAcceleratedScroll(); 