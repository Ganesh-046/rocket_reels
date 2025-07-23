import { Platform } from 'react-native';
import MMKVStorage from '../lib/mmkv';
import { AD_LIMITS, AD_TYPES, AdType } from '../utils/adConfig';
import rewardsService from './rewards.service';

interface AdditionalData {
  episodeId?: string;
  contentId?: string;
  episodeNo?: number;
  contentName?: string;
  benefitId?: string;
  coins?: number;
  userId?: string;
}

interface AdCallbacks {
  onRewardEarned?: (data: any) => void;
  onEpisodeUnlocked?: (data: any) => void;
  onAdFailed?: (error: any) => void;
}

class AdService {
  private callbacks: AdCallbacks = {};
  private adCounts = {
    daily: 0,
    episode: {} as Record<string, number>
  };

  initialize() {
    console.log('[AD SERVICE] Initializing ad service...');
    this.loadAdCounts();
    this.resetDailyAdCountIfNeeded();
  }

  private loadAdCounts() {
    try {
      this.adCounts.daily = MMKVStorage.get<number>('dailyAdCount') || 0;
      this.adCounts.episode = MMKVStorage.get<Record<string, number>>('episodeAdCounts') || {};
      console.log('[AD SERVICE] Loaded ad counts:', this.adCounts);
    } catch (error) {
      console.error('[AD SERVICE] Error loading ad counts:', error);
    }
  }

  private saveAdCounts() {
    try {
      MMKVStorage.set('dailyAdCount', this.adCounts.daily);
      MMKVStorage.set('episodeAdCounts', this.adCounts.episode);
    } catch (error) {
      console.error('[AD SERVICE] Error saving ad counts:', error);
    }
  }

  private resetDailyAdCountIfNeeded() {
    const today = new Date().toDateString();
    const lastReset = MMKVStorage.get<string>('lastAdResetDate');
    
    if (lastReset !== today) {
      console.log('[AD SERVICE] Resetting daily ad count for new day');
      this.adCounts.daily = 0;
      MMKVStorage.set('lastAdResetDate', today);
      this.saveAdCounts();
    }
  }

  canWatchAds(type: AdType, episodeId?: string): boolean {
    // Check daily limit
    if (this.adCounts.daily >= AD_LIMITS.MAX_DAILY_ADS) {
      console.log('[AD SERVICE] Daily ad limit reached');
      return false;
    }

    // Check episode limit for unlock ads
    if (type === AD_TYPES.UNLOCK && episodeId) {
      const episodeCount = this.adCounts.episode[episodeId] || 0;
      if (episodeCount >= AD_LIMITS.MAX_EPISODE_ADS) {
        console.log('[AD SERVICE] Episode ad limit reached');
        return false;
      }
    }

    return true;
  }

  getDailyAdCount(): number {
    return this.adCounts.daily;
  }

  getEpisodeAdCount(episodeId: string): number {
    return this.adCounts.episode[episodeId] || 0;
  }

  private incrementAdCount(type: AdType, episodeId?: string) {
    // Increment daily count
    this.adCounts.daily += 1;

    // Increment episode count for unlock ads
    if (type === AD_TYPES.UNLOCK && episodeId) {
      this.adCounts.episode[episodeId] = (this.adCounts.episode[episodeId] || 0) + 1;
    }

    this.saveAdCounts();
    console.log('[AD SERVICE] Incremented ad counts:', this.adCounts);
  }

  setCallbacks(callbacks: AdCallbacks) {
    this.callbacks = callbacks;
  }

  async processAdReward(adType: AdType, rewardData: any, additionalData: AdditionalData = {}): Promise<boolean> {
    try {
      console.log('[AD SERVICE] Processing ad reward:', { adType, rewardData, additionalData });
      
      // Increment ad count
      this.incrementAdCount(adType, additionalData.episodeId);

      // Update ad status on server
      const adStatusData = {
        reward: rewardData,
        adType: adType,
        episodeId: additionalData.episodeId,
        contentId: additionalData.contentId,
        ...additionalData
      };

      await rewardsService.updateAdStatus(adStatusData);

      // Handle different ad types
      switch (adType) {
        case AD_TYPES.REWARD:
          await this.handleRewardAd(rewardData, additionalData);
          break;
        case AD_TYPES.UNLOCK:
          await this.handleUnlockAd(rewardData, additionalData);
          break;
        case AD_TYPES.DAILY_CHECKIN:
          await this.handleDailyCheckinAd(rewardData, additionalData);
          break;
        case AD_TYPES.BENEFIT:
          await this.handleBenefitAd(rewardData, additionalData);
          break;
      }

      if (this.callbacks.onRewardEarned) {
        this.callbacks.onRewardEarned({ adType, rewardData, additionalData });
      }

      return true;
    } catch (error) {
      console.error('[AD SERVICE] Error processing ad reward:', error);
      if (this.callbacks.onAdFailed) {
        this.callbacks.onAdFailed(error);
      }
      return false;
    }
  }

  private async handleRewardAd(rewardData: any, additionalData: AdditionalData) {
    console.log('[AD SERVICE] Handling reward ad');
    // Update user balance
    if (additionalData.userId) {
      await rewardsService.getBalance(additionalData.userId);
    }
  }

  private async handleUnlockAd(rewardData: any, additionalData: AdditionalData) {
    console.log('[AD SERVICE] Handling unlock ad');
    if (additionalData.episodeId) {
      const unlockData = {
        contentId: additionalData.contentId,
        episodeId: additionalData.episodeId,
        episodeNo: additionalData.episodeNo,
        contentName: additionalData.contentName,
      };
      
      await rewardsService.unlockEpisodeWithAds(additionalData.episodeId);
      
      if (this.callbacks.onEpisodeUnlocked) {
        this.callbacks.onEpisodeUnlocked({ unlockData, additionalData });
      }
    }
  }

  private async handleDailyCheckinAd(rewardData: any, additionalData: AdditionalData) {
    console.log('[AD SERVICE] Handling daily check-in ad');
    // Set already watched flag
    const today = new Date().toISOString().split('T')[0];
    MMKVStorage.set('alreadyWatch', today);
    
    // Update user balance
    if (additionalData.userId) {
      await rewardsService.getBalance(additionalData.userId);
    }
  }

  private async handleBenefitAd(rewardData: any, additionalData: AdditionalData) {
    console.log('[AD SERVICE] Handling benefit ad');
    // Update user balance
    if (additionalData.userId) {
      await rewardsService.getBalance(additionalData.userId);
    }
  }
}

export default new AdService(); 