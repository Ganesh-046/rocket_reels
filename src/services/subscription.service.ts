import apiService from './api.service';
import { Platform } from 'react-native';

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

export interface PurchaseSubscriptionRequest {
  userId: string;
  planId: string;
  paymentMethod: string;
  transactionId: string;
  amount: number;
  currency: string;
  transactionReceipt: string;
  device: string;
}

export interface CurrentSubscription {
  _id: string;
  productId: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  source: 'backend' | 'iap';
}

class SubscriptionService {
  // Get all subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiService.getVIPSubscriptions();
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  // Get current subscription status
  async getCurrentSubscription(): Promise<CurrentSubscription | null> {
    try {
      const response = await apiService.getCurrentSubscription();
      
      if (response.data && response.data.isSubscriber) {
        return {
          _id: response.data._id || '',
          productId: response.data.planDetails?.planName || '',
          subscriptionStartDate: response.data.subscriptionStartDate || '',
          subscriptionEndDate: response.data.subscriptionEndDate || '',
          source: 'backend' as const
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return null;
    }
  }

  // Purchase subscription
  async purchaseSubscription(purchaseData: {
    userId: string;
    planId: string;
    paymentMethod: string;
    transactionId: string;
    amount: number;
    currency: string;
  }): Promise<boolean> {
    try {
      const formdata: PurchaseSubscriptionRequest = {
        ...purchaseData,
        transactionReceipt: purchaseData.transactionId,
        device: Platform.OS
      };

      const response = await apiService.purchaseSubscription(formdata);
      return !!response.data;
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      throw error;
    }
  }

  // Update subscription status
  async updateSubscriptionStatus(data: {
    orderId: string;
    status: string;
    transactionId?: string;
  }): Promise<boolean> {
    try {
      const response = await apiService.updateSubscriptionStatus(data);
      return !!response.data;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }
}

export default new SubscriptionService();