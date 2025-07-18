import React from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';

interface PressableButtonProps extends PressableProps {
  children: React.ReactNode;
  style?: any;
}

export const PressableButton: React.FC<PressableButtonProps> = ({ 
  children, 
  style, 
  ...props 
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        style,
        pressed && styles.pressed
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    // Default button styles
  },
  pressed: {
    opacity: 0.7,
  },
});
