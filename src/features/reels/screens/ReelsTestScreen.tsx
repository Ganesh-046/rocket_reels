import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import ReelCard from '../components/ReelCard';

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
}

const ReelsTestScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const flatListRef = useRef<FlatList>(null);
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([0]));
  const [activeIndex, setActiveIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Test data
  const testData: ReelItem[] = useMemo(() => Array.from({ length: 10 }, (_, i) => ({
    id: `test-reel-${i}`,
    title: `Test Reel ${i + 1} - Instagram-like Behavior`,
    description: `This video should play smoothly without pauses during scrolling. Scroll up and down to test.`,
    videoUrl: `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
    thumbnail: `https://picsum.photos/400/600?random=${i}`,
    likes: Math.floor(Math.random() * 100000) + 1000,
    comments: Math.floor(Math.random() * 1000) + 100,
    shares: Math.floor(Math.random() * 500) + 50,
    author: `test_creator_${i}`,
    duration: 30,
    views: `${Math.floor(Math.random() * 1000000) + 10000}`,
  })), []);

  const viewHeight = useMemo(() => screenHeight - insets.top - tabBarHeight, [insets.top, tabBarHeight]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: viewHeight,
    offset: viewHeight * index,
    index,
  }), [viewHeight]);

  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length === 0) return;

    const newVisibleIndices = new Set<number>(viewableItems.map((item: any) => item.index as number));
    setVisibleIndices(newVisibleIndices);

    const mostVisibleItem = viewableItems.reduce((prev: any, current: any) => 
      prev.percentVisible > current.percentVisible ? prev : current
    );

    if (mostVisibleItem && mostVisibleItem.index !== activeIndex) {
      setActiveIndex(mostVisibleItem.index);
    }
  }, [activeIndex]);

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
          console.log('Card pressed:', pressedItem.id);
        }}
        onLike={(itemId) => {
          console.log('Liked:', itemId);
        }}
        onShare={(shareItem) => {
          console.log('Share:', shareItem.id);
        }}
        onComment={(itemId) => {
          console.log('Comment:', itemId);
        }}
      />
    );
  }, [visibleIndices, activeIndex, viewHeight, isUserScrolling]);

  const keyExtractor = useCallback((item: ReelItem) => item.id, []);

  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 30, // Lower threshold for more responsive detection
    minimumViewTime: 50, // Shorter minimum time for manual scrolling
  }), []);

  // Scroll handler for YouTube Shorts-like behavior
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: () => {
      runOnJS(setIsUserScrolling)(true);
    },
    onBeginDrag: () => {
      runOnJS(setIsUserScrolling)(true);
    },
    onEndDrag: () => {
      setTimeout(() => {
        runOnJS(setIsUserScrolling)(false);
      }, 100);
    },
    onMomentumEnd: () => {
      runOnJS(setIsUserScrolling)(false);
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with instructions */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Instagram-like Reels Test</Text>
        <Text style={styles.headerSubtitle}>
          YouTube Shorts-like: Tap to show/hide pause button. Button hidden during scrolling.
        </Text>
        <Text style={styles.statusText}>
          Active: {activeIndex + 1} | Visible: {Array.from(visibleIndices).map(i => i + 1).join(', ')}
        </Text>
        <Text style={styles.progressText}>
          Progress bars should appear at the top of each video
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={testData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        pagingEnabled={false} // Disabled auto-scrolling
        snapToInterval={0} // Disabled snap-to-interval
        snapToAlignment="start"
        decelerationRate="normal"
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        updateCellsBatchingPeriod={16}
      />
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#00ff00',
    fontWeight: '600',
  },
  progressText: {
    fontSize: 12,
    color: '#00ffff',
    fontWeight: '600',
    marginTop: 8,
  },
});

export default ReelsTestScreen; 