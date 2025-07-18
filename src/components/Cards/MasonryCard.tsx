import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import useTheme from '../../hooks/useTheme';

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
  const cardWidth = width * 0.45;
  const cardHeight = item.height || cardWidth * 1.3;

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

  return (
    <View style={[styles.container, { width: cardWidth, height: cardHeight }, style]}>
      <Image
        source={{ uri: item.imageUri || 'https://via.placeholder.com/300x400' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || 'Content Title'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.genre || 'Genre'}
        </Text>
      </View>
    </View>
  );
};

export default MasonryCard; 