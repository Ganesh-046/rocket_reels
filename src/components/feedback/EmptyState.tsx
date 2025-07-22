import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

const { colors, spacing, typography } = theme;

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  containerStyle,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      {description && (
        <Text style={[styles.description, descriptionStyle]}>
          {description}
        </Text>
      )}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight as any,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight as any,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
});

export default EmptyState; 