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

// Dummy history data
const dummyHistory = [
  {
    id: '1',
    title: 'Avengers: Endgame',
    type: 'Movie',
    watchedAt: '2023-12-15',
    progress: 85,
    duration: '2h 15m',
    image: 'https://via.placeholder.com/120x180/ed9b72/ffffff?text=AE',
  },
  {
    id: '2',
    title: 'Breaking Bad S01E05',
    type: 'TV Show',
    watchedAt: '2023-12-14',
    progress: 100,
    duration: '45m',
    image: 'https://via.placeholder.com/120x180/7d2537/ffffff?text=BB',
  },
  {
    id: '3',
    title: 'Spider-Man: No Way Home',
    type: 'Movie',
    watchedAt: '2023-12-13',
    progress: 60,
    duration: '2h 30m',
    image: 'https://via.placeholder.com/120x180/ed9b72/ffffff?text=SM',
  },
  {
    id: '4',
    title: 'The Crown S04E03',
    type: 'TV Show',
    watchedAt: '2023-12-12',
    progress: 100,
    duration: '55m',
    image: 'https://via.placeholder.com/120x180/7d2537/ffffff?text=TC',
  },
];

const HistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'movies' | 'shows'>('all');

  const filteredHistory = dummyHistory.filter(item => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'movies') return item.type === 'Movie';
    if (selectedFilter === 'shows') return item.type === 'TV Show';
    return true;
  });

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.historyCard}
      onPress={() => navigation.navigate('Detail', { movieId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.historyImage} />
      <View style={styles.historyInfo}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>{item.title}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
        </View>
        
        <View style={styles.historyMeta}>
          <Text style={styles.historyDate}>{item.watchedAt}</Text>
          <Text style={styles.historyDuration}>{item.duration}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${item.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{item.progress}% watched</Text>
        </View>

        <TouchableOpacity style={styles.resumeButton}>
          <Icon name="play-arrow" size={16} color="#ffffff" />
          <Text style={styles.resumeText}>Resume</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: 'all' | 'movies' | 'shows', label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text style={[styles.filterButtonText, selectedFilter === filter && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="history" size={64} color="rgba(255, 255, 255, 0.3)" />
      <Text style={styles.emptyTitle}>No watch history yet</Text>
      <Text style={styles.emptySubtitle}>
        Start watching content to see your history here
      </Text>
    </View>
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
        <Text style={styles.headerTitle}>Watch History</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => Alert.alert('Clear History', 'Clear all watch history?')}
        >
          <Icon name="clear-all" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('movies', 'Movies')}
        {renderFilterButton('shows', 'TV Shows')}
      </View>

      {/* History List */}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.historyContainer}
        ListEmptyComponent={renderEmptyState}
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#ffffff',
  },
  filterButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: '#7d2537',
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  historyImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  historyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginRight: 12,
  },
  historyDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ed9b72',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  resumeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

export default HistoryScreen; 