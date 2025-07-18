import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Text,
  InteractionManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';

// Components
import ReelCard from '../components/ReelCard';
import PerformanceMonitor from '../../../components/common/PerformanceMonitor';
import { prefetchManager } from '../../../utils/prefetch';
import { performanceMonitor } from '../../../utils/performanceMonitor';
import { useVideoStore } from '../../../store/videoStore';

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

interface OptimizedReelsFeedScreenProps {
  navigation: any;
  initialData?: ReelItem[];
}

const OptimizedReelsFeedScreen: React.FC<OptimizedReelsFeedScreenProps> = ({
  navigation,
  initialData = [],
}) => {
  // Hooks
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isFocused = useIsFocused();

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const scrollY = useSharedValue(0);
  const isScrolling = useSharedValue(false);
  const currentIndex = useRef(0);
  const lastScrollTime = useRef(0);
  const isMounted = useRef(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State
  const [reelsData, setReelsData] = useState<ReelItem[]>(initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([0]));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isScrollingFast, setIsScrollingFast] = useState(false);

  // Video store
  const { setCurrentVideo, clearCache, setVideoPlaying } = useVideoStore();

  // Memoized values for performance
  const viewHeight = useMemo(() => screenHeight - insets.top - tabBarHeight, [insets.top, tabBarHeight]);
  
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: viewHeight,
    offset: viewHeight * index,
    index,
  }), [viewHeight]);

  // Optimized scroll handler with better performance
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      isScrolling.value = true;
      
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;
      lastScrollTime.current = now;
      
      // Detect fast scrolling (less than 50ms between scroll events)
      const isFast = timeSinceLastScroll < 50;
      
      runOnJS(setIsUserScrolling)(true);
      runOnJS(setIsScrollingFast)(isFast);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to stop scrolling detection
      scrollTimeoutRef.current = setTimeout(() => {
        runOnJS(setIsUserScrolling)(false);
        runOnJS(setIsScrollingFast)(false);
      }, 150); // Increased delay for better detection
    },
    onBeginDrag: () => {
      isScrolling.value = true;
      runOnJS(setIsUserScrolling)(true);
    },
    onEndDrag: () => {
      // Don't immediately stop scrolling detection
      // Let the timeout handle it
    },
    onMomentumEnd: () => {
      // Don't immediately stop scrolling detection
      // Let the timeout handle it
    },
  });

  // Animated styles for smooth interactions
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

  // Load more data function
  const loadMoreData = useCallback(async () => {
    if (isLoading || !isMounted.current) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add more dummy data
      const newData: ReelItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `reel-${reelsData.length + i}`,
        title: `Amazing Reel ${reelsData.length + i + 1}`,
        description: `This is an incredible short video that will blow your mind! #viral #trending`,
        videoUrl: `https://example.com/video-${reelsData.length + i}.mp4`,
        thumbnail: `https://picsum.photos/400/600?random=${reelsData.length + i}`,
        likes: Math.floor(Math.random() * 100000) + 1000,
        comments: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 500) + 50,
        author: `creator_${reelsData.length + i}`,
        duration: Math.floor(Math.random() * 60) + 15,
        views: `${Math.floor(Math.random() * 1000000) + 10000}`,
        category: 'entertainment',
        tags: ['viral', 'trending', 'funny'],
      }));

      setReelsData(prev => [...prev, ...newData]);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [reelsData.length, isLoading]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || !isMounted.current) return;

    setIsRefreshing(true);
    try {
      // Clear cache and prefetch queue
      clearCache();
      prefetchManager.clearPrefetchQueue();

      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset data
      const refreshedData: ReelItem[] = Array.from({ length: 20 }, (_, i) => ({
        id: `reel-refresh-${i}`,
        title: `Fresh Reel ${i + 1}`,
        description: `Brand new content just for you! #fresh #new`,
        videoUrl: `https://example.com/refresh-video-${i}.mp4`,
        thumbnail: `https://picsum.photos/400/600?random=${i + 1000}`,
        likes: Math.floor(Math.random() * 100000) + 1000,
        comments: Math.floor(Math.random() * 1000) + 100,
        shares: Math.floor(Math.random() * 500) + 50,
        author: `fresh_creator_${i}`,
        duration: Math.floor(Math.random() * 60) + 15,
        views: `${Math.floor(Math.random() * 1000000) + 10000}`,
        category: 'trending',
        tags: ['fresh', 'new', 'viral'],
      }));

      setReelsData(refreshedData);
      setActiveIndex(0);
      currentIndex.current = 0;
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, clearCache]);

  // Optimized visibility change handler with better performance
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!isMounted.current || viewableItems.length === 0 || isScrollingFast) return;

    const newVisibleIndices = new Set<number>(viewableItems.map((item: any) => item.index as number));
    setVisibleIndices(newVisibleIndices);

    // Find the most visible item (highest visibility percentage)
    const mostVisibleItem = viewableItems.reduce((prev: any, current: any) => 
      prev.percentVisible > current.percentVisible ? prev : current
    );

    // Update active index with debouncing
    if (mostVisibleItem && mostVisibleItem.index !== activeIndex) {
      const newActiveIndex = mostVisibleItem.index;
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        if (isMounted.current) {
          setActiveIndex(newActiveIndex);
          currentIndex.current = newActiveIndex;
          
          // Update current video in store
          const activeItem = reelsData[newActiveIndex];
          if (activeItem) {
            setCurrentVideo(activeItem.id);
          }

          // Trigger prefetch for upcoming items only when not scrolling fast
          if (!isScrollingFast) {
            const prefetchItems = reelsData
              .slice(newActiveIndex, newActiveIndex + 3) // Reduced prefetch distance
              .map((item, idx) => ({
                id: item.id,
                videoUrl: item.videoUrl,
                thumbnailUrl: item.thumbnail,
                priority: (idx === 0 ? 'high' : 'medium') as 'high' | 'medium' | 'low',
                index: newActiveIndex + idx,
              }));

            prefetchManager.updateCurrentIndex(newActiveIndex, prefetchItems);
          }
        }
      });
    }
  }, [activeIndex, reelsData, setCurrentVideo, isScrollingFast]);

  // Optimized render item function
  const renderItem = useCallback(({ item, index }: { item: ReelItem; index: number }) => {
    const isVisible = visibleIndices.has(index);
    const isActive = index === activeIndex;

    return (
      <ReelCard
        item={item}
        index={index}
        isVisible={isVisible}
        isActive={isActive}
        viewHeight={viewHeight}
        isScrolling={isUserScrolling}
        onPress={(pressedItem) => {
          // Navigate to full screen player
          navigation.navigate('ReelPlayer', { reel: pressedItem });
        }}
        onLike={(itemId) => {
          // Handle like action
          console.log('Liked:', itemId);
        }}
        onShare={(shareItem) => {
          // Handle share action
          console.log('Share:', shareItem);
        }}
        onComment={(itemId) => {
          // Handle comment action
          console.log('Comment:', itemId);
        }}
      />
    );
  }, [visibleIndices, activeIndex, viewHeight, navigation, isUserScrolling]);

  // Key extractor for FlatList optimization
  const keyExtractor = useCallback((item: ReelItem) => item.id, []);

  // Optimized viewability config for better performance
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 60, // Increased threshold for more stable detection
    minimumViewTime: 200, // Increased minimum time to prevent rapid changes
  }), []);

  // Load initial data
  useEffect(() => {
    if (initialData.length === 0) {
      loadMoreData();
    }
  }, [initialData.length, loadMoreData]);

  // Focus/blur effects
  useEffect(() => {
    if (!isFocused) {
      // Pause all videos when screen loses focus
      reelsData.forEach(item => {
        // This would be handled by the video store
      });
    }
  }, [isFocused, reelsData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      prefetchManager.clearPrefetchQueue();
      performanceMonitor.logPerformanceSummary();
    };
  }, []);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading more reels...</Text>
      </View>
    );
  }, [isLoading]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading || isRefreshing) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No reels available</Text>
        <Text style={styles.emptySubtext}>Pull to refresh to load content</Text>
      </View>
    );
  }, [isLoading, isRefreshing]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.flatListContainer, animatedScrollStyle]}>
        <FlatList
          ref={flatListRef}
          data={reelsData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScroll={scrollHandler}
          scrollEventThrottle={32} // Increased throttle for better performance
          showsVerticalScrollIndicator={false}
          pagingEnabled={false}
          snapToInterval={0}
          snapToAlignment="start"
          decelerationRate="fast"
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={1} // Reduced for better performance
          windowSize={3} // Reduced window size
          initialNumToRender={1}
          updateCellsBatchingPeriod={50} // Increased batching period
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#ffffff']}
              tintColor="#ffffff"
              progressBackgroundColor="rgba(255, 255, 255, 0.3)"
            />
          }
          onEndReached={loadMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      </Animated.View>
      
      {/* Performance Monitor for debugging */}
      <PerformanceMonitor isVisible={__DEV__} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flatListContainer: {
    flex: 1,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default OptimizedReelsFeedScreen; 