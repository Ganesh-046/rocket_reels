import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SvgIconsProps {
  name: string;
  size: number;
  color: string;
}

export const SvgIcons: React.FC<SvgIconsProps> = ({ name, size, color }) => {
  // Map icon names to MaterialIcons names
  const iconMap: { [key: string]: string } = {
    search: 'search',
    home: 'home',
    trending: 'trending-up',
    person: 'person',
    add: 'add',
    play: 'play-arrow',
    pause: 'pause',
    volume: 'volume-up',
    volumeOff: 'volume-off',
    fullscreen: 'fullscreen',
    close: 'close',
    heart: 'favorite',
    'heart-filled': 'favorite',
    heartOutline: 'favorite-border',
    share: 'share',
    comment: 'comment',
    bookmark: 'bookmark',
    bookmarkBorder: 'bookmark-border',
    more: 'more-vert',
    arrowBack: 'arrow-back',
    arrowForward: 'arrow-forward',
    star: 'star',
    starBorder: 'star-border',
    time: 'access-time',
    eye: 'visibility',
    eyeOff: 'visibility-off',
    download: 'download',
    settings: 'settings',
    notifications: 'notifications',
    notificationsOff: 'notifications-off',
  };

  // Special icons for rewards
  const specialIcons: { [key: string]: string } = {
    coin: '🪙',
    'right-check': '✅',
    unlimited: '∞',
    hd: 'HD',
    'daily-reward': '🎁',
    'ads-free': '🚫📺',
    'member-only': '👑',
  };

  // Check if it's a special icon
  if (specialIcons[name]) {
    return (
      <View>
        <Text style={{ fontSize: size, color, fontWeight: name === 'hd' ? 'bold' : 'normal' }}>
          {specialIcons[name]}
        </Text>
      </View>
    );
  }

  const iconName = iconMap[name] || name;

  return (
    <View>
      <Icon name={iconName} size={size} color={color} />
    </View>
  );
}; 