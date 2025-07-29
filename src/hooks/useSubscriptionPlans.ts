import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import subscriptionService from '../services/subscription.service';
import { useAuthStore } from '../store/auth.store';

export interface SubscriptionPlan {
  _id: string;
  planName: string;
  planDuration: number;
  price: number;
  discountPrice?: number;
  description: string | string[];
  features?: string[];
  isPopular?: boolean;
}

export interface CurrentSubscription {
  _id: string;
  productId: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  source: 'backend' | 'iap';
}

export interface PurchaseData {
  userId: string;
  planId: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  currency: string;
}

export const useSubscriptionPlans = () => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, token } = useAuthStore();

  // Fetch subscription plans
  const fetchSubscriptionPlans = useCallback(async () => {
    if (!token) {
      console.log('🔑 No token available for subscription plans');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching subscription plans...');
      console.log('📋 User token:', token ? 'Present' : 'Missing');
      console.log('📋 User ID:', user?._id);
      
      const plans = await subscriptionService.getSubscriptionPlans();
      console.log('📋 Subscription plans loaded:', plans.length);
      
      setSubscriptionPlans(plans);
      console.log('✅ Subscription plans loaded:', plans.length);
    } catch (error: any) {
      console.error('❌ Error fetching subscription plans:', error);
      setError(error.message || 'Failed to fetch subscription plans');
      setSubscriptionPlans([]);
    } finally {
      setLoading(false);
    }
  }, [token, user?._id]);

  // Check current subscription
  const checkCurrentSubscription = useCallback(async () => {
    if (!token || !user?._id) return;

    try {
      console.log('🔍 Checking current subscription...');
      const subscription = await subscriptionService.getCurrentSubscription();
      
      if (subscription) {
        setCurrentSubscription(subscription);
        console.log('✅ Current subscription found:', subscription);
      } else {
        setCurrentSubscription(null);
        console.log('ℹ️ No active subscription found');
      }
    } catch (error: any) {
      console.error('❌ Error checking current subscription:', error);
      setCurrentSubscription(null);
    }
  }, [token, user?._id]);

  // Purchase subscription
  const purchaseSubscription = useCallback(async (purchaseData: PurchaseData) => {
    if (!token) {
      Alert.alert('Error', 'Please login to purchase subscriptions');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('💳 Starting subscription purchase:', purchaseData);
      
      const success = await subscriptionService.purchaseSubscription(purchaseData);
      console.log('💳 Purchase result:', success);

      if (success) {
        Alert.alert('Success', 'Purchase completed successfully!');
        
        // Refresh subscription status
        await checkCurrentSubscription();
        
        console.log('✅ Purchase completed successfully');
        return true;
      } else {
        throw new Error('Purchase failed');
      }
    } catch (error: any) {
      console.error('❌ Subscription purchase error:', error);
      
      if (error.response?.data?.code === 11000) {
        Alert.alert('Error', 'This transaction has already been processed');
      } else if (error.response?.status === 500) {
        Alert.alert('Error', 'Server error. Please try again later');
      } else {
        Alert.alert('Error', error.message || 'Failed to purchase subscription');
      }
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [token, checkCurrentSubscription]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    if (!token) {
      Alert.alert('Error', 'Please login to restore purchases');
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('🔄 Restoring purchases...');
      await checkCurrentSubscription();
      Alert.alert('Success', 'Purchases restored successfully!');
    } catch (error: any) {
      console.error('❌ Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setIsProcessing(false);
    }
  }, [token, checkCurrentSubscription]);

  // Refresh subscription data
  const refreshSubscription = useCallback(async () => {
    await Promise.all([
      fetchSubscriptionPlans(),
      checkCurrentSubscription()
    ]);
  }, [fetchSubscriptionPlans, checkCurrentSubscription]);

  // Initial load
  useEffect(() => {
    if (token) {
      fetchSubscriptionPlans();
      checkCurrentSubscription();
    }
  }, [token, fetchSubscriptionPlans, checkCurrentSubscription]);

  // Computed values
  const hasActiveSubscription = currentSubscription !== null;
  const isUserLoggedIn = !!token;

  return {
    // State
    subscriptionPlans,
    currentSubscription,
    loading,
    isProcessing,
    error,
    
    // Actions
    fetchSubscriptionPlans,
    checkCurrentSubscription,
    purchaseSubscription,
    restorePurchases,
    refreshSubscription,
    
    // Computed
    hasActiveSubscription,
    isUserLoggedIn
  };
};