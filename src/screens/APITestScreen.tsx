import React, { useState } from 'react';
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
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Hooks and context
import { useTheme } from '../hooks/useTheme';
import useThemedStyles from '../hooks/useThemedStyles';
import { useAuthUser, useAuthToken } from '../store/auth.store';

// Components
import ActivityLoader from '../components/common/ActivityLoader';

// API Test Utility
import { testAllApis, testAuthenticatedApis } from '../utils/apiTest';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

interface TestResult {
  endpoint: string;
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
}

const APITestScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  const token = useAuthToken();
  
  // State
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestSummary | null>(null);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runAllTests = async () => {
    try {
      setLoading(true);
      setCurrentTest('Running all API tests...');
      
      const results = await testAllApis();
      setTestResults(results);
      
      Alert.alert(
        'Test Complete',
        `Tests completed!\n\nPassed: ${results.passed}/${results.total}\nFailed: ${results.failed}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Test error:', error);
      Alert.alert('Error', 'Failed to run tests. Please try again.');
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const runAuthenticatedTests = async () => {
    if (!user?._id) {
      Alert.alert('Error', 'User not authenticated. Please login first.');
      return;
    }

    try {
      setLoading(true);
      setCurrentTest('Running authenticated API tests...');
      
      // Get token from auth store
      const authToken = token || 'test_token';
      
      const results = await testAuthenticatedApis(user._id, authToken);
      setTestResults(results);
      
      Alert.alert(
        'Test Complete',
        `Authenticated tests completed!\n\nPassed: ${results.passed}/${results.total}\nFailed: ${results.failed}`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Authenticated test error:', error);
      Alert.alert('Error', 'Failed to run authenticated tests. Please try again.');
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>API Test Suite</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderTestButtons = () => (
    <View style={style.testButtonsContainer}>
      <TouchableOpacity
        style={style.testButton}
        onPress={runAllTests}
        disabled={loading}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={style.testButtonGradient}
        >
          <FontAwesome5 name="network-wired" size={24} color="#ffffff" />
          <Text style={style.testButtonText}>Test All APIs</Text>
          <Text style={style.testButtonSubtext}>Public endpoints</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={style.testButton}
        onPress={runAuthenticatedTests}
        disabled={loading || !user?._id}
      >
        <LinearGradient
          colors={user?._id ? ['#2196F3', '#1976D2'] : ['#9E9E9E', '#757575']}
          style={style.testButtonGradient}
        >
          <Icon name="security" size={24} color="#ffffff" />
          <Text style={style.testButtonText}>Test Auth APIs</Text>
          <Text style={style.testButtonSubtext}>
            {user?._id ? 'User endpoints' : 'Login required'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderTestResults = () => {
    if (!testResults) return null;

    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    const isSuccess = testResults.failed === 0;

    return (
      <View style={style.resultsContainer}>
        <View style={style.summaryCard}>
          <LinearGradient
            colors={isSuccess ? ['#4CAF50', '#45A049'] : ['#FF9800', '#F57C00']}
            style={style.summaryGradient}
          >
            <Text style={style.summaryTitle}>Test Results</Text>
            <View style={style.summaryStats}>
              <View style={style.statItem}>
                <Text style={style.statNumber}>{testResults.total}</Text>
                <Text style={style.statLabel}>Total</Text>
              </View>
              <View style={style.statItem}>
                <Text style={style.statNumber}>{testResults.passed}</Text>
                <Text style={style.statLabel}>Passed</Text>
              </View>
              <View style={style.statItem}>
                <Text style={style.statNumber}>{testResults.failed}</Text>
                <Text style={style.statLabel}>Failed</Text>
              </View>
              <View style={style.statItem}>
                <Text style={style.statNumber}>{successRate}%</Text>
                <Text style={style.statLabel}>Success</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={style.detailsContainer}>
          <Text style={style.detailsTitle}>Test Details</Text>
          <ScrollView style={style.detailsList}>
            {testResults.results.map((result, index) => (
              <View key={index} style={style.resultItem}>
                <View style={style.resultHeader}>
                  <View style={style.resultInfo}>
                    <Text style={style.resultEndpoint}>{result.endpoint}</Text>
                    <Text style={style.resultDuration}>{result.duration}ms</Text>
                  </View>
                  <View style={[
                    style.resultStatus,
                    result.success ? style.statusSuccess : style.statusFailed
                  ]}>
                    <Icon 
                      name={result.success ? 'check-circle' : 'error'} 
                      size={16} 
                      color="#ffffff" 
                    />
                    <Text style={style.statusText}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </Text>
                  </View>
                </View>
                {!result.success && result.error && (
                  <Text style={style.errorText}>{result.error}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }} 
      colors={['#ed9b72', '#7d2537']}
      style={[style.container, { paddingTop: insets.top }]}
    >
      {renderHeader()}
      
      {loading ? (
        <View style={style.loadingContainer}>
          <ActivityLoader loaderColor={colors.PRIMARYWHITE} />
          <Text style={style.loadingText}>{currentTest}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={style.scrollContainer}
        >
          {renderTestButtons()}
          {renderTestResults()}
        </ScrollView>
      )}
    </LinearGradient>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.TRANSPARENT,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: isLargeDevice ? 16 : 18,
    color: '#ffffff',
    marginTop: isLargeDevice ? width * 0.02 : width * 0.03,
    textAlign: 'center',
  },
  scrollContainer: {
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  testButtonsContainer: {
    gap: isLargeDevice ? width * 0.02 : width * 0.03,
    marginBottom: isLargeDevice ? width * 0.03 : width * 0.04,
  },
  testButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  testButtonGradient: {
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.008,
  },
  testButtonSubtext: {
    fontSize: isLargeDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  resultsContainer: {
    gap: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  summaryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryGradient: {
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
  },
  summaryTitle: {
    fontSize: isLargeDevice ? 20 : 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: isLargeDevice ? 24 : 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isLargeDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
  },
  detailsTitle: {
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.02,
  },
  detailsList: {
    maxHeight: height * 0.4,
  },
  resultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultEndpoint: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultDuration: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  resultStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isLargeDevice ? width * 0.015 : width * 0.02,
    paddingVertical: isLargeDevice ? width * 0.008 : width * 0.012,
    borderRadius: 16,
  },
  statusSuccess: {
    backgroundColor: '#4CAF50',
  },
  statusFailed: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: isLargeDevice ? 11 : 12,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 4,
  },
  errorText: {
    fontSize: isLargeDevice ? 11 : 12,
    color: '#FFCDD2',
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
    fontStyle: 'italic',
  },
});

export default APITestScreen; 