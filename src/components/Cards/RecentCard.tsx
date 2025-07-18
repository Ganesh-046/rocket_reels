import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import useTheme from '../../hooks/useTheme';

interface RecentCardProps {
  item: any;
  index: number;
  navigation: any;
}

const { width } = Dimensions.get('window');

const RecentCard: React.FC<RecentCardProps> = ({ item, index, navigation }) => {
  const { theme } = useTheme();
  const cardWidth = width * 0.35;
  const cardHeight = cardWidth * 1.4;

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
      bottom: 0,
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

  return (
    <View style={[styles.container, { width: cardWidth, height: cardHeight }]}>
      <Image
        source={{ uri: item.imageUri || 'https://via.placeholder.com/250x350' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${item.progress || 30}%` }]} />
      </View>
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title || 'Recent Show'}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.episode || 'Episode 5'}
        </Text>
      </View>
    </View>
  );
};

export default RecentCard; 