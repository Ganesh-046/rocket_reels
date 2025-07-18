import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import useTheme from '../../hooks/useTheme';

interface ActivityLoaderProps {
  size?: 'small' | 'large';
  color?: string;
}

const ActivityLoader: React.FC<ActivityLoaderProps> = ({ 
  size = 'small', 
  color 
}) => {
  const { theme } = useTheme();
  const defaultColor = color || theme.colors.primary;
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={defaultColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActivityLoader; 