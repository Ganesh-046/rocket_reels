import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../../theme';

const { colors, spacing, borderRadius } = theme;

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'medium',
  margin = 'none',
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles],
    styles[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}` as keyof typeof styles],
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
  },
  elevated: {
    backgroundColor: colors.backgroundSecondary,
    shadowColor: colors.background,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filled: {
    backgroundColor: colors.backgroundSecondary,
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
});

export default Card; 