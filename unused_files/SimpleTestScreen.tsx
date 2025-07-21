import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import SimpleVideoPlayer from '../../../components/VideoPlayer/SimpleVideoPlayer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

const SimpleTestScreen = ({ navigation }: { navigation: any }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);

  // Test episode data
  const testEpisodes = [
    {
      _id: "686fa33cacf6eb2deb05ebf1",
      title: "Test Episode 1",
      video_urls: {
        master: "hls1/686fa33cacf6eb2deb05ebf1/686f8966acf6eb2deb05ebbf/episode-1/master.m3u8"
      },
      thumbnail: "https://via.placeholder.com/400x600/ed9b72/ffffff?text=Episode+1",
      episodeNo: 1,
      description: "This is a test episode to verify HLS video playback"
    },
    {
      _id: "test-episode-2",
      title: "Test Episode 2 (MP4)",
      video_urls: {
        master: "https://www.w3schools.com/html/mov_bbb.mp4"
      },
      thumbnail: "https://via.placeholder.com/400x600/72ed9b/ffffff?text=Episode+2",
      episodeNo: 2,
      description: "This is a test MP4 video to verify regular video playback"
    }
  ];

  const currentEpisode = testEpisodes[currentEpisodeIndex];

  const nextEpisode = () => {
    const nextIndex = (currentEpisodeIndex + 1) % testEpisodes.length;
    setCurrentEpisodeIndex(nextIndex);
    setIsPlaying(true);
  };

  const prevEpisode = () => {
    const prevIndex = currentEpisodeIndex === 0 ? testEpisodes.length - 1 : currentEpisodeIndex - 1;
    setCurrentEpisodeIndex(prevIndex);
    setIsPlaying(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Simple Video Test</Text>
        <Text style={styles.headerSubtitle}>
          Episode {currentEpisodeIndex + 1} of {testEpisodes.length}
        </Text>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <SimpleVideoPlayer
          episode={currentEpisode}
          isPlaying={isPlaying}
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
        <Text style={styles.episodeTitle}>{currentEpisode.title}</Text>
        <Text style={styles.episodeDescription}>{currentEpisode.description}</Text>
        <Text style={styles.episodeUrl}>
          URL: {currentEpisode.video_urls.master}
        </Text>
        <Text style={styles.episodeId}>
          ID: {currentEpisode._id}
        </Text>
      </ScrollView>

      {/* Test Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Test Instructions:</Text>
        <Text style={styles.instructionText}>
          • Episode 1: HLS video (should work with proper headers){'\n'}
          • Episode 2: MP4 video (should work normally){'\n'}
          • Check console logs for detailed debugging{'\n'}
          • Use controls to test play/pause and navigation{'\n'}
          • This is a simplified version without re-rendering issues
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
});

export default SimpleTestScreen; 