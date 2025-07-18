import React, { useRef, useEffect, useCallback, useMemo } from 'react';
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
import { useVideoStore, useVideoState, useIsVideoPlaying, useIsVideoCached } from '../../store/videoStore';
import { enhancedVideoCache } from '../../utils/enhancedVideoCache';

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
  viewHeight: number;
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
  item,
  index,
  isVisible,
  onEnd,
  onShare,
  onLike,
  viewHeight,
}) => {
  const videoRef = useRef<any>(null);
  const { 
    setVideoPlaying, 
    setVideoProgress, 
    setVideoCached, 
    updateVideoState,
    setControllerVisible 
  } = useVideoStore();

  // Get video state from store
  const videoState = useVideoState(item.id);
  const isPlaying = useIsVideoPlaying(item.id);
  const isCached = useIsVideoCached(item.id);

  // Animated values
  const progressValue = useSharedValue(0);
  const opacityValue = useSharedValue(1);
  const scaleValue = useSharedValue(1);
  const controllerOpacity = useSharedValue(1);

  // Memoized video source
  const videoSource = useMemo(() => ({
    uri: videoState?.cachedPath || item.videoUrl,
    headers: {
      'Cache-Control': 'max-age=3600',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'RocketReels/1.0',
    },
    bufferConfig: {
      minBufferMs: 1000,
      maxBufferMs: 5000,
      bufferForPlaybackMs: 500,
      bufferForPlaybackAfterRebufferMs: 1000,
      backBufferDurationMs: 3000,
      maxHeapAllocationPercent: 0.3,
    },
    minLoadRetryCount: 3,
    shouldCache: true,
  }), [videoState?.cachedPath, item.videoUrl]);

  // Preload video when component mounts
  useEffect(() => {
    const preloadVideo = async () => {
      try {
        const cachedPath = await enhancedVideoCache.cacheVideo(item.videoUrl, item.id, 'low');
        if (cachedPath !== item.videoUrl) {
          setVideoCached(item.id, cachedPath);
        }
      } catch (error) {
        console.error('Error preloading video:', error);
      }
    };

    preloadVideo();
  }, [item.id, item.videoUrl, setVideoCached]);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      setVideoPlaying(item.id, true);
      controllerOpacity.value = withTiming(1, { duration: 300 });
    } else {
      setVideoPlaying(item.id, false);
      controllerOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible, item.id, setVideoPlaying, controllerOpacity]);

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
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      controllerOpacity.value = withTiming(0, { duration: 300 });
    }, 3000);
  }, [setControllerVisible, controllerOpacity]);

  const handlePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying;
    setVideoPlaying(item.id, newPlayingState);
    
    // Animate play button
    scaleValue.value = withSpring(0.8, {}, () => {
      scaleValue.value = withSpring(1);
    });
  }, [isPlaying, item.id, setVideoPlaying, scaleValue]);

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

  return (
    <View style={[styles.container, { height: viewHeight }]}>
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
          repeat={false}
          resizeMode="cover"
          paused={!isVisible || !isPlaying}
          controls={false}
          playInBackground={false}
          poster={item.thumbnail}
          posterResizeMode="cover"
          preventsDisplaySleepDuringVideoPlayback
          onError={onError}
          onLoad={onLoad}
          onBuffer={onBuffer}
          onProgress={onProgress}
          onEnd={handleVideoEnd}
          playWhenInactive={false}
          progressUpdateInterval={1000}
          reportBandwidth
          onReadyForDisplay={onReadyForDisplay}
          ignoreSilentSwitch="ignore"
          automaticallyWaitsToMinimizeStalling={true}
        />

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>

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

      {/* Controls Overlay */}
      <Animated.View style={[styles.controls, controllerStyle]}>
        {/* Play/Pause Button */}
        <Animated.View style={[styles.playButton, playButtonStyle]}>
          <TouchableOpacity
            style={styles.playButtonTouchable}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Icon
              name={isPlaying ? "pause" : "play-arrow"}
              color="#ffffff"
              size={40}
            />
          </TouchableOpacity>
        </Animated.View>

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

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <View style={styles.iconContainer}>
              <Icon name="info" color="#ffffff" size={28} />
            </View>
            <Text style={styles.actionText}>
              Info
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    width: screenWidth,
    height: '100%',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
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
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 100,
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
    bottom: 120,
    right: 20,
    alignItems: 'center',
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