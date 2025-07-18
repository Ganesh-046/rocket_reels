import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import useTheme from '../../hooks/useTheme';

interface BannerComponentProps {
  banner_Data: any[];
  baseGradientColors: any;
  currentBannerIndex: number;
  setCurrentBannerIndex: (index: number) => void;
  navigation: any;
  onBannerScroll: (isScrolling: boolean) => void;
  onBannerIndexChange: (index: number) => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
}

const { width, height } = Dimensions.get('window');

const BannerComponent: React.FC<BannerComponentProps> = ({
  banner_Data,
  baseGradientColors,
  currentBannerIndex,
  setCurrentBannerIndex,
  navigation,
  onBannerScroll,
  onBannerIndexChange,
  onTouchStart,
  onTouchEnd,
}) => {
  const { theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const bannerWidth = width;
  const bannerHeight = height * 0.4;

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / bannerWidth);
    if (index !== currentBannerIndex) {
      setCurrentBannerIndex(index);
      onBannerIndexChange(index);
    }
  };

  const handleScrollBeginDrag = () => {
    setIsScrolling(true);
    onBannerScroll(true);
    onTouchStart();
  };

  const handleScrollEndDrag = () => {
    setIsScrolling(false);
    onBannerScroll(false);
    onTouchEnd();
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
    },
    scrollView: {
      flex: 1,
    },
    bannerItem: {
      position: 'relative',
    },
    bannerImage: {
      width: '100%',
    },
    bannerOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 24,
    },
    bannerTitle: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    bannerSubtitle: {
      color: theme.colors.textSecondary,
      fontSize: 16,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      marginHorizontal: 4,
    },
    activeDot: {
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollBegin={handleScrollBeginDrag}
        onMomentumScrollEnd={handleScrollEndDrag}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {banner_Data.map((banner, index) => (
          <View key={banner.id || index} style={[styles.bannerItem, { width: bannerWidth }]}>
            <Image
              source={{ uri: banner.imageUri || 'https://via.placeholder.com/400x200' }}
              style={[styles.bannerImage, { height: bannerHeight }]}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {banner.title || 'Banner Title'}
              </Text>
              <Text style={styles.bannerSubtitle} numberOfLines={1}>
                {banner.subtitle || 'Banner Subtitle'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Pagination dots */}
      <View style={styles.pagination}>
        {banner_Data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentBannerIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerComponent; 