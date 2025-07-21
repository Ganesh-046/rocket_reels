import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const WorkingHLSVideoPlayer = React.memo(({
  episode,
  isPlaying = true,
  onLoad,
  onProgress,
  onEnd,
  onError,
  onReadyForDisplay,
  onBuffer,
  style,
  resizeMode = "cover",
  repeat = true,
  muted = false,
  showControls = false,
  showThumbnail = true,
}) => {
  // Refs
  const videoRef = useRef(null);
  
  // State
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoLoadTime, setVideoLoadTime] = useState(0);

  // Animated values
  const thumbnailOpacity = useSharedValue(1);
  const loadingOpacity = useSharedValue(1);

  // 🔑 CRITICAL: HLS Video URL Construction - Memoized
  const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';
  
  const constructVideoUrl = useCallback(() => {
    const relativeUrl = episode?.video_urls?.master || episode?.video_url || '';
    
    if (!relativeUrl) {
      console.error('❌ WorkingHLSVideoPlayer - No video URL found:', episode);
      return null;
    }

    let fullVideoUrl = '';
    if (relativeUrl.startsWith('http')) {
      fullVideoUrl = relativeUrl;
    } else {
      fullVideoUrl = `${NEXT_PUBLIC_ASSET_URL}/${relativeUrl}`;
    }

    const isHLS = fullVideoUrl.includes('.m3u8') || relativeUrl.includes('hls1/');
    
    console.log('🎬 WorkingHLSVideoPlayer - Video Source:', {
      episodeId: episode?._id,
      relativeUrl,
      fullVideoUrl,
      isHLS,
      usingCloudFront: fullVideoUrl.includes('cloudfront.net'),
      hasVideoUrls: !!episode?.video_urls,
      masterUrl: episode?.video_urls?.master,
    });

    return { fullVideoUrl, isHLS };
  }, [episode?._id, episode?.video_urls?.master, episode?.video_url]);

  // 🔑 CRITICAL: HLS Video Source Configuration - Memoized
  const videoSource = useMemo(() => {
    const { fullVideoUrl, isHLS } = constructVideoUrl();
    
    if (!fullVideoUrl) return null;

    const startTime = Date.now();
    setVideoLoadTime(startTime);

    console.log('🎬 HLS Load Start:', {
      episodeId: episode?._id,
      videoUrl: fullVideoUrl,
      isHLS,
      timestamp: startTime,
    });

    if (isHLS) {
      // 🔑 CRITICAL: HLS-specific configuration
      return {
        uri: fullVideoUrl,
        type: 'm3u8', // 🔑 CRITICAL: This was missing!
        headers: {
          'User-Agent': 'RocketReel/1.0',
          'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, video/mp4, video/*',
          'X-HLS-Stream': 'true',
          'X-Playback-Type': 'streaming',
          'X-Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'max-age=3600',
          'Connection': 'keep-alive',
        },
        bufferConfig: {
          minBufferMs: 1000,
          maxBufferMs: 5000,
          bufferForPlaybackMs: 500,
          bufferForPlaybackAfterRebufferMs: 1000,
          backBufferDurationMs: 3000,
          maxHeapAllocationPercent: 0.3,
        },
      };
    } else {
      // Regular video configuration
      return {
        uri: fullVideoUrl,
        headers: {
          'User-Agent': 'RocketReel/1.0',
          'Accept': 'video/mp4, video/*',
          'Cache-Control': 'max-age=3600',
        },
      };
    }
  }, [constructVideoUrl, episode?._id]);

  // 🔑 CRITICAL: Event Handlers - Memoized with useCallback
  const handleLoad = useCallback((data) => {
    const loadTime = Date.now() - videoLoadTime;
    setDuration(data.duration || 0);
    setIsVideoReady(true);
    setError(null);
    
    console.log('🎬 HLS Load Success:', {
      episodeId: episode?._id,
      duration: data.duration,
      naturalSize: data.naturalSize,
      loadTime,
      timestamp: Date.now(),
    });

    // Hide thumbnail after video loads
    thumbnailOpacity.value = withTiming(0, { duration: 500 });
    loadingOpacity.value = withTiming(0, { duration: 300 });

    onLoad?.(data);
  }, [episode?._id, videoLoadTime, onLoad, thumbnailOpacity, loadingOpacity]);

  const handleReadyForDisplay = useCallback(() => {
    console.log('🎬 HLS Ready for Display:', {
      episodeId: episode?._id,
      timestamp: Date.now(),
    });
    onReadyForDisplay?.();
  }, [episode?._id, onReadyForDisplay]);

  const handleProgress = useCallback((data) => {
    setCurrentTime(data.currentTime || 0);
    onProgress?.(data);
  }, [onProgress]);

  const handleBuffer = useCallback((data) => {
    setIsBuffering(data.isBuffering);
    console.log('🎬 HLS Buffer:', {
      episodeId: episode?._id,
      isBuffering: data.isBuffering,
      timestamp: Date.now(),
    });
    onBuffer?.(data);
  }, [episode?._id, onBuffer]);

  const handleEnd = useCallback(() => {
    console.log('🎬 HLS Video End:', {
      episodeId: episode?._id,
      timestamp: Date.now(),
    });
    onEnd?.();
  }, [episode?._id, onEnd]);

  const handleError = useCallback((error) => {
    console.error('❌ HLS Video Error:', {
      episodeId: episode?._id,
      error: error.error,
      errorString: error.errorString,
      timestamp: Date.now(),
    });
    setError(error);
    setIsVideoReady(false);
    onError?.(error);
  }, [episode?._id, onError]);

  // Animated styles - Memoized
  const thumbnailAnimatedStyle = useAnimatedStyle(() => ({
    opacity: thumbnailOpacity.value,
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  // Memoized video key to prevent unnecessary re-renders
  const videoKey = useMemo(() => `hls-video-${episode?._id}`, [episode?._id]);

  // Memoized poster source
  const posterSource = useMemo(() => {
    return showThumbnail && episode?.thumbnail ? { uri: episode.thumbnail } : undefined;
  }, [showThumbnail, episode?.thumbnail]);

  // Memoized thumbnail source
  const thumbnailSource = useMemo(() => {
    return episode?.thumbnail ? { uri: episode.thumbnail } : null;
  }, [episode?.thumbnail]);

  if (!videoSource) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>No video URL available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode={resizeMode}
        repeat={repeat}
        paused={!isPlaying}
        muted={muted}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        onLoad={handleLoad}
        onReadyForDisplay={handleReadyForDisplay}
        onProgress={handleProgress}
        onBuffer={handleBuffer}
        onEnd={handleEnd}
        onError={handleError}
        // 🔑 CRITICAL: HLS-specific props
        controls={showControls}
        progressUpdateInterval={1000}
        reportBandwidth={true}
        preventsDisplaySleepDuringVideoPlayback={true}
        automaticallyWaitsToMinimizeStalling={false} // 🔑 CRITICAL: Disable for HLS
        poster={posterSource}
        posterResizeMode="cover"
        // 🔑 CRITICAL: Stable key prop for proper re-rendering
        key={videoKey}
      />

      {/* Thumbnail Overlay - Show while video not ready */}
      {showThumbnail && thumbnailSource && !isVideoReady && (
        <Animated.View style={[styles.thumbnailOverlay, thumbnailAnimatedStyle]}>
          <Image 
            source={thumbnailSource} 
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Loading Overlay */}
      {isBuffering && (
        <Animated.View style={[styles.loadingOverlay, loadingAnimatedStyle]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </Animated.View>
      )}

      {/* Error Overlay */}
      {error && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorContainer}>
            <Icon name="error" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>Video playback error</Text>
            <Text style={styles.errorSubtext}>{error.errorString}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setIsVideoReady(false);
                thumbnailOpacity.value = 1;
                loadingOpacity.value = 1;
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Debug Info (Development Only) */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Ready: {isVideoReady ? '✅' : '❌'} | 
            Playing: {isPlaying ? '▶️' : '⏸️'} | 
            Buffer: {isBuffering ? '🔄' : '✅'} | 
            Time: {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </Text>
        </View>
      )}
    </View>
  );
});

// Add display name for debugging
WorkingHLSVideoPlayer.displayName = 'WorkingHLSVideoPlayer';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#cccccc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ed9b72',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 4,
    zIndex: 20,
  },
  debugText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default WorkingHLSVideoPlayer; 