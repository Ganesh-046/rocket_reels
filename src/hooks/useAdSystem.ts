import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { getAdUnit, AD_TYPES, AdType } from '../utils/adConfig';
import adService from '../services/adService';
import moment from 'moment';
import MMKVStorage from '../lib/mmkv';

interface AdditionalData {
  episodeId?: string;
  contentId?: string;
  episodeNo?: number;
  contentName?: string;
  benefitId?: string;
  coins?: number;
  userId?: string;
  type?: string;
}

interface AdCallbacks {
  onRewardEarned?: (data: any) => void;
  onEpisodeUnlocked?: (data: any) => void;
  onAdFailed?: (error: any) => void;
}

// WORKING IMPLEMENTATION FROM OLD PROJECT
export const useAdSystem = (adType: AdType = AD_TYPES.REWARD) => {
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [currentAdType, setCurrentAdType] = useState(adType);
  const [additionalData, setAdditionalData] = useState<AdditionalData>({});
  const [type, setType] = useState('WatchAds');

  // Get appropriate ad unit (WORKING LOGIC)
  const adUnit = getAdUnit(adType);
  
  console.log(`[AD DEBUG] Hook initialized with ad unit: ${adUnit}`);
  console.log(`[AD DEBUG] Platform: ${Platform.OS}`);
  console.log(`[AD DEBUG] Ad type: ${adType}`);
  
  // Configure test device for development
  useEffect(() => {
    if (__DEV__) {
      console.log('[AD DEBUG] Configuring test device for development');
      // Add your test device ID here
      // You can get this from the logs when running the app
    }
  }, []);
  
  const { isLoaded, isClosed, load, show, isEarnedReward, reward } = useRewardedAd(adUnit);
  
  // Additional debug logging
  useEffect(() => {
    console.log(`[AD DEBUG] useRewardedAd hook returned:`, { isLoaded, isClosed, isEarnedReward, reward });
  }, [isLoaded, isClosed, isEarnedReward, reward]);

  console.log(`[AD DEBUG] useRewardedAd hook returned:`, {
    isLoaded,
    isClosed,
    load: typeof load,
    show: typeof show,
    isEarnedReward,
    reward
  });

  // Initialize ad service
  useEffect(() => {
    console.log('[AD DEBUG] Initializing ad service...');
    adService.initialize();
  }, []);

  // Handle ad loading state (WORKING LOGIC)
  useEffect(() => {
    console.log(`[AD DEBUG] Ad loading state changed: isLoaded=${isLoaded}`);
    setIsAdReady(isLoaded);
    setIsAdLoading(!isLoaded);
  }, [isLoaded]);

  // Handle ad closure (WORKING LOGIC)
  useEffect(() => {
    console.log(`[AD DEBUG] Ad closure state changed: isClosed=${isClosed}`);
    if (isClosed) {
      console.log('[AD DEBUG] Ad closed, reloading...');
      load();
    }
  }, [isClosed, load]);

  // Handle ad reward (WORKING LOGIC FROM OLD PROJECT)
  useEffect(() => {
    console.log(`[AD DEBUG] Reward state changed: isEarnedReward=${isEarnedReward}, reward=`, reward);
    if (isEarnedReward && reward) {
      console.log('[AD DEBUG] Reward earned!', reward);
      handleAdReward();
    }
  }, [isEarnedReward, reward]);

  const handleAdReward = useCallback(async () => {
    try {
      console.log('[AD DEBUG] Processing ad reward...');
      if (type === 'WatchAds') {
        // Daily check-in ad (WORKING LOGIC)
        await adService.processAdReward(AD_TYPES.DAILY_CHECKIN, reward, additionalData);
        // Set already watch date (WORKING LOGIC)
        const today = moment().format('DD-MMM-YYYY');
        MMKVStorage.set('alreadyWatch', today);
        Alert.alert('Success', 'Daily check-in completed! +10 coins earned');
      } else {
        // Regular reward ad (WORKING LOGIC)
        await adService.processAdReward(AD_TYPES.REWARD, reward, additionalData);
        Alert.alert('Success', 'Ad completed! +10 coins earned');
      }
    } catch (error) {
      console.error('[AD DEBUG] Error handling ad reward:', error);
      Alert.alert('Error', 'Failed to process ad reward');
    }
  }, [type, reward, additionalData]);

  // Show ad (WORKING LOGIC FROM OLD PROJECT)
  const showAd = useCallback(async (adType = currentAdType, data: AdditionalData = {}) => {
    try {
      console.log('[AD DEBUG] Attempting to show ad...', { adType, data, isLoaded });
      setCurrentAdType(adType);
      setAdditionalData(data);

      if (isLoaded) {
        setType(data.type || 'Ads');
        console.log('[AD DEBUG] Showing ad...');
        show();
        return true;
      } else {
        console.log('[AD DEBUG] Ad not loaded, loading...');
        load();
        Alert.alert('Ad Loading', 'Please wait while the ad loads...');
        return false;
      }
    } catch (error) {
      console.error('[AD DEBUG] Error showing ad:', error);
      Alert.alert('Error', 'Failed to show ad');
      return false;
    }
  }, [isLoaded, currentAdType, load, show]);

  // Load ad (WORKING LOGIC)
  const loadAd = useCallback(() => {
    console.log('[AD DEBUG] Manually loading ad...');
    setIsAdLoading(true);
    load();
  }, [load]);

  // Check if user can watch ads (WORKING LOGIC)
  const canWatchAds = useCallback((type: AdType = currentAdType, episodeId?: string): boolean => {
    const canWatch = adService.canWatchAds(type, episodeId);
    console.log(`[AD DEBUG] canWatchAds check: ${canWatch}`);
    return canWatch;
  }, [currentAdType]);

  // Get ad count (WORKING LOGIC)
  const getAdCount = useCallback((episodeId?: string): number => {
    if (episodeId) {
      return adService.getEpisodeAdCount(episodeId);
    }
    return adService.getDailyAdCount();
  }, []);

  // Set callbacks (WORKING LOGIC)
  const setAdCallbacks = useCallback((callbacks: AdCallbacks) => {
    adService.setCallbacks(callbacks);
  }, []);

  return {
    // State
    isAdReady,
    isAdLoading,
    currentAdType,
    
    // Actions
    showAd,
    loadAd,
    canWatchAds,
    getAdCount,
    setAdCallbacks,
    
    // Ad status
    isLoaded,
    isClosed,
    isEarnedReward
  };
}; 