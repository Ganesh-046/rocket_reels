import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import TrailerControls from '../components/TrailerControls';
import { useTrailerPlayer } from '../hooks/useTrailerPlayer';
import { Trailer } from '../types/trailer.types';

const { width, height } = Dimensions.get('window');

interface TrailerDetailScreenProps {
  navigation: any;
  route: {
    params: {
      trailer: Trailer;
    };
  };
}

const TrailerDetailScreen: React.FC<TrailerDetailScreenProps> = ({ navigation, route }) => {
  const { trailer } = route.params;
  const videoRef = useRef<Video>(null);
  
  const {
    playerState,
    initializePlayer,
    handlePlayPause,
    handleSeek,
    handleQualityChange,
    handleVideoLoad,
    handleVideoProgress,
    handleVideoError,
    handleVideoEnd,
    toggleControls,
    resetPlayer,
  } = useTrailerPlayer();

  // Initialize player when component mounts
  React.useEffect(() => {
    initializePlayer(trailer);
  }, [trailer, initializePlayer]);

  const handleBack = () => {
    resetPlayer();
    navigation.goBack();
  };

  const handleFullscreen = () => {
    // Implement fullscreen functionality
    console.log('Fullscreen pressed');
  };

  const getVideoSource = () => {
    const quality = playerState.quality === 'auto' ? '720p' : playerState.quality;
    return trailer.video_urls[quality] || trailer.video_urls.master;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: getVideoSource() }}
          style={styles.video}
          resizeMode="contain"
          paused={playerState.isPaused}
          onLoad={handleVideoLoad}
          onProgress={handleVideoProgress}
          onError={handleVideoError}
          onEnd={handleVideoEnd}
          repeat={false}
          controls={false}
          playInBackground={false}
          playWhenInactive={false}
        />
        
        <TouchableOpacity
          style={styles.tapArea}
          onPress={toggleControls}
          activeOpacity={1}
        />
        
        <TrailerControls
          isPlaying={playerState.isPlaying}
          isPaused={playerState.isPaused}
          currentTime={playerState.currentTime}
          duration={playerState.duration}
          showControls={playerState.showControls}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onQualityChange={() => handleQualityChange('720p')}
          onFullscreen={handleFullscreen}
          onBack={handleBack}
        />
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{trailer.title}</Text>
        {trailer.description && (
          <Text style={styles.description}>{trailer.description}</Text>
        )}
        
        <View style={styles.meta}>
          <Text style={styles.genre}>{trailer.genre}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.views}>{trailer.viewCount || 0} views</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.rating}>{trailer.rating || 0} ★</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: '100%',
    height: height * 0.4,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  infoContainer: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#cccccc',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genre: {
    color: '#ff4757',
    fontSize: 14,
    fontWeight: '600',
  },
  dot: {
    color: '#666',
    fontSize: 14,
    marginHorizontal: 8,
  },
  views: {
    color: '#999',
    fontSize: 14,
  },
  rating: {
    color: '#ffd700',
    fontSize: 14,
  },
});

export default TrailerDetailScreen; 