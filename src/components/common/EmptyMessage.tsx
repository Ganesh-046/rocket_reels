import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useTheme from '../../hooks/useTheme';

interface EmptyMessageProps {
  title: string;
  subtitle?: string;
  mainContainer?: any;
  onRetry?: () => void;
}

const EmptyMessage: React.FC<EmptyMessageProps> = ({ 
  title, 
  subtitle, 
  mainContainer, 
  onRetry 
}) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, mainContainer]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default EmptyMessage; 