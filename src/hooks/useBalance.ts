import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from '../store/auth.store';
import apiService from '../services/api.service';
import { BalanceResponse } from '../types/api';

export const useBalance = () => {
  const { user, token } = useAuthState();
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!user?._id || !token) {
      setBalanceData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching balance for user:', user._id);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
      
      const response = await apiService.getBalance(user._id);
      console.log('📊 Balance API Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        setBalanceData(response.data);
        console.log('✅ Balance data set:', response.data);
        console.log('💰 Total Coins:', response.data?.coinsQuantity?.totalCoins);
      } else {
        setError(response.message || 'Failed to fetch balance');
        console.log('❌ Balance API error:', response.message);
      }
    } catch (err) {
      console.error('🚨 Error fetching balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  }, [user?._id, token]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const refreshBalance = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  // Get total coins from balance data
  const totalCoins = balanceData?.coinsQuantity?.totalCoins || 0;
  const purchasedCoins = balanceData?.coinsQuantity?.purchasedCoins || 0;
  const rewardCoins = balanceData?.coinsQuantity?.rewardCoins || 0;

  return {
    balanceData,
    totalCoins,
    purchasedCoins,
    rewardCoins,
    loading,
    error,
    refreshBalance,
  };
};