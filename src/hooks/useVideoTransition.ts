import { useCallback, useRef, useEffect } from 'react';
import { useVideoStore } from '../store/videoStore';

interface UseVideoTransitionProps {
  videoId: string;
  isVisible: boolean;
  isActive: boolean;
  index: number;
  isScrolling?: boolean; // Add scrolling state
}

export const useVideoTransition = ({
  videoId,
  isVisible,
  isActive,
  index,
  isScrolling = false,
}: UseVideoTransitionProps) => {
  const { setVideoPlaying, updateVideoState } = useVideoStore();
  const lastVisibilityState = useRef({ isVisible: false, isActive: false, isScrolling: false });
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any pending timeouts
  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  // Handle video transitions with optimized timing and scroll awareness
  useEffect(() => {
    const prevState = lastVisibilityState.current;
    const currentState = { isVisible, isActive, isScrolling };

    // Clear any pending transitions
    clearTransitionTimeout();

    // If scrolling, pause all videos immediately
    if (isScrolling) {
      setVideoPlaying(videoId, false);
      updateVideoState(videoId, { 
        isVisible: false, 
        lastAccessed: Date.now() 
      });
      
      return;
    }

    if (isVisible && isActive && !isScrolling) {
      // Video is visible, active, and not scrolling - play with delay
      transitionTimeoutRef.current = setTimeout(() => {
        setVideoPlaying(videoId, true);
        updateVideoState(videoId, { 
          isVisible: true, 
          lastAccessed: Date.now() 
        });

      }, 100); // Small delay to prevent rapid play/pause during scroll
    } else if (isVisible && !isActive && !isScrolling) {
      // Video is visible but not active - pause with minimal delay
      transitionTimeoutRef.current = setTimeout(() => {
        setVideoPlaying(videoId, false);

      }, 50); // Very short delay to prevent flickering
      
      updateVideoState(videoId, { 
        isVisible: true, 
        lastAccessed: Date.now() 
      });
    } else if (!isVisible) {
      // Video is not visible - pause immediately
      setVideoPlaying(videoId, false);
      updateVideoState(videoId, { isVisible: false });
      
    }

    // Update last known state
    lastVisibilityState.current = currentState;
  }, [isVisible, isActive, isScrolling, videoId, setVideoPlaying, updateVideoState, clearTransitionTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTransitionTimeout();
    };
  }, [clearTransitionTimeout]);

  return {
    clearTransitionTimeout,
  };
}; 