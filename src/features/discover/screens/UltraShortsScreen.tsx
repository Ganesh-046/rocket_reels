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
  Alert,
} from 'react-native';
import { FlatList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { enhancedVideoCache } from '../../../utils/enhancedVideoCache';
import { useVideoStore, useCurrentVideo } from '../../../store/videoStore';
import EnhancedVideoPlayer from '../../../components/VideoPlayer/EnhancedVideoPlayer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced static video data with more realistic content
const SHORTS_DATA = [
  {
    id: '1',
    title: 'Epic Mountain Adventure',
    description: 'Breathtaking views from the highest peaks. Nature at its finest! 🌄',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=1',
    likes: 12450,
    comments: 890,
    shares: 234,
    author: 'AdventurePro',
    duration: 15,
    views: '2.1M'
  },
  {
    id: '2',
    title: 'Amazing Cooking Skills',
    description: 'Watch this chef create magic in the kitchen! 👨‍🍳',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=2',
    likes: 8920,
    comments: 456,
    shares: 123,
    author: 'ChefMaster',
    duration: 12,
    views: '1.8M'
  },
  {
    id: '3',
    title: 'Dance Battle Champions',
    description: 'Incredible moves that will blow your mind! 💃',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=3',
    likes: 15670,
    comments: 1200,
    shares: 567,
    author: 'DanceKing',
    duration: 18,
    views: '3.2M'
  },
  {
    id: '4',
    title: 'Tech Innovation',
    description: 'The future is here! Revolutionary technology showcase 🚀',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=4',
    likes: 9870,
    comments: 678,
    shares: 345,
    author: 'TechGuru',
    duration: 14,
    views: '1.5M'
  },
  {
    id: '5',
    title: 'Wildlife Photography',
    description: 'Capturing nature\'s most beautiful moments 📸',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=5',
    likes: 11230,
    comments: 789,
    shares: 234,
    author: 'WildlifePro',
    duration: 16,
    views: '2.8M'
  },
  {
    id: '6',
    title: 'Urban Street Art',
    description: 'Amazing street art that transforms cities! 🎨',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=6',
    likes: 8760,
    comments: 543,
    shares: 198,
    author: 'StreetArtist',
    duration: 13,
    views: '1.9M'
  },
  {
    id: '7',
    title: 'Ocean Deep Dive',
    description: 'Exploring the mysterious depths of the ocean 🌊',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=7',
    likes: 13450,
    comments: 987,
    shares: 345,
    author: 'OceanExplorer',
    duration: 17,
    views: '2.5M'
  },
  {
    id: '8',
    title: 'Extreme Sports',
    description: 'Pushing the limits of human capability! 🏂',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMob.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=8',
    likes: 18920,
    comments: 1456,
    shares: 789,
    author: 'ExtremeAthlete',
    duration: 19,
    views: '4.1M'
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

  // Calculate proper video height considering all safe areas
  const videoHeight = useMemo(() => {
    const statusBarHeight = StatusBar.currentHeight || 0;
    const navBarHeight = Platform.OS === 'android' ? 0 : insets.top;
    const totalHeight = screenHeight - statusBarHeight - navBarHeight - tabBarHeight;
    
    // Ensure minimum height for proper display
    const finalHeight = Math.max(totalHeight, 400);
    
    console.log('📏 Video height calculation:', {
      screenHeight,
      statusBarHeight,
      navBarHeight,
      tabBarHeight,
      totalHeight,
      finalHeight
    });
    
    return finalHeight;
  }, [insets.top, tabBarHeight]);

  // React Query for data fetching (simulated)
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
    const nextIndex = currentIndex + 1;
    if (nextIndex < shortsData.length) {
      setCurrentIndex(nextIndex);
      setCurrentVideo(shortsData[nextIndex].id);

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true
        });
      });
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
      await Share.share({
        title: item.title,
        message: `Check out this amazing short: ${item.title}`,
        url: item.videoUrl,
      });
    } catch (error) {
      console.error('Share error:', error);
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
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    });
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
          viewHeight={videoHeight}
        />
      </View>
    );
  }, [currentIndex, videoHeight, onEnd, onShare, handleLike]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const getItemLayout = useMemo(() => (data: any, index: number) => ({
    length: videoHeight,
    offset: videoHeight * index,
    index,
  }), [videoHeight]);

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
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={shortsData}
        renderItem={renderVideoItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        maxToRenderPerBatch={1}
        windowSize={3}
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={1}
        updateCellsBatchingPeriod={100}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
          />
        }
        onScrollToIndexFailed={onScrollToIndexFailed}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        ListEmptyComponent={ListEmptyComponent}
        onScroll={handleScroll}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: screenWidth,
    backgroundColor: '#000000',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default UltraShortsScreen; 