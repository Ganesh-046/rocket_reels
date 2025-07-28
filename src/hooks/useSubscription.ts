import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import subscriptionService, { SubscriptionPlan, SubscriptionPurchase, SubscriptionStatus } from '../services/subscription.service';
import { useAuthUser } from '../store/auth.store';

// Query Keys
export const SUBSCRIPTION_QUERY_KEYS = {
  PLANS: 'subscription_plans',
  STATUS: 'subscription_status',
  HISTORY: 'subscription_history',
  BENEFITS: 'subscription_benefits',
  ACTIVE: 'active_subscription',
  TRIAL: 'subscription_trial',
  PRICING: 'subscription_pricing',
  USAGE: 'subscription_usage',
  NOTIFICATIONS: 'subscription_notifications',
  SUPPORT: 'subscription_support',
  TERMS: 'subscription_terms',
  FAQ: 'subscription_faq',
  COMPARISON: 'subscription_comparison',
  RECOMMENDATIONS: 'subscription_recommendations',
  RATING: 'subscription_rating',
} as const;

// Get Subscription Plans Hook
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.PLANS],
    queryFn: () => subscriptionService.getSubscriptionPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Subscription Status Hook
export const useSubscriptionStatus = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, actualUserId],
    queryFn: () => subscriptionService.getSubscriptionStatus(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Subscription History Hook
export const useSubscriptionHistory = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.HISTORY, actualUserId],
    queryFn: () => subscriptionService.getSubscriptionHistory(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Subscription Benefits Hook
export const useSubscriptionBenefits = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.BENEFITS],
    queryFn: () => subscriptionService.getSubscriptionBenefits(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Check Active Subscription Hook
export const useActiveSubscription = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, actualUserId],
    queryFn: () => subscriptionService.hasActiveSubscription(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Trial Info Hook
export const useTrialInfo = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.TRIAL, actualUserId],
    queryFn: () => subscriptionService.getTrialInfo(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Subscription Pricing Hook
export const useSubscriptionPricing = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.PRICING],
    queryFn: () => subscriptionService.getSubscriptionPricing(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get Subscription Usage Hook
export const useSubscriptionUsage = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.USAGE, actualUserId],
    queryFn: () => subscriptionService.getSubscriptionUsage(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Subscription Notifications Hook
export const useSubscriptionNotifications = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.NOTIFICATIONS, actualUserId],
    queryFn: () => subscriptionService.getSubscriptionNotifications(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Subscription Support Hook
export const useSubscriptionSupport = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.SUPPORT, actualUserId],
    queryFn: () => subscriptionService.getSubscriptionSupport(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get Subscription Terms Hook
export const useSubscriptionTerms = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.TERMS],
    queryFn: () => subscriptionService.getSubscriptionTerms(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Get Subscription FAQ Hook
export const useSubscriptionFAQ = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.FAQ],
    queryFn: () => subscriptionService.getSubscriptionFAQ(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Search Subscription FAQ Hook
export const useSearchSubscriptionFAQ = (query: string) => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.FAQ, 'search', query],
    queryFn: () => subscriptionService.searchSubscriptionFAQ(query),
    enabled: !!query && query.length > 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get Subscription Comparison Hook
export const useSubscriptionComparison = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.COMPARISON],
    queryFn: () => subscriptionService.getSubscriptionComparison(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Get Subscription Recommendations Hook
export const useSubscriptionRecommendations = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.RECOMMENDATIONS, actualUserId],
    queryFn: () => subscriptionService.getSubscriptionRecommendations(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get Subscription Rating Hook
export const useSubscriptionRating = (userId?: string) => {
  const user = useAuthUser();
  const actualUserId = userId || user?._id;

  return useQuery({
    queryKey: [SUBSCRIPTION_QUERY_KEYS.RATING, actualUserId],
    queryFn: () => subscriptionService.getSubscriptionRating(actualUserId!),
    enabled: !!actualUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Purchase Subscription Hook
export const usePurchaseSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: (data: SubscriptionPurchase) => subscriptionService.purchaseSubscription(data),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.HISTORY, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.USAGE, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Purchase subscription error:', error);
    },
  });
};

