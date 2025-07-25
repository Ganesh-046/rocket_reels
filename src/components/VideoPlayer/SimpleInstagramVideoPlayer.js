import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';

import { useVideoQualityStore } from '../../store/videoQualityStore';
import { useLikeDislikeContent, useLikedContent } from '../../hooks/useUserInteractions';
import { useAuthUser } from '../../store/auth.store';
import { NavigationService } from '../../navigation/NavigationService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SimpleInstagramVideoPlayer = ({ episode, isPlaying = true, style, isScrolling = false }) => {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState(null);
  const [loadStartTime, setLoadStartTime] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Auto-hide timer ref
  const hideTimerRef = useRef(null);
  
  // Double tap detection
  const lastTapRef = useRef(0);
  const doubleTapDelay = 300; // milliseconds
  
  // Like functionality
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Get global quality from store
  const { currentQuality } = useVideoQualityStore();
  
  // Get current user
  const user = useAuthUser();
  
  // Like/Dislike hooks
  const likeDislikeMutation = useLikeDislikeContent();
  const { data: likedContent } = useLikedContent(user?._id);

  // Debug logs for like functionality
  console.log('🔍 VideoPlayer - Like Debug Info:', {
    hasUser: !!user,
    userId: user?._id,
    userObject: user,
    hasEpisode: !!episode,
    episodeId: episode?._id,
    episodeObject: episode,
    hasLikeMutation: !!likeDislikeMutation,
    hasLikedContent: !!likedContent,
    likedContentData: likedContent?.data,
    isLiked: isLiked,
    isAuthenticated: !!user?._id,
    navigationServiceAvailable: !!NavigationService
  });

  // Get video URL based on quality
  const getVideoUrl = useCallback(() => {
    // Log all available video URLs for debugging
    if (episode?.video_urls) {
      console.log('🎬 Video Quality URLs for:', episode._id);
      console.log('📋 Available Qualities:', episode.video_urls);
    }

    // Get URL based on selected quality
    let videoUrl = null;
    
    if (currentQuality === 'auto' || !episode?.video_urls?.[currentQuality]) {
      // Use master URL for auto or if specific quality not available
      videoUrl = episode?.video_urls?.master || episode?.video_url || '';
    } else {
      // Use specific quality URL
      videoUrl = episode?.video_urls?.[currentQuality] || '';
    }

    if (!videoUrl) return null;

    // Log the selected URL
    console.log('🎬 SimpleInstagramVideoPlayer - Selected quality:', currentQuality);
    console.log('🎬 SimpleInstagramVideoPlayer - Video URL:', videoUrl);

    if (videoUrl.startsWith('http')) {
      return videoUrl;
    } else {
      // Use CloudFront CDN
      return `https://d1cuox40kar1pw.cloudfront.net/${videoUrl}`;
    }
  }, [episode?.video_urls, episode?.video_url, episode?._id, currentQuality]);

  const videoUrl = getVideoUrl();

  // Video source configuration
  const videoSource = useMemo(() => {
    if (!videoUrl) return null;

    return {
      uri: videoUrl,
      type: videoUrl.includes('.m3u8') ? 'm3u8' : undefined,
      headers: {
        'User-Agent': 'Instagram/219.0.0.29.118 Android',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, video/mp4, video/*',
        'Cache-Control': 'max-age=3600',
        'Accept-Encoding': 'gzip, deflate',
      },
    };
  }, [videoUrl]);

  // Buffer configuration
  const bufferConfig = useMemo(() => ({
    minBufferMs: 500,
    maxBufferMs: 2000,
    bufferForPlaybackMs: 100,
    bufferForPlaybackAfterRebufferMs: 500,
  }), []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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

  // Reset state when episode changes
  useEffect(() => {
    setIsVideoReady(false);
    setIsBuffering(false);
    setError(null);
    setLoadStartTime(Date.now());
    setShowControls(false);
    setIsPaused(false); // Auto-play new videos
    setShowLikeAnimation(false);
    
    // Clear any existing timer
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, [episode?._id]);

  // Initialize like state when episode or liked content changes
  useEffect(() => {
    if (episode?._id && likedContent?.data) {
      const isEpisodeLiked = likedContent.data.includes(episode._id);
      setIsLiked(isEpisodeLiked);
      
      console.log('❤️ VideoPlayer - Like state initialized:', {
        episodeId: episode._id,
        isLiked: isEpisodeLiked,
        userId: user?._id,
        likedContentCount: likedContent.data.length
      });
    }
  }, [episode?._id, likedContent?.data, user?._id]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  // Auto-hide controls when video is playing
  useEffect(() => {
    if (showControls && !isPaused && isPlaying && !isScrolling) {
      // Clear existing timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      
      // Set new timer to hide controls after 2 seconds
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
        hideTimerRef.current = null;
      }, 2000);
    } else {
      // Clear timer if video is paused or not playing
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }
  }, [showControls, isPaused, isPlaying, isScrolling]);

  if (!videoUrl) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.errorText}>No video URL available</Text>
      </View>
    );
  }

  // Event handlers
  const handleLoad = useCallback((data) => {
    const loadTime = Date.now() - loadStartTime;
    console.log('✅ SimpleInstagramVideoPlayer - Video Loaded:', {
      episodeId: episode?._id,
      duration: data.duration,
      loadTime: `${loadTime}ms`,
    });
    
    setIsVideoReady(true);
    setError(null);
  }, [episode?._id, loadStartTime]);

  const handleReadyForDisplay = useCallback(() => {
    console.log('🎬 SimpleInstagramVideoPlayer - Video Ready:', episode?._id);
  }, [episode?._id]);

  const handleProgress = useCallback((data) => {
    // Progress tracking
  }, []);

  const handleBuffer = useCallback((data) => {
    setIsBuffering(data.isBuffering);
  }, []);

  const handleEnd = useCallback(() => {
    console.log('🏁 SimpleInstagramVideoPlayer - Video Ended:', episode?._id);
  }, [episode?._id]);

  const handleError = useCallback((error) => {
    const loadTime = Date.now() - loadStartTime;
    console.error('❌ SimpleInstagramVideoPlayer - Video Error:', {
      episodeId: episode?._id,
      error: error.error,
      loadTime: `${loadTime}ms`,
    });
    
    setError(error);
    setIsVideoReady(false);
  }, [episode?._id, loadStartTime]);

  // Handle like/unlike
  const handleLikeToggle = useCallback(async () => {
    console.log('🎯 VideoPlayer - handleLikeToggle called');
    console.log('🔍 VideoPlayer - handleLikeToggle debug:', {
      hasUser: !!user,
      userId: user?._id,
      hasEpisode: !!episode,
      episodeId: episode?._id,
      currentIsLiked: isLiked,
      hasLikeMutation: !!likeDislikeMutation
    });

    // Check if user is authenticated
    if (!user?._id) {
      console.log('⚠️ VideoPlayer - User not authenticated, showing login popup');
      
      // Use NavigationService for consistent login modal behavior
      NavigationService.showLoginModal();
      return;
    }

    if (!episode?._id) {
      console.log('⚠️ VideoPlayer - Cannot like: Missing episode ID');
      console.log('⚠️ VideoPlayer - Episode ID:', episode?._id);
      return;
    }

    try {
      const newLikeState = !isLiked;
      
      console.log('❤️ VideoPlayer - Toggling like:', {
        episodeId: episode._id,
        userId: user._id,
        currentState: isLiked,
        newState: newLikeState
      });

      // Optimistically update UI
      setIsLiked(newLikeState);
      setShowLikeAnimation(true);

      console.log('📡 VideoPlayer - Calling like API...');
      
      // Call API
      const response = await likeDislikeMutation.mutateAsync({
        userId: user._id,
        episodeId: episode._id,
        isLike: newLikeState
      });

      console.log('✅ VideoPlayer - Like API response:', {
        episodeId: episode._id,
        success: response.status,
        message: response.message,
        data: response.data
      });

      // Hide like animation after 1 second
      setTimeout(() => {
        setShowLikeAnimation(false);
      }, 1000);

    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setShowLikeAnimation(false);
      
      console.error('❌ VideoPlayer - Like API error:', {
        episodeId: episode._id,
        userId: user._id,
        error: error.message,
        errorStack: error.stack
      });

      Alert.alert('Error', 'Failed to update like status. Please try again.');
    }
  }, [user?._id, episode?._id, isLiked, likeDislikeMutation]);

  // Handle screen tap to show/hide controls
  const handleScreenTap = useCallback(() => {
    console.log('👆 VideoPlayer - Screen tapped');
    
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;
    
    console.log('🔍 VideoPlayer - Tap timing:', {
      timeDiff,
      doubleTapDelay,
      isDoubleTap: timeDiff < doubleTapDelay
    });
    
    if (timeDiff < doubleTapDelay) {
      // Double tap detected - handle like
      console.log('👆 VideoPlayer - Double tap detected, toggling like');
      handleLikeToggle();
      lastTapRef.current = 0; // Reset to prevent multiple triggers
    } else {
      // Single tap - show/hide controls
      console.log('👆 VideoPlayer - Single tap, toggling controls');
      setShowControls(prev => !prev);
      
      // If showing controls and video is playing, start auto-hide timer
      if (!showControls && !isPaused && isPlaying && !isScrolling) {
        // Clear existing timer
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        
        // Set new timer to hide controls after 2 seconds
        hideTimerRef.current = setTimeout(() => {
          setShowControls(false);
          hideTimerRef.current = null;
        }, 2000);
      }
    }
    
    lastTapRef.current = now;
  }, [showControls, isPaused, isPlaying, isScrolling, handleLikeToggle]);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Determine if video should be paused
  const shouldPause = !isPlaying || isScrolling || isPaused;

  return (
    <View style={[styles.container, style]}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={videoSource}
        style={styles.video}
        resizeMode="cover"
        repeat={true}
        paused={shouldPause}
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
        progressUpdateInterval={500}
        reportBandwidth={true}
        preventsDisplaySleepDuringVideoPlayback={true}
        automaticallyWaitsToMinimizeStalling={false}
        poster={episode?.thumbnail}
        posterResizeMode="cover"
        bufferConfig={bufferConfig}
        maxBitRate={1500000}
        {...(Platform.OS === 'ios' ? {
          allowsExternalPlayback: false,
          automaticallyWaitsToMinimizeStalling: false,
        } : {
          useTextureView: true,
          bufferType: 'surface',
        })}
      />

      {/* Thumbnail Overlay */}
      {episode?.thumbnail && !isVideoReady && (
        <View style={styles.thumbnailOverlay}>
          <Image 
            source={{ uri: episode.thumbnail }} 
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Tap Area for Controls */}
      <TouchableOpacity 
        style={styles.tapArea} 
        onPress={handleScreenTap}
        activeOpacity={1}
      />

      {/* Play/Pause Controls */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          <TouchableOpacity 
            style={styles.playPauseButton}
            onPress={handlePlayPause}
          >
            <Icon 
              name={isPaused ? "play" : "pause"} 
              size={32} 
              color="#ffffff" 
            />
          </TouchableOpacity>
          
          {/* Like Button */}
          <TouchableOpacity 
            style={styles.likeButton}
            onPress={() => {
              console.log('❤️ VideoPlayer - Like button pressed');
              handleLikeToggle();
            }}
          >
            <Icon 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? "#ff4757" : "#ffffff"} 
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Like Animation Overlay */}
      {showLikeAnimation && (
        <View style={styles.likeAnimationOverlay}>
          <Icon 
            name="heart" 
            size={80} 
            color="#ff4757" 
            style={styles.likeAnimationIcon}
          />
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
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Ensure it's below other overlays
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above other overlays
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above other overlays
  },
  likeAnimationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it's above other overlays
  },
  likeAnimationIcon: {
    opacity: 0.8,
  },
});

export default SimpleInstagramVideoPlayer; 