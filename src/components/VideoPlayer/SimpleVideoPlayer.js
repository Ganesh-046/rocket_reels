import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import iosVideoDebugger from '../../utils/iosVideoDebugger';
import iosVideoPerformanceOptimizer from '../../utils/iosVideoPerformanceOptimizer';

const SimpleVideoPlayer = ({ episode, isPlaying = true, style }) => {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const loadStartTime = useRef(0);

  // Simple URL construction
  const getVideoUrl = () => {
    const relativeUrl = episode?.video_urls?.master || episode?.video_url || '';
    if (!relativeUrl) return null;

    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    } else {
      return `https://d1cuox40kar1pw.cloudfront.net/${relativeUrl}`;
    }
  };

  const videoUrl = getVideoUrl();

  // Check for iOS-specific issues
  useEffect(() => {
    if (Platform.OS === 'ios' && videoUrl) {
      const issues = iosVideoDebugger.checkCommonIOSIssues(videoUrl);
      if (issues.length > 0) {
        console.log('⚠️ iOS Video Issues Detected:', issues);
      }
    }
  }, [videoUrl]);

  // 🔑 CRITICAL: Cleanup video when component unmounts or episode changes
  useEffect(() => {
    return () => {
      // Cleanup video resources
      if (videoRef.current) {
        try {
          videoRef.current.seek(0);
          videoRef.current = null;
        } catch (error) {
          console.log('Video cleanup error:', error);
        }
      }
    };
  }, [episode?._id]);

  // 🔑 CRITICAL: Reset state when episode changes
  useEffect(() => {
    setIsVideoReady(false);
    setIsBuffering(false);
    setError(null);
    loadStartTime.current = Date.now();
  }, [episode?._id]);

  if (!videoUrl) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>No video URL available</Text>
      </View>
    );
  }

  // Get iOS-optimized video source
  const getOptimizedVideoSource = () => {
    if (Platform.OS === 'ios') {
      return iosVideoPerformanceOptimizer.getOptimizedVideoSource(videoUrl, episode?._id);
    }
    
    // Default configuration for Android
    return {
      uri: videoUrl,
      type: videoUrl.includes('.m3u8') ? 'm3u8' : undefined,
      headers: {
        'User-Agent': 'RocketReel/1.0',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, video/mp4, video/*',
      },
    };
  };

  const handleLoad = (data) => {
    const loadTime = Date.now() - loadStartTime.current;
    
    console.log('✅ SimpleVideoPlayer - Video Loaded:', {
      episodeId: episode?._id,
      duration: data.duration,
      platform: Platform.OS,
      loadTime: `${loadTime}ms`,
      videoUrl: videoUrl?.substring(0, 100) + '...',
    });
    setIsVideoReady(true);
    setError(null);
    
    // iOS-specific loading debug and performance tracking
    if (Platform.OS === 'ios') {
      iosVideoDebugger.logVideoLoad(data, videoUrl, episode?._id);
      iosVideoPerformanceOptimizer.trackVideoLoad(episode?._id, loadStartTime.current);
    }
  };

  const handleReadyForDisplay = () => {
    console.log('🎬 SimpleVideoPlayer - Video Ready:', {
      episodeId: episode?._id,
      platform: Platform.OS,
    });
    
    // iOS-specific ready debug
    if (Platform.OS === 'ios') {
      iosVideoDebugger.logVideoReady(episode?._id);
    }
  };

  const handleProgress = (data) => {
    // Optional: Handle progress
  };

  const handleBuffer = (data) => {
    setIsBuffering(data.isBuffering);
    
    // iOS-specific buffer debug
    if (Platform.OS === 'ios') {
      iosVideoDebugger.logVideoBuffer(data.isBuffering, episode?._id);
    }
  };

  const handleEnd = () => {
    console.log('🏁 SimpleVideoPlayer - Video Ended:', episode?._id);
  };

  const handleError = (error) => {
    console.error('❌ SimpleVideoPlayer - Video Error:', {
      episodeId: episode?._id,
      error: error.error,
      errorString: error.errorString,
      platform: Platform.OS,
      videoUrl: videoUrl?.substring(0, 100) + '...',
    });
    setError(error);
    setIsVideoReady(false);
    
    // iOS-specific error handling
    if (Platform.OS === 'ios') {
      iosVideoDebugger.logVideoError(error, videoUrl, episode?._id);
    }
  };

  // Get iOS-optimized video player props
  const getIOSVideoPlayerProps = () => {
    if (Platform.OS === 'ios') {
      return iosVideoPerformanceOptimizer.getIOSVideoPlayerProps();
    }
    return {};
  };

  return (
    <View style={[styles.container, style]}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={getOptimizedVideoSource()}
        style={styles.video}
        resizeMode="cover"
        repeat={true}
        paused={!isPlaying}
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
        progressUpdateInterval={Platform.OS === 'ios' ? 100 : 1000}
        reportBandwidth={Platform.OS !== 'ios'} // Disable on iOS for performance
        preventsDisplaySleepDuringVideoPlayback={true}
        automaticallyWaitsToMinimizeStalling={Platform.OS !== 'ios'} // Disable on iOS for faster start
        poster={episode?.thumbnail}
        posterResizeMode="cover"
        // iOS-optimized buffer configuration
        bufferConfig={Platform.OS === 'ios' 
          ? iosVideoPerformanceOptimizer.getOptimizedBufferConfig()
          : {
              minBufferMs: 1000,
              maxBufferMs: 5000,
              bufferForPlaybackMs: 500,
              bufferForPlaybackAfterRebufferMs: 1000,
            }
        }
        maxBitRate={Platform.OS === 'ios' ? 2000000 : 2000000} // 2Mbps for iOS
        // iOS-specific optimizations
        {...getIOSVideoPlayerProps()}
      />

      {/* Thumbnail Overlay - Show while video not ready */}
      {episode?.thumbnail && !isVideoReady && (
        <View style={styles.thumbnailOverlay}>
          <Image 
            source={{ uri: episode.thumbnail }} 
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Loading Overlay */}
      {isBuffering && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      )}

      {/* Error Overlay */}
      {error && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Video playback error</Text>
            <Text style={styles.errorSubtext}>{error.errorString}</Text>
          </View>
        </View>
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
});

export default SimpleVideoPlayer; 