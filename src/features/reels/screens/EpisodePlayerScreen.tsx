import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SvgIcons } from '../../../components/common/SvgIcons';
import VideoProgressBar from '../../../components/VideoPlayer/VideoProgressBar';
import { useVideoStore, useVideoState, useIsVideoPlaying, useIsVideoCached, useVideoProgress, useVideoDuration } from '../../../store/videoStore';
import { enhancedVideoCache } from '../../../utils/enhancedVideoCache';
import { performanceMonitor } from '../../../utils/performanceMonitor';
import { useVideoTransition } from '../../../hooks/useVideoTransition';
import { dummyEpisodeReelsData, dummyVideoUrls } from '../../../utils/dummyData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Episode {
  _id: string;
  episodeNo: number;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  views: string;
  likes: number;
  comments: number;
  shares: number;
  status: 'locked' | 'unlocked';
  contentId: string;
  contentName: string;
  isShort?: boolean;
  aspectRatio?: number;
}

interface EpisodePlayerScreenProps {
  navigation: any;
  route: {
    params: {
      contentId: string;
      contentName: string;
      episodes: Episode[];
      initialIndex?: number;
    };
  };
}

const EpisodePlayerScreen: React.FC<EpisodePlayerScreenProps> = ({ navigation, route }) => {
  const { contentId, contentName, episodes, initialIndex = 0 } = route.params;
  
  // Hooks
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const currentIndex = useRef(initialIndex);
  const isMounted = useRef(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [episodesData, setEpisodesData] = useState<Episode[]>(episodes || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([initialIndex]));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isScrollingFast, setIsScrollingFast] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(episodes?.[initialIndex] || null);

  // Video store
  const { setCurrentVideo, clearCache, setVideoPlaying, setVideoProgress } = useVideoStore();

  // Memoized values for performance
  const viewHeight = useMemo(() => screenHeight - insets.top, [insets.top]);
  
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: viewHeight,
    offset: viewHeight * index,
    index,
  }), [viewHeight]);

  // Regular scroll handler for FlatList
  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.value = offsetY;
    isScrolling.value = true;
    
    // Debounce scroll end detection
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      isScrolling.value = false;
      setIsUserScrolling(false);
      setIsScrollingFast(false);
    }, 150);
  }, []);

  // Animated scroll style
  const animatedScrollStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 100],
            [0, -20],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  // Load more episodes with dummy internet videos
  const loadMoreEpisodes = useCallback(async () => {
    if (isLoading || isRefreshing) return;
    
    setIsLoading(true);
    try {
      // Simulate API call to load more episodes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate more episodes with dummy internet videos
      const newEpisodes = Array.from({ length: 10 }, (_, i) => {
        const episodeIndex = episodesData.length + i + 1;
        const videoUrl = dummyVideoUrls[episodeIndex % dummyVideoUrls.length];
        
        return {
          _id: `episode-${contentId}-${episodeIndex}`,
          episodeNo: episodeIndex,
          title: `${contentName} - Episode ${episodeIndex}`,
          description: `Watch the exciting Episode ${episodeIndex} of ${contentName}. This episode features amazing storytelling and incredible performances.`,
          videoUrl,
          thumbnail: `https://picsum.photos/400/600?random=${contentId}-${episodeIndex}`,
          duration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
          views: `${Math.floor(Math.random() * 1000)}K`,
          likes: Math.floor(Math.random() * 10000),
          comments: Math.floor(Math.random() * 500),
          shares: Math.floor(Math.random() * 200),
          status: 'unlocked' as const,
          contentId,
          contentName,
          isShort: true,
          aspectRatio: 9 / 16,
        };
      });
      
      setEpisodesData(prev => [...prev, ...newEpisodes]);
    } catch (error) {
      console.error('Error loading more episodes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isRefreshing, episodesData, contentId, contentName]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate fresh episodes with dummy internet videos
      const freshEpisodes = dummyEpisodeReelsData(contentId, contentName).slice(0, 20);
      setEpisodesData(freshEpisodes);
      setActiveIndex(initialIndex);
      currentIndex.current = initialIndex;
    } catch (error) {
      console.error('Error refreshing episodes:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, contentId, contentName, initialIndex]);

  // Optimized visibility change handler
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!isMounted.current || viewableItems.length === 0 || isScrollingFast) return;

    const newVisibleIndices = new Set<number>(viewableItems.map((item: any) => item.index as number));
    setVisibleIndices(newVisibleIndices);

    // Find the most visible item
    const mostVisibleItem = viewableItems.reduce((prev: any, current: any) => 
      prev.percentVisible > current.percentVisible ? prev : current
    );

    if (mostVisibleItem && mostVisibleItem.index !== activeIndex) {
      const newActiveIndex = mostVisibleItem.index;
      
      requestAnimationFrame(() => {
        if (isMounted.current) {
          setActiveIndex(newActiveIndex);
          currentIndex.current = newActiveIndex;
          setCurrentEpisode(episodesData[newActiveIndex]);
          
          // Update current video in store
          const activeItem = episodesData[newActiveIndex];
          if (activeItem) {
            setCurrentVideo(activeItem._id);
          }

          // Prefetch next episodes
          if (!isScrollingFast) {
            const prefetchItems = episodesData
              .slice(newActiveIndex, newActiveIndex + 3)
              .map((item) => ({
                id: item._id,
                url: item.videoUrl,
              }));

            enhancedVideoCache.preloadVideos(prefetchItems);
          }
        }
      });
    }
  }, [activeIndex, episodesData, setCurrentVideo, isScrollingFast]);

  // Share handler
  const handleShare = async (episode: Episode) => {
    try {
      const message = `Watch ${episode.title} from ${contentName} on Rocket Reels!`;
      await Share.share({
        title: episode.title,
        message,
        url: 'https://rocketreels.app',
      });
    } catch (error) {
      console.error('Error sharing episode:', error);
    }
  };

  // Key extractor
  const keyExtractor = useCallback((item: Episode) => item._id, []);

  // Viewability config
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 200,
  }), []);

  // Load initial data with dummy internet videos
  useEffect(() => {
    if (episodesData.length === 0) {
      // Initialize with dummy episode reels data
      const initialEpisodes = dummyEpisodeReelsData(contentId, contentName).slice(0, 20);
      setEpisodesData(initialEpisodes);
    }
  }, [episodesData.length, contentId, contentName]);

  // Focus/blur effects
  useEffect(() => {
    if (!isFocused) {
      // Pause all videos when screen loses focus
      setVideoPlaying('', false);
    }
  }, [isFocused, setVideoPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      performanceMonitor.logPerformanceSummary();
    };
  }, []);

  // Render episode item
  const renderEpisodeItem = useCallback(({ item, index }: { item: Episode; index: number }) => {
    const isVisible = visibleIndices.has(index);
    const isActive = index === activeIndex;

    return (
      <EpisodeCard
        episode={item}
        index={index}
        isVisible={isVisible}
        isActive={isActive}
        viewHeight={viewHeight}
        isScrolling={isUserScrolling}
        onLike={(episodeId) => {
          console.log('Liked episode:', episodeId);
        }}
        onShare={(episode) => {
          handleShare(episode);
        }}
        onComment={(episodeId) => {
          console.log('Comment on episode:', episodeId);
        }}
        showControls={showControls}
        setShowControls={setShowControls}
        navigation={navigation}
      />
    );
  }, [visibleIndices, activeIndex, viewHeight, isUserScrolling, showControls, handleShare, navigation]);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading more episodes...</Text>
      </View>
    );
  }, [isLoading]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading || isRefreshing) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No episodes available</Text>
        <Text style={styles.emptySubtext}>Pull to refresh to load content</Text>
      </View>
    );
  }, [isLoading, isRefreshing]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.flatListContainer, animatedScrollStyle]}>
        <FlatList
          ref={flatListRef}
          data={episodesData}
          renderItem={renderEpisodeItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          showsVerticalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={0}
          snapToAlignment="start"
          decelerationRate="fast"
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={1}
          windowSize={3}
          initialNumToRender={1}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#ffffff']}
              tintColor="#ffffff"
              progressBackgroundColor="rgba(255, 255, 255, 0.3)"
            />
          }
          onEndReached={loadMoreEpisodes}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      </Animated.View>
    </View>
  );
};

