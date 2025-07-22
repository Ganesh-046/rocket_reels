import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

const { spacing } = theme;

export interface ContainerProps {
  children: React.ReactNode;
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  maxWidth?: number;
  center?: boolean;
  style?: ViewStyle;
}

const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'medium',
  margin = 'none',
  maxWidth,
  center = false,
  style,
}) => {
  const containerStyle = [
    styles.container,
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles],
    styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}` as keyof typeof styles],
    center && styles.center,
    maxWidth ? { maxWidth } : undefined,
    style,
  ].filter(Boolean);

  return <View style={containerStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: spacing.sm,
  },
  paddingMedium: {
    padding: spacing.md,
  },
  paddingLarge: {
    padding: spacing.lg,
  },
  marginNone: {
    margin: 0,
  },
  marginSmall: {
    margin: spacing.sm,
  },
  marginMedium: {
    margin: spacing.md,
  },
  marginLarge: {
    margin: spacing.lg,
  },
  center: {
    alignSelf: 'center',
  },
});

export default Container; 