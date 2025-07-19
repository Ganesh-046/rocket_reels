import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  InteractionManager,
  Share,
  Text,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { enhancedVideoCache } from '../../../utils/enhancedVideoCache';
import { advancedVideoOptimizer } from '../../../utils/advancedVideoOptimizer';
import { hardwareAcceleratedScroll } from '../../../utils/hardwareAcceleratedScroll';
import { useVideoStore, useCurrentVideo } from '../../../store/videoStore';
import EnhancedVideoPlayer from '../../../components/VideoPlayer/EnhancedVideoPlayer';
import WatchNowButton from '../../../components/common/WatchNowButton';
import { dummyEpisodeReelsData, dummySeriesData } from '../../../utils/dummyData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced static video data with more realistic content and series information
const SHORTS_DATA = [
  {
    id: 'series-1',
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student to secure his family\'s financial future as a terminal lung cancer diagnosis pushes him to a life of crime.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=1',
    likes: 12450,
    comments: 890,
    shares: 234,
    author: 'AMC',
    duration: 15,
    views: '2.1M',
    genre: 'Drama',
    episodeCount: 62,
    year: 2008
  },
  {
    id: 'series-2',
    title: 'Game of Thrones',
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=2',
    likes: 8920,
    comments: 456,
    shares: 123,
    author: 'HBO',
    duration: 12,
    views: '1.8M',
    genre: 'Fantasy',
    episodeCount: 73,
    year: 2011
  },
  {
    id: 'series-3',
    title: 'Stranger Things',
    description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=3',
    likes: 15670,
    comments: 1200,
    shares: 567,
    author: 'Netflix',
    duration: 18,
    views: '3.2M',
    genre: 'Sci-Fi',
    episodeCount: 34,
    year: 2016
  },
  {
    id: 'series-4',
    title: 'The Crown',
    description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the twentieth century.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=4',
    likes: 9870,
    comments: 678,
    shares: 345,
    author: 'Netflix',
    duration: 14,
    views: '1.5M',
    genre: 'Drama',
    episodeCount: 60,
    year: 2016
  },
  {
    id: 'series-5',
    title: 'Money Heist',
    description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=5',
    likes: 11230,
    comments: 789,
    shares: 234,
    author: 'Netflix',
    duration: 16,
    views: '2.8M',
    genre: 'Action',
    episodeCount: 41,
    year: 2017
  },
  {
    id: 'series-6',
    title: 'The Witcher',
    description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=6',
    likes: 8760,
    comments: 543,
    shares: 198,
    author: 'Netflix',
    duration: 13,
    views: '1.9M',
    genre: 'Fantasy',
    episodeCount: 24,
    year: 2019
  },
  {
    id: 'series-7',
    title: 'The Mandalorian',
    description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=7',
    likes: 13450,
    comments: 987,
    shares: 345,
    author: 'Disney+',
    duration: 17,
    views: '2.5M',
    genre: 'Sci-Fi',
    episodeCount: 24,
    year: 2019
  },
  {
    id: 'series-8',
    title: 'The Boys',
    description: 'A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMobsters.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=8',
    likes: 18920,
    comments: 1456,
    shares: 789,
    author: 'Amazon Prime',
    duration: 19,
    views: '4.1M',
    genre: 'Action',
    episodeCount: 32,
    year: 2019
  }
];

interface UltraShortsScreenProps {
  navigation: any;
}

