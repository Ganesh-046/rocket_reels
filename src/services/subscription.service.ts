import apiInterceptor from '../lib/api-interceptor';
import { ENDPOINTS, CACHE_TTL, API_CONFIG } from '../config/api';
import { ApiResponse } from '../types/api';

// Subscription Plan Interface
export interface SubscriptionPlan {
  _id: string;
  planName: string;
  planDuration: number;
  price: number;
  discountPrice?: number;
  description: string | string[];
  features?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subscription Purchase Interface
export interface SubscriptionPurchase {
  planId: string;
  transactionId: string;
  transactionReceipt: string;
  platform: 'ios' | 'android';
  deviceInfo?: any;
}

// Subscription Status Interface
export interface SubscriptionStatus {
  isActive: boolean;
  planDetails?: SubscriptionPlan;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
}

// Subscription Service Class
class SubscriptionService {
  // Get all subscription plans
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiInterceptor.get<SubscriptionPlan[]>('/rewards/subscription/subscriptionList', {
      isPublic: true,
      cacheKey: 'subscription_plans',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Purchase subscription
  async purchaseSubscription(data: SubscriptionPurchase): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>('/rewards/confirm-payment/plan-purchase', {
      planId: data.planId,
      transactionId: data.transactionId,
      transactionReceipt: data.transactionReceipt,
      platform: data.platform,
      deviceInfo: data.deviceInfo,
    }, {
      timeout: API_CONFIG.SUBSCRIPTION_TIMEOUT,
    });
  }

  // Get user subscription status
  async getSubscriptionStatus(userId: string): Promise<ApiResponse<SubscriptionStatus>> {
    return apiInterceptor.get<SubscriptionStatus>(`/user/subscription/status/${userId}`, {
      cacheKey: `subscription_status_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Cancel subscription
  async cancelSubscription(userId: string, reason?: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(`/user/subscription/cancel/${userId}`, {
      reason: reason || 'User requested cancellation',
    });
  }

  // Restore purchases (for iOS)
  async restorePurchases(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/restore/${userId}`, {});
  }

  // Get subscription history
  async getSubscriptionHistory(userId: string): Promise<ApiResponse<any[]>> {
    return apiInterceptor.get<any[]>(`/user/subscription/history/${userId}`, {
      cacheKey: `subscription_history_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Validate receipt (for backend validation)
  async validateReceipt(receipt: string, platform: 'ios' | 'android'): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>('/subscription/validate-receipt', {
      receipt,
      platform,
    });
  }

  // Get subscription benefits
  async getSubscriptionBenefits(): Promise<ApiResponse<any[]>> {
    return apiInterceptor.get<any[]>('/rewards/benefits/benefitList', {
      isPublic: true,
      cacheKey: 'subscription_benefits',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Update subscription preferences
  async updateSubscriptionPreferences(userId: string, preferences: any): Promise<ApiResponse<any>> {
    return apiInterceptor.put<any>(`/user/subscription/preferences/${userId}`, preferences);
  }

  // Get subscription analytics
  async getSubscriptionAnalytics(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>(`/user/subscription/analytics/${userId}`, {
      cacheKey: `subscription_analytics_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Check if user has active subscription
  async hasActiveSubscription(userId: string): Promise<ApiResponse<{ hasActive: boolean; details?: any }>> {
    return apiInterceptor.get<{ hasActive: boolean; details?: any }>(`/user/subscription/active/${userId}`, {
      cacheKey: `active_subscription_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Get subscription trial info
  async getTrialInfo(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>(`/user/subscription/trial/${userId}`, {
      cacheKey: `trial_info_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Start free trial
  async startFreeTrial(userId: string, planId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/trial/start/${userId}`, {
      planId,
    });
  }

  // Get subscription pricing
  async getSubscriptionPricing(): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>('/subscription/pricing', {
      cacheKey: 'subscription_pricing',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Process subscription webhook
  async processWebhook(webhookData: any): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>('/subscription/webhook', webhookData, {
      isPublic: true, // Webhooks are typically public endpoints
    });
  }

  // Get subscription usage
  async getSubscriptionUsage(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>(`/user/subscription/usage/${userId}`, {
      cacheKey: `subscription_usage_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Upgrade subscription
  async upgradeSubscription(userId: string, newPlanId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/upgrade/${userId}`, {
      newPlanId,
    });
  }

  // Downgrade subscription
  async downgradeSubscription(userId: string, newPlanId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/downgrade/${userId}`, {
      newPlanId,
    });
  }

  // Pause subscription
  async pauseSubscription(userId: string, reason?: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/pause/${userId}`, {
      reason: reason || 'User requested pause',
    });
  }

  // Resume subscription
  async resumeSubscription(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/resume/${userId}`, {});
  }

  // Get subscription notifications
  async getSubscriptionNotifications(userId: string): Promise<ApiResponse<any[]>> {
    return apiInterceptor.get<any[]>(`/user/subscription/notifications/${userId}`, {
      cacheKey: `subscription_notifications_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Mark notification as read
  async markNotificationAsRead(userId: string, notificationId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.put<any>(`/user/subscription/notifications/${userId}/${notificationId}/read`, {});
  }

  // Get subscription support
  async getSubscriptionSupport(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>(`/user/subscription/support/${userId}`, {
      cacheKey: `subscription_support_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Submit support ticket
  async submitSupportTicket(userId: string, ticketData: any): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/support/${userId}/ticket`, ticketData);
  }

  // Get subscription terms
  async getSubscriptionTerms(): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>('/subscription/terms', {
      isPublic: true,
      cacheKey: 'subscription_terms',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Accept subscription terms
  async acceptSubscriptionTerms(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/terms/accept/${userId}`, {});
  }

  // Get subscription FAQ
  async getSubscriptionFAQ(): Promise<ApiResponse<any[]>> {
    return apiInterceptor.get<any[]>('/subscription/faq', {
      isPublic: true,
      cacheKey: 'subscription_faq',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Search subscription FAQ
  async searchSubscriptionFAQ(query: string): Promise<ApiResponse<any[]>> {
    return apiInterceptor.get<any[]>(`/subscription/faq/search?q=${encodeURIComponent(query)}`, {
      isPublic: true,
      cacheKey: `subscription_faq_search_${query}`,
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Get subscription comparison
  async getSubscriptionComparison(): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>('/subscription/comparison', {
      isPublic: true,
      cacheKey: 'subscription_comparison',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Get subscription recommendations
  async getSubscriptionRecommendations(userId: string): Promise<ApiResponse<any[]>> {
    return apiInterceptor.get<any[]>(`/user/subscription/recommendations/${userId}`, {
      cacheKey: `subscription_recommendations_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Rate subscription
  async rateSubscription(userId: string, rating: number, feedback?: string): Promise<ApiResponse<any>> {
    return apiInterceptor.post<any>(`/user/subscription/rate/${userId}`, {
      rating,
      feedback,
    });
  }

  // Get subscription rating
  async getSubscriptionRating(userId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.get<any>(`/user/subscription/rating/${userId}`, {
      cacheKey: `subscription_rating_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }
}

// Create singleton instance
const subscriptionService = new SubscriptionService();

export default subscriptionService; 