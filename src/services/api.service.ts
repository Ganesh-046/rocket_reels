// ============================================================================
// COMPREHENSIVE API SERVICE LAYER FOR ROCKET REELS OTT APPLICATION
// ============================================================================

import axios, { AxiosInstance, AxiosResponse } from 'axios';
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

const API_CONFIG = {
  baseURL: 'https://api.rocketreels.com/v1', // Replace with your actual API base URL
  timeout: 30000,
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
    this.api = axios.create(API_CONFIG);
    this.setupInterceptors();
  }

  // ============================================================================
  // INTERCEPTORS SETUP
  // ============================================================================

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.clearToken();
          // You can dispatch a logout action here
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
    const response = await this.api.post('/auth/login', data);
    return response.data;
  }

  async verifyOTP(data: OTPVerificationRequest): Promise<ApiResponse<LoginSignupResponse>> {
    const response = await this.api.post('/auth/verify-otp', data);
    return response.data;
  }

  async signup(data: SignupRequest): Promise<ApiResponse<LoginSignupResponse>> {
    const response = await this.api.post('/auth/signup', data);
    return response.data;
  }

  async getUserProfile(userId: string): Promise<ApiResponse<UserProfile>> {
    const response = await this.api.get(`/auth/profile/${userId}`);
    return response.data;
  }

  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    const response = await this.api.put(`/auth/profile/${userId}`, data);
    return response.data;
  }

  async getActiveCountries(): Promise<ApiResponse<ActiveCountry[]>> {
    const response = await this.api.get('/auth/countries');
    return response.data;
  }

  async deleteAccount(userId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.delete(`/auth/account/${userId}`);
    return response.data;
  }

  // ============================================================================
  // 📺 CONTENT MANAGEMENT APIs
  // ============================================================================

  async getContentList(params: ContentListRequest): Promise<ApiResponse<ContentListResponse>> {
    const response = await this.api.get('/content/list', { params });
    return response.data;
  }

  async getContentDetails(contentId: string): Promise<ApiResponse<ContentDetailResponse>> {
    const response = await this.api.get(`/content/${contentId}`);
    return response.data;
  }

  async getTrailerList(params: { page?: number; limit?: number }): Promise<ApiResponse<TrailerListResponse>> {
    const response = await this.api.get('/content/trailers', { params });
    return response.data;
  }

  async getLatestContent(params: { page?: number; limit?: number }): Promise<ApiResponse<LatestContentResponse>> {
    const response = await this.api.get('/content/latest', { params });
    return response.data;
  }

  async getTopContent(params: { page?: number; limit?: number }): Promise<ApiResponse<TopContentResponse>> {
    const response = await this.api.get('/content/top', { params });
    return response.data;
  }

  async getUpcomingContent(params: { page?: number; limit?: number }): Promise<ApiResponse<UpcomingContentResponse>> {
    const response = await this.api.get('/content/upcoming', { params });
    return response.data;
  }

  async getCustomizedContent(params: { page?: number; limit?: number }): Promise<ApiResponse<CustomizedContentResponse>> {
    const response = await this.api.get('/content/customized', { params });
    return response.data;
  }

  async getBannerData(): Promise<ApiResponse<BannerItem[]>> {
    const response = await this.api.get('/content/banners');
    return response.data;
  }

  async getGenres(): Promise<ApiResponse<Genre[]>> {
    const response = await this.api.get('/content/genres');
    return response.data;
  }

  async getLanguages(): Promise<ApiResponse<Language[]>> {
    const response = await this.api.get('/content/languages');
    return response.data;
  }

  // ============================================================================
  // 📺 WATCHLIST & USER INTERACTIONS APIs
  // ============================================================================

  async getWatchlist(userId: string): Promise<ApiResponse<WatchlistItem[]>> {
    const response = await this.api.get(`/user/${userId}/watchlist`);
    return response.data;
  }

  async addToWatchlist(data: WatchlistRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/user/watchlist/add', data);
    return response.data;
  }

  async removeFromWatchlist(data: WatchlistRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.delete('/user/watchlist/remove', { data });
    return response.data;
  }

  async likeDislikeContent(data: LikeDislikeRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/user/like-dislike', data);
    return response.data;
  }

  async getLikedContent(userId: string): Promise<ApiResponse<string[]>> {
    const response = await this.api.get(`/user/${userId}/liked-content`);
    return response.data;
  }

  async likeTrailer(userId: string, trailerId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/user/trailer-like', { userId, trailerId });
    return response.data;
  }

  async getTrailerLikes(userId: string): Promise<ApiResponse<string[]>> {
    const response = await this.api.get(`/user/${userId}/trailer-likes`);
    return response.data;
  }

  async addWatchHistory(data: WatchHistoryRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/user/watch-history', data);
    return response.data;
  }

  async getWatchHistory(contentId: string): Promise<ApiResponse<VideoData>> {
    const response = await this.api.get(`/user/watch-history/${contentId}`);
    return response.data;
  }

  async updateViewCount(contentId: string): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post(`/content/${contentId}/view`);
    return response.data;
  }

  // ============================================================================
  // 🎁 REWARDS & SUBSCRIPTION APIs
  // ============================================================================

  async getBalance(userId: string): Promise<ApiResponse<BalanceResponse>> {
    const response = await this.api.get(`/rewards/balance/${userId}`);
    return response.data;
  }

  async getCheckInList(): Promise<ApiResponse<CheckInDay[]>> {
    const response = await this.api.get('/rewards/check-in-list');
    return response.data;
  }

  async dailyCheckIn(data: DailyCheckInRequest): Promise<ApiResponse<{ message: string; coins: number }>> {
    const response = await this.api.post('/rewards/daily-check-in', data);
    return response.data;
  }

  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await this.api.get('/subscription/plans');
    return response.data;
  }

  async getVIPSubscriptions(): Promise<ApiResponse<SubscriptionPlan[]>> {
    const response = await this.api.get('/subscription/vip-plans');
    return response.data;
  }

  async purchaseSubscription(data: PurchaseSubscriptionRequest): Promise<ApiResponse<{ message: string; orderId: string }>> {
    const response = await this.api.post('/subscription/purchase', data);
    return response.data;
  }

  async getRechargeList(): Promise<ApiResponse<RechargePlan[]>> {
    const response = await this.api.get('/rewards/recharge-list');
    return response.data;
  }

  async createRecharge(data: RechargeRequest): Promise<ApiResponse<{ message: string; orderId: string }>> {
    const response = await this.api.post('/rewards/recharge', data);
    return response.data;
  }

  async updateRechargeStatus(paymentData: { orderId: string; status: string; transactionId?: string }): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/rewards/recharge-status', paymentData);
    return response.data;
  }

  async getRechargeHistory(userId: string): Promise<ApiResponse<RechargeHistoryItem[]>> {
    const response = await this.api.get(`/rewards/recharge-history/${userId}`);
    return response.data;
  }

  async getRewardHistory(userId: string): Promise<ApiResponse<RewardCoinHistoryItem[]>> {
    const response = await this.api.get(`/rewards/history/${userId}`);
    return response.data;
  }

  async getAdsCount(userId: string): Promise<ApiResponse<{ adsCount: number }>> {
    const response = await this.api.get(`/rewards/ads-count/${userId}`);
    return response.data;
  }

  async updateAdStatus(adData: { userId: string; adId: string; completed: boolean }): Promise<ApiResponse<{ message: string; coins: number }>> {
    const response = await this.api.post('/rewards/ad-status', adData);
    return response.data;
  }

  async unlockEpisodeWithCoins(data: UnlockEpisodeRequest): Promise<ApiResponse<{ message: string; coinsSpent: number }>> {
    const response = await this.api.post('/content/unlock-coins', data);
    return response.data;
  }

  async unlockEpisodeWithAds(data: UnlockEpisodeRequest): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post('/content/unlock-ads', data);
    return response.data;
  }

  async getUnlockedEpisodes(userId: string): Promise<ApiResponse<UnlockedEpisode[]>> {
    const response = await this.api.get(`/user/${userId}/unlocked-episodes`);
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