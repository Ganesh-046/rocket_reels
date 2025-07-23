import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useAdSystem } from '../hooks/useAdSystem';

const AdTestScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  
  // Initialize ad system with debug logging
  const { isAdReady, isAdLoading, showAd, isEarnedReward } = useAdSystem('reward');
  
  console.log('[AD TEST] AdTestScreen loaded');
  console.log('[AD TEST] Ad ready:', isAdReady);
  console.log('[AD TEST] Ad loading:', isAdLoading);
  console.log('[AD TEST] Reward earned:', isEarnedReward);

  useEffect(() => {
    console.log('[AD TEST] Component mounted');
  }, []);

  useEffect(() => {
    if (isEarnedReward) {
      console.log('[AD TEST] Reward earned!');
      setRewardAmount(10); // Default reward amount
      Alert.alert('Reward Earned!', 'You earned 10 coins!');
    }
  }, [isEarnedReward]);

  const handleShowAd = async () => {
    console.log('[AD TEST] Show ad button pressed');
    if (isAdReady) {
      setIsLoading(true);
      try {
        await showAd('reward');
        console.log('[AD TEST] Ad show called successfully');
      } catch (error) {
        console.error('[AD TEST] Error showing ad:', error);
        Alert.alert('Error', 'Failed to show ad');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('[AD TEST] Ad not ready');
      Alert.alert('Ad Not Ready', 'Ad is not ready, please try again in a moment');
    }
  };

  const handleReloadAd = () => {
    console.log('[AD TEST] Reloading ad...');
    // The ad system handles loading automatically
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Ad System Test</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            Ad Ready: {isAdReady ? '✅ Yes' : '❌ No'}
          </Text>
          <Text style={styles.statusText}>
            Ad Loading: {isAdLoading ? '✅ Yes' : '❌ No'}
          </Text>
          <Text style={styles.statusText}>
            Reward Earned: {isEarnedReward ? '✅ Yes' : '❌ No'}
          </Text>
          {rewardAmount > 0 && (
            <Text style={styles.rewardText}>
              Coins Earned: {rewardAmount}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, isAdReady ? styles.buttonEnabled : styles.buttonDisabled]}
          onPress={handleShowAd}
          disabled={!isAdReady || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Loading...' : isAdReady ? 'Show Rewarded Ad' : 'Ad Not Ready'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.reloadButton}
          onPress={handleReloadAd}
        >
          <Text style={styles.reloadButtonText}>Reload Ad</Text>
        </TouchableOpacity>

        <Text style={styles.debugText}>
          Check console logs for detailed debug information
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffd700',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reloadButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  reloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AdTestScreen; 