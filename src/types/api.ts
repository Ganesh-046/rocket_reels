// ============================================================================
// COMPLETE API RESPONSE TYPES FOR ROCKET REELS OTT APPLICATION
// ============================================================================

// ============================================================================
// 🔐 AUTHENTICATION & USER APIs
// ============================================================================

export interface LoginSignupResponse {
  isNew: boolean;
  userId: string;
  token: string;
  message: string;
}

export interface UserProfile {
  _id: string;
  userName: string;
  userEmail: string;
  mobileNo: string;
  gender: string; // "male", "female", etc.
  dateOfBirth: string;
  callingCode: string;
  countryName: string;
  checkInStreak: number;
  checkInDate: string;
  profiles: UserProfileItem[];
}

export interface UserProfileItem {
  _id: string;
  profileName: string;
  // Add other profile fields as needed
}

export interface ActiveCountry {
  mobileRegisterationAllowed: boolean;
  countryName: string;
  callingCode: string;
}

// ============================================================================
// 📺 CONTENT MANAGEMENT APIs
// ============================================================================

export interface Genre {
  name: string;
  slug: string;
}

export interface ContentDetails {
  backdropImage: string;
  thumb: string;
  posterImage: string;
  maturityRating: string;
  genres: Genre[];
  releasingDate: string;
  favourites: number;
  isFavourite: boolean;
  adsCount: number;
  coinsPerEpisode: number;
}

export interface ContentItem {
  _id: string;
  title: string;
  contentDetails: ContentDetails;
}

export interface ContentListResponse {
  result: ContentItem[];
  hasNext: boolean;
  page: number;
}

export interface Cast {
  name: string;
  role: string;
}

export interface Episode {
  _id: string;
  title: string;
  status: 'locked' | 'unlocked';
  duration: number;
  videoUrl: string;
}

export interface ContentDetailResponse {
  _id: string;
  title: string;
  backdropImage: string;
  genres: Genre[];
  casts: Cast[];
  producers: Cast[];
  directors: Cast[];
  episodes: Episode[];
  favourites: number;
  isFavourite: boolean;
  adsCount: number;
  coinsPerEpisode: number;
}

export interface Trailer {
  _id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
}

export interface TrailerListResponse {
  trailers: Trailer[];
  hasNext: boolean;
  page: number;
}

export interface LatestContentResponse {
  contentList: ContentItem[];
  hasNext: boolean;
  page: number;
}

export interface TopContentResponse {
  top: ContentItem[];
  hasNext: boolean;
  page: number;
}

export interface UpcomingContentResponse {
  filteredContentList: ContentItem[];
  hasNext: boolean;
  page: number;
}

export interface CustomizedContentResponse {
  findTargetAudience: ContentItem[];
  hasNext: boolean;
  page: number;
}

export interface BannerItem {
  _id: string;
  imageUri: string;
  contentDetails: {
    backdropImage: string;
    thumb: string;
    posterImage: string;
  };
}

// ============================================================================
// 🎁 REWARDS & SUBSCRIPTION APIs
// ============================================================================

export interface CoinsQuantity {
  totalCoins: number;
  purchasedCoins: number;
  rewardCoins: number;
}

export interface BalanceResponse {
  coinsQuantity: CoinsQuantity;
}

export interface CheckInDay {
  _id: string;
  day1: number;
  day2: number;
  day3: number;
  day4: number;
  day5: number;
  day6: number;
  day7: number;
}

export interface SubscriptionPlan {
  _id: string;
  planName: string; // e.g., "VIP_7", "PREMIUM_30"
  planDuration: number; // Days
  description: string;
  price: number;
  productId: string;
}

export interface RechargePlan {
  _id: string;
  planName: string; // e.g., "COINS_100", "COINS_500"
  price: number;
  coins: number;
}

export interface RechargeHistoryItem {
  _id: string;
  amount: number;
  coins: number;
  status: 'pending' | 'complete' | 'failed';
  createdAt: string;
}

export interface RewardCoinHistoryItem {
  _id: string;
  benefitTitle: string; // e.g., "Daily Check-in", "Watch Video"
  coins: number;
  createdAt: string;
  expiryDate: string;
  isExpired: boolean;
}

export interface UnlockedEpisode {
  _id: string;
  contentId: string;
  episodeId: string;
  unlockedAt: string;
}

// ============================================================================
// 🌐 STATIC DATA APIs
// ============================================================================

export interface Language {
  name: string; // e.g., "English", "Hindi"
  code: string; // e.g., "en", "hi"
}

// ============================================================================
// 📺 WATCHLIST & PREFERENCES APIs
// ============================================================================

export interface WatchlistItem {
  _id: string;
  title: string;
  contentDetails: {
    backdropImage: string;
    thumb: string;
    posterImage: string;
  };
}

export interface VideoData {
  contentId: string;
  episodeId: string;
  duration: number; // Watched duration in seconds
  totalDuration: number; // Total video duration
  lastWatchedAt: string;
}

// ============================================================================
// 🔧 COMMON RESPONSE STRUCTURE
// ============================================================================

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  hasNext?: boolean;
  page?: number;
}

