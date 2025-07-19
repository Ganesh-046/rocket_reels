import React, { useCallback, useMemo, useRef, useEffect, memo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import { useVideoStore, useVideoState, useIsVideoPlaying, useVideoProgress, useVideoDuration } from '../../../store/videoStore';
import { prefetchManager } from '../../../utils/prefetch';
import { performanceMonitor } from '../../../utils/performanceMonitor';
import { useVideoTransition } from '../../../hooks/useVideoTransition';
import { instagramVideoCache } from '../../../utils/instagramOptimizedVideoCache';
import { instagramPerformanceOptimizer } from '../../../utils/instagramPerformanceOptimizer';
import { advancedVideoOptimizer } from '../../../utils/advancedVideoOptimizer';
import { hardwareAcceleratedScroll } from '../../../utils/hardwareAcceleratedScroll';
import { videoQueue } from '../../../utils/videoQueue';
import { useAdvancedPerformance } from '../../../hooks/useAdvancedPerformance';
import VideoProgressBar from '../../../components/VideoPlayer/VideoProgressBar';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ReelItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  likes: number;
  comments: number;
  shares: number;
  author: string;
  duration: number;
  views: string;
  category?: string;
  tags?: string[];
}

interface ReelCardProps {
  item: ReelItem;
  index: number;
  isVisible: boolean;
  onPress: (item: ReelItem) => void;
  onLike: (itemId: string) => void;
  onShare: (item: ReelItem) => void;
  onComment: (itemId: string) => void;
  viewHeight: number;
  isActive: boolean;
  isScrolling?: boolean;
}

