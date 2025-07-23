import React, { memo } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions, ViewStyle } from 'react-native';
import { useAdSystem } from '../../hooks/useAdSystem';
import { AD_CONFIG, AD_TYPES, AdType } from '../../utils/adConfig';
import { Button } from './Button';
import { themeColors, APP_FONT_BOLD, APP_FONT_REGULAR } from '../../utils/constants';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface WatchAdButtonProps {
  adType?: AdType;
  episodeId?: string;
  contentId?: string;
  episodeNo?: number;
  contentName?: string;
  benefitId?: string;
  coins?: number;
  title?: string;
  disabled?: boolean;
  style?: ViewStyle;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  showCount?: boolean;
  maxCount?: number;
}

const WatchAdButton = memo<WatchAdButtonProps>(({
  adType = AD_TYPES.REWARD,
  episodeId,
  contentId,
  episodeNo,
  contentName,
  benefitId,
  coins = AD_CONFIG.REWARD_COINS_PER_AD,
  title = 'Watch Ads',
  disabled = false,
  style = {},
  onSuccess,
  onError,
  showCount = true,
  maxCount = AD_CONFIG.MAX_ADS_PER_EPISODE
}) => {
  const {
    isAdReady,
    isAdLoading,
    showAd,
    canWatchAds,
    getAdCount
  } = useAdSystem(adType);

  const currentAdCount = getAdCount(episodeId);
  const canWatch = canWatchAds(adType, episodeId) && !disabled;
  const isMaxReached = currentAdCount >= maxCount;

  const handlePress = async () => {
    try {
      const additionalData = {
        episodeId,
        contentId,
        episodeNo,
        contentName,
        benefitId,
        coins
      };

      const success = await showAd(adType, additionalData);
      
      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Watch ad button error:', error);
      if (onError) {
        onError(error);
      } else {
        Alert.alert('Error', 'Failed to show ad');
      }
    }
  };

  const getButtonTitle = () => {
    if (isAdLoading) return 'Loading...';
    if (isMaxReached) return 'Max Ads Reached';
    if (showCount && episodeId) {
      return `${title} (${currentAdCount}/${maxCount})`;
    }
    return title;
  };

  const getButtonColor = () => {
    if (isMaxReached || !canWatch) return themeColors.PRIMARYGRAY;
    if (isAdLoading) return themeColors.PRIMARYGRAY;
    return themeColors.PRIMARYBG;
  };

  return (
    <Button
      title={getButtonTitle()}
      onPress={handlePress}
      disabled={!canWatch || isAdLoading || isMaxReached}
      loading={isAdLoading}
      style={{
        ...styles.button,
        backgroundColor: getButtonColor(),
        ...style
      }}
    />
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});

export default WatchAdButton; 