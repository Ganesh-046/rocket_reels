import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

// Mock data for history
const mockHistoryData = [
  {
    id: '1',
    title: 'Amazing Adventure',
    thumbnail: 'https://picsum.photos/300/200?random=1',
    duration: '2:15:30',
    views: '1.2M',
    progress: 0.7,
  },
  {
    id: '2',
    title: 'Mystery Thriller',
    thumbnail: 'https://picsum.photos/300/200?random=2',
    duration: '1:45:20',
    views: '890K',
    progress: 0.3,
  },
  {
    id: '3',
    title: 'Comedy Special',
    thumbnail: 'https://picsum.photos/300/200?random=3',
    duration: '1:20:15',
    views: '2.1M',
    progress: 0.9,
  },
  {
    id: '4',
    title: 'Action Packed',
    thumbnail: 'https://picsum.photos/300/200?random=4',
    duration: '2:30:45',
    views: '1.5M',
    progress: 0.5,
  },
  {
    id: '5',
    title: 'Romantic Drama',
    thumbnail: 'https://picsum.photos/300/200?random=5',
    duration: '1:55:10',
    views: '750K',
    progress: 0.2,
  },
  {
    id: '6',
    title: 'Sci-Fi Adventure',
    thumbnail: 'https://picsum.photos/300/200?random=6',
    duration: '2:10:30',
    views: '1.8M',
    progress: 0.6,
  },
];

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const HistoryScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const renderHistoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => navigation.navigate('EpisodePlayer', { contentId: item.id })}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ 
            uri: item.imageUri || item.thumbnail || item.image || item.backdropImage || 'https://via.placeholder.com/400x600/ed9b72/ffffff?text=Profile+History' 
          }} 
          style={styles.thumbnail} 
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress * 100}%` }]} />
        </View>
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemViews}>{item.views} views</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={64} color="rgba(255, 255, 255, 0.6)" />
      <Text style={styles.emptyTitle}>No Watch History</Text>
      <Text style={styles.emptyMessage}>
        Start watching videos to see them appear here
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Watch History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <FlatList
        data={mockHistoryData}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyState}
        numColumns={isLargeDevice ? 2 : 1}
        columnWrapperStyle={isLargeDevice ? styles.row : undefined}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  historyItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    flex: isLargeDevice ? 0.48 : 1,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: isLargeDevice ? 120 : 180,
    resizeMode: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E9743A',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemViews: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HistoryScreen; 