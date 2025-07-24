import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// API Service
import apiService from '../../../services/api.service';
import { useAuthUser } from '../../../store/auth.store';

// Components
import ActivityLoader from '../../../components/common/ActivityLoader';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const HistoryScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  
  // State
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      getWatchHistory();
    }
  }, [user?._id]);

  // API Functions
  const getWatchHistory = async () => {
    try {
      setLoading(true);
      console.log('📺 Fetching watch history for:', user?._id);
      // Note: This might need to be adjusted based on your API structure
      // The current API might not have a direct watch history endpoint
      // You might need to get content list and filter by watched status
      const response = await apiService.getContentList({ 
        page: 1, 
        limit: 20,
        // Add any filters for watched content if available
      });
      console.log('📺 Watch history response:', response);
      
      if (response.status === 200 && response.data) {
        // Filter for watched content or use a different approach
        // This is a placeholder - adjust based on your API structure
        setHistoryData(response.data.result || []);
        console.log('✅ Watch history set:', response.data.result);
      } else {
        console.warn('⚠️ Watch history response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get watch history error:', error);
      Alert.alert('Error', 'Failed to load watch history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      {loading ? (
        <ActivityLoader />
      ) : (
        <FlatList
          data={historyData}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item._id || item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={EmptyState}
          numColumns={isLargeDevice ? 2 : 1}
          columnWrapperStyle={isLargeDevice ? styles.row : undefined}
        />
      )}
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