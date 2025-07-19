import { instagramPerformanceOptimizer } from './instagramPerformanceOptimizer';

interface ScrollState {
  isScrolling: boolean;
  scrollVelocity: number;
  lastScrollTime: number;
  lastScrollY: number;
}

class InstagramScrollOptimizer {
  private scrollState: ScrollState = {
    isScrolling: false,
    scrollVelocity: 0,
    lastScrollTime: 0,
    lastScrollY: 0,
  };

  private scrollTimeoutRef: NodeJS.Timeout | null = null;
  private velocityHistory: number[] = [];
  private maxHistorySize = 5;

  // Instagram-style scroll handling
  handleScroll = (scrollY: number, timestamp: number = Date.now()) => {
    const timeDiff = timestamp - this.scrollState.lastScrollTime;
    const scrollDiff = scrollY - this.scrollState.lastScrollY;
    
    if (timeDiff > 0) {
      const velocity = scrollDiff / timeDiff;
      this.updateVelocityHistory(velocity);
      
      this.scrollState = {
        isScrolling: true,
        scrollVelocity: this.getAverageVelocity(),
        lastScrollTime: timestamp,
        lastScrollY: scrollY,
      };
    }

    // Clear existing timeout
    if (this.scrollTimeoutRef) {
      clearTimeout(this.scrollTimeoutRef);
    }

    // Set new timeout for scroll end detection
    this.scrollTimeoutRef = setTimeout(() => {
      this.scrollState.isScrolling = false;
      this.scrollState.scrollVelocity = 0;
    }, 50); // 50ms debounce (Instagram uses very short debounce)
  };

  private updateVelocityHistory(velocity: number) {
    this.velocityHistory.push(velocity);
    if (this.velocityHistory.length > this.maxHistorySize) {
      this.velocityHistory.shift();
    }
  }

  private getAverageVelocity(): number {
    if (this.velocityHistory.length === 0) return 0;
    return this.velocityHistory.reduce((sum, v) => sum + v, 0) / this.velocityHistory.length;
  }

  // Check if videos should be paused during scroll
  shouldPauseVideos(): boolean {
    return (
      this.scrollState.isScrolling &&
      Math.abs(this.scrollState.scrollVelocity) > 30 // Instagram threshold
    );
  }

  // Get current scroll state
  getScrollState(): ScrollState {
    return { ...this.scrollState };
  }

  // Check if scrolling is fast
  isScrollingFast(): boolean {
    return Math.abs(this.scrollState.scrollVelocity) > 50;
  }

  // Check if scrolling has stopped
  hasScrollingStopped(): boolean {
    return !this.scrollState.isScrolling && Math.abs(this.scrollState.scrollVelocity) < 5;
  }

  // Cleanup
  cleanup() {
    if (this.scrollTimeoutRef) {
      clearTimeout(this.scrollTimeoutRef);
      this.scrollTimeoutRef = null;
    }
    this.velocityHistory = [];
  }
}

export const instagramScrollOptimizer = new InstagramScrollOptimizer(); 