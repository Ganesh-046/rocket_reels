import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loaderColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  loaderColor = '#ffffff',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          opacity: (disabled || loading) ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loaderColor} />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#7d2537',
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.03,
    paddingHorizontal: isLargeDevice ? width * 0.03 : width * 0.06,
    borderRadius: width * 0.01,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'System',
  },
}); 