import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  View,
  InteractionManager,
  Text,
} from 'react-native';
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';

// Hooks and Services
import { useTrailerList } from '../../../hooks/useContent';
import useTheme from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';

// Components
import ActivityLoader from '../../../components/common/ActivityLoader';
import EmptyMessage from '../../../components/common/EmptyMessage';
import TrailerVideoPlayer from '../../../components/VideoPlayer/TrailerVideoPlayer';

// Constants
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Utility function to safely get colors with fallbacks
const getSafeColors = (colors: any) => {
  return {
    PRIMARYLIGHTBLACKONE: colors?.PRIMARYLIGHTBLACKONE || '#1a1a1a',
    PRIMARYLIGHTBLACK: colors?.PRIMARYLIGHTBLACK || '#2d2d2d',
    PRIMARYBG: colors?.PRIMARYBG || '#ffffff',
    PRIMARYBLACK: colors?.PRIMARYBLACK || '#000000',
    PRIMARYWHITE: colors?.PRIMARYWHITE || '#ffffff',
  };
};

// Utility function to create safe gradient colors array
const createSafeGradientColors = (colors: any) => {
  const safeColors = getSafeColors(colors);
  return [
    safeColors.PRIMARYLIGHTBLACKONE,
    safeColors.PRIMARYLIGHTBLACK
  ].filter(color => color && typeof color === 'string');
};

