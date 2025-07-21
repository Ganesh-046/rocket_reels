import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useTheme } from '../../hooks/useTheme';
import ActivityLoader from '../common/ActivityLoader';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedMovieCardProps {
  item: any;
  index: number;
  navigation: any;
  isLarge?: boolean;
}

// Asset URL constant
const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';

const OptimizedMovieCard: React.FC<OptimizedMovieCardProps> = React.memo(({ 
  item, 
  index, 
  navigation, 
  isLarge = false 
}) => {
  const { theme } = useTheme();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Calculate card dimensions for grid layout
  const cardWidth = isLarge ? (screenWidth - 48) / 2 : screenWidth * 0.4;
  const cardHeight = cardWidth * 1.5;

  // Memoized image URL calculation
  const imageUrl = useMemo(() => {
    // Priority 1: Use processed imageUri if available
    if (item.imageUri && typeof item.imageUri === 'string') {
      return item.imageUri;
    }

    // Priority 2: Direct backdropImage (main content image)
    if (item.backdropImage && typeof item.backdropImage === 'string') {
      return item.backdropImage.startsWith('http') 
        ? item.backdropImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.backdropImage}`;
    }
    
    // Priority 3: Direct image field
    if (item.image && typeof item.image === 'string') {
      return item.image.startsWith('http') 
        ? item.image 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.image}`;
    }

    // Priority 4: ContentDetails backdropImage
    if (item.contentDetails?.backdropImage && typeof item.contentDetails.backdropImage === 'string') {
      return item.contentDetails.backdropImage.startsWith('http') 
        ? item.contentDetails.backdropImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.backdropImage}`;
    }
    
    // Priority 5: ContentDetails posterImage
    if (item.contentDetails?.posterImage && typeof item.contentDetails.posterImage === 'string') {
      return item.contentDetails.posterImage.startsWith('http') 
        ? item.contentDetails.posterImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.posterImage}`;
    }
    
    // Priority 6: Legacy fields
    if (item.posterImage && typeof item.posterImage === 'string') {
      return item.posterImage.startsWith('http') 
        ? item.posterImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.posterImage}`;
    }

    return null;
  }, [item]);

  // Memoized styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      width: cardWidth,
      height: cardHeight,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundSecondary,
      marginHorizontal: 4,
      marginVertical: 4,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: 8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    loadingContainer: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    errorContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
  }), [cardWidth, cardHeight, theme.colors]);

  // Memoized handlers
  const handlePress = useCallback(() => {
    if (item._id || item.id) {
      navigation.navigate('ContentDetails', { contentId: item._id || item.id });
    }
  }, [item._id, item.id, navigation]);

  const handleImageLoadStart = useCallback(() => {
    setImageLoading(true);
    setImageError(false);
  }, []);

  const handleImageLoadEnd = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
  }, []);

  // Memoized content
  const title = useMemo(() => item.title || item.name || '', [item.title, item.name]);
  const genre = useMemo(() => item.genre || item.genreName || '', [item.genre, item.genreName]);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {imageLoading && (
        <View style={styles.loadingContainer}>
          <ActivityLoader />
        </View>
      )}
      
      {!imageLoading && !imageError && imageUrl && (
        <FastImage
          source={{ 
            uri: imageUrl, 
            priority: FastImage.priority.high,
            cache: FastImage.cacheControl.immutable
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={handleImageLoadStart}
          onLoadEnd={handleImageLoadEnd}
          onError={handleImageError}
        />
      )}
      
      {!imageLoading && !imageError && !imageUrl && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No Image</Text>
        </View>
      )}
      
      {!imageLoading && imageError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load</Text>
        </View>
      )}
      
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {genre}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

OptimizedMovieCard.displayName = 'OptimizedMovieCard';

export default OptimizedMovieCard; 