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
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { useVideoStore } from '../../../store/videoStore';
import { instagramVideoCache } from '../../../utils/instagramOptimizedVideoCache';
import { advancedVideoOptimizer } from '../../../utils/advancedVideoOptimizer';
import { hardwareAcceleratedScroll } from '../../../utils/hardwareAcceleratedScroll';
import { performanceMonitor } from '../../../utils/performanceMonitor';
import { useVideoTransition } from '../../../hooks/useVideoTransition';
import { useAdvancedPerformance } from '../../../hooks/useAdvancedPerformance';
import { instagramStyleVideoPreloader } from '../../../utils/instagramStyleVideoPreloader';
import InstagramOptimizedVideoPlayer from '../../../components/VideoPlayer/InstagramOptimizedVideoPlayer';
import { useEpisodes } from '../../../hooks/useEpisodes';
import ActivityLoader from '../../../components/common/ActivityLoader';
import EmptyMessage from '../../../components/common/EmptyMessage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
}

interface InstagramOptimizedEpisodePlayerProps {
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

// Instagram-level performance configuration
const INSTAGRAM_SCROLL_CONFIG = {
  scrollVelocityThreshold: 500, // Higher threshold for Instagram-like smoothness
  scrollDebounceTime: 100, // Longer debounce for stability
  preloadDistance: 1, // Only preload 1 video ahead (Instagram approach)
  maxConcurrentLoads: 2, // Limit concurrent loads
  memoryThreshold: 100 * 1024 * 1024, // 100MB memory limit
  frameRateTarget: 60, // Target 60fps for smooth scrolling
};

const InstagramOptimizedEpisodePlayer: React.FC<InstagramOptimizedEpisodePlayerProps> = ({ navigation, route }) => {
  const { contentId, contentName, episodes: initialEpisodes, initialIndex = 0 } = route.params;

  console.log('🎬 InstagramEpisodePlayer - Navigation Params:', {
    contentId,
    contentName,
    initialEpisodesCount: initialEpisodes?.length || 0,
    initialIndex
  });

  // Use episodes hook for API integration
  const {
    episodes: episodesData,
    contentInfo,
    contentLoading,
    contentError,
    refetchContent,
    isEpisodeUnlocked,
    unlockEpisodeWithCoins,
    unlockEpisodeWithAds,
    videoAuthCookies,
  } = useEpisodes(contentId);

  // Instagram-level state management
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([initialIndex]));
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrollingFast, setIsScrollingFast] = useState(false);
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [isAppActive, setIsAppActive] = useState(true);
  const [scrollVelocity, setScrollVelocity] = useState(0);

  // Instagram-level refs
  const flatListRef = useRef<FlatList>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheCleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndex = useRef(initialIndex);
  const isMounted = useRef(true);
  const lastScrollTime = useRef(Date.now());

  // Video store
  const { setVideoPlaying, setCurrentVideo } = useVideoStore();

  // Calculate view height
  const viewHeight = screenHeight;

  // Instagram-level performance monitoring
  const { metrics, isOptimal, startMonitoring, endMonitoring } = useAdvancedPerformance('instagram-episode-player');

  // Instagram-level event handlers
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
    } catch (error) {
      console.error('Share error:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Instagram-level intelligent preloading
  const instagramPreload = useCallback(async (startIndex: number) => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    preloadTimeoutRef.current = setTimeout(async () => {
      try {
        // Instagram approach: Only preload 1 video ahead
        const nextEpisode = episodesData[startIndex + 1];
        if (nextEpisode) {
          const baseUrl = 'https://k9456pbd.rocketreel.co.in/';
          const relativeUrl = nextEpisode.video_urls?.master || '';
          const fullVideoUrl = relativeUrl.startsWith('http') ? relativeUrl : `${baseUrl}${relativeUrl}`;
          
          // Add to Instagram-style preloader with high priority
          instagramStyleVideoPreloader.addToPreloadQueue(
            nextEpisode._id, 
            fullVideoUrl, 
            'high'
          );
        }
        
      } catch (error) {
        console.error('Instagram preload error:', error);
      }
    }, 200); // Instagram-level delay
  }, [episodesData]);

  // Instagram-level scroll optimization
  const handleScroll = useCallback((event: any) => {
    if (!isMounted.current) return;

    const { contentOffset, velocity } = event.nativeEvent;
    const currentScrollY = contentOffset.y;
    const currentVelocity = velocity?.y || 0;
    const currentTime = Date.now();

    // Instagram-level velocity calculation
    const timeDelta = currentTime - lastScrollTime.current;
    const velocityMagnitude = Math.abs(currentVelocity);
    
    setScrollVelocity(velocityMagnitude);
    lastScrollTime.current = currentTime;

    // Instagram-level scroll detection
    const isScrollingFast = velocityMagnitude > INSTAGRAM_SCROLL_CONFIG.scrollVelocityThreshold;
    setIsScrollingFast(isScrollingFast);

    // Only update index when scrolling is very slow or stopped
    if (velocityMagnitude < 100) {
      const newIndex = Math.round(currentScrollY / viewHeight);
      if (newIndex !== currentIndex.current && newIndex >= 0 && newIndex < episodesData.length) {
        currentIndex.current = newIndex;
        
        const newEpisode = episodesData[newIndex];
        if (newEpisode) {
          setCurrentEpisode(newEpisode);
          setCurrentVideo(newEpisode._id);
        }
      }
    }

    // Instagram-level debounced scroll end detection
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrollingFast(false);
      setScrollVelocity(0);
    }, INSTAGRAM_SCROLL_CONFIG.scrollDebounceTime);
  }, [episodesData, viewHeight, setCurrentVideo]);

  // Instagram-level momentum scroll handling
  const handleMomentumScrollEnd = useCallback((event: any) => {
    if (!isMounted.current) return;

    const { contentOffset } = event.nativeEvent;
    const currentScrollY = contentOffset.y;
    
    // Snap to the nearest episode
    const newIndex = Math.round(currentScrollY / viewHeight);
    if (newIndex >= 0 && newIndex < episodesData.length) {
      currentIndex.current = newIndex;
      
      const newEpisode = episodesData[newIndex];
      if (newEpisode) {
        setCurrentEpisode(newEpisode);
        setCurrentVideo(newEpisode._id);
      }
      
      // Instagram-level preloader update
      instagramStyleVideoPreloader.setCurrentIndex(newIndex);
      instagramPreload(newIndex);
    }
    
    setIsScrollingFast(false);
    setScrollVelocity(0);
  }, [episodesData, viewHeight, setCurrentVideo, instagramPreload]);

  // Instagram-level viewability handling
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!isMounted.current || viewableItems.length === 0) return;

    const newVisibleIndices = new Set<number>(viewableItems.map((item: any) => item.index));
    setVisibleIndices(newVisibleIndices);

    // Only update active index if not scrolling fast
    if (!isScrollingFast && scrollVelocity < 200) {
      const newActiveIndex = viewableItems[0]?.index;
      if (newActiveIndex !== undefined && newActiveIndex !== currentIndex.current) {
        currentIndex.current = newActiveIndex;
        
        const newEpisode = episodesData[newActiveIndex];
        if (newEpisode) {
          setCurrentEpisode(newEpisode);
          setCurrentVideo(newEpisode._id);
        }

        // Instagram-level preloader update
        instagramStyleVideoPreloader.setCurrentIndex(newActiveIndex);
        instagramStyleVideoPreloader.setVisibleIndices(newVisibleIndices);
        
        // Instagram-level preloading
        instagramPreload(newActiveIndex);
      }
    }
  }, [episodesData, setCurrentVideo, instagramPreload, isScrollingFast, scrollVelocity]);

  // Instagram-level render function
  const renderEpisode = useCallback(({ item, index }: { item: Episode; index: number }) => {
    const isActive = currentIndex.current === index;
    const isLiked = likedEpisodes.has(item._id);

    return (
      <View key={item._id} style={{ width: '100%', height: viewHeight }}>
        {/* Instagram-level Video Player */}
        <InstagramOptimizedVideoPlayer
          episode={item}
          isPlaying={isActive && !isScrollingFast}
          isScrolling={isScrollingFast}
          style={{ width: '100%', height: '100%' }}
        />

        {/* Top Navigation Overlay */}
        <View style={styles.topOverlay}>
          <View style={styles.topLeft}>
                          <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.episodeText}>
                Episode {item.episodeNo || index + 1}
              </Text>
              <TouchableOpacity style={styles.menuButton}>
                <Icon name="menu" size={20} color="#ffffff" />
              </TouchableOpacity>
          </View>
                      <TouchableOpacity style={styles.infoButton}>
              <Icon name="information-circle" size={20} color="#ffffff" />
            </TouchableOpacity>
        </View>

        {/* Right Side Action Buttons */}
        <View style={styles.rightActions}>
                      <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => handleLike(item._id)}
            >
              <View style={[styles.actionIconContainer, isLiked && styles.likedIconContainer]}>
                <Icon 
                  name={isLiked ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isLiked ? "#ff1493" : "#ffffff"} 
                />
              </View>
              <Text style={styles.actionLabel}>Like</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Icon name="bookmark-outline" size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Icon name="volume-high" size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>Audio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Icon name="settings-outline" size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>Video</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => handleShare(item)}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="share-outline" size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionLabel}>Share</Text>
            </TouchableOpacity>
        </View>

        {/* Bottom Content Section */}
        <View style={styles.bottomContent}>
          <Text style={styles.contentTitle}>
            Episode {item.episodeNo || index + 1}
          </Text>
          <Text style={styles.contentDescription} numberOfLines={3}>
            Watch this amazing episode!
          </Text>
        </View>
      </View>
    );
  }, [viewHeight, likedEpisodes, isScrollingFast, handleLike, handleShare, navigation]);

  const keyExtractor = useCallback((item: Episode) => item._id, []);

  // Instagram-level viewability config
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 70, // Higher threshold for stability
    minimumViewTime: 300, // Longer minimum time
  }), []);

  // Instagram-level item layout
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: viewHeight,
    offset: viewHeight * index,
    index,
  }), [viewHeight]);

  // Instagram-level performance monitoring
  useEffect(() => {
    startMonitoring();
    
    // Monitor preloader performance
    if (__DEV__) {
      const interval = setInterval(() => {
        const preloaderStats = instagramStyleVideoPreloader.getStats();
        console.log('📊 Instagram Preloader Stats:', preloaderStats);
      }, 10000);
      
      return () => {
        clearInterval(interval);
        endMonitoring();
      };
    }
    
    return () => {
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

  // Instagram-level initial setup
  useEffect(() => {
    console.log('🔄 InstagramEpisodePlayer - Initial Setup Effect:', {
      episodesDataLength: episodesData?.length || 0,
      initialIndex,
      hasEpisodesData: !!episodesData
    });

    if (episodesData && episodesData.length > 0) {
      console.log('✅ InstagramEpisodePlayer - Setting up episodes:', {
        totalEpisodes: episodesData.length,
        initialIndex,
        initialEpisodeId: episodesData[initialIndex]?._id
      });
      
      // Ensure initial episode is properly set up
      currentIndex.current = initialIndex;
      setVisibleIndices(new Set([initialIndex]));
      
      const initialEpisode = episodesData[initialIndex];
      if (initialEpisode) {
        console.log('🎬 InstagramEpisodePlayer - Setting initial episode:', {
          episodeId: initialEpisode._id,
          episodeNo: initialEpisode.episodeNo
        });
        setCurrentEpisode(initialEpisode);
        setCurrentVideo(initialEpisode._id);
      }
      
      instagramPreload(initialIndex);
    } else {
      console.log('⚠️ InstagramEpisodePlayer - No episodes data available');
    }
  }, [episodesData, initialIndex, instagramPreload, setCurrentVideo]);

  // Focus management
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (currentEpisode) {
          setVideoPlaying(currentEpisode._id, false);
        }
      };
    }, [currentEpisode, setVideoPlaying])
  );

  // Instagram-level cache cleanup
  useEffect(() => {
    const cleanupCache = async () => {
      try {
        await instagramVideoCache.clearCache();
      } catch (error) {
        console.error('Cache cleanup error:', error);
      }
    };

    cacheCleanupTimeoutRef.current = setTimeout(cleanupCache, 30000);

    return () => {
      if (cacheCleanupTimeoutRef.current) {
        clearTimeout(cacheCleanupTimeoutRef.current);
      }
    };
  }, []);

  // Instagram-level cleanup on unmount
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

  // Loading state
  if (contentLoading) {
    console.log('⏳ InstagramEpisodePlayer - Showing loading state');
    return (
      <View style={styles.container}>
        <ActivityLoader />
      </View>
    );
  }

  // Error state
  if (contentError) {
    console.log('❌ InstagramEpisodePlayer - Showing error state:', {
      error: contentError.message,
      contentId
    });
    return (
      <View style={styles.container}>
        <EmptyMessage
          title="Error loading episodes"
          subtitle={contentError.message || "Please try again"}
          onRetry={refetchContent}
        />
      </View>
    );
  }

  // Empty state
  if (!episodesData || episodesData.length === 0) {
    console.log('📭 InstagramEpisodePlayer - Showing empty state:', {
      contentId,
      hasEpisodesData: !!episodesData,
      episodesLength: episodesData?.length || 0
    });
    return (
      <View style={styles.container}>
        <EmptyMessage
          title="No episodes available"
          subtitle="This content doesn't have any episodes yet"
          onRetry={refetchContent}
        />
      </View>
    );
  }

  console.log('🎬 InstagramEpisodePlayer - Rendering FlatList with episodes:', {
    episodesCount: episodesData.length,
    currentIndex: currentIndex.current,
    isScrollingFast,
    scrollVelocity
  });

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
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={2} // Reduced for Instagram-level performance
        windowSize={3} // Reduced window size
        initialNumToRender={1}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetchContent}
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
  // Top Navigation Overlay
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  episodeText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  menuIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
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
  // Bottom Content Section
  bottomContent: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 80,
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
});

export default InstagramOptimizedEpisodePlayer; 