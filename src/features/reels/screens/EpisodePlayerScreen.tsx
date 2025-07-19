import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useVideoStore } from '../../../store/videoStore';
import { instagramVideoCache } from '../../../utils/instagramOptimizedVideoCache';
import { advancedVideoOptimizer } from '../../../utils/advancedVideoOptimizer';
import { hardwareAcceleratedScroll } from '../../../utils/hardwareAcceleratedScroll';
import { performanceMonitor } from '../../../utils/performanceMonitor';
import { useVideoTransition } from '../../../hooks/useVideoTransition';
import { useAdvancedPerformance } from '../../../hooks/useAdvancedPerformance';
import { instagramStyleVideoPreloader } from '../../../utils/instagramStyleVideoPreloader';
import InstantEpisodePlayer from '../../../components/VideoPlayer/InstantEpisodePlayer';
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
  const { contentId, contentName, episodes: initialEpisodes, initialIndex = 0 } = route.params;

  // State
  const [episodesData, setEpisodesData] = useState<Episode[]>(initialEpisodes || dummyEpisodeReelsData);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([initialIndex]));
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(initialEpisodes?.[initialIndex] || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isScrollingFast, setIsScrollingFast] = useState(false);
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [isAppActive, setIsAppActive] = useState(true);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheCleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndex = useRef(initialIndex);
  const isMounted = useRef(true);

  // Video store
  const { setVideoPlaying, setCurrentVideo } = useVideoStore();

  // Calculate view height
  const viewHeight = screenHeight;

  // Performance monitoring
  const { metrics, isOptimal, startMonitoring, endMonitoring } = useAdvancedPerformance('episode-player');

  // Event handlers - defined first to avoid hoisting issues
  const handleLike = useCallback((episodeId: string) => {
    setLikedEpisodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(episodeId)) {
        newSet.delete(episodeId);
      } else {
        newSet.add(episodeId);
      }
      return newSet;
    });
  }, []);

  const handleShare = useCallback(async (episode: Episode) => {
    try {
      // Implement share functionality
      console.log('Sharing episode:', episode._id);
    } catch (error) {
      console.error('Share error:', error);
    }
  }, []);

  const handleComment = useCallback((episodeId: string) => {
    // Implement comment functionality
    console.log('Commenting on episode:', episodeId);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Implement refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const loadMoreEpisodes = useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Implement load more logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Instagram-style aggressive preloading - less aggressive
  const smartPreload = useCallback(async (startIndex: number) => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    preloadTimeoutRef.current = setTimeout(async () => {
      try {
        // Add videos to Instagram-style preloader - reduced count
        const preloadItems = episodesData
          .slice(startIndex, startIndex + 2) // Reduced from 5 to 2
          .map((item, index) => ({
            id: item._id,
            url: item.videoUrl,
            priority: index === 0 ? 'high' as const : 'medium' as const,
          }));

        // Add to preload queue with priorities
        for (const item of preloadItems) {
          instagramStyleVideoPreloader.addToPreloadQueue(item.id, item.url, item.priority);
        }
        
        console.log(`🚀 Instagram-style preloader queued ${preloadItems.length} videos from index ${startIndex}`);
      } catch (error) {
        console.error('Smart preload error:', error);
      }
    }, 200); // Increased delay for stability
  }, [episodesData]);

  // Enhanced scroll handling with momentum detection
  const handleScroll = useCallback((event: any) => {
    if (!isMounted.current) return;

    const { contentOffset, velocity } = event.nativeEvent;
    const currentScrollY = contentOffset.y;
    const currentVelocity = velocity?.y || 0;

    // Simplified scroll velocity detection - less aggressive
    const isScrollingFast = Math.abs(currentVelocity) > 100; // Higher threshold for stability
    const isScrollingWithMomentum = Math.abs(currentVelocity) > 200; // Much higher threshold
    
    setIsScrollingFast(isScrollingFast || isScrollingWithMomentum);

    // Only update index when scrolling is very slow or stopped
    if (!isScrollingWithMomentum && Math.abs(currentVelocity) < 50) {
      const newIndex = Math.round(currentScrollY / viewHeight);
      if (newIndex !== currentIndex.current && newIndex >= 0 && newIndex < episodesData.length) {
        currentIndex.current = newIndex;
        setActiveIndex(newIndex);
        
        const newEpisode = episodesData[newIndex];
        if (newEpisode) {
          setCurrentEpisode(newEpisode);
          setCurrentVideo(newEpisode._id);
        }
      }
    }

    // Longer debounced scroll end detection for stability
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrollingFast(false);
    }, 300); // Longer delay for better stability
  }, [episodesData, viewHeight, setCurrentVideo]);

  // Handle scroll momentum end
  const handleMomentumScrollEnd = useCallback((event: any) => {
    if (!isMounted.current) return;

    const { contentOffset } = event.nativeEvent;
    const currentScrollY = contentOffset.y;
    
    // Snap to the nearest episode
    const newIndex = Math.round(currentScrollY / viewHeight);
    if (newIndex >= 0 && newIndex < episodesData.length) {
      setActiveIndex(newIndex);
      currentIndex.current = newIndex;
      
      const newEpisode = episodesData[newIndex];
      if (newEpisode) {
        setCurrentEpisode(newEpisode);
        setCurrentVideo(newEpisode._id);
      }
      
      // Update preloader after momentum ends - less aggressive
      instagramStyleVideoPreloader.setCurrentIndex(newIndex);
      smartPreload(newIndex + 1);
    }
    
    setIsScrollingFast(false);
  }, [episodesData, viewHeight, setCurrentVideo, smartPreload]);

  // Simplified viewability handling - less aggressive
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!isMounted.current || viewableItems.length === 0) return;

    const newVisibleIndices = new Set<number>(viewableItems.map((item: any) => item.index));
    setVisibleIndices(newVisibleIndices);

    // Only update active index if not scrolling fast
    if (!isScrollingFast) {
      const newActiveIndex = viewableItems[0]?.index;
      if (newActiveIndex !== undefined && newActiveIndex !== activeIndex) {
        setActiveIndex(newActiveIndex);
        currentIndex.current = newActiveIndex;
        
        const newEpisode = episodesData[newActiveIndex];
        if (newEpisode) {
          setCurrentEpisode(newEpisode);
          setCurrentVideo(newEpisode._id);
        }

        // Update preloader with current context - less aggressive
        instagramStyleVideoPreloader.setCurrentIndex(newActiveIndex);
        instagramStyleVideoPreloader.setVisibleIndices(newVisibleIndices);
        
        // Moderate preloading for next episodes
        smartPreload(newActiveIndex + 1);
      }
    }
  }, [activeIndex, episodesData, setCurrentVideo, smartPreload, isScrollingFast]);

  // Optimized render function with React.memo and scroll optimization
  const renderEpisode = useCallback(({ item, index }: { item: Episode; index: number }) => {
    const isVisible = visibleIndices.has(index);
    const isActive = activeIndex === index;
    const isLiked = likedEpisodes.has(item._id);

    // Always render the component - let the video player handle its own state
    return (
      <InstantEpisodePlayer
        key={item._id}
        episode={item}
        index={index}
        isVisible={isVisible}
        isActive={isActive}
        viewHeight={viewHeight}
        isScrolling={isScrollingFast}
        onLike={handleLike}
        onShare={handleShare}
        onComment={handleComment}
        showControls={showControls}
        setShowControls={setShowControls}
        navigation={navigation}
        isLiked={isLiked}
        isAppActive={isAppActive}
        allEpisodes={episodesData} // Pass all episodes for predictive loading
      />
    );
  }, [visibleIndices, activeIndex, viewHeight, isScrollingFast, handleLike, handleShare, handleComment, showControls, navigation, likedEpisodes, isAppActive, episodesData]);

  const keyExtractor = useCallback((item: Episode) => item._id, []);

  // Optimized viewability config for better scroll control - more stable
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 70, // Higher threshold for more stable detection
    minimumViewTime: 300, // Longer minimum time to prevent rapid switching
  }), []);

  // Optimized item layout for better performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: viewHeight,
    offset: viewHeight * index,
    index,
  }), [viewHeight]);

  // Performance monitoring
  useEffect(() => {
    console.log('🎬 Episode player mounted');
    startMonitoring();
    
    // Monitor preloader performance
    if (__DEV__) {
      const interval = setInterval(() => {
        const preloaderStats = instagramStyleVideoPreloader.getStats();
        console.log('📊 Preloader Performance:', preloaderStats);
      }, 10000);
      
      return () => {
        clearInterval(interval);
        console.log('🎬 Episode player unmounted');
        endMonitoring();
      };
    }
    
    return () => {
      console.log('🎬 Episode player unmounted');
      endMonitoring();
    };
  }, [startMonitoring, endMonitoring]);

  // App state management
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setIsAppActive(nextAppState === 'active');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Initial setup and preloading
  useEffect(() => {
    if (episodesData.length > 0) {
      console.log('🚀 Initial setup for episodes:', episodesData.length);
      
      // Ensure initial episode is properly set up
      setActiveIndex(initialIndex);
      currentIndex.current = initialIndex;
      setVisibleIndices(new Set([initialIndex]));
      
      const initialEpisode = episodesData[initialIndex];
      if (initialEpisode) {
        setCurrentEpisode(initialEpisode);
        setCurrentVideo(initialEpisode._id);
        console.log('🎬 Initial episode set:', initialEpisode._id);
      }
      
      smartPreload(initialIndex);
    }
  }, [episodesData, initialIndex, smartPreload, setCurrentVideo]);

  // Focus management - simplified
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Only pause active video when screen loses focus
        if (currentEpisode) {
          setVideoPlaying(currentEpisode._id, false);
        }
      };
    }, [currentEpisode, setVideoPlaying])
  );

  // Cache cleanup
  useEffect(() => {
    const cleanupCache = async () => {
      try {
        await instagramVideoCache.clearCache();
        console.log('🧹 Cache cleaned up');
      } catch (error) {
        console.error('Cache cleanup error:', error);
      }
    };

    cacheCleanupTimeoutRef.current = setTimeout(cleanupCache, 30000); // Cleanup every 30 seconds

    return () => {
      if (cacheCleanupTimeoutRef.current) {
        clearTimeout(cacheCleanupTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
      if (cacheCleanupTimeoutRef.current) {
        clearTimeout(cacheCleanupTimeoutRef.current);
      }
      
      // Cleanup Instagram-style preloader
      instagramStyleVideoPreloader.cleanup();
    };
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={episodesData}
        renderItem={renderEpisode}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={viewHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={1}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
        onEndReached={loadMoreEpisodes}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : null
        }
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flatList: {
    flex: 1,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
});

export default EpisodePlayerScreen; 