import React from 'react';
import { Text } from 'react-native';
import { PressableButton } from '../Button';

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

const GenreTab: React.FC<GenreTabProps> = React.memo(({ 
  item, 
  index, 
  isSelected, 
  setIsSelected, 
  setCurrentBannerIndex, 
  style, 
  colors, 
  appFonts, 
  isLargeDevice, 
  loadingStates 
}) => {
  const isActive = isSelected === item.slug;
  
  return (
    <PressableButton
      key={`genre-${item.slug}-${index}`}
      onPress={() => {
        if (isActive) return;
        setIsSelected(item.slug);
        setCurrentBannerIndex(0);
      }}
      style={[
        style.tabBarCard,
        {
          borderColor: isActive ? colors.PRIMARYWHITEFOUR : colors.TRANSPARENT,
          marginLeft: index === 0 ? 7 : 0,
          opacity: isActive ? 1 : 0.7
        }
      ]}
      disabled={loadingStates.content}
    >
      <Text
        style={[
          style.heading,
          {
            fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_35,
            color: isActive ? colors.PRIMARYWHITE : colors.PRIMARYWHITEFOUR
          }
        ]}
      >
        {item.name.toUpperCase()}
      </Text>
    </PressableButton>
  );
});

export default GenreTab; 