import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useContentDetails, useSeasonContent } from '../hooks/useContent';
import { useAuthState } from '../store/auth.store';

const { width, height } = Dimensions.get('window');

// Dummy episodes data
const dummyEpisodes = [
  { id: '1', title: 'Episode 1: The Beginning', duration: '45 min', image: 'https://via.placeholder.com/300x200/ed9b72/ffffff?text=EP1' },
  { id: '2', title: 'Episode 2: The Journey', duration: '42 min', image: 'https://via.placeholder.com/300x200/7d2537/ffffff?text=EP2' },
  { id: '3', title: 'Episode 3: The Discovery', duration: '48 min', image: 'https://via.placeholder.com/300x200/ed9b72/ffffff?text=EP3' },
  { id: '4', title: 'Episode 4: The Challenge', duration: '44 min', image: 'https://via.placeholder.com/300x200/7d2537/ffffff?text=EP4' },
];

const DetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { movieId } = route.params;
  const { user } = useAuthState();

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // API hooks
  const { data: contentData, isLoading, error, refetch } = useContentDetails(movieId);
  const { data: seasonData, isLoading: seasonLoading } = useSeasonContent(movieId, selectedSeason);

  const content = contentData?.data;
  const episodes = seasonData?.data || dummyEpisodes;

  // Navigation handlers with authentication checks
  const handleWatchPress = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to watch this content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => navigation.navigate('AuthStack')
          },
        ]
      );
      return;
    }

    // Navigate to video player
    navigation.navigate('VideoPlayer', { contentId: movieId });
  };

  const handleEpisodePress = (episodeId: string) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to watch this episode.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => navigation.navigate('AuthStack')
          },
        ]
      );
      return;
    }

    // Navigate to video player with episode
    navigation.navigate('VideoPlayer', { contentId: movieId, episodeId });
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to add content to your watchlist.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => navigation.navigate('AuthStack')
          },
        ]
      );
      return;
    }

    try {
      // Simulate API call
      setIsInWatchlist(!isInWatchlist);
      Alert.alert('Success', isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
    } catch (error) {
      Alert.alert('Error', 'Failed to update watchlist');
    }
  };

  const handleLikePress = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to like content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sign In', 
            onPress: () => navigation.navigate('AuthStack')
          },
        ]
      );
      return;
    }

    try {
      // Simulate API call
      setIsLiked(!isLiked);
      Alert.alert('Success', isLiked ? 'Removed from likes' : 'Added to likes');
    } catch (error) {
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleSharePress = () => {
    // Share functionality
    Alert.alert('Share', 'Share functionality would be implemented here');
  };

  const handleCastPress = (castId: string) => {
    // Navigate to cast details
    navigation.navigate('WebView', {
      url: `https://example.com/cast/${castId}`,
      title: 'Cast Details'
    });
  };

  const renderEpisode = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.episodeCard}
      onPress={() => handleEpisodePress(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.episodeImage} />
      <View style={styles.episodeInfo}>
        <Text style={styles.episodeTitle}>{item.title}</Text>
        <Text style={styles.episodeDuration}>{item.duration}</Text>
      </View>
      <Icon name="play-circle-outline" size={24} color="#ffffff" />
    </TouchableOpacity>
  );

  const renderCastMember = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.castCard}
      onPress={() => handleCastPress(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.castImage} />
      <Text style={styles.castName}>{item.name}</Text>
      <Text style={styles.castRole}>{item.role}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ed9b72" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !content) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error" size={64} color="#ff4757" />
        <Text style={styles.errorTitle}>Failed to load content</Text>
        <Text style={styles.errorSubtitle}>Please try again later</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerSection}>
          <Image source={{ uri: content.image || 'https://via.placeholder.com/400x600/ed9b72/ffffff?text=Movie+Poster' }} style={styles.headerImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.headerOverlay}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleSharePress}
            >
              <Icon name="share" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLikePress}
            >
              <Icon 
                name={isLiked ? 'favorite' : 'favorite-border'} 
                size={24} 
                color={isLiked ? '#ff4757' : '#ffffff'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Info */}
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle}>{content.title}</Text>
          <View style={styles.contentMeta}>
            <Text style={styles.contentYear}>{content.year}</Text>
            <Text style={styles.contentDuration}>{content.duration}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.rating}>{content.rating}</Text>
            </View>
          </View>
          <Text style={styles.contentDescription}>{content.description}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.watchButton}
            onPress={handleWatchPress}
          >
            <Icon name="play-arrow" size={24} color="#ffffff" />
            <Text style={styles.watchButtonText}>Watch Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={handleAddToWatchlist}
          >
            <Icon 
              name={isInWatchlist ? 'check' : 'add'} 
              size={24} 
              color="#ffffff" 
            />
            <Text style={styles.watchlistButtonText}>
              {isInWatchlist ? 'In Watchlist' : 'Add to List'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Episodes Section (for TV Shows) */}
        {content.type === 'series' && (
          <View style={styles.episodesSection}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            <FlatList
              data={episodes}
              renderItem={renderEpisode}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Cast Section */}
        <View style={styles.castSection}>
          <Text style={styles.sectionTitle}>Cast</Text>
          <FlatList
            data={content.cast || []}
            renderItem={renderCastMember}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.castList}
          />
        </View>

        {/* Related Content */}
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>You May Also Like</Text>
          <FlatList
            data={content.related || []}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.relatedCard}
                onPress={() => navigation.navigate('Detail', { movieId: item.id })}
              >
                <Image source={{ uri: item.image }} style={styles.relatedImage} />
                <Text style={styles.relatedTitle}>{item.title}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ed9b72',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ed9b72',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerSection: {
    position: 'relative',
    height: 300,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  contentYear: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  contentDuration: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
  },
  contentDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
  mainActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  watchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ed9b72',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  watchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  watchlistButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  episodesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  episodeImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  episodeInfo: {
    flex: 1,
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  episodeDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  castSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  castList: {
    paddingRight: 20,
  },
  castCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 16,
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 2,
  },
  castRole: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  relatedSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  relatedList: {
    paddingRight: 20,
  },
  relatedCard: {
    width: 120,
    marginRight: 16,
  },
  relatedImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default DetailScreen; 