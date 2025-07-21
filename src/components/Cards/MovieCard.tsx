import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import useTheme from '../../hooks/useTheme';
import ActivityLoader from '../common/ActivityLoader';

interface MovieCardProps {
  item: any;
  index: number;
  navigation: any;
}

const MovieCard: React.FC<MovieCardProps> = ({ item, index, navigation }) => {
  const { theme } = useTheme();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Calculate card dimensions for grid layout
  const { width } = Dimensions.get('window');
  const cardWidth = (width - 48) / 2; // 48 = padding (16) + gap between items (16)
  const cardHeight = cardWidth * 1.5; // 1.5 aspect ratio

  // Debug logging for first few items
  if (index < 3) {
    console.log(`🖼️ MovieCard ${index} item structure:`, {
      id: item._id || item.id,
      title: item.title || item.name,
      backdropImage: item.posterImage,
      contentDetails: item.contentDetails,
      image: item.image,
      imageUri: item.imageUri
    });
  }

  const styles = StyleSheet.create({
    container: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundSecondary,
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
  });

  // Asset URL constant - Use CloudFront CDN (no authentication required)
  const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';

  const getImageUrl = (item: any) => {
    // Priority 1: Use processed imageUri if available
    if (item.imageUri && typeof item.imageUri === 'string') {
      return item.imageUri;
    }

    // Priority 2: Direct backdropImage (main content image) - MOST IMPORTANT
    if (item.backdropImage && typeof item.backdropImage === 'string') {
      const url = item.backdropImage.startsWith('http') ? item.backdropImage : `${NEXT_PUBLIC_ASSET_URL}/${item.backdropImage}`;
      return url;
    }
    
    // Priority 3: Direct image field
    if (item.image && typeof item.image === 'string') {
      const url = item.image.startsWith('http') ? item.image : `${NEXT_PUBLIC_ASSET_URL}/${item.image}`;
      return url;
    }

    // Priority 4: ContentDetails backdropImage (fallback)
    if (item.contentDetails?.backdropImage && typeof item.contentDetails.backdropImage === 'string') {
      const url = item.contentDetails.backdropImage.startsWith('http') ? item.contentDetails.backdropImage : `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.backdropImage}`;
      return url;
    }
    
    // Priority 5: ContentDetails posterImage (fallback)
    if (item.contentDetails?.posterImage && typeof item.contentDetails.posterImage === 'string') {
      const url = item.contentDetails.posterImage.startsWith('http') ? item.contentDetails.posterImage : `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.posterImage}`;
      return url;
    }
    
    // Priority 6: Legacy fields
    if (item.posterImage && typeof item.posterImage === 'string') {
      const url = item.posterImage.startsWith('http') ? item.posterImage : `${NEXT_PUBLIC_ASSET_URL}/${item.posterImage}`;
      return url;
    }

    return null;
  };

  const imageUrl = getImageUrl(item);

  const handlePress = () => {
    if (item._id || item.id) {
      // Extract data for episodes navigation
      const contentId = item.contentId || item._id || item.id;
      const contentTitle = item.title || item.name;
      const contentDescription = item.description;
      
      console.log('MovieCard clicked:', {
        contentId,
        contentTitle,
        contentDescription
      });
      
      // Navigate to EpisodePlayerScreen with content data
      navigation.navigate('EpisodePlayer', {
        contentId: contentId,
        contentName: contentTitle,
        episodes: [], // Will be loaded by EpisodePlayerScreen
        initialIndex: 0,
        trailerData: {
          id: item._id || item.id,
          title: contentTitle,
          description: contentDescription,
          contentId: contentId
        }
      });
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width: cardWidth, height: cardHeight }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* {imageLoading && (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityLoader />
        </View>
      )} */}
      {!imageLoading && !imageError && imageUrl && (
        <FastImage
          source={{ 
            uri: imageUrl, 
            priority: 'high', 
            cache: 'immutable' 
          }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
            console.error(`🖼️ MovieCard ${index} image error:`, {
              imageUrl,
              item: {
                id: item._id || item.id,
                title: item.title || item.name,
                backdropImage: item.backdropImage,
                contentDetails: item.contentDetails,
                image: item.image
              }
            });
          }}
        />
      )}
      {!imageLoading && !imageError && !imageUrl && (
        <View style={[styles.image, { backgroundColor: theme.colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No Image</Text>
        </View>
      )}
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || item.name || ''}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.genre || item.genreName || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MovieCard; 