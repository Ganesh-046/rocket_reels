import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rewardsService, subscriptionService, rechargeService } from '../services/rewards.service';
import {
  CheckInReward,
  Benefit,
  RewardBalance,
  SubscriptionPlan,
  RechargePlan,
  Transaction,
  UnlockedEpisode,
} from '../types/api';
import MMKVStorage from '../lib/mmkv';

// Query Keys
export const REWARDS_QUERY_KEYS = {
  CHECK_IN_LIST: 'check_in_list',
  BENEFITS: 'benefits',
  BALANCE: 'balance',
  REWARD_HISTORY: 'reward_history',
  ADS_COUNT: 'ads_count',
  UNLOCKED_EPISODES: 'unlocked_episodes',
  UNLOCKED_EPISODE: 'unlocked_episode',
} as const;

export const SUBSCRIPTION_QUERY_KEYS = {
  PLANS: 'subscription_plans',
  VIP_SUBSCRIPTIONS: 'vip_subscriptions',
} as const;

export const RECHARGE_QUERY_KEYS = {
  LIST: 'recharge_list',
  HISTORY: 'recharge_history',
} as const;

// Rewards Hooks
export const useCheckInList = () => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEYS.CHECK_IN_LIST],
    queryFn: () => rewardsService.getCheckInList(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useDailyCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => rewardsService.dailyCheckIn(userId),
    onSuccess: (response, userId) => {
      if (response.status) {
        // Update local check-in streak
        const currentStreak = MMKVStorage.getCheckInStreak();
        MMKVStorage.setCheckInStreak(currentStreak + 1);
        
        // Invalidate and refetch balance
        queryClient.invalidateQueries({
          queryKey: [REWARDS_QUERY_KEYS.BALANCE, userId],
        });
      }
    },
    onError: (error) => {
    },
  });
};

export const useBenefits = () => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEYS.BENEFITS],
    queryFn: () => rewardsService.getBenefits(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useBalance = (userId?: string) => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEYS.BALANCE, userId],
    queryFn: () => rewardsService.getBalance(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRewardHistory = (userId?: string) => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEYS.REWARD_HISTORY, userId],
    queryFn: () => rewardsService.getRewardHistory(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAdsCount = (userId?: string) => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEYS.ADS_COUNT, userId],
    queryFn: () => rewardsService.getAdsCount(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateAdStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (adData: any) => rewardsService.updateAdStatus(adData),
    onSuccess: (response, variables) => {
      if (response.status) {
        // Invalidate and refetch ads count
        queryClient.invalidateQueries({
          queryKey: [REWARDS_QUERY_KEYS.ADS_COUNT],
        });
      }
    },
    onError: (error) => {
    },
  });
};

// Episode Unlocking Hooks
export const useUnlockEpisodeWithCoins = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ episodeId, coins }: { episodeId: string; coins: number }) =>
      rewardsService.unlockEpisodeWithCoins(episodeId, coins),
    onSuccess: (response, variables) => {
      if (response.status) {
        // Invalidate and refetch unlocked episodes and balance
        queryClient.invalidateQueries({
          queryKey: [REWARDS_QUERY_KEYS.UNLOCKED_EPISODES],
        });
        queryClient.invalidateQueries({
          queryKey: [REWARDS_QUERY_KEYS.BALANCE],
        });
      }
    },
    onError: (error) => {
    },
  });
};

export const useUnlockEpisodeWithAds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (episodeId: string) => rewardsService.unlockEpisodeWithAds(episodeId),
    onSuccess: (response, episodeId) => {
      if (response.status) {
        // Invalidate and refetch unlocked episodes
        queryClient.invalidateQueries({
          queryKey: [REWARDS_QUERY_KEYS.UNLOCKED_EPISODES],
        });
        queryClient.invalidateQueries({
          queryKey: [REWARDS_QUERY_KEYS.UNLOCKED_EPISODE, episodeId],
        });
      }
    },
    onError: (error) => {
    },
  });
};

export const useUnlockedEpisodes = () => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEYS.UNLOCKED_EPISODES],
    queryFn: () => rewardsService.getUnlockedEpisodes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUnlockedEpisode = (episodeId?: string) => {
  return useQuery({
    queryKey: [REWARDS_QUERY_KEYS.UNLOCKED_EPISODE, episodeId],
    queryFn: () => rewardsService.getUnlockedEpisode(episodeId!),
    enabled: !!episodeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Subscription Hooks
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.PLANS],
    queryFn: () => subscriptionService.getSubscriptionPlans(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useVIPSubscriptions = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.VIP_SUBSCRIPTIONS],
    queryFn: () => subscriptionService.getVIPSubscriptions(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: (userId: string) => subscriptionService.createPaymentOrder(userId),
    onError: (error) => {
    },
  });
};

export const usePurchaseSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planData: any) => subscriptionService.purchaseSubscription(planData),
    onSuccess: (response) => {
      if (response.status) {
        // Invalidate and refetch user data
        queryClient.invalidateQueries({
          queryKey: ['user'],
        });
      }
    },
    onError: (error) => {
    },
  });
};

// Recharge Hooks
export const useRechargeList = () => {
  return useQuery({
    queryKey: [RECHARGE_QUERY_KEYS.LIST],
    queryFn: () => rechargeService.getRechargeList(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useCreateRecharge = () => {
  return useMutation({
    mutationFn: ({ userId, currency }: { userId: string; currency: string }) =>
      rechargeService.createRecharge(userId, currency),
    onError: (error) => {
    },
  });
};

export const useUpdateRechargeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentData: any) => rechargeService.updateRechargeStatus(paymentData),
    onSuccess: (response) => {
      if (response.status) {
        // Invalidate and refetch balance and history
        queryClient.invalidateQueries({
          queryKey: [REWARDS_QUERY_KEYS.BALANCE],
        });
        queryClient.invalidateQueries({
          queryKey: [RECHARGE_QUERY_KEYS.HISTORY],
        });
      }
    },
    onError: (error) => {
    },
  });
};

export const useRechargeHistory = (userId?: string) => {
  return useQuery({
    queryKey: [RECHARGE_QUERY_KEYS.HISTORY, userId],
    queryFn: () => rechargeService.getRechargeHistory(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 