// Cancel Subscription Hook
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      subscriptionService.cancelSubscription(userId, reason),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.HISTORY, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Cancel subscription error:', error);
    },
  });
};

// Restore Purchases Hook
export const useRestorePurchases = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: (userId: string) => subscriptionService.restorePurchases(userId),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.HISTORY, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Restore purchases error:', error);
    },
  });
};

// Start Free Trial Hook
export const useStartFreeTrial = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, planId }: { userId: string; planId: string }) =>
      subscriptionService.startFreeTrial(userId, planId),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.TRIAL, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Start free trial error:', error);
    },
  });
};

// Upgrade Subscription Hook
export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, newPlanId }: { userId: string; newPlanId: string }) =>
      subscriptionService.upgradeSubscription(userId, newPlanId),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.HISTORY, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Upgrade subscription error:', error);
    },
  });
};

// Downgrade Subscription Hook
export const useDowngradeSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, newPlanId }: { userId: string; newPlanId: string }) =>
      subscriptionService.downgradeSubscription(userId, newPlanId),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.HISTORY, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Downgrade subscription error:', error);
    },
  });
};

// Pause Subscription Hook
export const usePauseSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      subscriptionService.pauseSubscription(userId, reason),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Pause subscription error:', error);
    },
  });
};

// Resume Subscription Hook
export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: (userId: string) => subscriptionService.resumeSubscription(userId),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Resume subscription error:', error);
    },
  });
};

// Mark Notification as Read Hook
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, notificationId }: { userId: string; notificationId: string }) =>
      subscriptionService.markNotificationAsRead(userId, notificationId),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate notifications query
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.NOTIFICATIONS, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Mark notification as read error:', error);
    },
  });
};

// Submit Support Ticket Hook
export const useSubmitSupportTicket = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, ticketData }: { userId: string; ticketData: any }) =>
      subscriptionService.submitSupportTicket(userId, ticketData),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate support query
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.SUPPORT, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Submit support ticket error:', error);
    },
  });
};

// Accept Subscription Terms Hook
export const useAcceptSubscriptionTerms = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: (userId: string) => subscriptionService.acceptSubscriptionTerms(userId),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate terms query
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.TERMS],
        });
      }
    },
    onError: (error) => {
      console.error('Accept subscription terms error:', error);
    },
  });
};

// Rate Subscription Hook
export const useRateSubscription = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, rating, feedback }: { userId: string; rating: number; feedback?: string }) =>
      subscriptionService.rateSubscription(userId, rating, feedback),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate rating query
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.RATING, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Rate subscription error:', error);
    },
  });
};

// Update Subscription Preferences Hook
export const useUpdateSubscriptionPreferences = () => {
  const queryClient = useQueryClient();
  const user = useAuthUser();

  return useMutation({
    mutationFn: ({ userId, preferences }: { userId: string; preferences: any }) =>
      subscriptionService.updateSubscriptionPreferences(userId, preferences),
    onSuccess: (response) => {
      if (response.status === 200) {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.STATUS, user?._id],
        });
        queryClient.invalidateQueries({
          queryKey: [SUBSCRIPTION_QUERY_KEYS.ACTIVE, user?._id],
        });
      }
    },
    onError: (error) => {
      console.error('Update subscription preferences error:', error);
    },
  });
};

// Validate Receipt Hook
export const useValidateReceipt = () => {
  return useMutation({
    mutationFn: ({ receipt, platform }: { receipt: string; platform: 'ios' | 'android' }) =>
      subscriptionService.validateReceipt(receipt, platform),
    onError: (error) => {
      console.error('Validate receipt error:', error);
    },
  });
};

// Process Webhook Hook
export const useProcessWebhook = () => {
  return useMutation({
    mutationFn: (webhookData: any) => subscriptionService.processWebhook(webhookData),
    onError: (error) => {
      console.error('Process webhook error:', error);
    },
  });
}; 