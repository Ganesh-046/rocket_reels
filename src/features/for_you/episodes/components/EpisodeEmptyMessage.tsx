// ============================================================================
// EPISODE EMPTY MESSAGE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface EpisodeEmptyMessageProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
  mainContainer?: ViewStyle;
}

const EpisodeEmptyMessage: React.FC<EpisodeEmptyMessageProps> = ({
  title = 'No episodes available',
  subtitle = 'Try refreshing or check back later',
  icon = 'film-outline',
  onRetry,
  retryText = 'Retry',
  mainContainer,
}) => {
  return (
    <View style={[styles.container, mainContainer]}>
      <View style={styles.content}>
        <Icon name={icon} size={64} color="#666666" style={styles.icon} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#7d2537',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EpisodeEmptyMessage; 