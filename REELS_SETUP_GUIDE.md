# 🚀 Quick Setup Guide: Optimized Reels Feed

This guide will help you integrate the buttery-smooth reels feed into your existing Rocket Reels app.

## 📋 Prerequisites

Make sure you have these dependencies installed:

```bash
npm install react-native-reanimated react-native-fast-image react-native-mmkv
# or
yarn add react-native-reanimated react-native-fast-image react-native-mmkv
```

## 🔧 Installation Steps

### 1. **Update Navigation**

Add the optimized reels screen to your navigation:

```typescript
// In your navigation file (e.g., src/navigation/StackNavigator.tsx)
import OptimizedReelsFeedScreen from '../features/reels/screens/OptimizedReelsFeedScreen';

// Add to your stack navigator
<Stack.Screen 
  name="OptimizedReels" 
  component={OptimizedReelsFeedScreen}
  options={{ headerShown: false }}
/>
```

### 2. **Update Tab Navigator**

Replace your existing reels tab with the optimized version:

```typescript
// In src/navigation/BottomTabNavigator.tsx
import OptimizedReelsFeedScreen from '../features/reels/screens/OptimizedReelsFeedScreen';

// Replace the existing reels screen
{
  name: 'Reels',
  component: OptimizedReelsFeedScreen,
  options: {
    tabBarIcon: ({ color, size }) => (
      <Icon name="video" size={size} color={color} />
    ),
  },
}
```

### 3. **Initialize Performance Monitoring**

Add performance monitoring to your app's entry point:

```typescript
// In App.tsx or index.js
import { performanceMonitor } from './src/utils/performanceMonitor';

// Start monitoring when app launches
performanceMonitor.startFrameRateMonitoring();
```

## 🎯 Usage Examples

### Basic Implementation

```typescript
import React from 'react';
import OptimizedReelsFeedScreen from './src/features/reels/screens/OptimizedReelsFeedScreen';

const MyApp = () => {
  const navigation = useNavigation();
  
  return (
    <OptimizedReelsFeedScreen
      navigation={navigation}
      initialData={[]} // Your reels data here
    />
  );
};
```

### With Performance Optimization Hook

```typescript
import React, { useEffect } from 'react';
import OptimizedReelsFeedScreen from './src/features/reels/screens/OptimizedReelsFeedScreen';
import { usePerformanceOptimization } from './src/hooks/usePerformanceOptimization';

const MyApp = () => {
  const {
    startPerformanceTracking,
    endPerformanceTracking,
    optimizeMemory,
  } = usePerformanceOptimization({
    enablePrefetch: true,
    maxCachedVideos: 10,
  });

  useEffect(() => {
    startPerformanceTracking();
    return () => endPerformanceTracking();
  }, []);

  return (
    <OptimizedReelsFeedScreen
      navigation={navigation}
      initialData={reelsData}
    />
  );
};
```

## 🔄 Data Integration

### Connect to Your API

Replace the dummy data with your actual API:

```typescript
// In OptimizedReelsFeedScreen.tsx, replace loadMoreData function
const loadMoreData = useCallback(async () => {
  if (isLoading) return;
  
  setIsLoading(true);
  try {
    const response = await fetch('/api/reels?page=' + (reelsData.length / 10 + 1));
    const newData = await response.json();
    setReelsData(prev => [...prev, ...newData]);
  } catch (error) {
    console.error('Error loading reels:', error);
  } finally {
    setIsLoading(false);
  }
}, [reelsData.length, isLoading]);
```

### Custom Reel Data Structure

Make sure your data matches this interface:

```typescript
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
```

## ⚙️ Configuration Options

### Performance Settings

```typescript
// Customize performance settings
const performanceConfig = {
  enablePrefetch: true,        // Enable video prefetching
  enableMemoryOptimization: true, // Enable memory cleanup
  enableScrollOptimization: true, // Enable scroll optimizations
  maxCachedVideos: 10,         // Max videos in cache
  prefetchDistance: 3,         // Videos to prefetch ahead
};
```

### Cache Settings

```typescript
// In src/utils/enhancedVideoCache.ts
const cacheConfig = {
  maxSize: 500 * 1024 * 1024, // 500MB cache limit
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  preloadCount: 3,            // Videos to preload
  cleanupThreshold: 0.8,      // Cleanup at 80% capacity
};
```

## 🎨 Customization

### Styling

Customize the appearance by modifying the styles in:
- `src/features/reels/components/ReelCard.tsx`
- `src/features/reels/components/ReelActions.tsx`
- `src/features/reels/screens/OptimizedReelsFeedScreen.tsx`

### Actions

Customize the action handlers:

```typescript
// In OptimizedReelsFeedScreen.tsx
const renderItem = useCallback(({ item, index }) => (
  <ReelCard
    item={item}
    index={index}
    isVisible={visibleIndices.has(index)}
    isActive={index === activeIndex}
    viewHeight={viewHeight}
    onPress={(pressedItem) => {
      // Your custom press handler
      navigation.navigate('ReelPlayer', { reel: pressedItem });
    }}
    onLike={(itemId) => {
      // Your like API call
      likeReel(itemId);
    }}
    onShare={(shareItem) => {
      // Your share functionality
      shareReel(shareItem);
    }}
    onComment={(itemId) => {
      // Your comment handler
      openComments(itemId);
    }}
  />
), [visibleIndices, activeIndex, viewHeight, navigation]);
```

## 🚨 Troubleshooting

### Common Issues

1. **Videos not loading**
   - Check video URLs are accessible
   - Verify cache directory permissions
   - Check network connectivity

2. **Performance issues**
   - Monitor memory usage in development
   - Clear cache if needed: `enhancedVideoCache.clearCache()`
   - Check for memory leaks

3. **Scroll stuttering**
   - Verify FlatList configuration
   - Check for heavy operations in render
   - Ensure proper memoization

### Debug Commands

```typescript
// Check performance metrics
performanceMonitor.logPerformanceSummary();

// Clear all caches
enhancedVideoCache.clearCache();
prefetchManager.clearPrefetchQueue();

// Get cache statistics
const stats = await enhancedVideoCache.getCacheStats();
console.log('Cache stats:', stats);
```

## 📊 Performance Monitoring

### Development Tools

1. **React DevTools Profiler** - Monitor component re-renders
2. **Flipper** - Debug performance issues
3. **Console logs** - Check performance metrics

### Production Monitoring

Add crash reporting and analytics:

```typescript
// Add to your app initialization
import { performanceMonitor } from './src/utils/performanceMonitor';

// Log performance metrics periodically
setInterval(() => {
  performanceMonitor.logPerformanceSummary();
}, 60000); // Every minute
```

## 🎯 Next Steps

1. **Test thoroughly** on different devices and network conditions
2. **Monitor performance** in production
3. **Optimize based on real usage** patterns
4. **Add analytics** to track user engagement
5. **Implement A/B testing** for further optimization

## 📚 Additional Resources

- [Performance Optimizations Documentation](./PERFORMANCE_OPTIMIZATIONS.md)
- [React Native Performance Guide](https://reactnative.dev/docs/performance)
- [Reanimated 2 Documentation](https://docs.swmansion.com/react-native-reanimated/)

---

**Result**: You now have a buttery-smooth reels feed that rivals Instagram and TikTok! 🚀

For support or questions, check the performance documentation or create an issue in your repository. 