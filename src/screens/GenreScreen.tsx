import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// Dummy genre content
const dummyGenreContent = [
  {
    id: '1',
    title: 'Action Movie 1',
    year: '2023',
    rating: '4.8',
    image: 'https://via.placeholder.com/150x200/ed9b72/ffffff?text=AM1',
  },
  {
    id: '2',
    title: 'Action Movie 2',
    year: '2022',
    rating: '4.7',
    image: 'https://via.placeholder.com/150x200/7d2537/ffffff?text=AM2',
  },
  {
    id: '3',
    title: 'Action Movie 3',
    year: '2021',
    rating: '4.9',
    image: 'https://via.placeholder.com/150x200/ed9b72/ffffff?text=AM3',
  },
  {
    id: '4',
    title: 'Action Movie 4',
    year: '2020',
    rating: '4.6',
    image: 'https://via.placeholder.com/150x200/7d2537/ffffff?text=AM4',
  },
];

const GenreScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { genreName = 'Action' } = route.params;
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'year'>('latest');

  const renderMovieCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.movieCard}
      onPress={() => navigation.navigate('Detail', { movieId: item.id })}
    >
      <Image 
        source={{ 
          uri: item.imageUri || item.image || item.backdropImage || 'https://via.placeholder.com/400x600/ed9b72/ffffff?text=Genre' 
        }} 
        style={styles.movieImage} 
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.movieMeta}>
          <Text style={styles.movieYear}>{item.year}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={12} color="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSortButton = (type: 'latest' | 'rating' | 'year', label: string) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === type && styles.activeSortButton]}
      onPress={() => setSortBy(type)}
    >
      <Text style={[styles.sortButtonText, sortBy === type && styles.activeSortButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{genreName}</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => Alert.alert('Filter', 'Filter functionality')}
        >
          <Icon name="filter-list" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {renderSortButton('latest', 'Latest')}
        {renderSortButton('rating', 'Top Rated')}
        {renderSortButton('year', 'Year')}
      </View>

      {/* Content List */}
      <FlatList
        data={dummyGenreContent}
        renderItem={renderMovieCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={styles.row}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  activeSortButton: {
    backgroundColor: '#ffffff',
  },
  sortButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  activeSortButtonText: {
    color: '#7d2537',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  movieCard: {
    width: (width - 60) / 2,
    marginBottom: 20,
  },
  movieImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  movieInfo: {
    marginTop: 8,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  movieMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieYear: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default GenreScreen; 