// Episode Card Component
interface EpisodeCardProps {
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
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({
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
}) => {
  // Video store hooks
  const { setVideoPlaying, setVideoProgress, updateVideoState } = useVideoStore();

  // Get video state from store
  const videoState = useVideoState(episode._id);
  const isPlaying = useIsVideoPlaying(episode._id);
  const isCached = useIsVideoCached(episode._id);
  const progress = useVideoProgress(episode._id);
  const duration = useVideoDuration(episode._id);

  // Local state for pause button visibility
  const [showPauseButton, setShowPauseButton] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animated values
  const progressValue = useSharedValue(0);
  const opacityValue = useSharedValue(1);
  const scaleValue = useSharedValue(1);
  const controllerOpacity = useSharedValue(1);
  const pauseButtonOpacity = useSharedValue(0);

  // Video transition hook
  useVideoTransition({
    videoId: episode._id,
    isVisible,
    isActive,
    index,
    isScrolling,
  });

  // Memoized video source with better buffer configuration
  const videoSource = useMemo(() => ({
    uri: videoState?.cachedPath || episode.videoUrl,
    headers: {
      'Cache-Control': 'max-age=3600',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'RocketReels/1.0',
    },
    bufferConfig: {
      minBufferMs: 500,
      maxBufferMs: 3000,
      bufferForPlaybackMs: 200,
      bufferForPlaybackAfterRebufferMs: 500,
      backBufferDurationMs: 2000,
      maxHeapAllocationPercent: 0.2,
    },
    minLoadRetryCount: 3,
    shouldCache: true,
  }), [videoState?.cachedPath, episode.videoUrl]);

  // Function to show pause button with auto-hide
  const showPauseButtonWithTimer = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setShowPauseButton(true);
    pauseButtonOpacity.value = withTiming(1, { duration: 200 });
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
        const cachedPath = await enhancedVideoCache.cacheVideo(episode.videoUrl, episode._id, 'high');
        if (cachedPath !== episode.videoUrl) {
          updateVideoState(episode._id, { isCached: true, cachedPath });
        }
      } catch (error) {
        console.error('Error preloading video:', error);
      }
    };
    preloadVideo();
  }, [episode._id, episode.videoUrl, updateVideoState]);

  // Start playing immediately when component mounts if visible
  useEffect(() => {
    if (isVisible) {
      setVideoPlaying(episode._id, true);
    }
  }, [isVisible, episode._id, setVideoPlaying]);

  // Handle visibility changes with optimized timing
  useEffect(() => {
    if (isVisible) {
      setVideoPlaying(episode._id, true);
      controllerOpacity.value = withTiming(1, { duration: 50 });
    } else {
      setTimeout(() => {
        setVideoPlaying(episode._id, false);
      }, 30);
      controllerOpacity.value = withTiming(0, { duration: 50 });
      hidePauseButton();
    }
  }, [isVisible, episode._id, setVideoPlaying, controllerOpacity, hidePauseButton]);

  // Handle video progress
  const handleProgress = useCallback(({ currentTime, playableDuration }: any) => {
    setVideoProgress(episode._id, currentTime);
    updateVideoState(episode._id, { duration: playableDuration });
  }, [episode._id, setVideoProgress, updateVideoState]);

  // Handle video load
  const handleLoad = useCallback(({ duration: videoDuration }: any) => {
    updateVideoState(episode._id, { duration: videoDuration, isReady: true });
  }, [episode._id, updateVideoState]);

  // Handle video buffer
  const handleBuffer = useCallback(({ isBuffering: buffering }: any) => {
    updateVideoState(episode._id, { isBuffering: buffering });
  }, [episode._id, updateVideoState]);

  // Handle video end
  const handleEnd = useCallback(() => {
    setVideoPlaying(episode._id, false);
    updateVideoState(episode._id, { progress: 0 });
  }, [episode._id, setVideoPlaying, updateVideoState]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    const newPlayingState = !isPlaying;
    setVideoPlaying(episode._id, newPlayingState);
    if (newPlayingState) {
      hidePauseButton();
    } else {
      showPauseButtonWithTimer();
    }
  }, [isPlaying, episode._id, setVideoPlaying, hidePauseButton, showPauseButtonWithTimer]);

  // Handle video press
  const handleVideoPress = useCallback(() => {
    if (isPlaying) {
      showPauseButtonWithTimer();
    } else {
      hidePauseButton();
    }
  }, [isPlaying, showPauseButtonWithTimer, hidePauseButton]);

  // Format duration
  const formatDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Format likes
  const formatLikes = useCallback((likes: number) => {
    if (likes >= 1000000) {
      return `${(likes / 1000000).toFixed(1)}M`;
    } else if (likes >= 1000) {
      return `${(likes / 1000).toFixed(1)}K`;
    }
    return likes.toString();
  }, []);

  return (
    <View style={[styles.episodeContainer, { height: viewHeight }]}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          source={videoSource}
          style={styles.video}
          resizeMode="cover"
          repeat={false}
          paused={!isPlaying || !isActive}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onBuffer={handleBuffer}
          onEnd={handleEnd}
          onError={(error: any) => console.error('Video error:', error)}
        />

        {/* Cache indicator */}
        {isCached && (
          <View style={styles.cacheIndicator}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
          </View>
        )}

        {/* Loading indicator */}
        {videoState?.isBuffering && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}

        {/* Video overlay for controls */}
        <TouchableOpacity
          style={styles.videoOverlay}
          onPress={handleVideoPress}
          activeOpacity={1}
        />

        {/* Header with episode info */}
        <Animated.View style={[styles.header, { opacity: controllerOpacity }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.episodeInfo}>
              Episode {episode.episodeNo}/26
            </Text>
            <TouchableOpacity style={styles.menuButton}>
              <Icon name="layers" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Icon name="info" size={24} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Right side action buttons */}
        <Animated.View style={[styles.actionButtons, { opacity: controllerOpacity }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onLike(episode._id)}
          >
            <View style={styles.iconContainer}>
              <Icon name="favorite-border" color="#ffffff" size={28} />
            </View>
            <Text style={styles.actionText}>
              {formatLikes(episode.likes)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.iconContainer}>
              <Icon name="bookmark-border" color="#ffffff" size={28} />
            </View>
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.iconContainer}>
              <Icon name="audiotrack" color="#ffffff" size={28} />
            </View>
            <Text style={styles.actionText}>Audio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.iconContainer}>
              <Text style={styles.hdText}>HD</Text>
            </View>
            <Text style={styles.actionText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onShare(episode)}
          >
            <View style={styles.iconContainer}>
              <Icon name="share" color="#ffffff" size={28} />
            </View>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom content info */}
        <Animated.View style={[styles.bottomOverlay, { opacity: controllerOpacity }]}>
          <View style={styles.contentInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {episode.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {episode.description}
            </Text>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <VideoProgressBar
          progress={progress}
          duration={duration}
          isVisible={true}
          isPlaying={isPlaying}
          isBuffering={videoState?.isBuffering}
        />

        {/* Play/Pause Button */}
        <Animated.View style={[styles.playButton, { opacity: pauseButtonOpacity }]}>
          <TouchableOpacity
            style={styles.playButtonTouchable}
            onPress={togglePlayPause}
          >
            <Icon
              name={isPlaying ? "pause" : "play-arrow"}
              size={48}
              color="#ffffff"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    zIndex: 1000,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  episodeInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 12,
  },
  menuButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
  },
  flatListContainer: {
    flex: 1,
  },
  episodeContainer: {
    width: screenWidth,
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
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cacheIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
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
  actionButtons: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
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
  hdText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  contentInfo: {
    marginBottom: 10,
    paddingRight: 80,
    paddingTop: 10,
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
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#ffffff',
    opacity: 0.7,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EpisodePlayerScreen; 