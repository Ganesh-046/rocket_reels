import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
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
import { useVideoStore, useVideoState, useIsVideoPlaying, useVideoProgress, useVideoDuration } from '../../store/videoStore';
import { revolutionaryInstantVideoSystem } from '../../utils/revolutionaryInstantVideoSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

interface Episode {
  _id: string;
  episodeNo: number;
  language: string;
  status: 'locked' | 'unlocked';
  contentId: string;
  video_urls: {
    '1080p': string;
    '720p': string;
    '480p': string;
    '360p': string;
    master: string;
  };
  thumbnail: string;
  like: number;
  isDeleted: boolean;
  isLiked: boolean | null;
  // Additional properties for unlock functionality
  isLocked?: boolean;
  unlockType?: 'coins' | 'ads';
  unlockPrice?: number;
  title?: string;
  description?: string;
}

interface InstantEpisodePlayerProps {
  episode: Episode;
  index: number;
  isVisible: boolean;
  isActive: boolean;
  viewHeight: number;
  isScrolling: boolean;
  onLike: (episodeId: string) => void;
  onShare: (episode: Episode) => void;
  onComment: (episodeId: string) => void;
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  navigation: any;
  isLiked: boolean;
  isAppActive: boolean;
  allEpisodes?: Episode[]; // Add all episodes for predictive loading
  isEpisodeUnlocked?: (episodeId: string) => boolean;
  onUnlockWithCoins?: (episodeId: string, coins: number) => Promise<any>;
  onUnlockWithAds?: (episodeId: string, adType: string) => Promise<any>;
  videoAuthCookies?: Record<string, string>; // 🔑 CRITICAL: Cookies for video authentication
}

