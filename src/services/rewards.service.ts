import apiInterceptor from '../lib/api-interceptor';
import { ENDPOINTS, CACHE_TTL } from '../config/api';
import {
  ApiResponse,
  CheckInDay,
  BenefitItem,
  BalanceResponse,
  SubscriptionPlan,
  RechargePlan,
  RechargeHistoryItem,
  RewardCoinHistoryItem,
  UnlockedEpisode,
} from '../types/api';

// Rewards Service
class RewardsService {
  // Check-in Rewards
  async getCheckInList(): Promise<ApiResponse<CheckInDay[]>> {
    return apiInterceptor.get<CheckInDay[]>(ENDPOINTS.REWARDS.CHECK_IN_LIST, {
      cacheKey: 'check_in_list',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  async dailyCheckIn(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post(`${ENDPOINTS.REWARDS.DAILY_CHECK_IN}/${userId}`);
  }

  // Benefits
  async getBenefits(): Promise<ApiResponse<BenefitItem[]>> {
    return apiInterceptor.get<BenefitItem[]>(ENDPOINTS.REWARDS.BENEFITS, {
      cacheKey: 'benefits',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Balance
  async getBalance(userId: string): Promise<ApiResponse<BalanceResponse>> {
    return apiInterceptor.get<BalanceResponse>(`${ENDPOINTS.REWARDS.BALANCE}/${userId}`, {
      cacheKey: `balance_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Reward History
  async getRewardHistory(userId: string): Promise<ApiResponse<RewardCoinHistoryItem[]>> {
    return apiInterceptor.get<RewardCoinHistoryItem[]>(`${ENDPOINTS.REWARDS.REWARD_HISTORY}/${userId}`, {
      cacheKey: `reward_history_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Ads Management
  async getAdsCount(userId: string): Promise<ApiResponse<{ count: number }>> {
    return apiInterceptor.get<{ count: number }>(`${ENDPOINTS.REWARDS.ADS_COUNT}/${userId}`, {
      cacheKey: `ads_count_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async updateAdStatus(adData: any): Promise<ApiResponse<any>> {
    return apiInterceptor.post(ENDPOINTS.REWARDS.UPDATE_AD_STATUS, adData);
  }

  // Episode Unlocking
  async unlockEpisodeWithCoins(episodeId: string, coins: number): Promise<ApiResponse<any>> {
    return apiInterceptor.post(ENDPOINTS.REWARDS.UNLOCK_COINS, { episodeId, coins });
  }

  async unlockEpisodeWithAds(episodeId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post(ENDPOINTS.REWARDS.UNLOCK_ADS, { episodeId });
  }

  async getUnlockedEpisodes(): Promise<ApiResponse<UnlockedEpisode[]>> {
    return apiInterceptor.get<UnlockedEpisode[]>(ENDPOINTS.REWARDS.UNLOCKED_EPISODES, {
      cacheKey: 'unlocked_episodes',
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async getUnlockedEpisode(episodeId: string): Promise<ApiResponse<UnlockedEpisode>> {
    return apiInterceptor.get<UnlockedEpisode>(`${ENDPOINTS.REWARDS.GET_UNLOCKED_EPISODE}/${episodeId}`, {
      cacheKey: `unlocked_episode_${episodeId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async createPaymentOrder(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post(`${ENDPOINTS.SUBSCRIPTION.CREATE_ORDER}/${userId}`);
  }
}

// Subscription Service
class SubscriptionService {
  // Subscription Plans
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiInterceptor.get<SubscriptionPlan[]>(ENDPOINTS.SUBSCRIPTION.PLANS, {
      cacheKey: 'subscription_plans',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  async getVIPSubscriptions(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiInterceptor.get<SubscriptionPlan[]>(ENDPOINTS.SUBSCRIPTION.VIP_SUBSCRIPTIONS, {
      cacheKey: 'vip_subscriptions',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Payment
  async createPaymentOrder(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.get(`${ENDPOINTS.SUBSCRIPTION.CREATE_ORDER}/${userId}`);
  }

  async purchaseSubscription(planData: any): Promise<ApiResponse<any>> {
    return apiInterceptor.post(ENDPOINTS.SUBSCRIPTION.PURCHASE, planData);
  }
}

// Recharge Service
class RechargeService {
  // Recharge Plans
  async getRechargeList(): Promise<ApiResponse<RechargePlan[]>> {
    return apiInterceptor.get<RechargePlan[]>(ENDPOINTS.RECHARGE.LIST, {
      cacheKey: 'recharge_list',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Recharge Operations
  async createRecharge(userId: string, currency: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post(`${ENDPOINTS.RECHARGE.CREATE}/${userId}`, { currency });
  }

  async updateRechargeStatus(paymentData: any): Promise<ApiResponse<any>> {
    return apiInterceptor.post(ENDPOINTS.RECHARGE.UPDATE_STATUS, paymentData);
  }

  async getRechargeHistory(userId: string): Promise<ApiResponse<RechargeHistoryItem[]>> {
    return apiInterceptor.get<RechargeHistoryItem[]>(`${ENDPOINTS.RECHARGE.HISTORY}/${userId}`, {
      cacheKey: `recharge_history_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }
}

// Create singleton instances
const rewardsService = new RewardsService();
const subscriptionService = new SubscriptionService();
const rechargeService = new RechargeService();

export { rewardsService, subscriptionService, rechargeService };
export default rewardsService; 