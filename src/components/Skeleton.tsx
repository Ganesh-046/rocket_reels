import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
  variant?: 'banner' | 'card' | 'text' | 'avatar' | 'masonry';
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4, 
  style, 
  variant = 'text' 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getSkeletonStyle = () => {
    switch (variant) {
      case 'banner':
        return {
          width: screenWidth - 32,
          height: screenWidth * 0.5,
          borderRadius: 12,
        };
      case 'card':
        return {
          width: (screenWidth - 48) / 2,
          height: (screenWidth - 48) / 2 * 1.5,
          borderRadius: 8,
        };
      case 'masonry':
        return {
          width: (screenWidth - 32) / 2,
          height: Math.random() * 200 + 150, // Random height for masonry
          borderRadius: 8,
        };
      case 'avatar':
        return {
          width: 40,
          height: 40,
          borderRadius: 20,
        };
      case 'text':
      default:
        return {
          width,
          height,
          borderRadius,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getSkeletonStyle(),
        { opacity },
        style,
      ]}
    >
      <LinearGradient
        colors={['#2a2a2a', '#3a3a3a', '#2a2a2a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
};

// Optimized skeleton components for specific use cases
export const BannerSkeleton = () => (
  <View style={styles.bannerContainer}>
    <Skeleton variant="banner" />
    <View style={styles.bannerOverlay}>
      <Skeleton variant="text" width="60%" height={24} style={styles.bannerTitle} />
      <Skeleton variant="text" width="40%" height={16} style={styles.bannerSubtitle} />
    </View>
  </View>
);

export const MovieCardSkeleton = () => (
  <View style={styles.cardContainer}>
    <Skeleton variant="card" />
    <View style={styles.cardOverlay}>
      <Skeleton variant="text" width="80%" height={14} style={styles.cardTitle} />
      <Skeleton variant="text" width="60%" height={12} style={styles.cardSubtitle} />
    </View>
  </View>
);

export const MasonryCardSkeleton = () => (
  <View style={styles.masonryContainer}>
    <Skeleton variant="masonry" />
    <View style={styles.masonryOverlay}>
      <Skeleton variant="text" width="70%" height={16} style={styles.masonryTitle} />
      <Skeleton variant="text" width="50%" height={12} style={styles.masonrySubtitle} />
    </View>
  </View>
);

export const TopContentSkeleton = () => (
  <View style={styles.topContentContainer}>
    <View style={styles.topContentNumber}>
      <Skeleton variant="text" width={30} height={30} borderRadius={15} />
    </View>
    <Skeleton variant="card" />
  </View>
);

export const GenreTabSkeleton = () => (
  <View style={styles.genreTabContainer}>
    <Skeleton variant="text" width={60} height={32} borderRadius={16} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#2a2a2a',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    position: 'relative',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  bannerTitle: {
    marginBottom: 8,
  },
  bannerSubtitle: {
    marginBottom: 0,
  },
  cardContainer: {
    marginHorizontal: 4,
    position: 'relative',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardSubtitle: {
    marginBottom: 0,
  },
  masonryContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  masonryOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  masonryTitle: {
    marginBottom: 4,
  },
  masonrySubtitle: {
    marginBottom: 0,
  },
  topContentContainer: {
    marginLeft: 24,
    position: 'relative',
  },
  topContentNumber: {
    position: 'absolute',
    left: -20,
    top: 56,
    zIndex: 1,
  },
  genreTabContainer: {
    marginRight: 8,
  },
});

export default Skeleton;
