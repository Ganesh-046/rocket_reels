import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuthStore } from '../store/auth.store';

// Types
interface SubscriptionPlan {
  _id: string;
  planName: string;
  planDuration: number;
  price: number;
  discountPrice?: number;
  description: string | string[];
  features?: string[];
  isPopular?: boolean;
}

interface PurchaseData {
  userId: string;
  planId: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  currency: string;
}

/**
 * Subscription Hook
 * Handles all subscription-related functionality
 */
export const useSubscriptionHook = () => {
  const {
    subscriptionPlans,
    currentSubscription,
    loading,
    isProcessing,
    purchaseSubscription,
    checkCurrentSubscription,
    refreshSubscriptionStatus,
    getSubscriptionPlans,
  } = useSubscription();

  const user = useAuthStore((state) => state.user);

  // State
  const [isReady, setIsReady] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Refs for debouncing and state tracking
  const isInitializedRef = useRef(false);
  const lastPurchaseTimeRef = useRef(0);

  // Initialize subscription system
  const initializeSubscription = useCallback(async () => {
    if (isInitializedRef.current) {
      console.log('⚠️ Subscription already initialized, skipping...');
      return;
    }

    try {
      console.log('🚀 Initializing subscription system...');
      
      // Load subscription plans
      await getSubscriptionPlans();
      
      // Check current subscription status
      await checkCurrentSubscription();
      
      isInitializedRef.current = true;
      setIsReady(true);
      console.log('✅ Subscription system initialized');
    } catch (error) {
      console.error('❌ Error initializing subscription:', error);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [getSubscriptionPlans, checkCurrentSubscription]);

  // Purchase subscription with debouncing
  const purchaseSubscriptionWithDebounce = useCallback(async (planData: PurchaseData) => {
    const now = Date.now();
    const timeSinceLastPurchase = now - lastPurchaseTimeRef.current;
    const minInterval = 5000; // 5 seconds

    if (timeSinceLastPurchase < minInterval) {
      console.log(`⏭️ Purchase called too frequently (${timeSinceLastPurchase}ms), debouncing...`);
      return;
    }

    lastPurchaseTimeRef.current = now;

    try {
      console.log('💳 Starting subscription purchase...');
      const result = await purchaseSubscription(planData);
      console.log('✅ Subscription purchase completed');
      return result;
    } catch (error) {
      console.error('❌ Subscription purchase failed:', error);
      setLastError(error instanceof Error ? error.message : 'Purchase failed');
      throw error;
    }
  }, [purchaseSubscription]);

  // Reset processing state
  const resetProcessing = useCallback(() => {
    console.log('🔄 Resetting processing state...');
    // This will be handled by the context
  }, []);

  // Force reset processing state
  const forceResetProcessing = useCallback(() => {
    console.log('🔄 Force resetting processing state...');
    // This will be handled by the context
  }, []);

  // Restore purchases (placeholder for IAP integration)
  const restorePurchases = useCallback(async () => {
    try {
      console.log('🔄 Restoring purchases...');
      await refreshSubscriptionStatus();
      Alert.alert('Success', 'Purchases restored successfully!');
    } catch (error) {
      console.error('❌ Error restoring purchases:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    }
  }, [refreshSubscriptionStatus]);

  // Refresh subscription status
  const refreshSubscription = useCallback(async () => {
    try {
      console.log('🔄 Refreshing subscription status...');
      await refreshSubscriptionStatus();
    } catch (error) {
      console.error('❌ Error refreshing subscription:', error);
    }
  }, [refreshSubscriptionStatus]);

  // Effects
  useEffect(() => {
    // Initialize subscription system when user is available
    if (user && !isInitializedRef.current) {
      initializeSubscription();
    }
  }, [user, initializeSubscription]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (lastError) {
      const timeout = setTimeout(() => {
        setLastError(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [lastError]);

  return {
    // State
    isReady,
    isProcessing,
    loading,
    subscriptionPlans,
    currentSubscription,
    lastError,
    
    // Actions
    purchaseSubscription: purchaseSubscriptionWithDebounce,
    restorePurchases,
    refreshSubscription,
    resetProcessing,
    forceResetProcessing,
    initializeSubscription,
    
    // Utilities
    hasActiveSubscription: !!currentSubscription,
    isUserLoggedIn: !!user,
  };
};

export default useSubscriptionHook; 