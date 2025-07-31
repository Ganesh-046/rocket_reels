import React from 'react';
import { View, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface LinearGradientViewProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  colors: string[];
  style?: ViewStyle;
  children: React.ReactNode;
}

const LinearGradientView: React.FC<LinearGradientViewProps> = ({
  start,
  end,
  colors,
  style,
  children,
}) => {
  return (
    <LinearGradient
      start={start}
      end={end}
      colors={colors}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
};

export default LinearGradientView; 