// ============================================================================
// 📊 STATE MANAGEMENT TYPES
// ============================================================================

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ContentState {
  contentDetail: ContentDetailResponse | null;
  watchListData: WatchlistItem[];
  unlockedEpisodeData: UnlockedEpisode[];
  trailerLike: string[];
  videoData: VideoData | null;
  isLoading: boolean;
}

export interface RewardsState {
  balanceData: BalanceResponse | null;
  checkInList: CheckInDay[];
  vipSubcriptionData: SubscriptionPlan[];
  rechargeList: RechargePlan[];
  rechargeHistory: RechargeHistoryItem[];
  rewardCoinHistory: RewardCoinHistoryItem[];
  isLoading: boolean;
}

// ============================================================================
// 🎯 UTILITY TYPES
// ============================================================================

export type ContentType = 'movie' | 'tv_show' | 'trailer';
export type Gender = 'male' | 'female' | 'other';
export type TransactionStatus = 'pending' | 'complete' | 'failed';
export type EpisodeStatus = 'locked' | 'unlocked';
export type PlanType = 'VIP' | 'PREMIUM' | 'BASIC';

// ============================================================================
// 🔄 API REQUEST TYPES
// ============================================================================

export interface LoginRequest {
  mobileNo: string;
  callingCode: string;
}

export interface OTPVerificationRequest {
  mobileNo: string;
  callingCode: string;
  otp: string;
}

export interface SignupRequest {
  userName: string;
  userEmail: string;
  mobileNo: string;
  callingCode: string;
  gender: Gender;
  dateOfBirth: string;
  countryName: string;
  referralCode?: string;
}

export interface ContentListRequest {
  page?: number;
  limit?: number;
  genre?: string;
  language?: string;
  type?: ContentType;
  search?: string;
}

export interface WatchlistRequest {
  userId: string;
  contentId: string;
}

export interface LikeDislikeRequest {
  userId: string;
  episodeId: string;
  isLike: boolean;
}

export interface WatchHistoryRequest {
  userId: string;
  contentId: string;
  episodeId: string;
  duration: number;
  totalDuration: number;
}

export interface UnlockEpisodeRequest {
  userId: string;
  episodeId: string;
  method: 'coins' | 'ads';
  coins?: number;
}

export interface DailyCheckInRequest {
  userId: string;
}

export interface PurchaseSubscriptionRequest {
  userId: string;
  planId: string;
  paymentMethod: string;
}

export interface RechargeRequest {
  userId: string;
  planId: string;
  currency: string;
}

// ============================================================================
// 📱 SCREEN NAVIGATION TYPES
// ============================================================================

export interface NavigationParams {
  // Auth Stack
  Login?: undefined;
  Signup?: undefined;
  
  // Main Stack
  Home?: undefined;
  Detail?: { movieId: string };
  Search?: { initialQuery?: string };
  Genre?: { genreName: string };
  History?: undefined;
  MyList?: undefined;
  EditProfile?: undefined;
  MyWallet?: undefined;
  Refill?: undefined;
  Transaction?: undefined;
  Subscription?: undefined;
  VideoPlayer?: { contentId: string; episodeId?: string };
  WebView?: { url: string; title?: string };
  
  // Feature Screens
  Settings?: undefined;
  RewardHistory?: undefined;
  EpisodePlayer?: { episodeId: string; contentId: string };
  ReelPlayer?: { reel: any };
  UltraShorts?: undefined;
  Rewards?: undefined;
  
  // Upload Flow
  Upload?: undefined;
  Preview?: { videoUri: string };
  Caption?: { videoUri: string; previewData: any };
}

// ============================================================================
// 🎨 UI COMPONENT TYPES
// ============================================================================

export interface MovieCardProps {
  movie: ContentItem;
  onPress: () => void;
  showProgress?: boolean;
  progress?: number;
}

export interface GenreTabProps {
  genres: Genre[];
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

export interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
  onProgress?: (progress: number) => void;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retry?: () => void;
}

// ============================================================================
// 🔧 CONFIGURATION TYPES
// ============================================================================

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface AppConfig {
  api: ApiConfig;
  features: {
    enablePushNotifications: boolean;
    enableAds: boolean;
    enableInAppPurchases: boolean;
  };
  limits: {
    maxWatchlistItems: number;
    maxSearchHistory: number;
    maxProfiles: number;
  };
}

// ============================================================================
// 📊 ANALYTICS & TRACKING TYPES
// ============================================================================

export interface UserEvent {
  eventName: string;
  userId: string;
  timestamp: string;
  properties: Record<string, any>;
}

export interface ContentViewEvent extends UserEvent {
  contentId: string;
  episodeId?: string;
  duration: number;
  progress: number;
}

export interface PurchaseEvent extends UserEvent {
  productId: string;
  amount: number;
  currency: string;
  success: boolean;
}

// ============================================================================
// 🎯 EXPORT ALL TYPES
// ============================================================================

export type {
  // Re-export commonly used types
  LoginSignupResponse as AuthResponse,
  ContentDetailResponse as ContentDetail,
  BalanceResponse as UserBalance,
  SubscriptionPlan as Plan,
  RechargePlan as CoinPackage,
  WatchlistItem as WatchlistContent,
  VideoData as WatchProgress,
}; 