import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OptimizedReelsFeedScreen from './OptimizedReelsFeedScreen';
import { usePerformanceOptimization } from '../../../hooks/usePerformanceOptimization';
import { performanceMonitor } from '../../../utils/performanceMonitor';

// Sample data for demonstration
const sampleReelsData = [
  {
    id: 'reel-1',
    title: 'Amazing Sunset View',
    description: 'Beautiful sunset captured at the beach! 🌅 #sunset #beach #nature',
    videoUrl: 'https://example.com/video-1.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=1',
    likes: 12500,
    comments: 850,
    shares: 320,
    author: 'nature_lover',
    duration: 45,
    views: '125K',
    category: 'nature',
    tags: ['sunset', 'beach', 'nature'],
  },
  {
    id: 'reel-2',
    title: 'Cooking Masterclass',
    description: 'Learn to make the perfect pasta! 🍝 #cooking #pasta #foodie',
    videoUrl: 'https://example.com/video-2.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=2',
    likes: 8900,
    comments: 650,
    shares: 180,
    author: 'chef_mike',
    duration: 32,
    views: '89K',
    category: 'food',
    tags: ['cooking', 'pasta', 'foodie'],
  },
  {
    id: 'reel-3',
    title: 'Dance Challenge',
    description: 'New dance trend alert! 💃 #dance #trending #viral',
    videoUrl: 'https://example.com/video-3.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=3',
    likes: 25600,
    comments: 1200,
    shares: 890,
    author: 'dance_queen',
    duration: 28,
    views: '256K',
    category: 'dance',
    tags: ['dance', 'trending', 'viral'],
  },
  {
    id: 'reel-4',
    title: 'Travel Vlog',
    description: 'Exploring the hidden gems of Paris! 🇫🇷 #travel #paris #adventure',
    videoUrl: 'https://example.com/video-4.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=4',
    likes: 18700,
    comments: 950,
    shares: 420,
    author: 'travel_bug',
    duration: 52,
    views: '187K',
    category: 'travel',
    tags: ['travel', 'paris', 'adventure'],
  },
  {
    id: 'reel-5',
    title: 'Fitness Motivation',
    description: 'Get fit with this quick workout! 💪 #fitness #workout #motivation',
    videoUrl: 'https://example.com/video-5.mp4',
    thumbnail: 'https://picsum.photos/400/600?random=5',
    likes: 15600,
    comments: 780,
    shares: 290,
    author: 'fitness_guru',
    duration: 38,
    views: '156K',
    category: 'fitness',
    tags: ['fitness', 'workout', 'motivation'],
  },
];

const ReelsExample: React.FC = () => {
  // Initialize performance optimization
  const {
    startPerformanceTracking,
    endPerformanceTracking,
    optimizeMemory,
    clearCache,
  } = usePerformanceOptimization({
    enablePrefetch: true,
    enableMemoryOptimization: true,
    enableScrollOptimization: true,
    maxCachedVideos: 10,
    prefetchDistance: 3,
  });

  // Start performance tracking when component mounts
  useEffect(() => {
    startPerformanceTracking();
    
    // Log initial performance metrics
    performanceMonitor.logPerformanceSummary();

    // Cleanup on unmount
    return () => {
      endPerformanceTracking();
    };
  }, [startPerformanceTracking, endPerformanceTracking]);

  // Handle navigation (you would implement this based on your navigation setup)
  const handleNavigation = {
    navigate: (screen: string, params?: any) => {
      // Implement your navigation logic here
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <OptimizedReelsFeedScreen
        navigation={handleNavigation}
        initialData={sampleReelsData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default ReelsExample; 