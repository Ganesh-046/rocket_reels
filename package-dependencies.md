# Required Dependencies for New Login Screen

## Core Dependencies

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-native-mmkv": "^2.10.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "react-native-safe-area-context": "^4.7.0",
    "react-native-linear-gradient": "^2.8.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-device-info": "^10.8.0",
    "@react-native-firebase/messaging": "^18.7.0",
    "react-native-modal-datetime-picker": "^17.1.0",
    "moment": "^2.29.4"
  }
}
```

## Installation Commands

```bash
# Install core dependencies
npm install @tanstack/react-query zustand react-native-mmkv

# Install navigation
npm install @react-navigation/native @react-navigation/stack react-native-screens react-native-gesture-handler

# Install UI components
npm install react-native-safe-area-context react-native-linear-gradient react-native-vector-icons

# Install device and Firebase
npm install react-native-device-info @react-native-firebase/messaging

# Install date picker and utilities
npm install react-native-modal-datetime-picker moment

# For iOS, also run:
cd ios && pod install
```

## Key Features Implemented

### ✅ Login Screen Features
- **3-Step Authentication Flow**: Phone → OTP → Profile Setup
- **Country Code Picker**: International phone number support
- **OTP Verification**: 6-digit OTP with timer and resend
- **Profile Completion**: Name, email, gender, DOB, referral code
- **Social Login**: Apple and Google sign-in buttons
- **Animations**: Smooth transitions between steps
- **Form Validation**: Real-time validation and error handling
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

### ✅ API Integration
- **React Query Hooks**: Complete data, error, loading, refetch states
- **Authentication Service**: Login, OTP, profile update APIs
- **MMKV Storage**: Encrypted local storage
- **Zustand Store**: Global state management
- **API Interceptor**: Centralized HTTP client with caching

### ✅ Profile Screen Features
- **User Profile Display**: Name, email, phone
- **Menu Navigation**: Edit profile, watchlist, history, rewards
- **Action Buttons**: Login, logout, delete account
- **"Go to Login Page" Button**: Direct navigation to login
- **Loading & Error States**: Proper state handling

### ✅ Navigation
- **Conditional Routing**: Based on authentication status
- **Stack Navigation**: Proper screen transitions
- **Safe Area Handling**: Proper insets for different devices

## Usage Examples

### Using Hooks in Components
```typescript
// Query hooks with all states
const { data, error, isLoading, refetch } = useContentList();

// Mutation hooks with loading states
const loginMutation = useLogin();
const { isPending, isError, error } = loginMutation;

// Direct usage in components
if (isLoading) return <ActivityIndicator />;
if (error) return <Text>Error: {error.message}</Text>;
```

### Navigation
```typescript
// Navigate to login
navigation.navigate('Login');

// Navigate to profile
navigation.navigate('Profile');

// Replace current screen
navigation.replace('Main');
```

## File Structure
```
src/
├── screens/
│   ├── auth/
│   │   └── LoginScreen.tsx          # Complete login flow
│   └── ProfileScreen.tsx            # Profile with login button
├── hooks/
│   └── useAuth.ts                   # Auth hooks with all states
├── services/
│   └── auth.service.ts              # API service
├── store/
│   └── auth.store.ts                # Zustand store
├── navigation/
│   └── AppNavigator.tsx             # Navigation setup
└── App.tsx                          # Main app component
```

## Testing the Implementation

1. **Install Dependencies**: Run the installation commands above
2. **Setup Firebase**: Configure Firebase for messaging
3. **Run the App**: `npx react-native run-android` or `npx react-native run-ios`
4. **Test Login Flow**: 
   - Enter phone number
   - Verify OTP (use test numbers for auto-fill)
   - Complete profile setup
5. **Test Profile Screen**: Navigate to profile and use "Go to Login Page" button

The implementation provides the exact UI and functionality from your old code, but with modern React Native best practices and the new tech stack you requested! 🚀 