// ============================================================================
// TRAILER ACTIVITY LOADER - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface TrailerActivityLoaderProps {
  container?: ViewStyle;
  loaderColor?: string;
}

const TrailerActivityLoader: React.FC<TrailerActivityLoaderProps> = ({
  container,
  loaderColor = '#7d2537',
}) => {
  return (
    <View style={[styles.container, container]}>
      <ActivityIndicator size="large" color={loaderColor} />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default TrailerActivityLoader; 