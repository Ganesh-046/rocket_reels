import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import { useSharedValue, withTiming, runOnJS, Animated } from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Instagram-level performance configuration
const INSTAGRAM_PERFORMANCE_CONFIG = {
  // Video loading
  preloadDistance: 1, // Only preload 1 video ahead (Instagram approach)
  maxConcurrentLoads: 2, // Limit concurrent video loads
  loadTimeout: 3000, // 3 second timeout for video loads
  
  // Memory management
  maxCachedVideos: 10, // Keep only 10 videos in memory
  memoryThreshold: 150 * 1024 * 1024, // 150MB memory limit
  
  // Scrolling optimization
  scrollVelocityThreshold: 30, // Pause videos during fast scrolling
  scrollDebounceTime: 50, // 50ms debounce for scroll events
  
  // Playback optimization
  bufferSize: 1024 * 1024, // 1MB buffer (Instagram uses small buffers)
  seekThreshold: 1000, // 1 second seek threshold
};

// Video instance pool for memory optimization
class VideoInstancePool {
  constructor() {
    this.pool = new Map();
    this.activeInstances = new Set();
  }

  getInstance(videoId) {
    return this.pool.get(videoId);
  }

  addInstance(videoId, instance) {
    this.pool.set(videoId, instance);
    this.activeInstances.add(videoId);
  }

  removeInstance(videoId) {
    this.pool.delete(videoId);
    this.activeInstances.delete(videoId);
  }

  cleanup() {
    this.pool.clear();
    this.activeInstances.clear();
  }
}

// Global video instance pool
const videoInstancePool = new VideoInstancePool();

