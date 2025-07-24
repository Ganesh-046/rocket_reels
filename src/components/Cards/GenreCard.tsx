import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface GenreCardProps {
  item: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    thumbnail: string;
    count: number;
  };
  index: number;
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const GenreCard: React.FC<GenreCardProps> = ({ item, index, navigation }) => {
  const handlePress = () => {
    navigation.navigate('MovieList', {
      title: item.name,
      type: 'Genre',
      item: {
        slug: item.slug,
        name: item.name
      }
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.cardGradient}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
            style={styles.overlay}
          />
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{item.count}</Text>
          </View>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.genreName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.genreDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        
        <View style={styles.iconContainer}>
          <Icon name="play-arrow" size={16} color="#ffffff" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: isLargeDevice ? width * 0.005 : width * 0.01,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: isLargeDevice ? width * 0.15 : width * 0.25,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  countBadge: {
    position: 'absolute',
    top: isLargeDevice ? width * 0.01 : width * 0.02,
    right: isLargeDevice ? width * 0.01 : width * 0.02,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: isLargeDevice ? width * 0.01 : width * 0.015,
    paddingVertical: isLargeDevice ? width * 0.005 : width * 0.008,
  },
  countText: {
    fontSize: isLargeDevice ? 10 : 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  contentContainer: {
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    flex: 1,
  },
  genreName: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01,
  },
  genreDescription: {
    fontSize: isLargeDevice ? 10 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: isLargeDevice ? 14 : 16,
  },
  iconContainer: {
    position: 'absolute',
    bottom: isLargeDevice ? width * 0.015 : width * 0.02,
    right: isLargeDevice ? width * 0.015 : width * 0.02,
    width: isLargeDevice ? width * 0.06 : width * 0.08,
    height: isLargeDevice ? width * 0.06 : width * 0.08,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GenreCard; 