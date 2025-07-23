import { Platform } from 'react-native';

// WORKING AD UNITS FROM OLD PROJECT
export const AD_UNITS = {
  // Android (WORKING)
  REWARD_AD_UNIT: 'ca-app-pub-3648621548657237/5603070021',
  UNLOCKED_AD_UNIT: 'ca-app-pub-3648621548657237/2194593465',
  
  // iOS (WORKING)
  REWARD_AD_UNIT_IOS: 'ca-app-pub-3648621548657237/3278969645',
  UNLOCKED_AD_UNIT_IOS: 'ca-app-pub-3648621548657237/2668595554'
};

// Get appropriate ad unit based on platform and type (WORKING LOGIC)
export const getAdUnit = (type = 'reward'): string => {
  const isIOS = Platform.OS === 'ios';
  
  if (type === 'unlock') {
    return isIOS ? AD_UNITS.UNLOCKED_AD_UNIT_IOS : AD_UNITS.UNLOCKED_AD_UNIT;
  }
  
  return isIOS ? AD_UNITS.REWARD_AD_UNIT_IOS : AD_UNITS.REWARD_AD_UNIT;
};

// Ad Types (WORKING)
export const AD_TYPES = {
  REWARD: 'reward',
  UNLOCK: 'unlock',
  DAILY_CHECKIN: 'daily_checkin',
  BENEFIT: 'benefit'
} as const;

export type AdType = typeof AD_TYPES[keyof typeof AD_TYPES];

// Ad Limits (WORKING)
export const AD_LIMITS = {
  MAX_DAILY_ADS: 5,
  MAX_EPISODE_ADS: 5,
  REWARD_COINS_PER_AD: 10
};

// Legacy config for backward compatibility (WORKING)
export const AD_CONFIG = {
  // Reward Ad Units (WORKING)
  REWARD_AD_UNIT: AD_UNITS.REWARD_AD_UNIT,
  REWARD_AD_UNIT_IOS: AD_UNITS.REWARD_AD_UNIT_IOS,
  
  // Unlock Ad Units (WORKING)
  UNLOCKED_AD_UNIT: AD_UNITS.UNLOCKED_AD_UNIT,
  UNLOCKED_AD_UNIT_IOS: AD_UNITS.UNLOCKED_AD_UNIT_IOS,
  
  // Ad Limits
  MAX_ADS_PER_DAY: AD_LIMITS.MAX_DAILY_ADS,
  MAX_ADS_PER_EPISODE: AD_LIMITS.MAX_EPISODE_ADS,
  
  // Reward Amounts
  REWARD_COINS_PER_AD: AD_LIMITS.REWARD_COINS_PER_AD,
  EPISODE_UNLOCK_ADS_REQUIRED: 5
}; 