interface DiscoverScreenProps {
  navigation: any;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ navigation }) => {
  // Theme and styling
  const { theme: { colors } } = useTheme();
  const safeColors = useMemo(() => getSafeColors(colors), [colors]);
  const gradientColors = useMemo(() => createSafeGradientColors(colors), [colors]);
  const style = useThemedStyles(styles);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // Refs - matching ForYouScreen.js pattern
  const flatListRef = useRef<FlatList<any>>(null);
  const controllerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingMore = useRef(false);
  const hasInitialized = useRef(false);
  const isScrolling = useRef(false);
  const apiCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastApiCallRef = useRef<Record<string, number>>({});
  const apiCallCountRef = useRef(0);

  // State management - matching ForYouScreen.js pattern
  const [state, setState] = useState({
    playPause: true,
    currentIndex: 0,
    controller: true,
    duration: 0,
    progress: 0,
    loading: false,
  });

  // Local refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate screen dimensions - Full screen height for trailer videos
  const screenDimensions = useMemo(() => {
    const screenHeight = Dimensions.get('screen').height;
    const statusBarHeight = StatusBar.currentHeight || 0;
    
    // Use full screen height minus status bar for videos
    const fullScreenHeight = screenHeight - statusBarHeight;
    
    return {
      platformHeight: fullScreenHeight,
      marginBottom: 0, // No margin bottom for full screen
      insets
    };
  }, [screenHeight, insets]);

  // Create a stable setState function with better state management
  const updateState = useCallback((updater: any) => {
    console.log('🎯 DiscoverScreen updateState called:', updater);
    setState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      console.log('🎯 DiscoverScreen state update:', { prevState, newState });
      return { ...prevState, ...newState };
    });
  }, []);

  // API Queries
  const {
    data: trailerData,
    isLoading: trailerLoading,
    error: trailerError,
    refetch: refetchTrailers,
  } = useTrailerList({ adult: true, page: 1 });

  // Process trailer data - convert to episode format for SimpleInstagramVideoPlayer
  const processedTrailerData = useMemo(() => {
    const trailerItems = trailerData?.data?.trailers;
    
    if (!trailerItems || !Array.isArray(trailerItems) || trailerItems.length === 0) {
      return [];
    }

    const processed = trailerItems
      .map((item: any, index: number) => {
        // Extract video URL from the complex trailerUrl structure - Prioritize HD
        let videoUrl = '';
        let videoUrls: any = {};
        
        // Get all available video URLs
        if (item.trailerUrl?.media?.video_urls) {
          videoUrls = item.trailerUrl.media.video_urls;
        }
        
        // Prioritize HD qualities in order: 1080p > 720p > master > 480p > 360p
        if (videoUrls['1080p']) {
          videoUrl = videoUrls['1080p'];
        } else if (videoUrls['720p']) {
          videoUrl = videoUrls['720p'];
        } else if (videoUrls.master) {
          videoUrl = videoUrls.master;
        } else if (videoUrls['480p']) {
          videoUrl = videoUrls['480p'];
        } else if (videoUrls['360p']) {
          videoUrl = videoUrls['360p'];
        } else if (item.trailerUrl?.video) {
          videoUrl = item.trailerUrl.video;
        }

        // Extract thumbnail
        let thumbnail = '';
        if (item.trailerUrl?.media?.thumbnail) {
          thumbnail = item.trailerUrl.media.thumbnail;
        } else if (item.backdropImage) {
          thumbnail = item.backdropImage;
        }

        // Only include items with valid video URLs
        if (!videoUrl) {
          return null;
        }
        
        // Log HD trailer detection
        const isHD = videoUrl.includes('1080p') || videoUrl.includes('720p');
        if (isHD) {
          console.log('🎬 HD Trailer detected:', {
            title: item.title,
            quality: videoUrl.includes('1080p') ? '1080p' : '720p',
            url: videoUrl
          });
        }

        // Convert to episode format for SimpleInstagramVideoPlayer
        return {
          _id: item._id || `trailer-${index}`,
          title: item.title || 'Untitled',
          description: item.description || '',
          video_urls: {
            master: videoUrl,
            '1080p': videoUrls['1080p'] || videoUrl,
            '720p': videoUrls['720p'] || videoUrl,
            '480p': videoUrls['480p'] || videoUrl,
            '360p': videoUrls['360p'] || videoUrl,
          },
          video_url: videoUrl,
          thumbnail: thumbnail,
          backdropImage: item.backdropImage,
          // Additional fields for UI
          likes: item.favourites || 0,
          author: item.targetAudience?.name || 'Unknown',
          duration: 15,
          views: '1K',
          genres: item.genres || [],
          releasingDate: item.releasingDate,
          targetAudience: item.targetAudience,
          trailerUrl: item.trailerUrl,
        };
      })
      .filter(Boolean);

    return processed;
  }, [trailerData, trailerLoading, trailerError]);

  // Initialize data - matching ForYouScreen.js pattern
  useEffect(() => {
    const initializeApp = async () => {
      if (!hasInitialized.current && isFocused) {
        hasInitialized.current = true;
        
        try {
          // Reset API call tracking on initialization
          apiCallCountRef.current = 0;
          lastApiCallRef.current = {};
          
          // Load trailer data first with delay to prevent rapid calls
          await new Promise(resolve => setTimeout(resolve, 500));
          await refetchTrailers();
          
          // Direct state update
          updateState({
            currentIndex: 0,
            playPause: true,
            controller: true
          });
          
        } catch (error) {
          console.log('Initialization error:', error);
        }
      }
    };

    initializeApp();
    
    // Cleanup function
    return () => {
      // Clear any pending timeouts
      if (controllerTimeoutRef.current) {
        clearTimeout(controllerTimeoutRef.current);
        controllerTimeoutRef.current = null;
      }
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
        apiCallTimeoutRef.current = null;
      }
      
      // Reset refs
      hasInitialized.current = false;
      isLoadingMore.current = false;
      isScrolling.current = false;
      apiCallCountRef.current = 0;
      
      // Clear flatList ref
      if (flatListRef.current) {
        flatListRef.current = null;
      }
      
      // Reset refresh state
      setIsRefreshing(false);
    };
  }, [isFocused, refetchTrailers, updateState]);

  // Add proper screen focus management to pause videos when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused - resume video if needed
      if (isFocused && state.playPause) {
        updateState({ playPause: true });
      }

      return () => {
        // Screen loses focus - pause all videos
        updateState({ playPause: false });
        
        // Clear any pending timeouts
        if (controllerTimeoutRef.current) {
          clearTimeout(controllerTimeoutRef.current);
          controllerTimeoutRef.current = null;
        }
        if (apiCallTimeoutRef.current) {
          clearTimeout(apiCallTimeoutRef.current);
          apiCallTimeoutRef.current = null;
        }
        
        // Reset scrolling state
        isScrolling.current = false;
        
        console.log('DiscoverScreen: Videos paused on screen blur');
      };
    }, [isFocused, state.playPause, updateState])
  );

  // Video navigation - matching ForYouScreen.js pattern
  const onEnd = useCallback(() => {
    // Don't auto-advance if user is actively scrolling
    if (isScrolling.current) return;

    const nextIndex = state.currentIndex + 1;
    
    if (nextIndex < processedTrailerData.length) {
      updateState({
        currentIndex: nextIndex,
        playPause: true,
        controller: true
      });
      
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: nextIndex,
          animated: true
        });
      }
    } else {
      // Loop back to first video
      updateState({
        currentIndex: 0,
        playPause: true,
        controller: true
      });
      
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: 0,
          animated: true
        });
      }
    }
  }, [state.currentIndex, processedTrailerData.length, updateState]);

  // Viewable items changed - matching ForYouScreen.js pattern
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      
      if (index !== state.currentIndex) {
        updateState({
          currentIndex: index,
          playPause: !isScrolling.current, // Only play if not scrolling
          controller: true
        });
      }
    }
  }, [state.currentIndex, updateState]);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 70,
    minimumViewTime: 200,
    waitForInteraction: false,
  }), []);

  // Scroll handling - matching ForYouScreen.js pattern
  const handleScroll = useCallback((event: any) => {
    updateState({ controller: true });

    if (controllerTimeoutRef.current) {
      clearTimeout(controllerTimeoutRef.current);
    }

    controllerTimeoutRef.current = setTimeout(() => {
      if (!isScrolling.current) { // Only hide controller if not scrolling
        updateState({ controller: false });
      }
    }, 3000);
  }, [updateState]);

  const onScrollBeginDrag = useCallback(() => {
    isScrolling.current = true;
    updateState({ playPause: false });
  }, [updateState]);

  const onScrollEndDrag = useCallback(() => {
    // Add a small delay to ensure scroll has fully stopped
    setTimeout(() => {
      isScrolling.current = false;
      updateState({ playPause: true });
    }, 200);
  }, [updateState]);

  // Refresh
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchTrailers();
      
      if (processedTrailerData.length > 0) {
        updateState({
          currentIndex: 0,
          playPause: true,
          controller: true
        });
      }
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchTrailers, processedTrailerData.length, updateState]);

  // User interactions
  const handleLike = useCallback(async (trailerId: string) => {
    // Like functionality will be implemented
    console.log('Like clicked for trailer:', trailerId);
  }, []);

  const handleShare = useCallback(async (item: any) => {
    // Share functionality will be implemented
    console.log('Share clicked for item:', item.title);
  }, []);

  const handleWatchNow = useCallback((item: any) => {
    // Extract trailer data for episodes navigation
    const trailerId = item._id;
    const contentId = item.contentId || item._id;
    const trailerTitle = item.title;
    const trailerDescription = item.description;
    
    console.log('Watch Now clicked:', {
      trailerId,
      contentId,
      trailerTitle,
      trailerDescription
    });
    
    // Navigate to EpisodePlayerScreen with trailer data
    navigation.navigate('EpisodePlayer', {
      contentId: contentId,
      contentName: trailerTitle,
      episodes: [], // Will be loaded by EpisodePlayerScreen
      initialIndex: 0,
      trailerData: {
        id: trailerId,
        title: trailerTitle,
        description: trailerDescription,
        contentId: contentId
      }
    });
  }, [navigation]);

  // Layout and rendering
  const getItemLayout = useMemo(() => (data: any, index: number) => ({
    length: screenDimensions.platformHeight,
    offset: screenDimensions.platformHeight * index,
    index,
  }), [screenDimensions.platformHeight]);

    const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const shouldPlay = isFocused && state.playPause && state.currentIndex === index && !isScrolling.current;
    
    // Debug logging
    if (index === state.currentIndex) {
      console.log('🎯 DiscoverScreen renderItem:', {
        index,
        itemTitle: item?.title,
        isFocused,
        statePlayPause: state.playPause,
        currentIndex: state.currentIndex,
        isScrolling: isScrolling.current,
        shouldPlay
      });
    }
    
    return (
      <View style={{ height: screenDimensions.platformHeight, width: '100%' }}>
        <TrailerVideoPlayer
          episode={item}
          isPlaying={shouldPlay}
          style={{ flex: 1 }}
          isScrolling={isScrolling.current}
          onPauseStateChange={(isPaused: boolean) => {
            // Handle pause state change if needed
            console.log('Video pause state changed:', isPaused, 'for episode:', item.title);
          }}
          externalPauseTrigger={0}
          externalSeekTime={0}
          onProgress={(currentTime: number, duration: number) => {
            // Handle progress updates if needed
          }}
          onWatchNow={handleWatchNow}
          onLike={handleLike}
          onShare={handleShare}
        />
      </View>
    );
  }, [
    isFocused, 
    state,
    screenDimensions.platformHeight,
    handleWatchNow,
    handleLike,
    handleShare,
  ]);

  const keyExtractor = useCallback((item: any, index: number) =>
    item?._id?.toString() || `video-${index}`, []);

  const onScrollToIndexFailed = useCallback((info: any) => {
    const wait = new Promise(resolve => setTimeout(resolve, 200));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: info.index,
          animated: true
        });
      }
    });
  }, []);

  // Reset refresh state when screen loses focus
  useEffect(() => {
    if (!isFocused) {
      setIsRefreshing(false);
    }
  }, [isFocused]);

  // Loading state
  if (trailerLoading && !processedTrailerData.length) {
    return (
      <View style={style.container}>
        <LinearGradient
          style={{ flex: 0, height: screenDimensions.insets.top }}
          colors={gradientColors}
        />
        <ActivityLoader />
      </View>
    );
  }

  // Empty state
  const ListEmptyComponent = () => {
    if (trailerError) {
      return (
        <EmptyMessage
          title={'Error loading trailers'}
          subtitle={trailerError.message || 'Please try again'}
          mainContainer={{ height: screenHeight / 1.1 }}
          onRetry={onRefresh}
        />
      );
    }

    return (
      <EmptyMessage
        title={'No trailers available'}
        subtitle={'Pull to refresh or try again later'}
        mainContainer={{ height: screenHeight / 1.1 }}
        onRetry={onRefresh}
      />
    );
  };

  return (
    <View style={style.container}>
      <LinearGradient
        style={{ flex: 0, height: screenDimensions.insets.top }}
        colors={gradientColors}
      />
      <View style={[style.container, { height: screenDimensions.platformHeight }]}>
        <FlatList
          ref={flatListRef}
          data={processedTrailerData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="normal"
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          maxToRenderPerBatch={1}
          windowSize={2}
          removeClippedSubviews={true}
          initialNumToRender={1}
          updateCellsBatchingPeriod={100}
          disableVirtualization={false}
          legacyImplementation={false}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={isRefreshing || trailerLoading}
              tintColor={safeColors.PRIMARYBG}
              colors={[safeColors.PRIMARYBG]}
            />
          }
          onScroll={handleScroll}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          onScrollToIndexFailed={onScrollToIndexFailed}
          ListEmptyComponent={ListEmptyComponent}
          scrollIndicatorInsets={{ right: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={true}
          bouncesZoom={false}
          alwaysBounceVertical={false}
          directionalLockEnabled={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme?.colors?.PRIMARYBLACK || '#000000',
    width: '100%',
  },
});

export default DiscoverScreen;
