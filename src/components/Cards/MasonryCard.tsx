import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import useTheme from '../../hooks/useTheme';
import ActivityLoader from '../common/ActivityLoader';

interface MasonryCardProps {
  item: any;
  style?: any;
  userProfileInfo?: any;
  navigation: any;
  setIsLoginPopUp?: (show: boolean) => void;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');

const MasonryCard: React.FC<MasonryCardProps> = ({ 
  item, 
  style, 
  userProfileInfo, 
  navigation, 
  setIsLoginPopUp, 
  disabled 
}) => {
  const { theme } = useTheme();
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardWidth = width * 0.45;
  const cardHeight = item.height || cardWidth * 1.3;

  // Asset URL constant - Use CloudFront CDN (no authentication required)
  const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';

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

  // Check if item is language data (logo display)
  if (item?.languageData) {
    return (
      <View style={[styles.container, { 
        borderWidth: 0, 
        backgroundColor: 'transparent', 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: width * 0.03, 
        padding: width * 0.02 
      }]}>
        <View style={{
          width: width * 0.16,
          height: width * 0.16,
          backgroundColor: theme.colors.primary,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>RR</Text>
        </View>
        <Text style={[styles.title, { marginLeft: width * 0.02 }]}>
          Rocket Reels
        </Text>
      </View>
    );
  }

  // Check for premium/exclusive content
  const premium = item.genres ? item.genres.some((genre: any) => genre.name === 'Exclusive') : false;

  const handlePress = () => {
    if (!disabled && (item._id || item.id)) {
      // Extract data for episodes navigation
      const contentId = item.contentId || item._id || item.id;
      const contentTitle = item.title || item.name;
      const contentDescription = item.description;
      
      console.log('MasonryCard clicked:', {
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
      style={[styles.container, { width: cardWidth, height: cardHeight }, style]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
    >
      {imageLoading && (
        <View style={[styles.image, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityLoader />
        </View>
      )}
      {!imageLoading && !imageError && (
        <FastImage
          source={item?.backdropImage ? 
            { 
              uri: `${NEXT_PUBLIC_ASSET_URL}/${item.backdropImage}`, 
              priority: 'high', 
              cache: 'immutable' 
            } : 
            { uri: 'https://via.placeholder.com/400x600/ed9b72/ffffff?text=No+Image' }
          }
          style={[styles.image, { height: item.height }]}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
            console.error('🖼️ MasonryCard image error:', item.backdropImage);
          }}
        />
      )}
      {imageError && (
        <View style={[styles.image, { backgroundColor: theme.colors.backgroundSecondary, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No Image</Text>
        </View>
      )}
      
      {/* Premium/Exclusive Badge */}
      {premium && (
        <View style={{
          position: 'absolute',
          right: 8,
          top: 8,
          backgroundColor: '#FFD700',
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4
        }}>
          <Text style={{ 
            color: '#000', 
            fontSize: 10, 
            fontWeight: 'bold' 
          }}>
            EXCLUSIVE
          </Text>
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

export default MasonryCard; 