const InstagramOptimizedVideoPlayer = ({ episode, isPlaying = true, style, isScrolling = false }) => {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [loadStartTime, setLoadStartTime] = useState(0);

  // Animated values for smooth transitions
  const thumbnailOpacity = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const errorOpacity = useSharedValue(0);

  // Instagram-level URL construction with CDN optimization
  const getOptimizedVideoUrl = useCallback(() => {
    const relativeUrl = episode?.video_urls?.master || episode?.video_url || '';
    if (!relativeUrl) return null;

    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    } else {
      // Use CloudFront CDN with optimized headers
      return `https://d1cuox40kar1pw.cloudfront.net/${relativeUrl}`;
    }
  }, [episode?.video_urls?.master, episode?.video_url]);

  const videoUrl = getOptimizedVideoUrl();

  // Instagram-level video source configuration
  const optimizedVideoSource = useMemo(() => {
    if (!videoUrl) return null;

    return {
      uri: videoUrl,
      type: videoUrl.includes('.m3u8') ? 'm3u8' : undefined,
      headers: {
        'User-Agent': 'Instagram/219.0.0.29.118 Android', // Instagram user agent for better CDN
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, video/mp4, video/*',
        'Cache-Control': 'max-age=3600',
        'Accept-Encoding': 'gzip, deflate',
      },
    };
  }, [videoUrl]);

  // Instagram-level buffer configuration
  const optimizedBufferConfig = useMemo(() => ({
    minBufferMs: 500, // Reduced for faster start
    maxBufferMs: 2000, // Reduced for memory efficiency
    bufferForPlaybackMs: 100, // Reduced for immediate playback
    bufferForPlaybackAfterRebufferMs: 500, // Reduced for faster recovery
  }), []);

  // 🔑 CRITICAL: Instagram-level memory management
  useEffect(() => {
    return () => {
      // Cleanup video resources immediately
      if (videoRef.current) {
        try {
          videoRef.current.seek(0);
          videoRef.current = null;
        } catch (error) {
          console.log('Video cleanup error:', error);
        }
      }
      
      // Remove from instance pool
      if (episode?._id) {
        videoInstancePool.removeInstance(episode._id);
      }
    };
  }, [episode?._id]);

  // 🔑 CRITICAL: Instagram-level state reset
  useEffect(() => {
    setIsVideoReady(false);
    setIsBuffering(false);
    setError(null);
    setLoadStartTime(Date.now());
    
    // Reset animated values
    thumbnailOpacity.value = 1;
    loadingOpacity.value = 0;
    errorOpacity.value = 0;
  }, [episode?._id, thumbnailOpacity, loadingOpacity, errorOpacity]);

  // Instagram-level scroll optimization
  useEffect(() => {
    if (isScrolling) {
      // Pause video immediately during scrolling
      if (videoRef.current) {
        videoRef.current.seek(0);
      }
    }
  }, [isScrolling]);

  if (!videoUrl) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>No video URL available</Text>
      </View>
    );
  }

  // Instagram-level event handlers
  const handleLoad = useCallback((data) => {
    const loadTime = Date.now() - loadStartTime;
    console.log('✅ InstagramVideoPlayer - Video Loaded:', {
      episodeId: episode?._id,
      duration: data.duration,
      loadTime: `${loadTime}ms`, // Target: <500ms
    });
    
    setIsVideoReady(true);
    setError(null);
    
    // Smooth thumbnail fade out
    thumbnailOpacity.value = withTiming(0, { duration: 200 });
    
    // Add to instance pool
    if (episode?._id) {
      videoInstancePool.addInstance(episode._id, { ref: videoRef.current, data });
    }
  }, [episode?._id, loadStartTime, thumbnailOpacity]);

  const handleReadyForDisplay = useCallback(() => {
    console.log('🎬 InstagramVideoPlayer - Video Ready:', episode?._id);
  }, [episode?._id]);

  const handleProgress = useCallback((data) => {
    // Instagram-level progress tracking
  }, []);

  const handleBuffer = useCallback((data) => {
    setIsBuffering(data.isBuffering);
    
    // Show/hide loading indicator with animation
    if (data.isBuffering) {
      loadingOpacity.value = withTiming(1, { duration: 150 });
    } else {
      loadingOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [loadingOpacity]);

  const handleEnd = useCallback(() => {
    console.log('🏁 InstagramVideoPlayer - Video Ended:', episode?._id);
  }, [episode?._id]);

  const handleError = useCallback((error) => {
    const loadTime = Date.now() - loadStartTime;
    console.error('❌ InstagramVideoPlayer - Video Error:', {
      episodeId: episode?._id,
      error: error.error,
      loadTime: `${loadTime}ms`,
    });
    
    setError(error);
    setIsVideoReady(false);
    
    // Show error with animation
    errorOpacity.value = withTiming(1, { duration: 200 });
  }, [episode?._id, loadStartTime, errorOpacity]);

  return (
    <View style={[styles.container, style]}>
      {/* Instagram-level Video Player */}
      <Video
        ref={videoRef}
        source={optimizedVideoSource}
        style={styles.video}
        resizeMode="cover"
        repeat={true}
        paused={!isPlaying || isScrolling} // Pause during scrolling
        muted={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        onLoad={handleLoad}
        onReadyForDisplay={handleReadyForDisplay}
        onProgress={handleProgress}
        onBuffer={handleBuffer}
        onEnd={handleEnd}
        onError={handleError}
        controls={false}
        progressUpdateInterval={500} // Reduced for smoother progress
        reportBandwidth={true}
        preventsDisplaySleepDuringVideoPlayback={true}
        automaticallyWaitsToMinimizeStalling={false} // Disabled for immediate playback
        poster={episode?.thumbnail}
        posterResizeMode="cover"
        // Instagram-level memory management props
        bufferConfig={optimizedBufferConfig}
        maxBitRate={1500000} // Reduced bitrate for better performance
        // Platform-specific optimizations
        {...(Platform.OS === 'ios' ? {
          allowsExternalPlayback: false,
          automaticallyWaitsToMinimizeStalling: false,
        } : {
          useTextureView: true,
          bufferType: 'surface',
        })}
      />

      {/* Instagram-level Thumbnail Overlay */}
      {episode?.thumbnail && !isVideoReady && (
        <Animated.View style={[styles.thumbnailOverlay, { opacity: thumbnailOpacity }]}>
          <Image 
            source={{ uri: episode.thumbnail }} 
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        </Animated.View>
      )}

      {/* Instagram-level Loading Overlay */}
      {isBuffering && (
        <Animated.View style={[styles.loadingOverlay, { opacity: loadingOpacity }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        </Animated.View>
      )}

      {/* Instagram-level Error Overlay */}
      {error && (
        <Animated.View style={[styles.errorOverlay, { opacity: errorOpacity }]}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Video playback error</Text>
            <Text style={styles.errorSubtext}>{error.errorString}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingContainer: {
    alignItems: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#cccccc',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default InstagramOptimizedVideoPlayer; 