const UltraShortsScreen: React.FC<UltraShortsScreenProps> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  
  const flatListRef = useRef<FlatList<any>>(null);
  const controllerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingMore = useRef(false);

  const { 
    setCurrentVideo, 
    setControllerVisible, 
    addPreloadedVideo,
    removePreloadedVideo 
  } = useVideoStore();

  const [shortsData, setShortsData] = useState(SHORTS_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Calculate proper video height for full-screen display
  const videoHeight = useMemo(() => {
    // Use the full screen height for immersive video experience
    // This ensures videos take the complete screen space
    const fullScreenHeight = screenHeight;
    
    console.log('📏 Video height calculation:', {
      screenHeight: fullScreenHeight,
      tabBarHeight,
      insetsTop: insets.top,
      insetsBottom: insets.bottom
    });
    
    return fullScreenHeight;
  }, []);

  // React Query for data fetching (simulated)
  const { data: shortsQueryData, isLoading } = useQuery({
    queryKey: ['shorts'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return SHORTS_DATA;
    },
  });

  // Preload next videos for smooth playback
  const preloadNextVideos = useCallback((currentIndex: number) => {
    const nextVideos = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = currentIndex + i;
      const nextVideo = shortsData[nextIndex];
      if (nextVideo) {
        nextVideos.push({ id: nextVideo.id, url: nextVideo.videoUrl });
      }
    }
    
    if (nextVideos.length > 0) {
      enhancedVideoCache.preloadVideos(nextVideos);
      nextVideos.forEach(video => addPreloadedVideo(video.id));
    }
  }, [shortsData, addPreloadedVideo]);

  // Preload initial videos when screen focuses
  useEffect(() => {
    if (isFocused && !isLoading) {
      InteractionManager.runAfterInteractions(() => {
        const initialVideos = shortsData.slice(0, 3).map(video => ({
          id: video.id,
          url: video.videoUrl
        }));
        
        enhancedVideoCache.preloadVideos(initialVideos);
        initialVideos.forEach(video => addPreloadedVideo(video.id));
      });
    }
  }, [isFocused, isLoading, shortsData, addPreloadedVideo]);

  const onEnd = useCallback(() => {
    // Don't auto-scroll - let user control scrolling manually
    // Just update the current video state
    const nextIndex = currentIndex + 1;
    if (nextIndex < shortsData.length) {
      setCurrentIndex(nextIndex);
      setCurrentVideo(shortsData[nextIndex].id);
    }
  }, [currentIndex, shortsData, setCurrentVideo]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== currentIndex) {
        setCurrentIndex(index);
        setCurrentVideo(shortsData[index].id);
        preloadNextVideos(index);
      }
    }
  }, [currentIndex, shortsData, setCurrentVideo, preloadNextVideos]);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 300,
    waitForInteraction: false,
  }), []);

  const handleScroll = useCallback(() => {
    setControllerVisible(true);

    if (controllerTimeoutRef.current) {
      clearTimeout(controllerTimeoutRef.current);
    }

    controllerTimeoutRef.current = setTimeout(() => {
      setControllerVisible(false);
    }, 3000);
  }, [setControllerVisible]);

  const onShare = async (item: any) => {
    try {
      const message = `Check out this amazing series: ${item.title} on Rocket Reels!`;
      await Share.share({
        title: item.title,
        message,
        url: 'https://rocketreels.app',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLike = (itemId: string) => {
    setShortsData(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, likes: item.likes + 1 }
          : item
      )
    );
  };

  const handleWatchNow = (item: any) => {
    // Use dummy episode reels data for the series
    const episodeData = dummyEpisodeReelsData(item.id, item.title).slice(0, 20);
    
    navigation.navigate('EpisodePlayer', {
      contentId: item.id,
      contentName: item.title,
      episodes: episodeData,
      initialIndex: 0,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch data
      await queryClient.invalidateQueries({ queryKey: ['shorts'] });
      setCurrentIndex(0);
      setCurrentVideo(shortsData[0].id);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onScrollToIndexFailed = (info: any) => {
    // Don't auto-scroll on failure - let user control scrolling
    console.log('Scroll to index failed:', info.index);
  };

  const ListEmptyComponent = () => (
    <View style={[styles.videoContainer, { height: videoHeight, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text style={styles.emptyText}>Loading shorts...</Text>
    </View>
  );

  const renderVideoItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const isVisible = currentIndex === index;
    
    console.log('🎬 Rendering video item:', { index, itemId: item.id, isVisible, videoHeight });
    
    return (
      <View style={[styles.videoContainer, { height: videoHeight }]}>
        <EnhancedVideoPlayer
          item={item}
          index={index}
          isVisible={isVisible}
          onEnd={onEnd}
          onShare={onShare}
          onLike={handleLike}
          onWatchNow={handleWatchNow}
          viewHeight={videoHeight}
          isScrolling={false} // Add scrolling state for optimization
        />
      </View>
    );
  }, [currentIndex, videoHeight, onEnd, onShare, handleLike, handleWatchNow]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const getItemLayout = useMemo(() => (data: any, index: number) => ({
    length: screenHeight,
    offset: screenHeight * index,
    index,
  }), []);

  // Performance monitoring
  useEffect(() => {
    if (__DEV__) {
      const stats = async () => {
        const cacheStats = await enhancedVideoCache.getCacheStats();
        console.log('📊 Cache Stats:', cacheStats);
      };
      stats();
    }
  }, []);

  return (
    <View style={[styles.container, { marginTop: -insets.top }]}>
      <FlatList
        ref={flatListRef}
        data={shortsData}
        renderItem={renderVideoItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        {...hardwareAcceleratedScroll.getOptimizedScrollConfig()}
        snapToInterval={0}
        snapToAlignment="start"
        pagingEnabled={false}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
        onScroll={handleScroll}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
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
  flatListContent: {
    flexGrow: 1,
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000000',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default UltraShortsScreen; 