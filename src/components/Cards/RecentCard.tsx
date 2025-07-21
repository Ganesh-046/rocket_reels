import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import useTheme from '../../hooks/useTheme';
import ActivityLoader from '../common/ActivityLoader';

interface RecentCardProps {
  item: any;
  index: number;
  navigation: any;
}

const { width } = Dimensions.get('window');

const RecentCard: React.FC<RecentCardProps> = ({ item, index, navigation }) => {
  const { theme } = useTheme();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardWidth = width * 0.35;
  const cardHeight = cardWidth * 1.4;

  // Debug logging for continue watching data
  if (index === 0) {
    console.log('🖼️ RecentCard item structure:', {
      id: item._id || item.id,
      title: item.title || item.name,
      backdropImage: item.backdropImage,
      image: item.image,
      imageUri: item.imageUri,
      content: item.content
    });
  }

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 4,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.colors.backgroundSecondary,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    progressBar: {
      position: 'absolute',
      zIndex: 10,
      bottom: 50,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    progress: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    overlay: {
      position: 'absolute',
      bottom: 8,
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

    // Priority 2: Continue watching specific image - MOST IMPORTANT
    if (item.content?.continueWatchingImage && typeof item.content.continueWatchingImage === 'string') {
      if (item.content.continueWatchingImage.startsWith('http')) {
        return item.content.continueWatchingImage;
      }
      return `${NEXT_PUBLIC_ASSET_URL}/${item.content.continueWatchingImage}`;
    }
    
    // Priority 3: Content poster image
    if (item.content?.posterImage && typeof item.content.posterImage === 'string') {
      if (item.content.posterImage.startsWith('http')) {
        return item.content.posterImage;
      }
      return `${NEXT_PUBLIC_ASSET_URL}/${item.content.posterImage}`;
    }

    // Priority 4: Direct backdropImage (fallback)
    if (item.backdropImage && typeof item.backdropImage === 'string') {
      if (item.backdropImage.startsWith('http')) {
        return item.backdropImage;
      }
      return `${NEXT_PUBLIC_ASSET_URL}/${item.backdropImage}`;
    }
    
    // Priority 5: Direct image field (fallback)
    if (item.image && typeof item.image === 'string') {
      if (item.image.startsWith('http')) {
        return item.image;
      }
      return `${NEXT_PUBLIC_ASSET_URL}/${item.image}`;
    }
    
    // Priority 6: ContentDetails backdropImage (fallback)
    if (item.contentDetails?.backdropImage && typeof item.contentDetails.backdropImage === 'string') {
      if (item.contentDetails.backdropImage.startsWith('http')) {
        return item.contentDetails.backdropImage;
      }
      return `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.backdropImage}`;
    }
    
    // Priority 7: ContentDetails posterImage (fallback)
    if (item.contentDetails?.posterImage && typeof item.contentDetails.posterImage === 'string') {
      if (item.contentDetails.posterImage.startsWith('http')) {
        return item.contentDetails.posterImage;
      }
      return `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.posterImage}`;
    }
    
    // Priority 8: Legacy fields
    if (item.posterImage && typeof item.posterImage === 'string') {
      if (item.posterImage.startsWith('http')) {
        return item.posterImage;
      }
      return `${NEXT_PUBLIC_ASSET_URL}/${item.posterImage}`;
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
      
      console.log('RecentCard clicked:', {
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
      {imageLoading && (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityLoader />
        </View>
      )}
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
            console.error('🖼️ RecentCard image error:', imageUrl);
          }}
        />
      )}
      {!imageLoading && !imageError && !imageUrl && (
        <View style={[styles.image, { backgroundColor: theme.colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No Image</Text>
        </View>
      )}
      {imageError && (
        <View style={[styles.image, { backgroundColor: theme.colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Image Error</Text>
        </View>
      )}
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${item.progress || item.watchProgress || 0}%` }]} />
      </View>
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || item.name || ''}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.episode || item.episodeNo || ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default RecentCard; 