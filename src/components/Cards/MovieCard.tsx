import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import useTheme from '../../hooks/useTheme';

interface MovieCardProps {
  item: any;
  index: number;
  navigation: any;
}

const { width } = Dimensions.get('window');

const MovieCard: React.FC<MovieCardProps> = ({ item, index, navigation }) => {
  const { theme } = useTheme();
  const cardWidth = width * 0.4;
  const cardHeight = cardWidth * 1.5;

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
    <View style={[styles.container, { width: cardWidth, height: cardHeight }]}>
      <Image
        source={{ uri: item.imageUri || 'https://via.placeholder.com/300x450' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || 'Movie Title'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.genre || 'Action'}
        </Text>
      </View>
    </View>
  );
};

export default MovieCard; 