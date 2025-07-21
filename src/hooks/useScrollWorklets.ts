import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface ScrollWorkletConfig {
  enableScrollOptimization: boolean;
  enableParallax: boolean;
  enableStickyHeaders: boolean;
  scrollThreshold: number;
  animationDuration: number;
}

export const useScrollWorklets = (config: Partial<ScrollWorkletConfig> = {}) => {
  const {
    enableScrollOptimization = true,
    enableParallax = true,
    enableStickyHeaders = true,
    scrollThreshold = 50,
    animationDuration = 300,
  } = config;

  // Shared values for scroll state
  const scrollY = useSharedValue(0);
  const scrollVelocity = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const lastScrollTime = useSharedValue(0);

  // Derived values for performance optimization
  const isScrollingFast = useDerivedValue(() => {
    return Math.abs(scrollVelocity.value) > scrollThreshold;
  });

  const scrollProgress = useDerivedValue(() => {
    return interpolate(
      scrollY.value,
      [0, 1000], // Adjust based on your content height
      [0, 1],
      Extrapolate.CLAMP
    );
  });

  // Scroll handler with worklet optimizations
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      'worklet';
      
      const currentTime = Date.now();
      const timeDiff = currentTime - lastScrollTime.value;
      
      // Calculate velocity
      if (timeDiff > 0) {
        scrollVelocity.value = (event.contentOffset.y - scrollY.value) / timeDiff;
      }
      
      scrollY.value = event.contentOffset.y;
      lastScrollTime.value = currentTime;
      
      // Mark as scrolling
      isScrolling.value = true;
      
      // Reset scrolling state after delay
      if (enableScrollOptimization) {
        // Use runOnJS to call setTimeout equivalent
        runOnJS(() => {
          setTimeout(() => {
            isScrolling.value = false;
          }, 150);
        })();
      }
    },
    
    onBeginDrag: () => {
      'worklet';

    },
    
    onEndDrag: () => {
      'worklet';

    },
    
    onMomentumBegin: () => {
      'worklet';

    },
    
    onMomentumEnd: () => {
      'worklet';

    },
  });

  // Animated styles for scroll-based effects
  const parallaxStyle = useAnimatedStyle(() => {
    if (!enableParallax) return {};
    
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 200],
            [0, -50],
            Extrapolate.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [0, 200],
            [1, 0.95],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [1, 0.8],
        Extrapolate.CLAMP
      ),
    };
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    if (!enableStickyHeaders) return {};
    
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -100],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        scrollY.value,
        [0, 50, 100],
        [1, 0.8, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  const fadeInStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 100],
        [0, 1],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [20, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const scaleOnScrollStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(
            scrollY.value,
            [0, 200],
            [1, 1.1],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  // Performance optimization callbacks
  const onScrollOptimization = useCallback((callback: () => void) => {
    if (enableScrollOptimization) {
      // Only execute callback when not scrolling fast
      if (!isScrollingFast.value) {
        callback();
      }
    } else {
      callback();
    }
  }, [enableScrollOptimization, isScrollingFast]);

  // Smooth scroll to position
  const smoothScrollTo = useCallback((position: number, animated = true) => {
    if (animated) {
      scrollY.value = withTiming(position, {
        duration: animationDuration,
      });
    } else {
      scrollY.value = position;
    }
  }, [animationDuration]);

  // Spring scroll to position
  const springScrollTo = useCallback((position: number) => {
    scrollY.value = withSpring(position, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  // Get current scroll state
  const getScrollState = useCallback(() => {
    return {
      scrollY: scrollY.value,
      scrollVelocity: scrollVelocity.value,
      isScrolling: isScrolling.value,
      isScrollingFast: isScrollingFast.value,
      scrollProgress: scrollProgress.value,
    };
  }, [scrollY, scrollVelocity, isScrolling, isScrollingFast, scrollProgress]);

  return {
    // Shared values
    scrollY,
    scrollVelocity,
    isScrolling,
    isScrollingFast,
    scrollProgress,
    
    // Handlers
    scrollHandler,
    
    // Animated styles
    parallaxStyle,
    stickyHeaderStyle,
    fadeInStyle,
    scaleOnScrollStyle,
    
    // Utility functions
    onScrollOptimization,
    smoothScrollTo,
    springScrollTo,
    getScrollState,
  };
};

// Export types
export type { ScrollWorkletConfig }; 