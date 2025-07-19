import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';

const { width, height } = Dimensions.get('window');

const VideoPlayer: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { contentId, episodeId } = route.params;
  
  const videoRef = useRef<Video>(null);
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Dummy video URL - replace with actual video URL from API
  const videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const togglePlayPause = () => {
    setPaused(!paused);
    setShowControls(true);
  };

  const onLoad = (data: any) => {
    setDuration(data.duration);
    setLoading(false);
  };

  const onProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const onError = () => {
    setError(true);
    setLoading(false);
    Alert.alert('Error', 'Failed to load video. Please try again.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekTo = (time: number) => {
    videoRef.current?.seek(time);
  };

  const handleBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    seekTo(newTime);
  };

  const handleForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    seekTo(newTime);
  };

  const renderControls = () => {
    if (!showControls) return null;

    return (
      <View style={styles.controlsContainer}>
        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.topRightControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => Alert.alert('Quality', 'Select video quality')}
            >
              <Icon name="settings" size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => Alert.alert('More', 'More options')}
            >
              <Icon name="more-vert" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Center Play/Pause Button */}
        <TouchableOpacity
          style={styles.centerPlayButton}
          onPress={togglePlayPause}
        >
          <Icon 
            name={paused ? 'play-arrow' : 'pause'} 
            size={48} 
            color="#ffffff" 
          />
        </TouchableOpacity>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentTime / duration) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleBackward}
            >
              <Icon name="replay-10" size={24} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={togglePlayPause}
            >
              <Icon 
                name={paused ? 'play-arrow' : 'pause'} 
                size={32} 
                color="#ffffff" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleForward}
            >
              <Icon name="forward-10" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderLoadingOverlay = () => {
    if (!loading) return null;

    return (
      <View style={styles.loadingOverlay}>
        <Icon name="hourglass-empty" size={48} color="#ffffff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  };

  const renderErrorOverlay = () => {
    if (!error) return null;

    return (
      <View style={styles.errorOverlay}>
        <Icon name="error" size={48} color="#ff4757" />
        <Text style={styles.errorText}>Failed to load video</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(false);
            setLoading(true);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        paused={paused}
        onLoad={onLoad}
        onProgress={onProgress}
        onError={onError}
        resizeMode="contain"
        controls={false}
        onTouch={() => setShowControls(!showControls)}
      />

      {/* Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        style={styles.overlay}
      >
        {renderControls()}
        {renderLoadingOverlay()}
        {renderErrorOverlay()}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  topRightControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  centerPlayButton: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#ffffff',
    width: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ed9b72',
    borderRadius: 2,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
  },
  errorOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#ed9b72',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default VideoPlayer; 