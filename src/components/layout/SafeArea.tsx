import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

const { colors } = theme;

export interface SafeAreaProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
  style?: ViewStyle;
}

const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = colors.background,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const safeAreaStyle: ViewStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
    backgroundColor,
  };

  return (
    <View style={[styles.container, safeAreaStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeArea; 