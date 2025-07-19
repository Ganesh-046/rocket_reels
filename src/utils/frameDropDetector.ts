import { InteractionManager, UIManager, Platform } from 'react-native';
import { performanceMonitor } from './performanceMonitor';

interface FrameDropConfig {
  maxDropsPerSecond: number;
  lowResolutionThreshold: number;
  cacheClearThreshold: number;
  enablePreemptiveFlush: boolean;
}

class FrameDropDetector {
  private config: FrameDropConfig;
  private frameDropCount = 0;
  private lastFrameTime = 0;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private dropHistory: number[] = [];
  private maxHistorySize = 10;

  constructor(config: Partial<FrameDropConfig> = {}) {
    this.config = {
      maxDropsPerSecond: 3,
      lowResolutionThreshold: 5,
      cacheClearThreshold: 8,
      enablePreemptiveFlush: true,
      ...config,
    };
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.lastFrameTime = Date.now();
    
    // Monitor frame drops every 100ms
    this.monitoringInterval = setInterval(() => {
      this.checkFrameDrops();
    }, 100);

    console.log('🔍 Frame drop monitoring started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('🔍 Frame drop monitoring stopped');
  }

  private checkFrameDrops() {
    const currentTime = Date.now();
    const expectedFrameTime = 16.67; // 60 FPS = ~16.67ms per frame
    const actualFrameTime = currentTime - this.lastFrameTime;
    
    // If frame time is significantly higher than expected, count as drop
    if (actualFrameTime > expectedFrameTime * 1.5) {
      this.frameDropCount++;
      this.dropHistory.push(currentTime);
      
      // Keep only recent history
      if (this.dropHistory.length > this.maxHistorySize) {
        this.dropHistory.shift();
      }
    }
    
    this.lastFrameTime = currentTime;
    
    // Check if we need to trigger optimizations
    this.evaluatePerformance();
  }

  private evaluatePerformance() {
    const dropsInLastSecond = this.getDropsInLastSecond();
    
    if (dropsInLastSecond >= this.config.cacheClearThreshold) {
      this.triggerCacheClear();
    } else if (dropsInLastSecond >= this.config.lowResolutionThreshold) {
      this.triggerLowResolutionMode();
    } else if (dropsInLastSecond >= this.config.maxDropsPerSecond) {
      this.triggerPreemptiveFlush();
    }
  }

  private getDropsInLastSecond(): number {
    const oneSecondAgo = Date.now() - 1000;
    return this.dropHistory.filter(time => time > oneSecondAgo).length;
  }

  private triggerPreemptiveFlush() {
    if (!this.config.enablePreemptiveFlush) return;
    
    console.log('🚨 Triggering preemptive memory flush due to frame drops');
    
    // Trigger garbage collection and memory cleanup
    InteractionManager.runAfterInteractions(() => {
      // Clear non-essential caches
      this.clearNonEssentialCaches();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    });
  }

  private triggerLowResolutionMode() {
    console.log('📉 Switching to low resolution mode due to frame drops');
    
    // Emit event for components to switch to low resolution
    performanceMonitor.emit('lowResolutionMode', true);
  }

  private triggerCacheClear() {
    console.log('🧹 Triggering cache clear due to excessive frame drops');
    
    // Clear all caches
    this.clearAllCaches();
    
    // Emit event for components to reload with lower quality
    performanceMonitor.emit('cacheClear', true);
  }

  private clearNonEssentialCaches() {
    // Clear thumbnail caches, non-essential data
    // This would integrate with your existing cache system
    console.log('🧹 Clearing non-essential caches');
  }

  private clearAllCaches() {
    // Clear all video caches and force reload
    console.log('🧹 Clearing all caches');
    
    // This would integrate with your enhancedVideoCache
    // enhancedVideoCache.clearCache();
  }

  getFrameDropStats() {
    return {
      currentDrops: this.frameDropCount,
      dropsInLastSecond: this.getDropsInLastSecond(),
      isMonitoring: this.isMonitoring,
      dropHistory: this.dropHistory.length,
    };
  }

  reset() {
    this.frameDropCount = 0;
    this.dropHistory = [];
    this.lastFrameTime = Date.now();
  }
}

// Export singleton instance
export const frameDropDetector = new FrameDropDetector();

// Export types
export type { FrameDropConfig }; 