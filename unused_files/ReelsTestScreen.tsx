import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import WorkingHLSVideoPlayer from '../../../components/VideoPlayer/WorkingHLSVideoPlayer';
import { useEpisodes } from '../../../hooks/useEpisodes';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const ReelsTestScreen = ({ navigation }: { navigation: any }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  
  // Use your actual episodes data
  const { episodes: episodesData } = useEpisodes('your-content-id');

  const episodes = episodesData || [];

  const currentEpisode = episodes[currentEpisodeIndex];

  const handleLoad = (data: any) => {
    console.log('✅ ReelsTestScreen - Video Loaded Successfully!', {
      episodeId: currentEpisode?._id,
      duration: data.duration,
      naturalSize: data.naturalSize,
    });
    Alert.alert('Success', 'Video loaded successfully!');
  };

  const handleProgress = (data: any) => {
    console.log('📊 ReelsTestScreen - Progress:', {
      episodeId: currentEpisode?._id,
      currentTime: data.currentTime,
      playableDuration: data.playableDuration,
    });
  };

  const handleEnd = () => {
    console.log('🏁 ReelsTestScreen - Video Ended:', {
      episodeId: currentEpisode?._id,
    });
    Alert.alert('Video Ended', 'Video playback completed!');
  };

  const handleError = (error: any) => {
    console.error('❌ ReelsTestScreen - Video Error:', {
      episodeId: currentEpisode?._id,
      error: error.error,
      errorString: error.errorString,
    });
    Alert.alert('Error', `Video error: ${error.errorString}`);
  };

  const handleReadyForDisplay = () => {
    console.log('🎬 ReelsTestScreen - Video Ready for Display:', {
      episodeId: currentEpisode?._id,
    });
  };

  const handleBuffer = (data: any) => {
    console.log('🔄 ReelsTestScreen - Buffer:', {
      episodeId: currentEpisode?._id,
      isBuffering: data.isBuffering,
    });
  };

  const nextEpisode = () => {
    if (episodes.length > 0) {
      const nextIndex = (currentEpisodeIndex + 1) % episodes.length;
      setCurrentEpisodeIndex(nextIndex);
      setIsPlaying(true);
    }
  };

  const prevEpisode = () => {
    if (episodes.length > 0) {
      const prevIndex = currentEpisodeIndex === 0 ? episodes.length - 1 : currentEpisodeIndex - 1;
      setCurrentEpisodeIndex(prevIndex);
      setIsPlaying(true);
    }
  };

  if (!episodes || episodes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No episodes available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (episodes.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No episodes available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>HLS Video Test</Text>
        <Text style={styles.headerSubtitle}>
          Episode {currentEpisodeIndex + 1} of {episodes.length}
        </Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <WorkingHLSVideoPlayer
          episode={currentEpisode}
          isPlaying={isPlaying}
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
          onError={handleError}
          onReadyForDisplay={handleReadyForDisplay}
          onBuffer={handleBuffer}
          style={styles.videoPlayer}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={prevEpisode}>
          <Text style={styles.controlButtonText}>⏮️ Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton]} 
          onPress={() => setIsPlaying(!isPlaying)}
        >
          <Text style={styles.controlButtonText}>
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={nextEpisode}>
          <Text style={styles.controlButtonText}>Next ⏭️</Text>
        </TouchableOpacity>
      </View>

      {/* Episode Info */}
      <ScrollView style={styles.episodeInfo}>
        <Text style={styles.episodeTitle}>
          {currentEpisode?.title || `Episode ${currentEpisode?.episodeNo || currentEpisodeIndex + 1}`}
        </Text>
        <Text style={styles.episodeDescription}>
          {currentEpisode?.description || 'No description available'}
        </Text>
        <Text style={styles.episodeUrl}>
          URL: {currentEpisode?.video_urls?.master || 'No URL'}
        </Text>
        <Text style={styles.episodeId}>
          ID: {currentEpisode?._id || 'No ID'}
        </Text>
      </ScrollView>

      {/* Test Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Test Instructions:</Text>
        <Text style={styles.instructionText}>
          • Check console logs for detailed debugging{'\n'}
          • Use controls to test play/pause and navigation{'\n'}
          • Debug overlay shows video state in development{'\n'}
          • Alerts will show when video loads/ends/errors{'\n'}
          • This uses your actual episode data from the API
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 10,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cccccc',
    marginTop: 4,
  },
  videoContainer: {
    width: screenWidth,
    height: screenWidth * 9 / 16, // 16:9 aspect ratio
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playButton: {
    backgroundColor: '#ed9b72',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  episodeInfo: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  episodeDescription: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  episodeUrl: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  episodeId: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'monospace',
  },
  instructions: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#ed9b72',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReelsTestScreen; 