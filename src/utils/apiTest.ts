// API Test Utility for Rocket Reels Backend
import apiService from '../services/api.service';
import { log } from './logger';

interface ApiTestResult {
  endpoint: string;
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
}

interface ApiTestSummary {
  total: number;
  passed: number;
  failed: number;
  results: ApiTestResult[];
}

export class ApiTester {
  private results: ApiTestResult[] = [];

  async testAllApis(): Promise<ApiTestSummary> {
    this.results = [];
    
    log.info('API_TEST', 'Starting comprehensive API tests...');
    
    // Test Authentication APIs
    await this.testAuthApis();
    
    // Test Content APIs
    await this.testContentApis();
    
    // Test User Interaction APIs
    await this.testUserInteractionApis();
    
    // Test Rewards APIs
    await this.testRewardsApis();
    
    // Test Subscription APIs
    await this.testSubscriptionApis();
    
    // Test Recharge APIs
    await this.testRechargeApis();
    
    const summary = this.generateSummary();
    this.logResults(summary);
    
    return summary;
  }

  private async testAuthApis() {
    log.info('API_TEST', 'Testing Authentication APIs...');
    
    // Test Get Active Countries (Public API)
    await this.testApi('Get Active Countries', () => 
      apiService.getActiveCountries()
    );
    
    // Test Get Genres (Public API)
    await this.testApi('Get Genres', () => 
      apiService.getGenres()
    );
    
    // Test Get Languages (Public API)
    await this.testApi('Get Languages', () => 
      apiService.getLanguages()
    );
  }

  private async testContentApis() {
    log.info('API_TEST', 'Testing Content APIs...');
    
    // Test Get Content List
    await this.testApi('Get Content List', () => 
      apiService.getContentList({ page: 1, limit: 10 })
    );
    
    // Test Get Latest Content
    await this.testApi('Get Latest Content', () => 
      apiService.getLatestContent({ page: 1, limit: 10 })
    );
    
    // Test Get Top Content
    await this.testApi('Get Top Content', () => 
      apiService.getTopContent({ page: 1, limit: 10 })
    );
    
    // Test Get Upcoming Content
    await this.testApi('Get Upcoming Content', () => 
      apiService.getUpcomingContent({ page: 1, limit: 10 })
    );
    
    // Test Get Customized Content
    await this.testApi('Get Customized Content', () => 
      apiService.getCustomizedContent({ page: 1, limit: 10 })
    );
    
    // Test Get Trailer List
    await this.testApi('Get Trailer List', () => 
      apiService.getTrailerList({ page: 1, limit: 10 })
    );
    
    // Test Get Banner Data
    await this.testApi('Get Banner Data', () => 
      apiService.getBannerData()
    );
  }

  private async testUserInteractionApis() {
    log.info('API_TEST', 'Testing User Interaction APIs...');
    
    // Note: These require authentication, so we'll test with a mock user ID
    const mockUserId = 'test_user_id';
    
    // Test Get Watchlist
    await this.testApi('Get Watchlist', () => 
      apiService.getWatchlist(mockUserId)
    );
    
    // Test Get Liked Content
    await this.testApi('Get Liked Content', () => 
      apiService.getLikedContent(mockUserId)
    );
    
    // Test Get Trailer Likes
    await this.testApi('Get Trailer Likes', () => 
      apiService.getTrailerLikes(mockUserId)
    );
  }

  private async testRewardsApis() {
    log.info('API_TEST', 'Testing Rewards APIs...');
    
    const mockUserId = 'test_user_id';
    
    // Test Get Balance
    await this.testApi('Get Balance', () => 
      apiService.getBalance(mockUserId)
    );
    
    // Test Get Check-in List
    await this.testApi('Get Check-in List', () => 
      apiService.getCheckInList()
    );
    
    // Test Get Reward History
    await this.testApi('Get Reward History', () => 
      apiService.getRewardHistory(mockUserId)
    );
    
    // Test Get Ads Count
    await this.testApi('Get Ads Count', () => 
      apiService.getAdsCount(mockUserId)
    );
    
    // Test Get Unlocked Episodes
    await this.testApi('Get Unlocked Episodes', () => 
      apiService.getUnlockedEpisodes(mockUserId)
    );
  }

  private async testSubscriptionApis() {
    log.info('API_TEST', 'Testing Subscription APIs...');
    
    // Test Get Subscription Plans
    await this.testApi('Get Subscription Plans', () => 
      apiService.getSubscriptionPlans()
    );
    
    // Test Get VIP Subscriptions
    await this.testApi('Get VIP Subscriptions', () => 
      apiService.getVIPSubscriptions()
    );
  }

  private async testRechargeApis() {
    log.info('API_TEST', 'Testing Recharge APIs...');
    
    const mockUserId = 'test_user_id';
    
    // Test Get Recharge List
    await this.testApi('Get Recharge List', () => 
      apiService.getRechargeList()
    );
    
    // Test Get Recharge History
    await this.testApi('Get Recharge History', () => 
      apiService.getRechargeHistory(mockUserId)
    );
  }

  private async testApi(endpoint: string, apiCall: () => Promise<any>): Promise<void> {
    const startTime = Date.now();
    
    try {
      const response = await apiCall();
      const duration = Date.now() - startTime;
      
      this.results.push({
        endpoint,
        success: true,
        response: response?.data || response,
        duration
      });
      
      log.success('API_TEST', `${endpoint} - SUCCESS (${duration}ms)`, {
        status: response?.status,
        dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A'
      });
      
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        endpoint,
        success: false,
        error: error?.message || 'Unknown error',
        duration
      });
      
      log.error('API_TEST', `${endpoint} - FAILED (${duration}ms)`, error);
    }
  }

  private generateSummary(): ApiTestSummary {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    
    return {
      total,
      passed,
      failed,
      results: this.results
    };
  }

  private logResults(summary: ApiTestSummary) {
    log.info('API_TEST', '=== API TEST SUMMARY ===', {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      successRate: `${((summary.passed / summary.total) * 100).toFixed(1)}%`
    });
    
    if (summary.failed > 0) {
      log.warn('API_TEST', 'Failed APIs:', 
        summary.results.filter(r => !r.success).map(r => ({
          endpoint: r.endpoint,
          error: r.error
        }))
      );
    }
  }

  // Test specific API with authentication
  async testAuthenticatedApi(userId: string, token: string): Promise<ApiTestSummary> {
    log.info('API_TEST', 'Testing authenticated APIs...');
    
    // Set token for authenticated requests
    apiService.setToken(token);
    
    this.results = [];
    
    // Test user profile
    await this.testApi('Get User Profile', () => 
      apiService.getUserProfile(userId)
    );
    
    // Test user interactions
    await this.testApi('Get User Watchlist', () => 
      apiService.getWatchlist(userId)
    );
    
    await this.testApi('Get User Balance', () => 
      apiService.getBalance(userId)
    );
    
    await this.testApi('Get User Reward History', () => 
      apiService.getRewardHistory(userId)
    );
    
    await this.testApi('Get User Recharge History', () => 
      apiService.getRechargeHistory(userId)
    );
    
    const summary = this.generateSummary();
    this.logResults(summary);
    
    return summary;
  }
}

// Export singleton instance
export const apiTester = new ApiTester();

// Convenience functions
export const testAllApis = () => apiTester.testAllApis();
export const testAuthenticatedApis = (userId: string, token: string) => 
  apiTester.testAuthenticatedApi(userId, token); 