const ReelCard: React.FC<ReelCardProps> = memo(({
  item,
  index,
  isVisible,
  onPress,
  onLike,
  onShare,
  onComment,
  viewHeight,
  isActive,
  isScrolling = false,
}) => {
  // Refs for performance optimization
  const cardRef = useRef<View>(null);
  const videoRef = useRef<any>(null);
  const lastInteractionTime = useRef(0);
  const isMounted = useRef(true);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State for YouTube Shorts-like controls
  const [showControls, setShowControls] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  // Video store hooks
  const { setVideoPlaying, updateVideoState, setVideoProgress, setVideoCached, resetVideoProgress } = useVideoStore();
  const videoState = useVideoState(item.id);
  const isPlaying = useIsVideoPlaying(item.id);
  const progress = useVideoProgress(item.id);
  const duration = useVideoDuration(item.id);

  // Video transition hook for smooth playback
  useVideoTransition({
    videoId: item.id,
    isVisible,
    isActive,
    index,
    isScrolling,
  });

  // Advanced performance monitoring
  const { metrics, isOptimal, startMonitoring, endMonitoring } = useAdvancedPerformance(item.id);

  // Animated values for smooth interactions
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(1);
  const likeScaleValue = useSharedValue(1);
  const shareScaleValue = useSharedValue(1);
  const commentScaleValue = useSharedValue(1);
  const controlsOpacity = useSharedValue(0);

  // Memoized values for performance
  const formattedLikes = useMemo(() => {
    if (item.likes >= 1000000) {
      return `${(item.likes / 1000000).toFixed(1)}M`;
    } else if (item.likes >= 1000) {
      return `${(item.likes / 1000).toFixed(1)}K`;
    }
    return item.likes.toString();
  }, [item.likes]);

  const formattedViews = useMemo(() => {
    if (item.views.includes('K')) return item.views;
    const views = parseInt(item.views);
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return item.views;
  }, [item.views]);

  // Advanced Instagram-optimized video source configuration
  const videoSource = useMemo(() => {
    const optimizedConfig = advancedVideoOptimizer.getOptimizedVideoConfig();
    
    if (videoState?.cachedPath) {
      return { 
        uri: videoState.cachedPath,
        ...optimizedConfig,
      };
    }
    
    // Use actual video URL with fallback
    const actualVideoUrl = item.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';
    
    return {
      uri: actualVideoUrl,
      headers: {
        'Cache-Control': 'max-age=3600',
        'Accept-Encoding': 'gzip, deflate',
        'User-Agent': 'Instagram/219.0.0.29.118 Android', // Instagram user agent for better CDN
      },
      ...optimizedConfig,
      minLoadRetryCount: 1, // Reduced retry count for faster failure
      shouldCache: true,
    };
  }, [videoState?.cachedPath, item.videoUrl]);

  // Clear auto-hide timer
  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  // Show controls function
  const showControlsWithTimer = useCallback(() => {
    setShowControls(true);
    controlsOpacity.value = withTiming(1, { duration: 200 });
    
    // Clear existing timer
    clearAutoHideTimer();
    
    // Set new auto-hide timer
    autoHideTimerRef.current = setTimeout(() => {
      setShowControls(false);
      controlsOpacity.value = withTiming(0, { duration: 300 });
    }, 3000);
  }, [controlsOpacity, clearAutoHideTimer]);

  // Hide controls function
  const hideControls = useCallback(() => {
    setShowControls(false);
    controlsOpacity.value = withTiming(0, { duration: 200 });
    clearAutoHideTimer();
  }, [controlsOpacity, clearAutoHideTimer]);

  // Optimized video loading based on visibility and scrolling state
  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (!isMounted.current) return;

    // Clear existing timeout
    if (videoLoadTimeoutRef.current) {
      clearTimeout(videoLoadTimeoutRef.current);
      videoLoadTimeoutRef.current = null;
    }

    if (isVisible && !isScrolling) {
      // Load video with delay only if not already loaded
      if (!hasLoadedRef.current) {
        videoLoadTimeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            setShouldLoadVideo(true);
            hasLoadedRef.current = true;
          }
        }, 100);
      } else {
        // If already loaded, show immediately
        setShouldLoadVideo(true);
      }
    } else {
      setShouldLoadVideo(false);
    }
  }, [isVisible, isScrolling]);

  // Preload video when component mounts and should load
  useEffect(() => {
    if (!isMounted.current || !shouldLoadVideo) return;

    const preloadVideo = async () => {
      try {
        // Use advanced progressive video loading
        const cachedPath = await advancedVideoOptimizer.loadVideoProgressively(item.id, item.videoUrl);
        if (cachedPath !== item.videoUrl) {
          setVideoCached(item.id, cachedPath);
        }
      } catch (error) {
        console.warn('Video preload failed:', error);
      }
    };

    preloadVideo();
  }, [item.id, item.videoUrl, setVideoCached, shouldLoadVideo]);

  // Prefetch and performance monitoring with scroll awareness
  useEffect(() => {
    if (!isMounted.current || !shouldLoadVideo) return;

    if (isVisible && !isScrolling) {
      // Add to video queue
      videoQueue.addVideo(item.id, 'high', true);
      
      prefetchManager.updateCurrentIndex(index, [{
        id: item.id,
        videoUrl: item.videoUrl,
        thumbnailUrl: item.thumbnail,
        priority: 'high',
        index: index,
      }]);
      
      performanceMonitor.startVideoLoad(item.id);
    } else if (isVisible) {
      // Update visibility in queue
      videoQueue.updateVisibility(item.id, true);
    } else {
      // Update visibility in queue
      videoQueue.updateVisibility(item.id, false);
    }
  }, [isVisible, item.id, index, shouldLoadVideo, isScrolling]);

  // Hide controls when scrolling starts
  useEffect(() => {
    if (isScrolling) {
      hideControls();
    }
  }, [isScrolling, hideControls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      clearAutoHideTimer();
      if (videoLoadTimeoutRef.current) {
        clearTimeout(videoLoadTimeoutRef.current);
      }
      prefetchManager.cancelPrefetch(item.id);
      videoQueue.removeVideo(item.id);
    };
  }, [item.id, clearAutoHideTimer]);

  // Video event handlers
  const onLoad = useCallback(({ duration }: { duration: number }) => {
    updateVideoState(item.id, { duration, isReady: true });
  }, [item.id, updateVideoState]);

  const onReadyForDisplay = useCallback(() => {
    updateVideoState(item.id, { isReady: true });
  }, [item.id, updateVideoState]);

  const onProgress = useCallback(({ currentTime, seekableDuration }: { currentTime: number; seekableDuration: number }) => {
    if (seekableDuration > 0) {
      const progress = (currentTime / seekableDuration) * 100;
      setVideoProgress(item.id, progress);
    }
  }, [item.id, setVideoProgress]);

  const onBuffer = useCallback(({ isBuffering }: { isBuffering: boolean }) => {
    updateVideoState(item.id, { isBuffering });
  }, [item.id, updateVideoState]);

  const onError = useCallback((error: any) => {
    console.error('Video error:', error);
    updateVideoState(item.id, { error: error.error?.errorString || 'Video playback error' });
  }, [item.id, updateVideoState]);

  const onEnd = useCallback(() => {
    // Reset progress and loop the video
    resetVideoProgress(item.id);
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
  }, [item.id, resetVideoProgress]);

  // Animated styles for smooth interactions
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  const likeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: likeScaleValue.value }],
    };
  });

  const shareAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: shareScaleValue.value }],
    };
  });

  const commentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: commentScaleValue.value }],
    };
  });

  const controlsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: controlsOpacity.value,
    };
  });

  // Optimized touch handlers with debouncing
  const handleCardPress = useCallback(() => {
    const now = Date.now();
    if (now - lastInteractionTime.current < 300) return; // Debounce
    lastInteractionTime.current = now;

    // Show controls on tap (YouTube Shorts behavior)
    showControlsWithTimer();

    // Toggle play/pause state
    const newPlayingState = !isPlaying;
    setVideoPlaying(item.id, newPlayingState);

    // Animate press
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
    });

    console.log(`${newPlayingState ? '▶️' : '⏸️'} Video ${item.id} ${newPlayingState ? 'playing' : 'paused'}`);
  }, [item.id, isPlaying, setVideoPlaying, scaleValue, showControlsWithTimer]);

  const handleLikePress = useCallback(() => {
    const now = Date.now();
    if (now - lastInteractionTime.current < 200) return;
    lastInteractionTime.current = now;

    // Animate like button
    likeScaleValue.value = withSpring(1.3, {}, () => {
      likeScaleValue.value = withSpring(1);
    });

    onLike(item.id);
  }, [item.id, onLike, likeScaleValue]);

  const handleSharePress = useCallback(() => {
    const now = Date.now();
    if (now - lastInteractionTime.current < 200) return;
    lastInteractionTime.current = now;

    // Animate share button
    shareScaleValue.value = withSpring(1.2, {}, () => {
      shareScaleValue.value = withSpring(1);
    });

    onShare(item);
  }, [item, onShare, shareScaleValue]);

  const handleCommentPress = useCallback(() => {
    const now = Date.now();
    if (now - lastInteractionTime.current < 200) return;
    lastInteractionTime.current = now;

    // Animate comment button
    commentScaleValue.value = withSpring(1.2, {}, () => {
      commentScaleValue.value = withSpring(1);
    });

    onComment(item.id);
  }, [item.id, onComment, commentScaleValue]);

  // Render action button with optimized performance
  const renderActionButton = useCallback((
    icon: string,
    count: string,
    onPress: () => void,
    animatedStyle: any,
    isLiked?: boolean
  ) => (
    <Animated.View style={[styles.actionButton, animatedStyle]}>
      <TouchableOpacity
        style={styles.actionButtonTouchable}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={[styles.iconContainer, isLiked && styles.likedIconContainer]}>
          <Text style={styles.actionIcon}>{icon}</Text>
        </View>
        <Text style={styles.actionText}>{count}</Text>
      </TouchableOpacity>
    </Animated.View>
  ), []);

  return (
    <Animated.View
      ref={cardRef}
      style={[styles.container, cardAnimatedStyle]}
      collapsable={false}
    >
      {/* Video Container */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleCardPress}
        activeOpacity={1}
      >
        {/* Video Player - Always render, pause when not ready */}
        <Video
          ref={videoRef}
          source={videoSource}
          style={styles.video}
          resizeMode="cover"
          repeat={true}
          paused={!isPlaying || isScrolling} // Simplified pause logic - remove shouldLoadVideo condition
          muted={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="ignore"
          onLoad={onLoad}
          onReadyForDisplay={onReadyForDisplay}
          onProgress={onProgress}
          onBuffer={onBuffer}
          onError={onError}
          // Show thumbnail while video not ready
          poster={!shouldLoadVideo ? item.thumbnail : undefined}
          posterResizeMode="cover"
        />
        
        
        
        {/* Play/Pause Indicator - YouTube Shorts style */}
        <Animated.View style={[styles.playIndicator, controlsAnimatedStyle]}>
          <View style={[styles.playIndicatorBackground, isPlaying && { backgroundColor: 'rgba(0, 255, 0, 0.3)' }]}>
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </View>
        </Animated.View>

        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}s</Text>
        </View>

        {/* Subtle loading indicator - no text */}
        {videoState?.isBuffering && (
          <View style={styles.subtleLoadingOverlay}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom Overlay - All UI elements */}
      <View style={styles.bottomOverlay}>
        {/* Content Info */}
        <View style={styles.contentInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.author}>
            @{item.author} • {formattedViews} views
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {renderActionButton(
            '❤️',
            formattedLikes,
            handleLikePress,
            likeAnimatedStyle,
            videoState?.isLiked
          )}
          
          {renderActionButton(
            '💬',
            item.comments.toString(),
            handleCommentPress,
            commentAnimatedStyle
          )}
          
          {renderActionButton(
            '📤',
            item.shares.toString(),
            handleSharePress,
            shareAnimatedStyle
          )}
        </View>

        {/* Progress Bar */}
        <VideoProgressBar
          progress={progress}
          duration={duration}
          isVisible={isVisible}
          isPlaying={isPlaying}
          isBuffering={videoState?.isBuffering}
        />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000000',
    position: 'relative',
    zIndex: 1,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#1a1a1a',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    zIndex: 1000,
  },
  playIndicatorBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  durationBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  subtleLoadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  loadingSpinner: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40, // Increased padding to ensure progress bar is visible
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentInfo: {
    marginBottom: 16,
    paddingRight: 80, // Space for action buttons
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  author: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonTouchable: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  likedIconContainer: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

// Display name for debugging
ReelCard.displayName = 'ReelCard';

export default ReelCard;
