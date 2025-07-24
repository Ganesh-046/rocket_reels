import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Dimensions, TouchableOpacity, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Hooks and context
import { useTheme } from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';

// Components
import ActivityLoader from '../../../components/common/ActivityLoader';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      title: string;
    };
  };
}

// Mock unlocked episodes data - replace with actual API data
const mockUnlockedEpisodesData = [
  {
    _id: '1',
    title: 'Episode 1: The Beginning',
    seriesName: 'Mystery Series',
    thumbnail: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Episode+1',
    duration: '45:30',
    unlockDate: '2024-01-15T10:30:00Z',
    isWatched: false,
    seriesId: 'series1'
  },
  {
    _id: '2',
    title: 'Episode 2: The Plot Thickens',
    seriesName: 'Mystery Series',
    thumbnail: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Episode+2',
    duration: '52:15',
    unlockDate: '2024-01-14T15:45:00Z',
    isWatched: true,
    seriesId: 'series1'
  },
  {
    _id: '3',
    title: 'Episode 1: New Beginnings',
    seriesName: 'Adventure Series',
    thumbnail: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Adventure+1',
    duration: '38:20',
    unlockDate: '2024-01-13T09:20:00Z',
    isWatched: false,
    seriesId: 'series2'
  },
  {
    _id: '4',
    title: 'Episode 3: The Revelation',
    seriesName: 'Mystery Series',
    thumbnail: 'https://via.placeholder.com/300x200/96CEB4/FFFFFF?text=Episode+3',
    duration: '48:45',
    unlockDate: '2024-01-12T14:15:00Z',
    isWatched: false,
    seriesId: 'series1'
  },
  {
    _id: '5',
    title: 'Episode 2: The Journey Continues',
    seriesName: 'Adventure Series',
    thumbnail: 'https://via.placeholder.com/300x200/FFEAA7/000000?text=Adventure+2',
    duration: '41:10',
    unlockDate: '2024-01-11T11:00:00Z',
    isWatched: true,
    seriesId: 'series2'
  }
];

const EpisodeUnlockedScreen: React.FC<NavigationProps> = ({ navigation, route }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  
  // State
  const [loading, setLoading] = useState(false);
  const [unlockedEpisodesData, setUnlockedEpisodesData] = useState(mockUnlockedEpisodesData);

  useEffect(() => {
    // Simulate loading unlocked episodes data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderEpisodeCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        style={style.episodeCard}
        onPress={() => {
          // Navigate to episode player
          navigation.navigate('EpisodePlayer', {
            contentId: item.seriesId,
            contentName: item.seriesName,
            episodes: unlockedEpisodesData,
            initialIndex: index
          });
        }}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={style.cardGradient}
        >
          <View style={style.thumbnailContainer}>
            <Image 
              source={{ uri: item.thumbnail }} 
              style={style.thumbnail}
              resizeMode="cover"
            />
            <View style={style.overlay}>
              <View style={style.durationBadge}>
                <Icon name="access-time" size={12} color="#ffffff" />
                <Text style={style.durationText}>{item.duration}</Text>
              </View>
              {item.isWatched && (
                <View style={style.watchedBadge}>
                  <Icon name="check-circle" size={16} color="#4CAF50" />
                </View>
              )}
            </View>
          </View>
          
          <View style={style.cardContent}>
            <Text style={style.seriesName} numberOfLines={1}>
              {item.seriesName}
            </Text>
            <Text style={style.episodeTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={style.unlockInfo}>
              <Icon name="lock-open" size={14} color="rgba(255, 255, 255, 0.7)" />
              <Text style={style.unlockDate}>
                Unlocked on {formatDate(item.unlockDate)}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>{route.params.title}</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={style.emptyContainer}>
      <Icon name="lock-open" size={80} color="rgba(255, 255, 255, 0.5)" />
      <Text style={style.emptyTitle}>No {route.params.title} found</Text>
      <Text style={style.emptySubtitle}>
        You haven't unlocked any episodes yet. Start watching to unlock more content!
      </Text>
    </View>
  );

  const renderStats = () => (
    <View style={style.statsContainer}>
      <View style={style.statCard}>
        <Text style={style.statNumber}>
          {unlockedEpisodesData.length}
        </Text>
        <Text style={style.statLabel}>Total Episodes</Text>
      </View>
      <View style={style.statCard}>
        <Text style={style.statNumber}>
          {unlockedEpisodesData.filter(ep => ep.isWatched).length}
        </Text>
        <Text style={style.statLabel}>Watched</Text>
      </View>
      <View style={style.statCard}>
        <Text style={style.statNumber}>
          {unlockedEpisodesData.filter(ep => !ep.isWatched).length}
        </Text>
        <Text style={style.statLabel}>Unwatched</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }} 
      colors={['#ed9b72', '#7d2537']}
      style={[style.container, { paddingTop: insets.top }]}
    >
      {renderHeader()}
      
      {loading ? (
        <View style={style.loadingContainer}>
          <ActivityLoader loaderColor={colors.PRIMARYWHITE} />
        </View>
      ) : (
        <>
          {renderStats()}
          <FlatList
            data={unlockedEpisodesData}
            renderItem={renderEpisodeCard}
            ListEmptyComponent={renderEmptyComponent}
            keyExtractor={(item, index) => item._id.toString() || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={style.listContainer}
          />
        </>
      )}
    </LinearGradient>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.TRANSPARENT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  backButton: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
    height: isLargeDevice ? width * 0.08 : width * 0.12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  headerSpacer: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    marginHorizontal: isLargeDevice ? width * 0.005 : width * 0.01,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  episodeCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.02,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardGradient: {
    flexDirection: 'row',
  },
  thumbnailContainer: {
    width: isLargeDevice ? width * 0.25 : width * 0.35,
    height: isLargeDevice ? width * 0.15 : width * 0.25,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  durationText: {
    fontSize: isLargeDevice ? 10 : 11,
    color: '#ffffff',
    marginLeft: 2,
  },
  watchedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 2,
    alignSelf: 'flex-end',
  },
  cardContent: {
    flex: 1,
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    justifyContent: 'space-between',
  },
  seriesName: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  episodeTitle: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
    lineHeight: isLargeDevice ? 18 : 20,
  },
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockDate: {
    fontSize: isLargeDevice ? 10 : 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isLargeDevice ? width * 0.04 : width * 0.08,
    minHeight: height * 0.6,
  },
  emptyTitle: {
    fontSize: isLargeDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: isLargeDevice ? width * 0.02 : width * 0.04,
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  emptySubtitle: {
    fontSize: isLargeDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: isLargeDevice ? 20 : 24,
  },
});

export default EpisodeUnlockedScreen; 