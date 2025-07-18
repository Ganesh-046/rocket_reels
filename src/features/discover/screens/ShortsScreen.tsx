import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  View,
  InteractionManager,
  Share,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNFS from 'react-native-fs';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Video cache utility
class VideoCache {
  private cache: Map<string, string> = new Map();
  private cacheDir: string;

  constructor() {
    this.cacheDir = `${RNFS.CachesDirectoryPath}/videos`;
    this.initCache();
  }

  private async initCache() {
    try {
      const dirExists = await RNFS.exists(this.cacheDir);
      if (!dirExists) {
        await RNFS.mkdir(this.cacheDir);
      }
    } catch (error) {
      console.error('Failed to initialize video cache:', error);
    }
  }

  async getCachedVideo(videoId: string): Promise<string | null> {
    try {
      const cachedPath = this.cache.get(videoId);
      if (cachedPath) {
        const exists = await RNFS.exists(cachedPath);
        if (exists) {
          return cachedPath;
        } else {
          this.cache.delete(videoId);
        }
      }
      return null;
    } catch (error) {
      console.error('Error checking cached video:', error);
      return null;
    }
  }

  async cacheVideo(videoUrl: string, videoId: string): Promise<string> {
    try {
      // Check if already cached
      const cachedPath = await this.getCachedVideo(videoId);
      if (cachedPath) {
        return cachedPath;
      }

      const videoPath = `${this.cacheDir}/${videoId}.mp4`;
      
      // Download and cache video
      const downloadResult = await RNFS.downloadFile({
        fromUrl: videoUrl,
        toFile: videoPath,
        background: true,
        discretionary: true,
        progress: (res) => {
          const progressPercent = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Downloading ${videoId}: ${progressPercent.toFixed(2)}%`);
        }
      }).promise;

      if (downloadResult.statusCode === 200) {
        this.cache.set(videoId, videoPath);
        return videoPath;
      }
    } catch (error) {
      console.error('Video caching error:', error);
    }
    return videoUrl; // Fallback to original URL
  }

  async clearCache(): Promise<void> {
    try {
      const files = await RNFS.readDir(this.cacheDir);
      const deletePromises = files.map(file => RNFS.unlink(file.path));
      await Promise.all(deletePromises);
      this.cache.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const files = await RNFS.readDir(this.cacheDir);
      let totalSize = 0;
      for (const file of files) {
        const stats = await RNFS.stat(file.path);
        totalSize += stats.size;
      }
      return totalSize;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }
}

const videoCache = new VideoCache();

// Enhanced static video data
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
  }
];

interface ShortsScreenProps {
  navigation: any;
}

const ShortsScreen: React.FC<ShortsScreenProps> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  
  const flatListRef = useRef<FlatList>(null);
  const controllerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoCacheRef = useRef(new Map<string, string>());
  const isLoadingMore = useRef(false);

  const [state, setState] = useState({
    playPause: true,
    currentIndex: 0,
    controller: true,
    duration: 0,
    progress: 0,
    loading: false,
  });

  const [shortsData, setShortsData] = useState(SHORTS_DATA);
  const [refreshing, setRefreshing] = useState(false);

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

  // Video caching with video cache utility
  const cacheVideo = useCallback(async (videoUrl: string, videoId: string) => {
    try {
      const cachedPath = await videoCache.cacheVideo(videoUrl, videoId);
      videoCacheRef.current.set(videoId, cachedPath);
      return cachedPath;
    } catch (error) {
      console.error('Video caching error:', error);
      return videoUrl; // Fallback to original URL
    }
  }, []);

  // Preload next videos for smooth playback
  const preloadNextVideos = useCallback((currentIndex: number) => {
    const nextIndex = currentIndex + 1;
    const nextVideo = shortsData[nextIndex];
    
    if (nextVideo) {
      cacheVideo(nextVideo.videoUrl, nextVideo.id);
    }
  }, [shortsData, cacheVideo]);

  useEffect(() => {
    if (isFocused && !state.loading) {
      // Preload first few videos
      InteractionManager.runAfterInteractions(() => {
        shortsData.slice(0, 3).forEach(video => {
          cacheVideo(video.videoUrl, video.id);
        });
      });
    }
  }, [isFocused, cacheVideo]);

  const onEnd = useCallback(() => {
    const nextIndex = state.currentIndex + 1;
    if (nextIndex < shortsData.length) {
      setState(prev => ({ ...prev, playPause: false, currentIndex: nextIndex }));

      requestAnimationFrame(() => {
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true
        });
        setState(prev => ({ ...prev, playPause: true }));
      });
    }
  }, [state.currentIndex, shortsData.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== state.currentIndex) {
        setState(prev => ({
          ...prev,
          currentIndex: index,
          playPause: true,
        }));
        preloadNextVideos(index);
      }
    }
  }, [state.currentIndex, preloadNextVideos]);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 300,
    waitForInteraction: false,
  }), []);

  const handleScroll = useCallback(() => {
    setState(prev => ({ ...prev, controller: true }));

    if (controllerTimeoutRef.current) {
      clearTimeout(controllerTimeoutRef.current);
    }

    controllerTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, controller: false }));
    }, 3000);
  }, []);

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShortsData([...SHORTS_DATA]);
      setState(prev => ({ ...prev, currentIndex: 0, playPause: true }));
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
    const isVisible = state.currentIndex === index;
    
    console.log('🎬 Rendering video item:', { index, itemId: item.id, isVisible, videoHeight });
    
    return (
      <View style={[styles.videoContainer, { height: videoHeight }]}>
        <ShortVideoPlayer
          item={item}
          index={index}
          state={state}
          setState={setState}
          navigation={navigation}
          play={isVisible && state.playPause}
          viewHeight={videoHeight}
          onEnd={onEnd}
          onShare={onShare}
          onLike={handleLike}
          cacheVideo={cacheVideo}
          videoCacheRef={videoCacheRef}
        />
      </View>
    );
  }, [state, videoHeight, onEnd, onShare, handleLike, cacheVideo]);

  const keyExtractor = useCallback((item: any) => item.id, []);

  const getItemLayout = useMemo(() => (data: any, index: number) => ({
    length: videoHeight,
    offset: videoHeight * index,
    index,
  }), [videoHeight]);

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
        disableVirtualization={false}
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
      />
    </View>
  );
};

const ShortVideoPlayer = ({ 
  item, 
  index, 
  state, 
  setState, 
  navigation, 
  play, 
  viewHeight, 
  onEnd, 
  onShare, 
  onLike,
  cacheVideo,
  videoCacheRef
}: any) => {
  const videoRef = useRef<any>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [cachedPath, setCachedPath] = useState<string | null>(null);

  useEffect(() => {
    // Preload video
    const preloadVideo = async () => {
      try {
        const path = await cacheVideo(item.videoUrl, item.id);
        setCachedPath(path);
      } catch (error) {
        console.error('Error preloading video:', error);
      }
    };
    preloadVideo();
  }, [item.id, item.videoUrl, cacheVideo]);

  const load = ({ duration, naturalSize }: any) => {
    setState((prev: any) => ({ ...prev, duration }));
  };

  const onReadyForDisplay = () => {
    setVideoReady(true);
  };

  const onProgress = ({ currentTime, seekableDuration }: any) => {
    const progress = (currentTime / seekableDuration) * 100;
    setState((prev: any) => ({ ...prev, progress }));
  };

  const onBuffer = (bufferEvent: any) => {
    setState((prev: any) => ({ ...prev, loading: bufferEvent.isBuffering }));
  };

  const handleLikePress = () => {
    onLike(item.id);
  };

  const handleSharePress = () => {
    onShare(item);
  };

  return (
    <View style={styles.videoPlayerContainer}>
      {/* Video Component */}
      <Video
        ref={videoRef}
        style={styles.video}
        source={{
          uri: cachedPath || item.videoUrl,
          headers: {
            'Cache-Control': 'max-age=3600',
            'Accept-Encoding': 'gzip, deflate',
            'User-Agent': 'RocketReels/1.0',
          },
          bufferConfig: {
            minBufferMs: 1000,
            maxBufferMs: 5000,
            bufferForPlaybackMs: 500,
            bufferForPlaybackAfterRebufferMs: 1000,
            backBufferDurationMs: 3000,
            maxHeapAllocationPercent: 0.3,
          },
          minLoadRetryCount: 3,
          shouldCache: true,
        }}
        repeat={false}
        resizeMode="cover"
        paused={!play || !videoReady}
        controls={false}
        playInBackground={false}
        poster={item.thumbnail}
        preventsDisplaySleepDuringVideoPlayback
        onError={(error) => console.log('video error', error)}
        onLoad={load}
        onBuffer={onBuffer}
        onProgress={onProgress}
        onEnd={onEnd}
        playWhenInactive={false}
        progressUpdateInterval={1000}
        reportBandwidth
        onReadyForDisplay={onReadyForDisplay}
        ignoreSilentSwitch="ignore"
        automaticallyWaitsToMinimizeStalling={true}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${state.progress}%` }]} />
      </View>

      {/* Loading Indicator */}
      {!videoReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      {/* Controls Overlay */}
      {state.controller && (
        <View style={styles.controls}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setState((prev: any) => ({ ...prev, playPause: !prev.playPause }))}
          >
            <Icon
              name={play ? "pause" : "play-arrow"}
              color="#ffffff"
              size={40}
            />
          </TouchableOpacity>

          {/* Content Info */}
          <View style={styles.contentInfo}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.author}>
              @{item.author}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLikePress}>
              <View style={styles.iconContainer}>
                <Icon name="favorite-border" color="#ffffff" size={28} />
              </View>
              <Text style={styles.actionText}>
                {item.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.iconContainer}>
                <Icon name="comment" color="#ffffff" size={28} />
              </View>
              <Text style={styles.actionText}>
                {item.comments}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSharePress}>
              <View style={styles.iconContainer}>
                <Icon name="share" color="#ffffff" size={28} />
              </View>
              <Text style={styles.actionText}>
                {item.shares}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.iconContainer}>
                <Icon name="info" color="#ffffff" size={28} />
              </View>
              <Text style={styles.actionText}>
                Info
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  videoPlayerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    width: screenWidth,
    height: '100%',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
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
  controls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 100,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
  },
  author: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.8,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    alignItems: 'center',
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
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default ShortsScreen; 