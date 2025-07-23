import React, { memo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Alert, Dimensions } from 'react-native';
import { useAdSystem } from '../../hooks/useAdSystem';
import { AD_CONFIG, AD_TYPES, AdType } from '../../utils/adConfig';
import { Button } from './Button';
import { SvgIcons } from './SvgIcons';
import { themeColors, APP_FONT_BOLD, APP_FONT_REGULAR } from '../../utils/constants';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface AdModalProps {
  visible: boolean;
  onClose: () => void;
  adType?: AdType;
  episodeId?: string;
  contentId?: string;
  episodeNo?: number;
  contentName?: string;
  benefitId?: string;
  coins?: number;
  title?: string;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  showCount?: boolean;
  maxCount?: number;
}

const AdModal = memo<AdModalProps>(({
  visible,
  onClose,
  adType = AD_TYPES.REWARD,
  episodeId,
  contentId,
  episodeNo,
  contentName,
  benefitId,
  coins = AD_CONFIG.REWARD_COINS_PER_AD,
  title = 'Watch Ad',
  description = 'Watch a short ad to earn rewards',
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

  const [isProcessing, setIsProcessing] = useState(false);
  const currentAdCount = getAdCount(episodeId);
  const canWatch = canWatchAds(adType, episodeId);
  const isMaxReached = currentAdCount >= maxCount;

  const handleWatchAd = async () => {
    try {
      setIsProcessing(true);
      
      const additionalData = {
        episodeId,
        contentId,
        episodeNo,
        contentName,
        benefitId,
        coins
      };

      const success = await showAd(adType, additionalData);
      
      if (success) {
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Ad modal error:', error);
      if (onError) {
        onError(error);
      } else {
        Alert.alert('Error', 'Failed to show ad');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getRewardText = () => {
    switch (adType) {
      case AD_TYPES.UNLOCK:
        return `Watch ${maxCount - currentAdCount} more ads to unlock this episode`;
      case AD_TYPES.REWARD:
        return `Earn ${coins} coins`;
      case AD_TYPES.DAILY_CHECKIN:
        return `Earn ${coins} coins for daily check-in`;
      case AD_TYPES.BENEFIT:
        return `Earn ${coins} coins`;
      default:
        return `Earn ${coins} coins`;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <SvgIcons name="ads" size={32} color={themeColors.PRIMARYBG} />
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.rewardContainer}>
            <SvgIcons name="coin" size={24} color={themeColors.PRIMARYBG} />
            <Text style={styles.rewardText}>{getRewardText()}</Text>
          </View>

          {showCount && episodeId && (
            <View style={styles.countContainer}>
              <Text style={styles.countText}>
                Ads watched: {currentAdCount}/{maxCount}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={onClose}
              style={{
                ...styles.button,
                ...styles.cancelButton
              }}
            />
            
            <Button
              title={isAdLoading ? "Loading..." : "Watch Ad"}
              onPress={handleWatchAd}
              disabled={!canWatch || isAdLoading || isMaxReached || isProcessing}
              loading={isAdLoading || isProcessing}
              style={{
                ...styles.button,
                ...styles.watchButton,
                ...((!canWatch || isMaxReached) && styles.disabledButton)
              }}
            />
          </View>

          {isMaxReached && (
            <Text style={styles.maxReachedText}>
              You have reached the maximum number of ads for this episode
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modal: {
    backgroundColor: themeColors.PRIMARYWHITE,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontFamily: APP_FONT_BOLD,
    color: themeColors.PRIMARYBLACK,
    marginLeft: 12
  },
  description: {
    fontSize: 16,
    fontFamily: APP_FONT_REGULAR,
    color: themeColors.PRIMARYLIGHTBLACKONE,
    textAlign: 'center',
    marginBottom: 20
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.PRIMARYWHITEFOUR,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20
  },
  rewardText: {
    fontSize: 16,
    fontFamily: APP_FONT_BOLD,
    color: themeColors.PRIMARYBLACK,
    marginLeft: 8
  },
  countContainer: {
    marginBottom: 20
  },
  countText: {
    fontSize: 14,
    fontFamily: APP_FONT_REGULAR,
    color: themeColors.PRIMARYLIGHTBLACKONE,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12
  },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12
  },
  cancelButton: {
    backgroundColor: themeColors.PRIMARYGRAY
  },
  watchButton: {
    backgroundColor: themeColors.PRIMARYBG
  },
  disabledButton: {
    backgroundColor: themeColors.PRIMARYGRAY
  },
  maxReachedText: {
    fontSize: 14,
    fontFamily: APP_FONT_REGULAR,
    color: themeColors.PRIMARYGRAY,
    textAlign: 'center',
    marginTop: 16
  }
});

export default AdModal; 