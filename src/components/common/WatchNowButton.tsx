import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgIcons } from './SvgIcons';
import { dummyEpisodeReelsData } from '../../utils/dummyData';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface WatchNowButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  contentId?: string;
  contentName?: string;
  episodes?: any[];
}

const WatchNowButton: React.FC<WatchNowButtonProps> = ({ 
  onPress, 
  disabled = false, 
  size = 'medium',
  contentId,
  contentName,
  episodes
}) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    // Default navigation to episode player with dummy data
    if (contentId && contentName) {
      const episodeData = episodes || dummyEpisodeReelsData(contentId, contentName).slice(0, 20);
      navigation.navigate('EpisodePlayer', {
        contentId,
        contentName,
        episodes: episodeData,
        initialIndex: 0,
      });
    }
  };

  const buttonStyle = [
    styles.button,
    styles[size],
    disabled && styles.disabled
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    disabled && styles.disabledText
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <SvgIcons name="play" size={getIconSize(size)} color="#ffffff" />
      <Text style={textStyle}>Watch Now</Text>
    </TouchableOpacity>
  );
};

const getIconSize = (size: string) => {
  switch (size) {
    case 'small': return 16;
    case 'large': return 24;
    default: return 20;
  }
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED9B72',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  disabled: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  text: {
    color: '#ffffff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  disabledText: {
    color: '#cccccc',
  },
});

export default WatchNowButton; 