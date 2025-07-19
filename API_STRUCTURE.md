# Rocket Reels API Structure Documentation

## Overview

This document outlines the complete API structure for the Rocket Reels OTT application, including TypeScript interfaces, services, hooks, and state management.

## 📁 Folder Structure

```
src/
├── types/
│   └── api.ts                 # TypeScript interfaces for all API types
├── config/
│   └── api.ts                 # API configuration, endpoints, and constants
├── lib/
│   ├── mmkv.ts               # MMKV storage configuration
│   └── api-interceptor.ts    # API interceptor with caching and error handling
├── services/
│   ├── auth.service.ts       # Authentication service
│   ├── content.service.ts    # Content service
│   └── index.ts              # Service exports
├── hooks/
│   └── useAuth.ts            # React Query hooks for authentication
├── store/
│   └── auth.store.ts         # Zustand store for authentication state
├── providers/
│   └── QueryProvider.tsx     # React Query provider
└── screens/
    └── auth/
        ├── LoginScreen.tsx   # Login screen with OTP verification
        └── SignupScreen.tsx  # Signup screen with profile creation
```

## 🔧 Core Components

### 1. TypeScript Interfaces (`src/types/api.ts`)

Comprehensive TypeScript interfaces for all API requests and responses:

- **Authentication Types**: `UserSignupRequest`, `UserLoginRequest`, `OTPVerificationRequest`, `UserProfile`
- **Content Types**: `ContentItem`, `ContentDetail`, `Episode`, `Season`, `Banner`
- **Rewards Types**: `RewardBalance`, `CheckInReward`, `Benefit`, `SubscriptionPlan`
- **API Response Types**: `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiError`

### 2. API Configuration (`src/config/api.ts`)

Centralized API configuration:

- **Base URL**: Development and production endpoints
- **Endpoints**: All API endpoints organized by category
- **Constants**: HTTP methods, content types, cache TTL, error codes
- **Configuration**: Timeout, retry attempts, device types

### 3. MMKV Storage (`src/lib/mmkv.ts`)

High-performance local storage with encryption:

- **User Data**: Profile, token, settings
- **Cache Management**: TTL-based caching with automatic expiration
- **Watchlist & History**: User interaction data
- **Auth Data**: Secure storage of authentication information

### 4. API Interceptor (`src/lib/api-interceptor.ts`)

Advanced HTTP client with features:

- **Request/Response Interceptors**: Automatic token injection, error handling
- **Caching**: Intelligent caching with TTL
- **Retry Logic**: Exponential backoff for failed requests
- **Error Handling**: Centralized error management with status codes
- **File Upload**: Support for multipart form data

## 🚀 Services

### Authentication Service (`src/services/auth.service.ts`)

Complete authentication flow:

```typescript
// User registration
await authService.signup(userData);

// Mobile verification
await authService.login({ mobileNo, callingCode });

// OTP verification
await authService.verifyOTP({ mobileNo, otp, deviceType });

// Profile management
await authService.updateProfile(id, profileData);
await authService.getUserInfo(id);
```

### Content Service (`src/services/content.service.ts`)

Content discovery and management:

```typescript
// Get content with filters
await contentService.getContentList({ 
  adult: false, 
  genre: 'action', 
  page: 1 
});

// Get content details
await contentService.getContentDetails(id, userId, token);

// Get personalized content
await contentService.getCustomizedList({ page: 1 });
```

## 🎣 React Query Hooks

### Authentication Hooks (`src/hooks/useAuth.ts`)

React Query hooks for authentication with automatic caching:

```typescript
// Queries
const { data: user, isLoading } = useUser(userId);
const { data: countries } = useCountries();

// Mutations
const signupMutation = useSignup();
const loginMutation = useLogin();
const otpMutation = useOTPVerification();

// Usage
await signupMutation.mutateAsync(userData);
```

**Features:**
- Automatic caching with configurable TTL
- Loading and error states
- Optimistic updates
- Background refetching
- Automatic retry on failure

## 📊 State Management

### Zustand Store (`src/store/auth.store.ts`)

Lightweight state management for authentication:

```typescript
// Selectors
const user = useAuthUser();
const isAuthenticated = useIsAuthenticated();
const token = useAuthToken();

// Actions
const { login, logout, updateUser } = useAuthActions();

// Usage
login(userData, token);
logout();
updateUser({ userName: 'New Name' });
```

**Features:**
- Persistent storage with MMKV
- Type-safe state and actions
- Automatic synchronization with MMKV
- Optimized re-renders

## 🎨 UI Components

### Login Screen (`src/screens/auth/LoginScreen.tsx`)

Modern login flow with OTP verification:

- **Two-step process**: Phone number → OTP verification
- **Country picker**: International phone number support
- **Form validation**: Real-time validation with error messages
- **Loading states**: Activity indicators during API calls
- **Error handling**: User-friendly error messages

