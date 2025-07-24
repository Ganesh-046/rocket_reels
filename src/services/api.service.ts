// ============================================================================
// COMPREHENSIVE API SERVICE LAYER FOR ROCKET REELS OTT APPLICATION
// ============================================================================

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { log } from '../utils/logger';
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
  private token: string | null = null;

  constructor() {
    this.api = axios.create(SERVICE_CONFIG);
    this.setupInterceptors();
  }

  // ============================================================================
  // INTERCEPTORS SETUP
  // ============================================================================

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        log.apiRequest(config.method?.toUpperCase() || 'GET', config.url || '', config.data);
        
        if (this.token) {
          config.headers.accesstoken = this.token;
          log.debug('API', 'Added auth token to request');
        }
        return config;
      },
      (error) => {
        log.apiError('REQUEST', 'Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        log.apiResponse(
          response.config.method?.toUpperCase() || 'GET',
          response.config.url || '',
          response.status,
          response.data
        );
        return response;
      },
      (error) => {
        log.apiError(
          error.config?.method?.toUpperCase() || 'UNKNOWN',
          error.config?.url || 'unknown',
          error
        );
        
        if (error?.response?.status === 401) {
          log.securityEvent('Token expired, clearing token');
          // Handle token expiration
          this.clearToken();
          // You can add navigation logic here if needed
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // ============================================================================
  // 🔐 AUTHENTICATION APIs
  // ============================================================================

  async login(data: LoginRequest): Promise<ApiResponse<LoginSignupResponse>> {
    log.info('AUTH', 'Login attempt', { data });
    const response = await this.api.post(ENDPOINTS.AUTH.LOGIN, data);
    log.success('AUTH', 'Login successful', { userId: response.data.data?.userId });
    return response.data;
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<ApiResponse<LoginSignupResponse>> {
    const response = await this.api.post(ENDPOINTS.AUTH.VERIFY_OTP, data);
    return response.data;
  }

  async signup(data: SignupRequest): Promise<ApiResponse<LoginSignupResponse>> {
    const response = await this.api.post(ENDPOINTS.AUTH.SIGNUP, data);
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

  async getContentList(params: ContentListRequest): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.LIST, { 
      params,
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getContentDetails(contentId: string): Promise<ApiResponse<ContentDetailResponse>> {
    const response = await this.api.get(`${ENDPOINTS.CONTENT.DETAILS}/${contentId}`, {
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getTrailerList(params: { page?: number; limit?: number }): Promise<ApiResponse<TrailerListResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.TRAILER_LIST, { 
      params,
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getLatestContent(params: { page?: number; limit?: number }): Promise<ApiResponse<LatestContentResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.NEW_RELEASES, { 
      params,
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getTopContent(params: { page?: number; limit?: number }): Promise<ApiResponse<TopContentResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.TOP_TEN, { 
      params,
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getUpcomingContent(params: { page?: number; limit?: number }): Promise<ApiResponse<UpcomingContentResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.UPCOMING, { 
      params,
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getCustomizedContent(params: { page?: number; limit?: number }): Promise<ApiResponse<CustomizedContentResponse>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.CUSTOMIZED_LIST, { 
      params,
      headers: { 'public-request': false }
    });
    return response.data;
  }

  async getBannerData(): Promise<ApiResponse<BannerItem[]>> {
    const response = await this.api.get(ENDPOINTS.CONTENT.PROMOTIONAL, {
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
    const response = await this.api.get(ENDPOINTS.SUBSCRIPTION.PLANS);
    return response.data;
  }

  async getVIPSubscriptions(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await this.api.get(ENDPOINTS.SUBSCRIPTION.VIP_SUBSCRIPTIONS);
    return response.data;
  }

  async purchaseSubscription(data: PurchaseSubscriptionRequest): Promise<ApiResponse<{ message: string; orderId: string }>> {
    const response = await this.api.post(ENDPOINTS.SUBSCRIPTION.PURCHASE, data);
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
    const response = await this.api.get(ENDPOINTS.REWARDS.UNLOCKED_EPISODES);
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
    const response = await this.api.get('/content/search', { 
      params: { ...params, q: query } 
    });
    return response.data;
  }

  async getContentByGenre(genre: string, params: { page?: number; limit?: number }): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get(`/content/genre/${genre}`, { params });
    return response.data;
  }

  async getRelatedContent(contentId: string, params: { page?: number; limit?: number }): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get(`/content/${contentId}/related`, { params });
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