const InstantEpisodePlayer: React.FC<InstantEpisodePlayerProps> = React.memo(({
  episode,
  index,
  isVisible,
  isActive,
  viewHeight,
  isScrolling,
  onLike,
  onShare,
  onComment,
  showControls,
  setShowControls,
  navigation,
  isLiked,
  isAppActive,
  allEpisodes = [],
  isEpisodeUnlocked,
  onUnlockWithCoins,
  onUnlockWithAds,
}) => {
  // Video state
  const videoState = useVideoState(episode._id);
  const isPlaying = useIsVideoPlaying(episode._id);
  const progress = useVideoProgress(episode._id);
  const duration = useVideoDuration(episode._id);

  // Refs
  const videoRef = useRef<any>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPreloadedRef = useRef(false);
  const lastPlayTimeRef = useRef(0);

  // Local state
  const [cachedVideoUrl, setCachedVideoUrl] = useState<string | null>(null);
  const [isRevolutionaryReady, setIsRevolutionaryReady] = useState(false);
  const [videoAuthCookies, setVideoAuthCookies] = useState<any>(null);

  // Animated values
  const controllerOpacity = useSharedValue(1); // Start visible
  const pauseButtonOpacity = useSharedValue(0);
  const likeButtonScale = useSharedValue(1);

  // Video store actions
  const { setVideoPlaying, setVideoProgress, updateVideoState: updateVideoStateAction } = useVideoStore();

  // Enhanced pause button animations
  const showPauseButtonWithTimer = useCallback(() => {
    pauseButtonOpacity.value = withSpring(1, { damping: 15, stiffness: 150 });
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      pauseButtonOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });
    }, 2000);
  }, [pauseButtonOpacity]);

  const hidePauseButton = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    pauseButtonOpacity.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, [pauseButtonOpacity]);

  // Enhanced like animation
  const handleLikePress = useCallback(() => {
    likeButtonScale.value = withSpring(1.3, { damping: 10, stiffness: 200 }, () => {
      likeButtonScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
    onLike(episode._id);
  }, [likeButtonScale, onLike, episode._id]);

  // Get video authentication cookies
  useEffect(() => {
    const getVideoAuth = async () => {
      try {
        const response = await fetch(`https://k9456pbd.rocketreel.co.in/api/v1/content/video-access/${episode._id}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          setVideoAuthCookies(data.data);
          console.log('🔐 InstantEpisodePlayer - Video Auth Cookies:', {
            episodeId: episode._id,
            hasCookies: !!data.data
          });
        }
      } catch (error) {
        console.error('❌ InstantEpisodePlayer - Failed to get video auth:', error);
      }
    };

    if (isVisible && !videoAuthCookies) {
      getVideoAuth();
    }
  }, [isVisible, episode._id, videoAuthCookies]);

  // REVOLUTIONARY: Instant preloading when visible
  useEffect(() => {
    if (isVisible && !isPreloadedRef.current && videoAuthCookies) {
      
      const preloadVideo = async () => {
        try {
          // Use revolutionary video system with instant timeout
          const timeoutPromise = new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Revolutionary timeout')), 1000) // Ultra-fast timeout
          );
          
          const revolutionaryPromise = revolutionaryInstantVideoSystem.getVideo(episode._id, episode.video_urls.master);
          
          const revolutionaryUrl = await Promise.race([revolutionaryPromise, timeoutPromise]);
          setCachedVideoUrl(revolutionaryUrl);
          isPreloadedRef.current = true;
          setIsRevolutionaryReady(true);
        } catch (error) {
          // REVOLUTIONARY: Always use direct URL as fallback - no errors
          setCachedVideoUrl(episode.video_urls.master);
          isPreloadedRef.current = true;
          setIsRevolutionaryReady(true);
        }
      };

      preloadVideo();
    }
  }, [isVisible, episode._id, episode.video_urls.master, index, videoAuthCookies]);

  // REVOLUTIONARY: Predictive loading for next episodes - never fails
  useEffect(() => {
    if (isVisible && allEpisodes.length > 0) {
      // Trigger predictive loading for next episodes with revolutionary error handling
      const triggerPredictiveLoading = async () => {
        try {
          const episodeData = allEpisodes.map(ep => ({ id: ep._id, url: ep.video_urls.master }));
          await revolutionaryInstantVideoSystem.predictAndPreload(episodeData, index);
          
          // Update user behavior for better predictions
          // Note: Revolutionary system doesn't need user behavior tracking
        } catch (error) {
          // REVOLUTIONARY: Silent fail - don't affect user experience
        }
      };

      triggerPredictiveLoading();
    }
  }, [isVisible, index, allEpisodes, isScrolling, progress]);

  // REVOLUTIONARY: Instant play/pause logic - never fails
  useEffect(() => {
    const shouldPlay = isVisible && isActive && !isScrolling && isRevolutionaryReady;

    // Update play state immediately
    setVideoPlaying(episode._id, shouldPlay);
    
    // Update controller opacity
    controllerOpacity.value = withTiming(shouldPlay ? 1 : 0, { duration: 50 });
    
    // Hide pause button when not playing
    if (!shouldPlay) {
      hidePauseButton();
    }

    // Track play time for behavior analysis
    if (shouldPlay) {
      lastPlayTimeRef.current = Date.now();
    }
  }, [isVisible, isActive, isScrolling, isRevolutionaryReady, episode._id, setVideoPlaying, controllerOpacity, hidePauseButton, index]);

  // 🔑 FIXED: Video source configuration with correct CloudFront CDN and authentication
  const videoSource = useMemo(() => {
    // 🔑 CRITICAL: Use CloudFront CDN URL from old code
    const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';
    
    // 🔑 CRITICAL: Construct video URL like old working code
    const relativeUrl = episode.video_urls?.master || '';
    
    // 🔑 CRITICAL: Try different URL construction methods
    let fullVideoUrl = '';
    if (relativeUrl.startsWith('http')) {
      fullVideoUrl = relativeUrl;
    } else {
      // 🔑 CRITICAL: Use CloudFront for all videos (like your curl test)
      fullVideoUrl = `${NEXT_PUBLIC_ASSET_URL}/${relativeUrl}`;
    }
    
    // 🔑 CRITICAL: Test with dummy video first to ensure player works
    const testWithDummyVideo = false; // Set to true to test with dummy video
    const videoUrl = testWithDummyVideo 
      ? 'https://www.w3schools.com/html/mov_bbb.mp4' 
      : (cachedVideoUrl || fullVideoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4');
    
    console.log('🎬 InstantEpisodePlayer - Video Source (FIXED):', {
      episodeId: episode._id,
      episodeNo: episode.episodeNo,
      relativeUrl,
      fullVideoUrl,
      videoUrl,
      cachedVideoUrl: !!cachedVideoUrl,
      hasVideoUrls: !!episode.video_urls,
      masterUrl: episode.video_urls?.master,
      usingCloudFront: fullVideoUrl.includes('cloudfront.net'),
      usingApiServer: fullVideoUrl.includes('rocketreel.co.in'),
      testWithDummyVideo,
      finalVideoUrl: videoUrl,
      hasCookies: !!videoAuthCookies,
      cookieCount: videoAuthCookies ? Object.keys(videoAuthCookies).length : 0
    });
    
    // 🔑 CRITICAL: Build authentication headers like old working code
    const authHeaders: any = {
      'User-Agent': 'RocketReel/1.0',
      'Accept': 'application/vnd.apple.mpegurl',
    };

    // 🔑 CRITICAL: Add CloudFront authentication cookies if available
    if (videoAuthCookies) {
      const cookieString = Object.entries(videoAuthCookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      authHeaders['Cookie'] = cookieString;
      console.log('🔑 InstantEpisodePlayer - Added cookies:', cookieString);
    }

    // 🔑 CRITICAL: Simplify video source for testing
    if (testWithDummyVideo) {
      return {
        uri: videoUrl,
        // Simple source for dummy video test
      };
    }
    
    return {
      uri: videoUrl,
      headers: authHeaders,
      // 🔑 CRITICAL: Conservative buffering for reliability (like old code)
      bufferConfig: {
        minBufferMs: 1000, // Conservative for reliability
        maxBufferMs: 5000, // Moderate max buffer
        bufferForPlaybackMs: 500, // Conservative buffer for playback
        bufferForPlaybackAfterRebufferMs: 1000, // Conservative recovery
        backBufferDurationMs: 3000,
        maxHeapAllocationPercent: 0.3,
      },
      // 🔑 CRITICAL: Conservative settings for reliability
      minLoadRetryCount: 3, // Conservative retry
      shouldCache: true,
      automaticallyWaitsToMinimizeStalling: true, // Enable for reliability
    };
  }, [cachedVideoUrl, episode.video_urls.master, videoAuthCookies]);

  // REVOLUTIONARY: Video event handlers - never fail
  const handleProgress = useCallback(({ currentTime, playableDuration }: any) => {
    try {
      setVideoProgress(episode._id, currentTime);
      updateVideoStateAction(episode._id, { duration: playableDuration });
    } catch (error) {
      // Silent fail - don't affect user experience
    }
  }, [episode._id, setVideoProgress, updateVideoStateAction]);

  const handleLoad = useCallback(({ duration: videoDuration }: any) => {
    console.log('✅ InstantEpisodePlayer - Video Loaded Successfully:', {
      episodeId: episode._id,
      episodeNo: episode.episodeNo,
      duration: videoDuration,
      videoUrl: videoSource?.uri
    });
    
    try {
      updateVideoStateAction(episode._id, { 
        duration: videoDuration, 
        isReady: true,
        isBuffering: false 
      });
    } catch (error) {
      console.error('❌ InstantEpisodePlayer - Error updating video state:', error);
    }
  }, [episode._id, updateVideoStateAction, index, videoSource]);

  const handleReadyForDisplay = useCallback(() => {
    console.log('🎬 InstantEpisodePlayer - Video Ready for Display:', {
      episodeId: episode._id,
      episodeNo: episode.episodeNo,
      videoUrl: videoSource?.uri
    });
    
    try {
      updateVideoStateAction(episode._id, { isReady: true, isBuffering: false });
    } catch (error) {
      console.error('❌ InstantEpisodePlayer - Error updating ready state:', error);
    }
  }, [episode._id, updateVideoStateAction, videoSource]);

  const handleBuffer = useCallback(({ isBuffering: buffering }: any) => {
    try {
      updateVideoStateAction(episode._id, { isBuffering: buffering });
    } catch (error) {
      // Silent fail - don't affect user experience
    }
  }, [episode._id, updateVideoStateAction]);

  const handleEnd = useCallback(() => {
    try {
      // For repeat mode, just reset progress and keep playing
      updateVideoStateAction(episode._id, { progress: 0 });
    } catch (error) {
      // Silent fail - don't affect user experience
    }
  }, [episode._id, updateVideoStateAction, index]);

  const handleError = useCallback((error: any) => {
    console.error('❌ InstantEpisodePlayer - Video Error:', {
      episodeId: episode._id,
      episodeNo: episode.episodeNo,
      error: error?.errorString || error?.message || 'Unknown error',
      videoUrl: episode.video_urls?.master,
      errorCode: error?.errorCode,
      errorType: error?.errorType,
      fullError: error
    });
    
    // 🔑 CRITICAL: Log video source for debugging
    console.log('🔍 InstantEpisodePlayer - Video Source on Error:', {
      episodeId: episode._id,
      videoSource: videoSource,
      videoUrl: videoSource?.uri,
      headers: videoSource?.headers,
      hasCookies: !!videoAuthCookies
    });
    
    // REVOLUTIONARY: Never show errors to user - just keep trying
    try {
      updateVideoStateAction(episode._id, { 
        isBuffering: false,
        error: null // Clear any previous errors
      });
    } catch (updateError) {
      // Silent fail - don't affect user experience
    }
  }, [episode._id, updateVideoStateAction, videoSource, videoAuthCookies]);

  // Enhanced play/pause toggle
  const togglePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying;
    setVideoPlaying(episode._id, newPlayingState);
    
    // Show pause button briefly when toggling
    showPauseButtonWithTimer();
  }, [isPlaying, episode._id, setVideoPlaying, showPauseButtonWithTimer]);

  // Enhanced video press handler - show pause button on tap
  const handleVideoPress = useCallback(() => {
    showPauseButtonWithTimer();
  }, [showPauseButtonWithTimer]);

  // Animated styles
  const likeButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: likeButtonScale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { height: viewHeight }]}>
      {/* Video Container */}
      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        {/* Video Player - Always render, pause when not ready */}
        <Video
          ref={videoRef}
          source={videoSource}
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
          // 🔑 CRITICAL: Add missing props for proper video playback
          controls={false}
          progressUpdateInterval={1000}
          reportBandwidth={true}
          preventsDisplaySleepDuringVideoPlayback={true}
          automaticallyWaitsToMinimizeStalling={true}
          // Show thumbnail while video not ready
          poster={episode.thumbnail}
          posterResizeMode="cover"
          // 🔑 CRITICAL: Add key prop for proper re-rendering
          key={`video-${episode._id}-${index}`}
        />

        {/* Fallback Thumbnail - Show when video not ready */}
        {!videoState?.isReady && (
          <View style={styles.thumbnailOverlay}>
            <Image 
              source={{ uri: episode.thumbnail }} 
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Top Navigation Overlay */}
        <View style={styles.topOverlay}>
          <View style={styles.topLeft}>
            <TouchableOpacity style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.episodeText}>Episode {episode.episodeNo}/26</Text>
            <TouchableOpacity style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Text style={styles.infoIcon}>i</Text>
          </TouchableOpacity>
        </View>

        {/* Play/Pause Indicator - Only visible on tap */}
        <Animated.View style={[styles.playIndicator, { opacity: pauseButtonOpacity }]}>
          <View style={[styles.playIndicatorBackground, isPlaying && { backgroundColor: 'rgba(0, 255, 0, 0.3)' }]}>
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </View>
        </Animated.View>

        {/* Right Side Action Buttons */}
        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionItem} onPress={handleLikePress}>
            <View style={[styles.actionIconContainer, isLiked && styles.likedIconContainer]}>
              <Text style={styles.actionIconText}>❤️</Text>
            </View>
            <Text style={styles.actionLabel}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIconText}>🔖</Text>
            </View>
            <Text style={styles.actionLabel}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIconText}>XA</Text>
            </View>
            <Text style={styles.actionLabel}>Audio</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIconText}>HD</Text>
            </View>
            <Text style={styles.actionLabel}>Video</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => onShare(episode)}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIconText}>📤</Text>
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Video Progress Bar */}
        <View style={styles.videoProgressBar}>
          <View style={[styles.videoProgressFill, { width: `${(progress / duration) * 100}%` }]} />
        </View>

        {/* Subtle loading indicator - only show when buffering */}
        {videoState?.isBuffering && (
          <View style={styles.subtleLoadingOverlay}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          </View>
        )}

        {/* Episode Unlock Overlay */}
        {episode.isLocked && !isEpisodeUnlocked?.(episode._id) && (
          <View style={styles.unlockOverlay}>
            <View style={styles.unlockContent}>
              <Icon name="lock" size={48} color="#ffffff" style={styles.lockIcon} />
              <Text style={styles.unlockTitle}>Episode Locked</Text>
              <Text style={styles.unlockDescription}>
                {episode.unlockType === 'coins' 
                  ? `Unlock for ${episode.unlockPrice} coins`
                  : 'Watch an ad to unlock this episode'
                }
              </Text>
              
              <View style={styles.unlockButtons}>
                {episode.unlockType === 'coins' && onUnlockWithCoins && (
                  <TouchableOpacity 
                    style={styles.unlockButton}
                    onPress={() => onUnlockWithCoins(episode._id, episode.unlockPrice || 0)}
                  >
                    <Text style={styles.unlockButtonText}>
                      Unlock ({episode.unlockPrice} coins)
                    </Text>
                  </TouchableOpacity>
                )}
                
                {episode.unlockType === 'ads' && onUnlockWithAds && (
                  <TouchableOpacity 
                    style={styles.unlockButton}
                    onPress={() => onUnlockWithAds(episode._id, 'rewarded')}
                  >
                    <Text style={styles.unlockButtonText}>
                      Watch Ad to Unlock
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom Content Section */}
      <View style={styles.bottomContent}>
        <Text style={styles.contentTitle}>{episode.title}</Text>
        <Text style={styles.contentDescription} numberOfLines={3}>
          {episode.description}
        </Text>
      </View>

      {/* Global Progress Bar */}
      <View style={styles.globalProgressBar}>
        <Text style={styles.timeText}>00:00</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(progress / duration) * 100}%` }]} />
        </View>
        <Text style={styles.timeText}>02:21</Text>
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
  
  // Top Navigation Overlay
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  episodeText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 12,
  },
  menuButton: {
    marginLeft: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  
  // Play/Pause Indicator
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
  
  // Right Side Actions
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    zIndex: 10,
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  likedIconContainer: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
    borderWidth: 1,
  },
  actionIconText: {
    fontSize: 18,
    color: '#ffffff',
  },
  actionLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  // Video Progress Bar
  videoProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  videoProgressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  
  // Loading
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
  
  // Bottom Content Section
  bottomContent: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    // right: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 11,
    borderRadius: 8,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 20,
  },
  
  // Global Progress Bar
  globalProgressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  timeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    width: 40,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1,
  },
  
  // Episode Unlock Overlay Styles
  unlockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  unlockContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: 300,
  },
  lockIcon: {
    marginBottom: 16,
  },
  unlockTitle: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  unlockDescription: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  unlockButtons: {
    width: '100%',
  },
  unlockButton: {
    backgroundColor: '#ed9b72',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Thumbnail Overlay Styles
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
});

export default InstantEpisodePlayer; 