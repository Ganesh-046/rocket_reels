import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TrailerControlsProps } from '../types/trailer.types';

const { width } = Dimensions.get('window');

const TrailerControls: React.FC<TrailerControlsProps> = ({
  isPlaying,
  isPaused,
  currentTime,
  duration,
  showControls,
  onPlayPause,
  onSeek,
  onQualityChange,
  onFullscreen,
  onBack,
  style,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (percentage: number) => {
    const newTime = (percentage / 100) * duration;
    onSeek(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!showControls) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View style={styles.rightControls}>
          <TouchableOpacity style={styles.controlButton} onPress={onQualityChange}>
            <Icon name="settings" size={20} color="#ffffff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={onFullscreen}>
            <Icon name="expand" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Center Play/Pause Button */}
      <View style={styles.centerControls}>
        <TouchableOpacity style={styles.playPauseButton} onPress={onPlayPause}>
          <Icon
            name={isPaused ? 'play' : 'pause'}
            size={32}
            color="#ffffff"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <TouchableOpacity
            style={[styles.progressThumb, { left: `${progress}%` }]}
            onPress={() => handleSeek(progress)}
          />
        </View>
        
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  centerControls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 40,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 15,
    position: 'relative',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff4757',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: '#ff4757',
    borderRadius: 6,
    transform: [{ translateX: -6 }],
  },
});

export default TrailerControls; 