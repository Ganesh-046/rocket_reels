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
import { useIsFocused } from '@react-navigation/native';
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
import VideoPlayer from '../../../components/VideoPlayer/EnhancedVideoPlayer';

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

// Utility function to process image URLs
const processImageUrls = (item: any) => {
  const processedItem = { ...item };
  
  // Process image fields with CDN prefix
  if (item.image && typeof item.image === 'string' && item.image.trim() !== '' && !item.image.startsWith('http')) {
    processedItem.image = `https://d1cuox40kar1pw.cloudfront.net/${item.image}`;
  }
  
  if (item.imageUri && typeof item.imageUri === 'string' && item.imageUri.trim() !== '' && !item.imageUri.startsWith('http')) {
    processedItem.imageUri = `https://d1cuox40kar1pw.cloudfront.net/${item.imageUri}`;
  }
  
  if (item.posterImage && typeof item.posterImage === 'string' && item.posterImage.trim() !== '' && !item.posterImage.startsWith('http')) {
    processedItem.posterImage = `https://d1cuox40kar1pw.cloudfront.net/${item.posterImage}`;
  }
  
  if (item.backdropImage && typeof item.backdropImage === 'string' && item.backdropImage.trim() !== '' && !item.backdropImage.startsWith('http')) {
    processedItem.backdropImage = `https://d1cuox40kar1pw.cloudfront.net/${item.backdropImage}`;
  }
  
  // Process video URL if needed
  if (item.videoUrl && typeof item.videoUrl === 'string' && item.videoUrl.trim() !== '' && !item.videoUrl.startsWith('http')) {
    processedItem.videoUrl = `https://d1cuox40kar1pw.cloudfront.net/${item.videoUrl}`;
  }
  
  return processedItem;
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

  // Refs
  const flatListRef = useRef<FlatList<any>>(null);
  const controllerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);

  // Debug flag - set to false to use real API data
  const USE_DUMMY_DATA = false;

  // State management
  const [state, setState] = useState({
    playPause: true,
    currentIndex: 0,
    controller: true,
    duration: 0,
    progress: 0,
    loading: false,
    isScrolling: false,
    scrollVelocity: 0,
  });

  // Calculate screen dimensions
  const screenDimensions = useMemo(() => {
    // Use full available height for both platforms
    const availableHeight = screenHeight - insets.top - tabBarHeight - insets.bottom;
    return {
      platformHeight: availableHeight,
      marginBottom: tabBarHeight + insets.bottom,
      insets
    };
  }, [screenWidth, screenHeight, insets, tabBarHeight]);

  // API Queries - Fixed to use correct parameters
  const {
    data: trailerData,
    isLoading: trailerLoading,
    error: trailerError,
    refetch: refetchTrailers,
  } = useTrailerList({ adult: true, page: 1 });

  // Process trailer data based on actual API response structure
  const processedTrailerData = useMemo(() => {

    // Check if we should use dummy data (for debugging only)
    if (USE_DUMMY_DATA) {
      return [
        {
          id: 'dummy-1',
          title: 'Test Trailer 1',
          description: 'This is a test trailer for debugging',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: 'https://picsum.photos/400/600?random=1',
          likes: 100,
          comments: 50,
          shares: 25,
          author: 'Test Studio',
          duration: 15,
          views: '1K',
        }
      ];
    }

    // Based on cURL response, trailer API returns: data.trailers array
    const trailerItems = trailerData?.data?.trailers;
    
    if (!trailerItems || !Array.isArray(trailerItems) || trailerItems.length === 0) {
      return [];
    }

    const processed = trailerItems
      .map((item: any, index: number) => {
      const processedItem = processImageUrls(item);
      
      // Extract video URL from the complex trailerUrl structure
      let videoUrl = '';
      if (item.trailerUrl?.media?.video_urls?.master) {
        videoUrl = `https://k9456pbd.rocketreel.co.in/${item.trailerUrl.media.video_urls.master}`;
      } else if (item.trailerUrl?.media?.video_urls?.['720p']) {
        videoUrl = `https://k9456pbd.rocketreel.co.in/${item.trailerUrl.media.video_urls['720p']}`;
      } else if (item.trailerUrl?.video) {
        videoUrl = `https://k9456pbd.rocketreel.co.in/${item.trailerUrl.video}`;
      }

      // Extract thumbnail from the complex structure
      let thumbnail = '';
      if (item.trailerUrl?.media?.thumbnail) {
        thumbnail = `https://k9456pbd.rocketreel.co.in/${item.trailerUrl.media.thumbnail}`;
      } else if (item.backdropImage) {
        thumbnail = `https://k9456pbd.rocketreel.co.in/${item.backdropImage}`;
      }

      // Only include items with valid video URLs
      if (!videoUrl) {
        return null;
      }

      return {
        ...processedItem,
        id: item._id || `trailer-${index}`,
        stableIndex: index,
        // Map API fields to our expected structure
        title: item.title || 'Untitled',
        description: item.description || '',
        videoUrl: videoUrl,
        thumbnail: thumbnail || 'https://picsum.photos/400/600',
        likes: item.favourites || 0,
        comments: 0, // API doesn't provide comments
        shares: 0, // API doesn't provide shares
        author: item.targetAudience?.name || 'Unknown',
        duration: 15, // Default duration for trailers
        views: '1K', // Default views
        // Additional API fields
        genres: item.genres || [],
        releasingDate: item.releasingDate,
        targetAudience: item.targetAudience,
        trailerUrl: item.trailerUrl,
      };
    })
    .filter(Boolean); // Remove null items



    return processed;
  }, [trailerData, trailerLoading, trailerError]);

  // Initialize data
  useEffect(() => {
    if (!hasInitialized.current && isFocused) {
      InteractionManager.runAfterInteractions(async () => {
        try {
          // Load trailer data
          await refetchTrailers();
          
          hasInitialized.current = true;
        } catch (error) {
          // Handle initialization error silently
        }
      });
    }
  }, [isFocused, refetchTrailers]);

  // Video navigation
  const onEnd = useCallback(() => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < processedTrailerData.length) {
      setState(prev => ({ ...prev, playPause: false, currentIndex: nextIndex }));

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setState(prev => ({ ...prev, playPause: true }));
      });
    }
  }, [state.currentIndex, processedTrailerData.length]);

  // Viewable items changed - optimized for smooth scrolling
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== state.currentIndex) {
        // Immediate pause for smooth transition
        setState(prev => ({
          ...prev,
          playPause: false,
          isScrolling: false,
        }));
        
        // Quick transition to new video
        requestAnimationFrame(() => {
          setState(prev => ({
            ...prev,
            currentIndex: index,
            playPause: true,
          }));
        });
      }
    }
  }, [state.currentIndex]);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 150,
    waitForInteraction: false,
  }), []);

  // Scroll handling - optimized for performance
  const handleScroll = useCallback((event: any) => {
    const { velocity } = event.nativeEvent;
    const currentVelocity = velocity?.y || 0;
    
    // Only update if not already scrolling or if velocity changed significantly
    setState(prev => {
      if (!prev.isScrolling || Math.abs(currentVelocity - prev.scrollVelocity) > 50) {
        return {
          ...prev,
          controller: true,
          isScrolling: true,
          playPause: false,
          scrollVelocity: currentVelocity
        };
      }
      return prev;
    });

    // Clear existing timeout
    if (controllerTimeoutRef.current) {
      clearTimeout(controllerTimeoutRef.current);
    }

    // Set timeout for scroll end detection - shorter for fast scrolling
    const timeout = Math.abs(currentVelocity) > 200 ? 150 : 300;
    controllerTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        controller: false,
        isScrolling: false,
        playPause: true,
        scrollVelocity: 0
      }));
    }, timeout);
  }, []);

  // Refresh
  const onRefresh = useCallback(async () => {
    try {
      await refetchTrailers();
    } catch (error) {
      // Handle refresh error silently
    }
  }, [refetchTrailers]);

  // User interactions (placeholder for future implementation)
  const handleLike = useCallback(async (trailerId: string) => {
    // Like functionality will be implemented
  }, []);

  const handleShare = useCallback(async (item: any) => {
    // Share functionality will be implemented
  }, []);

  const handleWatchNow = useCallback((item: any) => {
    // Extract trailer data for episodes navigation
    const trailerId = item._id;
    const contentId = item.contentId || item._id; // Use contentId if available, fallback to _id
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
    try {
      const isCurrentVideo = state.currentIndex === index;
      const shouldPlay = isFocused && state.playPause && isCurrentVideo && !state.isScrolling;
      
      return (
        <VideoPlayer
          key={`video-${item.id}-${index}`}
          item={item}
          index={index}
          isVisible={shouldPlay}
          viewHeight={screenDimensions.platformHeight}
          isScrolling={state.isScrolling}
          onEnd={onEnd}
          onShare={() => handleShare(item)}
          onLike={() => handleLike(item._id)}
          onWatchNow={handleWatchNow}
        />
      );
    } catch (error) {
      // Fallback simple view
      return (
        <View 
          key={`fallback-${item.id}-${index}`}
          style={{
            height: screenDimensions.platformHeight,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>{item.title}</Text>
          <Text style={{ color: '#ccc', fontSize: 14, marginTop: 10 }}>Video Player Error</Text>
        </View>
      );
    }
  }, [state.currentIndex, state.playPause, state.isScrolling, isFocused, onEnd, screenDimensions.platformHeight, handleShare, handleLike, handleWatchNow]);

  const keyExtractor = useCallback((item: any, index: number) =>
    item?.id?.toString() || `video-${index}`, []);

  const onScrollToIndexFailed = useCallback((info: any) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true
      });
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controllerTimeoutRef.current) {
        clearTimeout(controllerTimeoutRef.current);
      }
    };
  }, []);



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
      <View style={[style.container, { marginBottom: screenDimensions.marginBottom }]}>
        <FlatList
          ref={flatListRef}
          data={processedTrailerData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          scrollEventThrottle={16}
          initialScrollIndex={state.currentIndex}
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
              refreshing={trailerLoading}
              tintColor={safeColors.PRIMARYBG}
              colors={[safeColors.PRIMARYBG]}
            />
          }
          onScroll={handleScroll}
          onScrollBeginDrag={() => {
            setState(prev => ({ 
              ...prev, 
              isScrolling: true, 
              playPause: false,
              controller: true 
            }));
          }}
          onScrollEndDrag={() => {
            // Quick response when user stops dragging
            setState(prev => ({ 
              ...prev, 
              isScrolling: false, 
              playPause: true,
              controller: false,
              scrollVelocity: 0
            }));
          }}
          onMomentumScrollEnd={() => {
            // Handle momentum scrolling end
            setState(prev => ({ 
              ...prev, 
              isScrolling: false, 
              playPause: true,
              controller: false,
              scrollVelocity: 0
            }));
          }}
          onScrollToIndexFailed={onScrollToIndexFailed}
          ListEmptyComponent={ListEmptyComponent}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
          snapToInterval={screenDimensions.platformHeight}
          snapToAlignment="start"
        />
      </View>
    </View>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme?.colors?.PRIMARYBLACK || '#000000',
  },
});

export default DiscoverScreen;
