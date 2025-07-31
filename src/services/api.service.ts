// ============================================================================
// COMPREHENSIVE API SERVICE LAYER FOR ROCKET REELS OTT APPLICATION
// ============================================================================

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import MMKVStorage from '../lib/mmkv';
import {
  // Authentication Types
  LoginSignupResponse,
  UserProfile,
  ActiveCountry,
  LoginRequest,
  OTPVerificationRequest,
  SignupRequest,
  
  // Content Types
  ContentListResponse,
  ContentDetailResponse,
  TrailerListResponse,
  LatestContentResponse,
  TopContentResponse,
  UpcomingContentResponse,
  CustomizedContentResponse,
  BannerItem,
  ContentListRequest,
  
  // Rewards Types
  BalanceResponse,
  CheckInDay,
  SubscriptionPlan,
  RechargePlan,
  RechargeHistoryItem,
  RewardCoinHistoryItem,
  UnlockedEpisode,
  
  // Watchlist Types
  WatchlistItem,
  VideoData,
  WatchlistRequest,
  LikeDislikeRequest,
  WatchHistoryRequest,
  UnlockEpisodeRequest,
  
  // Static Data Types
  Genre,
  Language,
  
  // Common Types
  ApiResponse,
  DailyCheckInRequest,
  PurchaseSubscriptionRequest,
  RechargeRequest,
} from '../types/api';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const SERVICE_CONFIG = {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create(SERVICE_CONFIG);
    this.setupInterceptors();
  }

  // ============================================================================
  // INTERCEPTORS SETUP
  // ============================================================================

  private setupInterceptors() {
    // Request interceptor to add auth token (WORKING LOGIC FROM ACU_OTT)
    this.api.interceptors.request.use(
      async (config) => {
        // Get token from MMKV storage (like acu_ott)
        const token = MMKVStorage.get('accessToken');
        
        // Add token to headers if available and not a public request
        if (token && !config.headers['public-request']) {
          config.headers.accesstoken = token;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling (WORKING LOGIC FROM ACU_OTT)
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // Handle 401 errors like acu_ott
        if (error.response?.status === 401) {
          console.log('⚠️ 401 Unauthorized - Token may be expired');
          // Clear invalid token
          MMKVStorage.remove('accessToken');
          // You can add navigation to login screen here if needed
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // TOKEN MANAGEMENT (WORKING LOGIC FROM ACU_OTT)
  // ============================================================================

  setToken(token: string) {
    MMKVStorage.set('accessToken', token);
  }

  clearToken() {
    MMKVStorage.remove('accessToken');
  }

  getToken(): string | null {
    return MMKVStorage.get('accessToken');
  }

  // ============================================================================
  // 🔐 AUTHENTICATION APIs
  // ============================================================================

  async login(data: LoginRequest): Promise<ApiResponse<LoginSignupResponse>> {
    const response = await this.api.post(ENDPOINTS.AUTH.LOGIN, data);
    
    // Store token on successful login (like acu_ott)
    if (response.data.status === 200 && response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    
    return response.data;
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<ApiResponse<LoginSignupResponse>> {
    const response = await this.api.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
    
    // Store token on successful verification (like acu_ott)
    if (response.data.status === 200 && response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    
    return response.data;
  }

  async signup(data: SignupRequest): Promise<ApiResponse<LoginSignupResponse>> {
    const response = await this.api.post(ENDPOINTS.AUTH.SIGNUP, data);
    
    // Store token on successful signup (like acu_ott)
    if (response.data.status === 200 && response.data.data?.token) {
      this.setToken(response.data.data.token);
    }
    
    return response.data;
  }

  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    const response = await this.api.get(`${ENDPOINTS.AUTH.GET_USER_INFO}/${userId}`);
    return response.data;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await this.api.put(`${ENDPOINTS.AUTH.UPDATE_PROFILE}/${userId}`, data);
    return response.data;
  }

  async updateUserProfilePublic(userId: string, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await this.api.put(`${ENDPOINTS.AUTH.UPDATE_USER}/${userId}`, data);
    return response.data;
  }

  async getActiveCountries(): Promise<ApiResponse<ActiveCountry[]>> {
    const response = await this.api.get(ENDPOINTS.AUTH.GET_ACTIVE_COUNTRIES);
    return response.data;
  }

  async deleteAccount(userId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.delete(`${ENDPOINTS.AUTH.DELETE_ACCOUNT}/${userId}`);
    return response.data;
  }

  // ============================================================================
  // 📺 CONTENT MANAGEMENT APIs
  // ============================================================================

  async getContentList(adult: boolean, search: string = '', type: string = '', language: string = '', genre: string = '', trgtAud: string = '', page: number = 1, limit: number = 30): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get(`/content/list?adult=${adult}&title=${search}&page=${page}&type=${type}&trgtAud=${trgtAud}&genre=${genre}&lang=${language}&limit=${limit}`, {
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getContentDetails(contentId: string): Promise<ApiResponse<ContentDetailResponse>> {
    const response = await this.api.get(`${ENDPOINTS.CONTENT.DETAILS}/${contentId}`, {
      headers: { 'public-request': 'true' }
    });
    return response.data;
  }

  async getTrailerList(params: { page?: number; limit?: number }): Promise<ApiResponse<TrailerListResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.TRAILER_LIST, { 
      params,
      headers: { 'public-request': 'true' }
    });
    return response.data;
  }

  async getLatestContent(adult: boolean, page: number = 1, limit: number = 30): Promise<ApiResponse<LatestContentResponse>> {
    const response = await this.api.get(`/content/newReleases?adult=${adult}&page=${page}&limit=${limit}`, {
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getTopContent(adult: boolean, page: number = 1, limit: number = 30): Promise<ApiResponse<TopContentResponse>> {
    const response = await this.api.get(`/content/topTen?adult=${adult}&page=${page}&limit=${limit}`, {
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getUpcomingContent(params: { page?: number; limit?: number }): Promise<ApiResponse<UpcomingContentResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.UPCOMING, { 
      params,
      headers: { 'public-request': 'true' }
    });
    return response.data;
  }

  async getCustomizedContent(params: { page?: number; limit?: number }): Promise<ApiResponse<CustomizedContentResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.CUSTOMIZED_LIST, { 
      params,
      headers: { 'public-request': 'true' }
    });
    return response.data;
  }

  async getBannerData(): Promise<ApiResponse<BannerItem[]>> {
    const response = await this.api.get('/content/promotional', {
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getGenres(): Promise<ApiResponse<Genre[]>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.GENRE_LIST, {
      headers: { 'public-request': true }
    });
    return response.data;
  }

  async getLanguages(): Promise<ApiResponse<Language[]>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.LANGUAGE_LIST, {
      headers: { 'public-request': true }
    });
    return response.data;
  }

  // ============================================================================
  // 📺 WATCHLIST & USER INTERACTIONS APIs
  // ============================================================================

  async getWatchlist(userId: string): Promise<ApiResponse<WatchlistItem[]>> {
    const response = await this.api.get(ENDPOINTS.USER_INTERACTIONS.GET_WATCHLIST);
    return response.data;
  }

  async addToWatchlist(data: WatchlistRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(ENDPOINTS.USER_INTERACTIONS.ADD_TO_WATCHLIST, data);
    return response.data;
  }

  async removeFromWatchlist(data: WatchlistRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.delete(ENDPOINTS.USER_INTERACTIONS.REMOVE_FROM_WATCHLIST, { data });
    return response.data;
  }

  async likeDislikeContent(data: LikeDislikeRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(ENDPOINTS.USER_INTERACTIONS.LIKE_DISLIKE, data);
    return response.data;
  }

  async getLikedContent(userId: string): Promise<ApiResponse<string[]>> {
    const response = await this.api.get(ENDPOINTS.USER_INTERACTIONS.GET_LIKED_CONTENT);
    return response.data;
  }

  async likeTrailer(userId: string, trailerId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(ENDPOINTS.USER_INTERACTIONS.TRAILER_LIKE, { userId, trailerId });
    return response.data;
  }

  async getTrailerLikes(userId: string): Promise<ApiResponse<string[]>> {
    const response = await this.api.get(ENDPOINTS.USER_INTERACTIONS.GET_TRAILER_LIKES);
    return response.data;
  }

  async addWatchHistory(data: WatchHistoryRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(ENDPOINTS.CONTENT.ADD_WATCH_HISTORY, data);
    return response.data;
  }

  async getWatchHistory(contentId: string): Promise<ApiResponse<VideoData>> {
    const response = await this.api.get(`${ENDPOINTS.CONTENT.WATCH_HISTORY}/${contentId}`);
    return response.data;
  }

  async updateViewCount(contentId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(`${ENDPOINTS.CONTENT.UPDATE_VIEW_COUNT}/${contentId}`);
    return response.data;
  }

  // ============================================================================
  // 🎁 REWARDS & SUBSCRIPTION APIs
  // ============================================================================

  async getBalance(userId: string): Promise<ApiResponse<BalanceResponse>> {
    const response = await this.api.get(`${ENDPOINTS.REWARDS.BALANCE}/${userId}`);
    return response.data;
  }

  async getCheckInList(): Promise<ApiResponse<CheckInDay[]>> {
    const response = await this.api.get(ENDPOINTS.REWARDS.CHECK_IN_LIST);
    return response.data;
  }

  async dailyCheckIn(data: DailyCheckInRequest): Promise<ApiResponse<{ message: string; coins: number }>> {
    const response = await this.api.post(ENDPOINTS.REWARDS.DAILY_CHECK_IN, data);
    return response.data;
  }

  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await this.api.get(ENDPOINTS.REWARDS.SUBSCRIPTION_PLANS);
    return response.data;
  }

  async getCurrentSubscription(): Promise<ApiResponse<any>> {
    const response = await this.api.get(ENDPOINTS.REWARDS.CURRENT_SUBSCRIPTION);
    return response.data;
  }

  async getVIPSubscriptions(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await this.api.get(ENDPOINTS.REWARDS.VIP_PLANS);
    return response.data;
  }

  async purchaseSubscription(data: PurchaseSubscriptionRequest): Promise<ApiResponse<{ message: string; orderId: string }>> {
    const response = await this.api.post(ENDPOINTS.REWARDS.SUBSCRIPTION_PURCHASE, data);
    return response.data;
  }

  async updateSubscriptionStatus(data: { orderId: string; status: string; transactionId?: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(ENDPOINTS.REWARDS.SUBSCRIPTION_STATUS, data);
    return response.data;
  }

  async getRechargeList(): Promise<ApiResponse<RechargePlan[]>> {
    const response = await this.api.get(ENDPOINTS.RECHARGE.LIST);
    return response.data;
  }

  async createRecharge(data: RechargeRequest): Promise<ApiResponse<{ message: string; orderId: string }>> {
    const response = await this.api.post(ENDPOINTS.RECHARGE.CREATE, data);
    return response.data;
  }

  async updateRechargeStatus(paymentData: { orderId: string; status: string; transactionId?: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(ENDPOINTS.RECHARGE.UPDATE_STATUS, paymentData);
    return response.data;
  }

  async getRechargeHistory(userId: string): Promise<ApiResponse<RechargeHistoryItem[]>> {
    const response = await this.api.get(`${ENDPOINTS.RECHARGE.HISTORY}/${userId}`);
    return response.data;
  }

  async getRewardHistory(userId: string): Promise<ApiResponse<RewardCoinHistoryItem[]>> {
    const response = await this.api.get(`${ENDPOINTS.REWARDS.REWARD_HISTORY}/${userId}`);
    return response.data;
  }

  async getAdsCount(userId: string): Promise<ApiResponse<{ adsCount: number }>> {
    const response = await this.api.get(ENDPOINTS.REWARDS.ADS_COUNT);
    return response.data;
  }

  async updateAdStatus(adData: { userId: string; adId: string; completed: boolean }): Promise<ApiResponse<{ message: string; coins: number }>> {
    const response = await this.api.post(ENDPOINTS.REWARDS.UPDATE_AD_STATUS, adData);
    return response.data;
  }

  async unlockEpisodeWithCoins(data: UnlockEpisodeRequest): Promise<ApiResponse<{ message: string; coinsSpent: number }>> {
    const response = await this.api.post(ENDPOINTS.REWARDS.UNLOCK_COINS, data);
    return response.data;
  }

  async unlockEpisodeWithAds(data: UnlockEpisodeRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(ENDPOINTS.REWARDS.UNLOCK_ADS, data);
    return response.data;
  }

  async getUnlockedEpisodes(userId: string): Promise<ApiResponse<UnlockedEpisode[]>> {
    const response = await this.api.get(ENDPOINTS.REWARDS.GET_UNLOCKED_EPISODE);
    return response.data;
  }

  // ============================================================================
  // 🔧 UTILITY METHODS
  // ============================================================================

  async uploadFile(file: any, type: 'image' | 'video'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post('/upload/file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async searchContent(query: string, params: { page?: number; limit?: number }): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get(`/content/list?adult=true&title=${query}&page=${params.page || 1}&type=&trgtAud=&genre=&lang=&limit=${params.limit || 30}`, {
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getContentByGenre(genre: string, params: { page?: number; limit?: number }): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get(`/content/genre/${genre}`, { 
      params,
      headers: { 'public-request': 'true' }
    });
    return response.data;
  }

  async getRelatedContent(contentId: string, params: { page?: number; limit?: number }): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get(`/content/${contentId}/related`, { 
      params,
      headers: { 'public-request': 'true' }
    });
    return response.data;
  }

  // ============================================================================
  // 📊 ANALYTICS & TRACKING
  // ============================================================================

  async trackEvent(eventData: {
    eventName: string;
    userId: string;
    properties: Record<string, any>;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/analytics/track', eventData);
    return response.data;
  }

  async trackContentView(viewData: {
    userId: string;
    contentId: string;
    episodeId?: string;
    duration: number;
    progress: number;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/analytics/content-view', viewData);
    return response.data;
  }

  async trackPurchase(purchaseData: {
    userId: string;
    productId: string;
    amount: number;
    currency: string;
    success: boolean;
  }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/analytics/purchase', purchaseData);
    return response.data;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const apiService = new ApiService();

export default apiService;

// ============================================================================
// EXPORT INDIVIDUAL METHODS FOR CONVENIENCE
// ============================================================================

export const {
  // Authentication
  login,
  verifyOTP,
  signup,
  getUserProfile,
  updateUserProfile,
  updateUserProfilePublic,
  getActiveCountries,
  deleteAccount,

  // Content
  getContentList,
  getContentDetails,
  getTrailerList,
  getLatestContent,
  getTopContent,
  getUpcomingContent,
  getCustomizedContent,
  getBannerData,
  getGenres,
  getLanguages,

  // Watchlist & Interactions
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  likeDislikeContent,
  getLikedContent,
  likeTrailer,
  getTrailerLikes,
  addWatchHistory,
  getWatchHistory,
  updateViewCount,

  // Rewards & Subscriptions
  getBalance,
  getCheckInList,
  dailyCheckIn,
  getSubscriptionPlans,
  getCurrentSubscription,
  getVIPSubscriptions,
  purchaseSubscription,
  getRechargeList,
  createRecharge,
  updateRechargeStatus,
  getRechargeHistory,
  getRewardHistory,
  getAdsCount,
  updateAdStatus,
  unlockEpisodeWithCoins,
  unlockEpisodeWithAds,
  getUnlockedEpisodes,

  // Utilities
  uploadFile,
  searchContent,
  getContentByGenre,
  getRelatedContent,

  // Analytics
  trackEvent,
  trackContentView,
  trackPurchase,
} = apiService; 