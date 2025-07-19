# 🚀 Complete API Integration Guide - Rocket Reels OTT Application

## 📋 Table of Contents

1. [Overview](#overview)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [API Service Layer](#api-service-layer)
4. [React Query Hooks](#react-query-hooks)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)

## 🎯 Overview

This guide provides comprehensive documentation for integrating APIs in the Rocket Reels OTT application using TypeScript interfaces and React Query hooks. The implementation ensures type safety, proper caching, and optimal performance.

## 🔧 TypeScript Interfaces

### Core Response Structure

All API responses follow this standard structure:

```typescript
interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  hasNext?: boolean;
  page?: number;
}
```

### Authentication Types

```typescript
// Login/Signup Response
interface LoginSignupResponse {
  isNew: boolean;
  userId: string;
  token: string;
  message: string;
}

// User Profile
interface UserProfile {
  _id: string;
  userName: string;
  userEmail: string;
  mobileNo: string;
  gender: string;
  dateOfBirth: string;
  callingCode: string;
  countryName: string;
  checkInStreak: number;
  checkInDate: string;
  profiles: UserProfileItem[];
}
```

### Content Types

```typescript
// Content Item
interface ContentItem {
  _id: string;
  title: string;
  contentDetails: ContentDetails;
}

// Content Details
interface ContentDetails {
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

// Content Detail Response
interface ContentDetailResponse {
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
```

### Rewards Types

```typescript
// Balance Response
interface BalanceResponse {
  coinsQuantity: {
    totalCoins: number;
    purchasedCoins: number;
    rewardCoins: number;
  };
}

// Subscription Plan
interface SubscriptionPlan {
  _id: string;
  planName: string;
  planDuration: number;
  description: string;
  price: number;
  productId: string;
}

// Recharge Plan
interface RechargePlan {
  _id: string;
  planName: string;
  price: number;
  coins: number;
}
```

## 🛠️ API Service Layer

### Service Configuration

```typescript
// src/services/api.service.ts
const API_CONFIG = {
  baseURL: 'https://api.rocketreels.com/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
```

### Authentication Methods

```typescript
// Login
const login = async (data: LoginRequest): Promise<ApiResponse<LoginSignupResponse>> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

// OTP Verification
const verifyOTP = async (data: OTPVerificationRequest): Promise<ApiResponse<LoginSignupResponse>> => {
  const response = await api.post('/auth/verify-otp', data);
  return response.data;
};

// Get User Profile
const getUserProfile = async (userId: string): Promise<ApiResponse<UserProfile>> => {
  const response = await api.get(`/auth/profile/${userId}`);
  return response.data;
};
```

### Content Methods

```typescript
// Get Content List
const getContentList = async (params: ContentListRequest): Promise<ApiResponse<ContentListResponse>> => {
  const response = await api.get('/content/list', { params });
  return response.data;
};

// Get Content Details
const getContentDetails = async (contentId: string): Promise<ApiResponse<ContentDetailResponse>> => {
  const response = await api.get(`/content/${contentId}`);
  return response.data;
};

// Search Content
const searchContent = async (query: string, params: { page?: number; limit?: number }): Promise<ApiResponse<ContentListResponse>> => {
  const response = await api.get('/content/search', { params: { ...params, q: query } });
  return response.data;
};
```

### Rewards Methods

```typescript
// Get Balance
const getBalance = async (userId: string): Promise<ApiResponse<BalanceResponse>> => {
  const response = await api.get(`/rewards/balance/${userId}`);
  return response.data;
};

// Daily Check-in
const dailyCheckIn = async (data: DailyCheckInRequest): Promise<ApiResponse<{ message: string; coins: number }>> => {
  const response = await api.post('/rewards/daily-check-in', data);
  return response.data;
};

// Get Subscription Plans
const getSubscriptionPlans = async (): Promise<ApiResponse<SubscriptionPlan[]>> => {
  const response = await api.get('/subscription/plans');
  return response.data;
};
```

## 🎣 React Query Hooks

### Query Keys Structure

```typescript
export const queryKeys = {
  auth: {
    profile: (userId: string) => ['auth', 'profile', userId],
    countries: ['auth', 'countries'],
  },
  content: {
    list: (params: ContentListRequest) => ['content', 'list', params],
    detail: (contentId: string) => ['content', 'detail', contentId],
    search: (query: string, params: any) => ['content', 'search', query, params],
  },
  rewards: {
    balance: (userId: string) => ['rewards', 'balance', userId],
    subscriptionPlans: ['rewards', 'subscription-plans'],
  },
};
```

### Authentication Hooks

```typescript
// Get User Profile
export const useUser = (userId: string, options?: UseQueryOptions<ApiResponse<UserProfile>>) => {
  return useQuery({
    queryKey: queryKeys.auth.profile(userId),
    queryFn: () => apiService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Login Mutation
export const useLogin = (options?: UseMutationOptions<ApiResponse<LoginSignupResponse>, Error, LoginRequest>) => {
  return useMutation({
    mutationFn: (data: LoginRequest) => apiService.login(data),
    ...options,
  });
};

// OTP Verification
export const useOTPVerification = (options?: UseMutationOptions<ApiResponse<LoginSignupResponse>, Error, OTPVerificationRequest>) => {
  return useMutation({
    mutationFn: (data: OTPVerificationRequest) => apiService.verifyOTP(data),
    ...options,
  });
};
```

### Content Hooks

```typescript
// Get Content List
export const useContentList = (params: ContentListRequest, options?: UseQueryOptions<ApiResponse<ContentListResponse>>) => {
  return useQuery({
    queryKey: queryKeys.content.list(params),
    queryFn: () => apiService.getContentList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Get Content Details
export const useContentDetails = (contentId: string, options?: UseQueryOptions<ApiResponse<ContentDetailResponse>>) => {
  return useQuery({
    queryKey: queryKeys.content.detail(contentId),
    queryFn: () => apiService.getContentDetails(contentId),
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Search Content
export const useSearchContent = (query: string, params: { page?: number; limit?: number }, options?: UseQueryOptions<ApiResponse<ContentListResponse>>) => {
  return useQuery({
    queryKey: queryKeys.content.search(query, params),
    queryFn: () => apiService.searchContent(query, params),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};
```

### Rewards Hooks

```typescript
// Get Balance
export const useBalance = (userId: string, options?: UseQueryOptions<ApiResponse<BalanceResponse>>) => {
  return useQuery({
    queryKey: queryKeys.rewards.balance(userId),
    queryFn: () => apiService.getBalance(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  });
};

// Daily Check-in
export const useDailyCheckIn = (options?: UseMutationOptions<ApiResponse<{ message: string; coins: number }>, Error, DailyCheckInRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DailyCheckInRequest) => apiService.dailyCheckIn(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.balance(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.rewardHistory(variables.userId) });
    },
    ...options,
  });
};
```

## 💡 Usage Examples

### 1. Authentication Flow

```typescript
// LoginScreen.tsx
import { useLogin, useOTPVerification } from '../hooks/useApi';

const LoginScreen = () => {
  const loginMutation = useLogin({
    onSuccess: (data) => {
      if (data.data.isNew) {
        // Navigate to signup
        navigation.navigate('Signup');
      } else {
        // Navigate to OTP verification
        navigation.navigate('OTPVerification');
      }
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const otpMutation = useOTPVerification({
    onSuccess: (data) => {
      // Store token and navigate to main app
      apiService.setToken(data.data.token);
      navigation.navigate('MainStack');
    },
  });

  const handleLogin = () => {
    loginMutation.mutate({
      mobileNo: phoneNumber,
      callingCode: selectedCountry.callingCode,
    });
  };

  const handleOTPVerification = () => {
    otpMutation.mutate({
      mobileNo: phoneNumber,
      callingCode: selectedCountry.callingCode,
      otp: otpCode,
    });
  };

  return (
    // Your login UI
  );
};
```

### 2. Content Display

```typescript
// HomeScreen.tsx
import { useContentList, useBannerData, useLatestContent } from '../hooks/useApi';

const HomeScreen = () => {
  const { data: bannerData, isLoading: bannerLoading } = useBannerData();
  const { data: latestContent, isLoading: latestLoading } = useLatestContent({ page: 1, limit: 10 });
  const { data: topContent, isLoading: topLoading } = useTopContent({ page: 1, limit: 10 });

  const { data: contentList, isLoading: contentLoading } = useContentList({
    page: 1,
    limit: 20,
    genre: selectedGenre,
  });

  if (bannerLoading || latestLoading || topLoading || contentLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView>
      {/* Banner Section */}
      {bannerData?.data && (
        <BannerCarousel banners={bannerData.data} />
      )}

      {/* Latest Content */}
      {latestContent?.data && (
        <ContentSection
          title="Latest Releases"
          content={latestContent.data.contentList}
        />
      )}

      {/* Top Content */}
      {topContent?.data && (
        <ContentSection
          title="Top Rated"
          content={topContent.data.top}
        />
      )}

      {/* Genre Content */}
      {contentList?.data && (
        <ContentSection
          title={selectedGenre}
          content={contentList.data.result}
        />
      )}
    </ScrollView>
  );
};
```

### 3. Content Details

```typescript
// DetailScreen.tsx
import { useContentDetails, useAddToWatchlist, useLikeDislikeContent } from '../hooks/useApi';

const DetailScreen = ({ route }) => {
  const { movieId } = route.params;
  
  const { data: contentDetail, isLoading } = useContentDetails(movieId);
  const addToWatchlistMutation = useAddToWatchlist();
  const likeDislikeMutation = useLikeDislikeContent();

  const handleAddToWatchlist = () => {
    addToWatchlistMutation.mutate({
      userId: currentUser.id,
      contentId: movieId,
    });
  };

  const handleLikeDislike = (isLike: boolean) => {
    likeDislikeMutation.mutate({
      userId: currentUser.id,
      episodeId: movieId,
      isLike,
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const content = contentDetail?.data;
  if (!content) {
    return <ErrorMessage message="Content not found" />;
  }

  return (
    <ScrollView>
      <ContentHeader content={content} />
      <ContentInfo content={content} />
      <EpisodeList episodes={content.episodes} />
      <CastList casts={content.casts} />
      <ActionButtons
        onWatchlist={handleAddToWatchlist}
        onLike={() => handleLikeDislike(true)}
        onDislike={() => handleLikeDislike(false)}
      />
    </ScrollView>
  );
};
```

### 4. Rewards & Subscriptions

```typescript
// RewardsScreen.tsx
import { useBalance, useDailyCheckIn, useCheckInList } from '../hooks/useApi';

const RewardsScreen = () => {
  const { data: balanceData, isLoading: balanceLoading } = useBalance(currentUser.id);
  const { data: checkInList, isLoading: checkInLoading } = useCheckInList();
  
  const dailyCheckInMutation = useDailyCheckIn({
    onSuccess: (data) => {
      Alert.alert('Success', `You earned ${data.data.coins} coins!`);
    },
  });

  const handleDailyCheckIn = () => {
    dailyCheckInMutation.mutate({
      userId: currentUser.id,
    });
  };

  if (balanceLoading || checkInLoading) {
    return <LoadingSpinner />;
  }

  const balance = balanceData?.data;
  const checkIn = checkInList?.data?.[0];

  return (
    <ScrollView>
      {/* Balance Display */}
      {balance && (
        <BalanceCard
          totalCoins={balance.coinsQuantity.totalCoins}
          purchasedCoins={balance.coinsQuantity.purchasedCoins}
          rewardCoins={balance.coinsQuantity.rewardCoins}
        />
      )}

      {/* Daily Check-in */}
      {checkIn && (
        <CheckInCard
          checkInData={checkIn}
          onCheckIn={handleDailyCheckIn}
          isLoading={dailyCheckInMutation.isPending}
        />
      )}
    </ScrollView>
  );
};
```

### 5. Search Functionality

```typescript
// SearchScreen.tsx
import { useSearchContent, useGenres } from '../hooks/useApi';

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  const { data: searchResults, isLoading: searchLoading } = useSearchContent(
    searchQuery,
    { page: 1, limit: 20 }
  );
  
  const { data: genresData } = useGenres();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleGenreFilter = (genre: string) => {
    setSelectedGenre(genre);
  };

  return (
    <View>
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search movies, shows..."
      />

      {/* Genre Filters */}
      {genresData?.data && (
        <GenreFilter
          genres={genresData.data}
          selectedGenre={selectedGenre}
          onSelectGenre={handleGenreFilter}
        />
      )}

      {/* Search Results */}
      {searchLoading ? (
        <LoadingSpinner />
      ) : (
        <ContentList
          content={searchResults?.data?.result || []}
          onItemPress={(item) => navigation.navigate('Detail', { movieId: item._id })}
        />
      )}
    </View>
  );
};
```

## 🎯 Best Practices

### 1. Type Safety

```typescript
// Always use proper types
const { data: userData } = useUser(userId);
const userName = userData?.data?.userName; // Type-safe access

// Use type guards for conditional rendering
if (userData?.data) {
  return <UserProfile user={userData.data} />;
}
```

### 2. Error Handling

```typescript
const { data, error, isLoading } = useContentList(params);

if (error) {
  return <ErrorMessage error={error} onRetry={() => refetch()} />;
}

if (isLoading) {
  return <LoadingSpinner />;
}
```

### 3. Optimistic Updates

```typescript
const addToWatchlistMutation = useAddToWatchlist({
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.watchlist.list(userId) });
    
    // Snapshot previous value
    const previousWatchlist = queryClient.getQueryData(queryKeys.watchlist.list(userId));
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.watchlist.list(userId), (old) => {
      return old ? [...old, newItem] : [newItem];
    });
    
    return { previousWatchlist };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.watchlist.list(userId), context?.previousWatchlist);
  },
});
```

### 4. Infinite Queries

```typescript
const useInfiniteContent = (params: ContentListRequest) => {
  return useInfiniteQuery({
    queryKey: queryKeys.content.list(params),
    queryFn: ({ pageParam = 1 }) => apiService.getContentList({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.data.hasNext ? lastPage.data.page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
  });
};
```

## 🚨 Error Handling

### 1. Global Error Handler

```typescript
// src/lib/api-interceptor.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      store.dispatch(logout());
    } else if (error.response?.status === 500) {
      // Handle server errors
      showGlobalError('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);
```

### 2. Component Error Boundaries

```typescript
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text>Something went wrong</Text>
        <Button title="Retry" onPress={() => setHasError(false)} />
      </View>
    );
  }

  return children;
};
```

### 3. Query Error Handling

```typescript
const { data, error, isLoading, refetch } = useContentList(params, {
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  onError: (error) => {
    console.error('Content list error:', error);
    // Log to analytics
    analytics.track('api_error', { endpoint: '/content/list', error: error.message });
  },
});
```

## ⚡ Performance Optimization

### 1. Query Caching

```typescript
// Configure stale times based on data type
const useUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.auth.profile(userId),
    queryFn: () => apiService.getUserProfile(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes for user data
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });
};

const useContentList = (params: ContentListRequest) => {
  return useQuery({
    queryKey: queryKeys.content.list(params),
    queryFn: () => apiService.getContentList(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for content
    cacheTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
```

### 2. Prefetching

```typescript
const queryClient = useQueryClient();

// Prefetch content details when hovering over content card
const handleContentHover = (contentId: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.content.detail(contentId),
    queryFn: () => apiService.getContentDetails(contentId),
    staleTime: 5 * 60 * 1000,
  });
};
```

### 3. Background Updates

```typescript
const useBackgroundSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh user balance in background
      queryClient.invalidateQueries({ queryKey: queryKeys.rewards.balance(userId) });
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [queryClient, userId]);
};
```

## 📱 Integration with Navigation

### 1. Navigation with Type Safety

```typescript
// src/types/navigation.ts
export type RootStackParamList = {
  Home: undefined;
  Detail: { movieId: string };
  Search: { initialQuery?: string };
  Profile: undefined;
  Settings: undefined;
};

// Usage in components
navigation.navigate('Detail', { movieId: contentId });
```

### 2. Deep Linking

```typescript
// Handle deep links to content
const handleDeepLink = (url: string) => {
  const contentId = extractContentIdFromUrl(url);
  if (contentId) {
    navigation.navigate('Detail', { movieId: contentId });
  }
};
```

## 🔒 Security Considerations

### 1. Token Management

```typescript
// Secure token storage
const setToken = (token: string) => {
  apiService.setToken(token);
  MMKVStorage.set('auth_token', token, { encrypt: true });
};

const getToken = () => {
  return MMKVStorage.getString('auth_token', { decrypt: true });
};
```

### 2. Request Validation

```typescript
// Validate request data before sending
const validateLoginRequest = (data: LoginRequest): boolean => {
  return data.mobileNo.length >= 10 && data.callingCode.length > 0;
};

const handleLogin = (data: LoginRequest) => {
  if (!validateLoginRequest(data)) {
    Alert.alert('Invalid data', 'Please check your input');
    return;
  }
  loginMutation.mutate(data);
};
```

## 📊 Analytics Integration

### 1. API Call Tracking

```typescript
const useTrackedQuery = (queryKey: any[], queryFn: any, options?: any) => {
  return useQuery({
    queryKey,
    queryFn: async (...args) => {
      const startTime = Date.now();
      try {
        const result = await queryFn(...args);
        analytics.track('api_success', {
          endpoint: queryKey.join('/'),
          duration: Date.now() - startTime,
        });
        return result;
      } catch (error) {
        analytics.track('api_error', {
          endpoint: queryKey.join('/'),
          error: error.message,
          duration: Date.now() - startTime,
        });
        throw error;
      }
    },
    ...options,
  });
};
```

### 2. User Behavior Tracking

```typescript
const useTrackContentView = () => {
  return useMutation({
    mutationFn: (data) => apiService.trackContentView(data),
    onSuccess: () => {
      // Additional client-side tracking
      analytics.track('content_viewed', {
        contentId: data.contentId,
        duration: data.duration,
        progress: data.progress,
      });
    },
  });
};
```

## 🎯 Conclusion

This comprehensive API integration guide provides everything needed to build a robust, type-safe, and performant OTT application. The combination of TypeScript interfaces, React Query hooks, and best practices ensures:

- **Type Safety**: Compile-time error checking
- **Performance**: Intelligent caching and background updates
- **User Experience**: Optimistic updates and error handling
- **Maintainability**: Clean, organized code structure
- **Scalability**: Modular architecture for future growth

Follow these patterns and examples to create a world-class streaming application with excellent performance and user experience. 