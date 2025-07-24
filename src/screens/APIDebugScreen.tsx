import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// API Service
import apiService from '../services/api.service';
import { useAuthUser, useAuthToken } from '../store/auth.store';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const APIDebugScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  const token = useAuthToken();
  
  // State
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (name: string, apiCall: () => Promise<any>) => {
    try {
      console.log(`🧪 Testing ${name}...`);
      const response = await apiCall();
      console.log(`✅ ${name} response:`, response);
      
      setTestResults((prev: any) => ({
        ...prev,
        [name]: {
          success: true,
          data: response.data,
          status: response.status,
          message: response.message
        }
      }));
      
      return response;
    } catch (error: any) {
      console.error(`❌ ${name} error:`, error);
      setTestResults((prev: any) => ({
        ...prev,
        [name]: {
          success: false,
          error: error.message || 'Unknown error',
          status: error.response?.status
        }
      }));
      throw error;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      // Test 1: Get Genres (Public API)
      await testAPI('Get Genres', () => apiService.getGenres());
      
      // Test 2: Get Active Countries (Public API)
      await testAPI('Get Countries', () => apiService.getActiveCountries());
      
      // Test 3: Get Content List (Public API)
      await testAPI('Get Content List', () => 
        apiService.getContentList({ page: 1, limit: 5 })
      );
      
      // Test 4: Get Subscription Plans (Public API)
      await testAPI('Get Subscription Plans', () => apiService.getSubscriptionPlans());
      
      // Test 5: Get Recharge List (Public API)
      await testAPI('Get Recharge List', () => apiService.getRechargeList());
      
      // Test authenticated APIs if user is logged in
      if (user?._id && token) {
        console.log('🔐 User authenticated, testing private APIs...');
        
        // Test 6: Get User Profile
        await testAPI('Get User Profile', () => apiService.getUserProfile(user._id));
        
        // Test 7: Get User Balance
        await testAPI('Get User Balance', () => apiService.getBalance(user._id));
        
        // Test 8: Get Transaction History
        await testAPI('Get Transaction History', () => apiService.getRechargeHistory(user._id));
        
        // Test 9: Get Reward History
        await testAPI('Get Reward History', () => apiService.getRewardHistory(user._id));
      } else {
        console.log('⚠️ User not authenticated, skipping private APIs');
      }
      
      Alert.alert('Success', 'All API tests completed! Check console for details.');
      
    } catch (error) {
      console.error('❌ Test suite error:', error);
      Alert.alert('Error', 'Some tests failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>API Debug</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  const renderTestResult = (name: string, result: any) => (
    <View key={name} style={styles.testResult}>
      <View style={styles.testHeader}>
        <Text style={styles.testName}>{name}</Text>
        <View style={[
          styles.statusBadge,
          result.success ? styles.statusSuccess : styles.statusFailed
        ]}>
          <Icon 
            name={result.success ? 'check-circle' : 'error'} 
            size={16} 
            color="#ffffff" 
          />
          <Text style={styles.statusText}>
            {result.success ? 'PASS' : 'FAIL'}
          </Text>
        </View>
      </View>
      
      {result.success ? (
        <View style={styles.successData}>
          <Text style={styles.dataLabel}>Status: {result.status}</Text>
          <Text style={styles.dataLabel}>Message: {result.message}</Text>
          <Text style={styles.dataLabel}>
            Data: {JSON.stringify(result.data).substring(0, 100)}...
          </Text>
        </View>
      ) : (
        <View style={styles.errorData}>
          <Text style={styles.errorText}>Error: {result.error}</Text>
          {result.status && (
            <Text style={styles.errorText}>Status: {result.status}</Text>
          )}
        </View>
      )}
    </View>
  );

  const renderUserInfo = () => (
    <View style={styles.userInfo}>
      <Text style={styles.userInfoTitle}>User Information</Text>
      <Text style={styles.userInfoText}>User ID: {user?._id || 'Not logged in'}</Text>
      <Text style={styles.userInfoText}>Token: {token ? 'Present' : 'Missing'}</Text>
      <Text style={styles.userInfoText}>User Name: {user?.userName || 'N/A'}</Text>
    </View>
  );

  return (
    <LinearGradient 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }} 
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {renderHeader()}
      
      <ScrollView style={styles.content}>
        {renderUserInfo()}
        
        <TouchableOpacity
          style={styles.testButton}
          onPress={runAllTests}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>
            {loading ? 'Running Tests...' : 'Run All API Tests'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          
          {Object.keys(testResults).length === 0 ? (
            <Text style={styles.noResults}>No tests run yet. Tap the button above to start.</Text>
          ) : (
            Object.entries(testResults).map(([name, result]) => 
              renderTestResult(name, result)
            )
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  backButton: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
    height: isLargeDevice ? width * 0.08 : width * 0.12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  headerSpacer: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
  },
  content: {
    flex: 1,
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  userInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: isLargeDevice ? width * 0.02 : width * 0.03,
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  userInfoTitle: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  userInfoText: {
    fontSize: isLargeDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: isLargeDevice ? width * 0.02 : width * 0.03,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  testButtonText: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  resultsTitle: {
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.02,
  },
  noResults: {
    fontSize: isLargeDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  testResult: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  testName: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isLargeDevice ? width * 0.01 : width * 0.015,
    paddingVertical: isLargeDevice ? width * 0.005 : width * 0.008,
    borderRadius: 12,
  },
  statusSuccess: {
    backgroundColor: '#4CAF50',
  },
  statusFailed: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: isLargeDevice ? 10 : 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 4,
  },
  successData: {
    gap: 4,
  },
  dataLabel: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  errorData: {
    gap: 4,
  },
  errorText: {
    fontSize: isLargeDevice ? 11 : 12,
    color: '#FFCDD2',
    fontFamily: 'monospace',
  },
});

export default APIDebugScreen; 