import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface VideoProgressBarProps {
  progress: number;
  duration: number;
  isVisible: boolean;
  isPlaying: boolean;
  isBuffering?: boolean;
}

const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  progress,
  duration,
  isVisible,
  isPlaying,
  isBuffering = false,
}) => {
  // Calculate progress percentage with error handling
  const progressPercentage = useMemo(() => {
    if (!duration || duration <= 0 || !progress || progress < 0) return 0;
    if (progress > 100) return 100;
    return progress;
  }, [progress, duration]);



  // Animated progress bar style with smooth transitions
  const progressBarStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressPercentage,
      [0, 100],
      [0, screenWidth - 32], // Account for left and right margins
      Extrapolate.CLAMP
    );

    return {
      width: withSpring(width, {
        damping: 15,
        stiffness: 100,
        mass: 0.5,
      }),
    };
  }, [progressPercentage]);

  // Container opacity based on visibility
  const containerStyle = useAnimatedStyle(() => {
    const opacity = isVisible ? 1 : 0;
    return {
      opacity: withTiming(opacity, { duration: 300 }),
      transform: [
        {
          translateY: withSpring(isVisible ? 0 : -10, {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  }, [isVisible]);

  // Buffering indicator style
  const bufferingStyle = useAnimatedStyle(() => {
    const opacity = isBuffering ? 0.6 : 0;
    return {
      opacity: withTiming(opacity, { duration: 200 }),
    };
  }, [isBuffering]);

  // Don't render if not visible or invalid duration
  if (!isVisible || !duration || duration <= 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Background track */}
      <View style={styles.progressBarBackground}>
        {/* Progress fill */}
        <Animated.View style={[styles.progressBarFill, progressBarStyle]} />
        
        {/* Buffering indicator */}
        {isBuffering && (
          <Animated.View style={[styles.bufferingIndicator, bufferingStyle]} />
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 2, // Increased height for better visibility
    marginTop: 8, // Space above the progress bar
    zIndex: 99999, // Maximum z-index to stay above everything
    elevation: 99999, // Maximum Android elevation
    backgroundColor: 'transparent', // Remove debug background
    // Ensure it's above all other elements
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 99999,
      },
    }),
  },
  progressBarBackground: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Increased opacity for better visibility
    // borderRadius: 3,
    // borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', // Added border for better definition
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ED9B72',
    // borderRadius: 3,
    // shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  bufferingIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 3,
  },
});

export default VideoProgressBar; 