import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../theme';

interface GenreTabProps {
  item: any;
  index: number;
  isSelected: string;
  setIsSelected: (genre: string) => void;
  setCurrentBannerIndex: (index: number) => void;
  style: any;
  colors: any;
  appFonts: any;
  isLargeDevice: boolean;
  loadingStates: any;
  navigation: any;
}

const GenreTab: React.FC<GenreTabProps> = ({
  item,
  index,
  isSelected,
  setIsSelected,
  setCurrentBannerIndex,
  style,
  colors,
  appFonts,
  isLargeDevice,
  loadingStates,
  navigation,
}) => {
  const isActive = isSelected === item.slug || isSelected === item.name;

  const handlePress = () => {
    setIsSelected(item.slug || item.name);
    setCurrentBannerIndex(0);
  };

  return (
    <TouchableOpacity
      style={[style.tabBarCard, isActive && { borderColor: colors.PRIMARYWHITE }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          style.txt,
          isActive && { color: colors.PRIMARYWHITE, fontWeight: 'bold' },
        ]}
        numberOfLines={1}
      >
        {item.name || item.slug || ''}
      </Text>
    </TouchableOpacity>
  );
};

export default GenreTab; 