### Signup Screen (`src/screens/auth/SignupScreen.tsx`)

Complete user profile creation:

- **Form validation**: Comprehensive validation for all fields
- **Gender selection**: Toggle buttons for gender selection
- **Date picker**: Date of birth input
- **Referral code**: Optional referral code support
- **Country selection**: International country picker

## 🔄 Data Flow

### Authentication Flow

1. **Login Process**:
   ```
   User Input → Login Hook → Auth Service → API → MMKV Storage → Zustand Store
   ```

2. **OTP Verification**:
   ```
   OTP Input → OTP Hook → Auth Service → API → Token Storage → User Data Fetch
   ```

3. **Signup Process**:
   ```
   Form Data → Signup Hook → Auth Service → API → Profile Creation → Login
   ```

### Content Flow

1. **Content Loading**:
   ```
   Component Mount → Content Hook → Content Service → API → Cache → UI Update
   ```

2. **Caching Strategy**:
   ```
   Request → Check Cache → Cache Hit? → Return Cached Data
                                    ↓ No
                              API Call → Store in Cache → Return Data
   ```

## 🛠️ Usage Examples

### Setting up the App

```typescript
// App.tsx
import { QueryProvider } from './providers/QueryProvider';
import { initializeAuth } from './store/auth.store';

const App = () => {
  useEffect(() => {
    initializeAuth(); // Initialize auth from MMKV
  }, []);

  return (
    <QueryProvider>
      <NavigationContainer>
        {/* Your app components */}
      </NavigationContainer>
    </QueryProvider>
  );
};
```

### Using Authentication

```typescript
// In a component
import { useLogin, useOTPVerification } from '../hooks/useAuth';
import { useAuthActions } from '../store/auth.store';

const LoginComponent = () => {
  const loginMutation = useLogin();
  const otpMutation = useOTPVerification();
  const { login } = useAuthActions();

  const handleLogin = async () => {
    const response = await loginMutation.mutateAsync({
      mobileNo: '9876543210',
      callingCode: '91'
    });
    
    if (response.status) {
      // Navigate to OTP screen
    }
  };

  const handleOTP = async () => {
    const response = await otpMutation.mutateAsync({
      mobileNo: '9876543210',
      otp: '123456',
      deviceType: 'android'
    });
    
    if (response.status && response.data) {
      // Handle successful login
    }
  };
};
```

### Using Content Services

```typescript
// In a component
import { useQuery } from '@tanstack/react-query';
import { contentService } from '../services';

const HomeScreen = () => {
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', 'latest'],
    queryFn: () => contentService.getLatestContent({ page: 1 }),
  });

  if (isLoading) return <LoadingSpinner />;
  
  return (
    <FlatList
      data={content?.data?.result}
      renderItem={({ item }) => <ContentCard content={item} />}
    />
  );
};
```

## 🔧 Configuration

### Environment Variables

```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'https://k9456pbd.rocketreel.co.in/api/v1'
    : 'https://k9456pbd.rocketreel.co.in/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};
```

### Cache Configuration

```typescript
// Cache TTL in milliseconds
export const CACHE_TTL = {
  VIDEO_CONTENT: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 5 * 60 * 1000,      // 5 minutes
  STATIC_CONTENT: 30 * 60 * 1000, // 30 minutes
};
```

## 🚀 Performance Optimizations

1. **Intelligent Caching**: TTL-based caching with automatic expiration
2. **Background Refetching**: Data stays fresh without blocking UI
3. **Optimistic Updates**: Immediate UI updates with background sync
4. **Request Deduplication**: Multiple components requesting same data
5. **Error Boundaries**: Graceful error handling with retry logic
6. **Memory Management**: Automatic garbage collection of stale data

## 🔒 Security Features

1. **Token Management**: Automatic token injection and refresh
2. **Encrypted Storage**: MMKV with encryption for sensitive data
3. **Request Validation**: Type-safe API requests and responses
4. **Error Sanitization**: Safe error messages without sensitive data
5. **Secure Logout**: Complete data cleanup on logout

## 📱 Platform Support

- **iOS**: Full support with platform-specific optimizations
- **Android**: Full support with platform-specific optimizations
- **Web**: Compatible with React Native Web (with modifications)

## 🧪 Testing

The API structure is designed for easy testing:

```typescript
// Mock services for testing
jest.mock('../services/auth.service');
jest.mock('../hooks/useAuth');

// Test authentication flow
test('should login user successfully', async () => {
  // Test implementation
});
```

## 📈 Monitoring & Analytics

- **Error Tracking**: Centralized error logging
- **Performance Monitoring**: Request timing and caching metrics
- **User Analytics**: Authentication and content interaction tracking
- **Cache Analytics**: Hit/miss ratios and storage usage

This API structure provides a robust, scalable, and maintainable foundation for the Rocket Reels OTT application with modern React Native development practices. 