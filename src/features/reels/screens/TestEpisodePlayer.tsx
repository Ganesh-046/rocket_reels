import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useEpisodes } from '../../../hooks/useEpisodes';
import ActivityLoader from '../../../components/common/ActivityLoader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TestEpisodePlayerProps {
  navigation: any;
  route: {
    params: {
      contentId: string;
      contentName: string;
      episodes: any[];
      initialIndex?: number;
    };
  };
}

const TestEpisodePlayer: React.FC<TestEpisodePlayerProps> = ({ navigation, route }) => {
  const { contentId, contentName, episodes: initialEpisodes, initialIndex = 0 } = route.params;

  console.log('🧪 TestEpisodePlayer - Navigation Params:', {
    contentId,
    contentName,
    initialEpisodesCount: initialEpisodes?.length || 0,
    initialIndex
  });

  // Use episodes hook for API integration
  const {
    episodes: episodesData,
    contentInfo,
    contentLoading,
    contentError,
    refetchContent,
  } = useEpisodes(contentId);

  console.log('🧪 TestEpisodePlayer - API Data Status:', {
    contentId,
    episodesCount: episodesData?.length || 0,
    contentLoading,
    contentError: contentError?.message,
  });

  // Loading state
  if (contentLoading) {
    return (
      <View style={styles.container}>
        <ActivityLoader />
      </View>
    );
  }

  // Error state
  if (contentError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error loading episodes</Text>
          <Text style={styles.errorMessage}>{contentError.message || "Please try again"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchContent()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state
  if (!episodesData || episodesData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No episodes available</Text>
          <Text style={styles.emptyMessage}>This content doesn't have any episodes yet</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetchContent()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{contentName || 'Episodes'}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Episodes Data:</Text>
        <Text style={styles.dataText}>Content ID: {contentId}</Text>
        <Text style={styles.dataText}>Total Episodes: {episodesData.length}</Text>
        <Text style={styles.dataText}>Initial Index: {initialIndex}</Text>
        
        <Text style={styles.sectionTitle}>Episodes List:</Text>
        {episodesData.map((episode: any, index: number) => (
          <View key={episode._id} style={styles.episodeItem}>
            <Text style={styles.episodeTitle}>
              Episode {episode.episodeNo || index + 1}
            </Text>
            <Text style={styles.episodeId}>ID: {episode._id}</Text>
            <Text style={styles.episodeStatus}>Status: {episode.status}</Text>
            <Text style={styles.episodeVideo}>
              Video URL: {episode.video_urls?.master ? 'Present' : 'Missing'}
            </Text>
            <Text style={styles.episodeThumbnail}>
              Thumbnail: {episode.thumbnail ? 'Present' : 'Missing'}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Content Info:</Text>
        {contentInfo ? (
          <View style={styles.contentInfo}>
            <Text style={styles.dataText}>Title: {contentInfo.title}</Text>
            <Text style={styles.dataText}>Genre: {contentInfo.genre}</Text>
            <Text style={styles.dataText}>Language: {contentInfo.language}</Text>
          </View>
        ) : (
          <Text style={styles.dataText}>No content info available</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  dataText: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
  episodeItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  episodeTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  episodeId: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 3,
  },
  episodeStatus: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 3,
  },
  episodeVideo: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 3,
  },
  episodeThumbnail: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 3,
  },
  contentInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorMessage: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptyMessage: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestEpisodePlayer; 