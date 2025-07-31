// ============================================================================
// TRAILER EMPTY MESSAGE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTrailerTheme } from '../hooks/useTrailerTheme';

// ============================================================================
// 🎨 TRAILER EMPTY MESSAGE TYPES
// ============================================================================

interface TrailerEmptyMessageProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
  mainContainer?: any;
  style?: any;
}

// ============================================================================
// 🎨 TRAILER EMPTY MESSAGE COMPONENT
// ============================================================================

const TrailerEmptyMessage: React.FC<TrailerEmptyMessageProps> = ({
  title,
  subtitle,
  icon = 'film-outline',
  onRetry,
  retryText = 'Try Again',
  mainContainer,
  style,
}) => {
  const { colors } = useTrailerTheme();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <View
      style={[
        styles.container,
        mainContainer || { height: screenHeight / 1.1 },
        style,
      ]}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.PRIMARYLIGHTBLACK }]}>
          <Icon
            name={icon}
            size={48}
            color={colors.PRIMARYWHITE}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.PRIMARYWHITE }]}>
          {title}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.PRIMARYGRAY || '#8E8E93' }]}>
            {subtitle}
          </Text>
        )}

        {/* Retry Button */}
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.PRIMARYBLUE || '#007AFF' }]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>
              {retryText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// 🎨 TRAILER EMPTY MESSAGE STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default TrailerEmptyMessage; 