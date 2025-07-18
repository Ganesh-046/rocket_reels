import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useVideoStore, useVideoState, useIsVideoPlaying, useIsVideoCached, useVideoProgress, useVideoDuration } from '../../store/videoStore';
import { enhancedVideoCache } from '../../utils/enhancedVideoCache';
import VideoProgressBar from './VideoProgressBar';
import WatchNowButton from '../common/WatchNowButton';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoItem {
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
}

interface EnhancedVideoPlayerProps {
  item: VideoItem;
  index: number;
  isVisible: boolean;
  onEnd: () => void;
  onShare: (item: VideoItem) => void;
  onLike: (itemId: string) => void;
  onWatchNow?: (item: VideoItem) => void; // Add Watch Now handler
  viewHeight: number;
  isScrolling?: boolean; // Add scrolling state prop
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  item,
  index,
  isVisible,
  onEnd,
  onShare,
  onLike,
  onWatchNow,
  viewHeight,
  isScrolling = false, // Default to false
}) => {
  const videoRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  
  const { 
    setVideoPlaying, 
    setVideoProgress, 
    setVideoCached, 
    updateVideoState,
    setControllerVisible,
  } = useVideoStore();

  // Get video state from store
  const videoState = useVideoState(item.id);
  const isPlaying = useIsVideoPlaying(item.id);
  const isCached = useIsVideoCached(item.id);
  const progress = useVideoProgress(item.id);
  const duration = useVideoDuration(item.id);

  // Local state for pause button visibility
  const [showPauseButton, setShowPauseButton] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animated values
  const progressValue = useSharedValue(0);
  const opacityValue = useSharedValue(1);
  const scaleValue = useSharedValue(1);
  const controllerOpacity = useSharedValue(1);
  const pauseButtonOpacity = useSharedValue(0); // Start hidden



  // Memoized video source
  const videoSource = useMemo(() => ({
    uri: videoState?.cachedPath || item.videoUrl,
    headers: {
      'Cache-Control': 'max-age=3600',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'RocketReels/1.0',
    },
    bufferConfig: {
      minBufferMs: 500, // Reduced for faster start
      maxBufferMs: 3000, // Reduced for faster response
      bufferForPlaybackMs: 200, // Reduced for immediate playback
      bufferForPlaybackAfterRebufferMs: 500, // Reduced for faster recovery
      backBufferDurationMs: 2000, // Reduced for memory efficiency
      maxHeapAllocationPercent: 0.2, // Reduced for better performance
    },
    minLoadRetryCount: 3,
    shouldCache: true,
  }), [videoState?.cachedPath, item.videoUrl]);

  // Function to show pause button with auto-hide
  const showPauseButtonWithTimer = useCallback(() => {
    // Clear existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Show pause button
    setShowPauseButton(true);
    pauseButtonOpacity.value = withTiming(1, { duration: 200 });

    // Auto-hide after 3 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setShowPauseButton(false);
      pauseButtonOpacity.value = withTiming(0, { duration: 300 });
    }, 3000);
  }, [pauseButtonOpacity]);

  // Function to hide pause button immediately
  const hidePauseButton = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowPauseButton(false);
    pauseButtonOpacity.value = withTiming(0, { duration: 200 });
  }, [pauseButtonOpacity]);

  // Handle scrolling state changes
  useEffect(() => {
    if (isScrolling) {
      hidePauseButton();
    }
  }, [isScrolling, hidePauseButton]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Preload video when component mounts
  useEffect(() => {
    const preloadVideo = async () => {
      try {
        const cachedPath = await enhancedVideoCache.cacheVideo(item.videoUrl, item.id, 'high'); // High priority
        if (cachedPath !== item.videoUrl) {
          setVideoCached(item.id, cachedPath);
        }
      } catch (error) {
        console.error('Error preloading video:', error);
      }
    };

    preloadVideo();
  }, [item.id, item.videoUrl, setVideoCached]);

  // Start playing immediately when component mounts if visible
  useEffect(() => {
    if (isVisible) {
      // Immediate play without any delay
      setVideoPlaying(item.id, true);
    }
  }, [isVisible, item.id, setVideoPlaying]);

  // Handle visibility changes with optimized timing
  useEffect(() => {
    if (isVisible) {
      // Start playing immediately when visible
      setVideoPlaying(item.id, true);
      controllerOpacity.value = withTiming(1, { duration: 50 });
    } else {
      // Pause when not visible with minimal delay to prevent flickering
      setTimeout(() => {
        setVideoPlaying(item.id, false);
      }, 30);
      controllerOpacity.value = withTiming(0, { duration: 50 });
      // Hide pause button when not visible
      hidePauseButton();
    }
  }, [isVisible, item.id, setVideoPlaying, controllerOpacity, hidePauseButton]);

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
      progressValue.value = withTiming(progress, { duration: 100 });
    }
  }, [item.id, setVideoProgress, progressValue]);

  const onBuffer = useCallback(({ isBuffering }: { isBuffering: boolean }) => {
    updateVideoState(item.id, { isBuffering });
  }, [item.id, updateVideoState]);

  const onError = useCallback((error: any) => {
    console.error('Video error:', error);
    updateVideoState(item.id, { error: error.error?.errorString || 'Video playback error' });
  }, [item.id, updateVideoState]);

  const handleVideoEnd = useCallback(() => {
    setVideoPlaying(item.id, false);
    progressValue.value = 0;
    runOnJS(onEnd)();
  }, [item.id, setVideoPlaying, progressValue, onEnd]);

  // Touch handlers
  const handleVideoPress = useCallback(() => {
    setControllerVisible(true);
    controllerOpacity.value = withTiming(1, { duration: 200 });
    
    // Show pause button on tap
    showPauseButtonWithTimer();
  }, [setControllerVisible, controllerOpacity, showPauseButtonWithTimer]);

  const handlePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying;
    setVideoPlaying(item.id, newPlayingState);
    
    // Animate play button
    scaleValue.value = withSpring(0.8, {}, () => {
      scaleValue.value = withSpring(1);
    });

    // Show pause button when manually toggling
    showPauseButtonWithTimer();
  }, [isPlaying, item.id, setVideoPlaying, scaleValue, showPauseButtonWithTimer]);

  const handleLikePress = useCallback(() => {
    onLike(item.id);
    // Animate like button
    scaleValue.value = withSpring(1.2, {}, () => {
      scaleValue.value = withSpring(1);
    });
  }, [item.id, onLike, scaleValue]);

  const handleSharePress = useCallback(() => {
    onShare(item);
  }, [item, onShare]);

  // Animated styles
  const progressBarStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      width: `${progressValue.value}%`,
    };
  });

  const controllerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: controllerOpacity.value,
    };
  });

  const playButtonStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const likeButtonStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const pauseButtonStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: pauseButtonOpacity.value,
      transform: [{ scale: scaleValue.value }],
    };
  });

  return (
    <View style={styles.container}>
      {/* Video Component */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          style={styles.video}
          source={videoSource}
          repeat={true}
          resizeMode="cover"
          paused={!isPlaying} // Depend on isPlaying state
          controls={false}
          playInBackground={false}
          poster={item.thumbnail}
          posterResizeMode="cover"
          preventsDisplaySleepDuringVideoPlayback
          onError={onError}
          onLoad={onLoad}
          onBuffer={onBuffer}
          onProgress={onProgress}
          playWhenInactive={false}
          progressUpdateInterval={500} // Reduced for smoother progress
          reportBandwidth
          onReadyForDisplay={onReadyForDisplay}
          ignoreSilentSwitch="ignore"
          automaticallyWaitsToMinimizeStalling={false} // Disabled for immediate playback
        />



        {/* Loading Indicator */}
        {videoState?.isBuffering && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}

        {/* Cache Status Indicator */}
        {isCached && (
          <View style={styles.cacheIndicator}>
            <Icon name="offline-pin" size={16} color="#4ade80" />
          </View>
        )}
      </TouchableOpacity>

      {/* Play/Pause Button - Only show when showPauseButton is true */}
      {showPauseButton && (
        <Animated.View style={[styles.playButton, pauseButtonStyle]}>
          <TouchableOpacity
            style={styles.playButtonTouchable}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Icon
              name={isPlaying ? "pause" : "play-arrow"}
              color="#ffffff"
              size={50}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Bottom Overlay - All UI elements */}
      <View style={styles.bottomOverlay}>
        {/* Content Info */}
        <View style={styles.contentInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.author}>
            @{item.author} • {item.views} views
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Animated.View style={[styles.actionButton, likeButtonStyle]}>
            <TouchableOpacity
              style={styles.actionButtonTouchable}
              onPress={handleLikePress}
              activeOpacity={0.8}
            >
              <View style={styles.iconContainer}>
                <Icon name="favorite-border" color="#ffffff" size={28} />
              </View>
              <Text style={styles.actionText}>
                {item.likes.toLocaleString()}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Icon name="comment" color="#ffffff" size={28} />
            </View>
            <Text style={styles.actionText}>
              {item.comments.toLocaleString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleSharePress}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Icon name="share" color="#ffffff" size={28} />
            </View>
            <Text style={styles.actionText}>
              {item.shares.toLocaleString()}
            </Text>
          </TouchableOpacity>

                      {onWatchNow && (
                        <TouchableOpacity 
                          style={styles.actionButton} 
                          onPress={() => onWatchNow(item)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.iconContainer}>
                            <WatchNowButton 
                              onPress={() => onWatchNow(item)}
                              size="small"
                            />
                          </View>
                          <Text style={styles.actionText}>
                            Watch Now
                          </Text>
                        </TouchableOpacity>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,  
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: screenWidth,
    height: screenHeight,
    position: 'absolute',
  },

  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cacheIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
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
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    marginBottom: 10,
    paddingRight: 80, // Space for action buttons
    paddingTop: 10
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
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
    marginBottom: 20
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonTouchable: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
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

export default EnhancedVideoPlayer; 