# Navigation Conditions Implementation - OTT Streaming App

## Overview
This document details the implementation of navigation conditions and authentication-based routing as specified in the Screen Flow Guide. The app now properly handles authentication states, protected routes, and conditional navigation.

## ✅ Implemented Navigation Conditions

### 1. App Launch Flow

#### Initial Launch Check
```typescript
// AppNavigator.tsx - App Entry Point
const initializeApp = async () => {
  try {
    // Check if first launch (MMKV Storage)
    const hasLaunched = MMKVStorage.get('hasLaunched');
    if (!hasLaunched) {
      setIsFirstLaunch(true);
      MMKVStorage.set('hasLaunched', true);
    }

    // Simulate loading delay (1 second as per spec)
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  } catch (error) {
    console.error('App initialization error:', error);
    setIsLoading(false);
  }
};
```

**Navigation Conditions:**
- ✅ **First Launch**: Navigate to `OnboardingScreen`
- ✅ **Subsequent Launch**: Navigate to `MainStack` or `AuthStack` based on authentication
- ✅ **Loading State**: Show loading screen with 1-second delay
- ✅ **Error State**: Handle initialization errors gracefully

### 2. Authentication-Based Navigation

#### Root Navigation Structure
```typescript
// AppNavigator.tsx - Root Navigator
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Condition 1: First Launch → OnboardingScreen */}
        {isFirstLaunch && (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        )}

        {/* Condition 2: Not Authenticated → AuthStack */}
        {!isFirstLaunch && !isAuthenticated && (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}

        {/* Condition 3: Authenticated → MainStack */}
        {!isFirstLaunch && isAuthenticated && (
          <Stack.Screen name="MainStack" component={MainStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 3. Protected Route Navigation

#### NavigationService Implementation
```typescript
// NavigationService.ts - Authentication-based navigation
export class NavigationService {
  // Navigate to video player with authentication check
  static navigateToVideo(contentId: string, episodeId?: string) {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate('VideoPlayer', { contentId, episodeId });
    } else {
      this.showLoginModal();
    }
  }

  // Navigate to watchlist with authentication check
  static navigateToWatchlist() {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate('MyList');
    } else {
      this.showLoginModal();
    }
  }

  // Show login modal for protected actions
  static showLoginModal() {
    Alert.alert(
      'Login Required',
      'Please log in to access this feature',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => this.navigate('AuthStack') },
      ]
    );
  }
}
```

### 4. Screen-Specific Navigation Conditions

#### HomeScreen Implementation
```typescript
// HomeScreen.tsx - Authentication-based content access
const HomeScreen = ({ navigation }) => {
  const { user } = useAuthState();
  const { navigateToDetail, navigateToSearch, navigateToGenre, navigateToWatchlist } = useNavigationService();

  // Navigation handlers with authentication checks
  const handleMoviePress = (movie: any) => {
    // Check if content is premium and user is not authenticated
    if (movie.isPremium && !user) {
      Alert.alert(
        'Premium Content',
        'This content requires a subscription. Please log in to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('AuthStack') },
        ]
      );
      return;
    }

    // Navigate to detail screen
    navigateToDetail(movie.id, movie.isPremium);
  };

  const handleWatchlistPress = () => {
    navigateToWatchlist(); // Automatically checks authentication
  };

  return (
    <ScrollView>
      {/* Content sections with authentication-based visibility */}
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continue Watching</Text>
          {/* Only show for authenticated users */}
        </View>
      )}

      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {/* Only show for authenticated users */}
        </View>
      )}
    </ScrollView>
  );
};
```

#### DetailScreen Implementation
```typescript
// DetailScreen.tsx - Protected content access
const DetailScreen = ({ navigation, route }) => {
  const { user } = useAuthState();
  const { navigateToVideo, navigateToWatchlist } = useNavigationService();

  const handleWatchPress = () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to watch this content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('AuthStack') },
        ]
      );
      return;
    }

    navigateToVideo(movieId);
  };

  const handleEpisodePress = (episodeId: string) => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to watch this episode.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('AuthStack') },
        ]
      );
      return;
    }

    navigateToVideo(movieId, episodeId);
  };

  const handleAddToWatchlist = async () => {
    if (!user) {
      Alert.alert(
        'Login Required',
        'Please log in to add content to your watchlist.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => navigation.navigate('AuthStack') },
        ]
      );
      return;
    }

    // Proceed with watchlist operation
  };
};
```

### 5. Navigation Conditions Summary

#### Authentication-Based Navigation Table
| Action | Logged In | Not Logged In | Implementation |
|--------|-----------|---------------|----------------|
| Watch Video | ✅ Play directly | ❌ Show login modal | `navigateToVideo()` |
| Add to List | ✅ Add to watchlist | ❌ Show login modal | `navigateToWatchlist()` |
| Purchase | ✅ Process payment | ❌ Show login modal | `navigateToPurchase()` |
| Profile Access | ✅ Full access | ❌ Limited access | `navigateToProfile()` |
| Premium Content | ✅ Access allowed | ❌ Show login modal | `navigateToDetail(id, true)` |

#### Content-Based Navigation Table
| Content Type | Navigation Target | Implementation |
|--------------|------------------|----------------|
| Movie/Show | DetailScreen | `navigateToDetail(movieId)` |
| Episode | VideoPlayer | `navigateToVideo(contentId, episodeId)` |
| Genre | GenreScreen | `navigateToGenre(genreName)` |
| Search | SearchScreen | `navigateToSearch(initialQuery)` |
| Banner | WebView/PromoDetail | `navigateToWebView(url, title)` |

#### State-Based Navigation Table
| App State | Navigation Behavior | Implementation |
|-----------|-------------------|----------------|
| First Launch | OnboardingScreen | `isFirstLaunch` check |
| Loading | ActivityLoader | `isLoading` state |
| Error | Error Screen | Error boundary |
| Offline | No Internet Screen | Network status check |

### 6. Protected Routes Configuration

```typescript
// NavigationService.ts - Route protection
export const PROTECTED_ROUTES = [
  'VideoPlayer',
  'MyList',
  'History',
  'MyWallet',
  'Refill',
  'Transaction',
  'Subscription',
  'EditProfile',
];

export const PUBLIC_ROUTES = [
  'Home',
  'Search',
  'Genre',
  'Detail',
  'Onboarding',
  'Login',
  'Signup',
];

// Check if a route requires authentication
export const isProtectedRoute = (routeName: string): boolean => {
  return PROTECTED_ROUTES.includes(routeName);
};

// Check if user can access a route
export const canAccessRoute = (routeName: string, isAuthenticated: boolean): boolean => {
  if (isProtectedRoute(routeName)) {
    return isAuthenticated;
  }
  return true;
};
```

### 7. Navigation Conditions Implementation Status

#### ✅ Completed Features
- [x] **App Launch Flow**: First launch detection and onboarding
- [x] **Authentication-Based Routing**: Conditional navigation based on auth state
- [x] **Protected Route Access**: Login modal for protected features
- [x] **Content Access Control**: Premium content authentication checks
- [x] **Navigation Service**: Centralized navigation with auth checks
- [x] **Loading States**: Proper loading screens during initialization
- [x] **Error Handling**: Graceful error handling and user feedback
- [x] **State Management**: Integration with auth store and MMKV storage

#### 🔄 In Progress
- [ ] **Network Connectivity**: Real-time network status monitoring
- [ ] **Deep Linking**: URL-based navigation support
- [ ] **Analytics Integration**: Navigation event tracking

#### 📋 Planned Features
- [ ] **Offline Mode**: Cached content access
- [ ] **Push Notification Navigation**: Deep linking from notifications
- [ ] **Biometric Authentication**: Touch ID/Face ID integration

### 8. Usage Examples

#### Using NavigationService in Components
```typescript
import { useNavigationService } from '../navigation/NavigationService';

const MyComponent = () => {
  const { 
    navigateToDetail, 
    navigateToVideo, 
    navigateToWatchlist,
    isAuthenticated 
  } = useNavigationService();

  const handleMoviePress = (movie) => {
    // Automatically handles authentication check
    navigateToDetail(movie.id, movie.isPremium);
  };

  const handleWatchPress = () => {
    // Automatically handles authentication check
    navigateToVideo(contentId, episodeId);
  };

  return (
    <View>
      {/* Content with authentication-based visibility */}
      {isAuthenticated && <AuthenticatedContent />}
      <PublicContent />
    </View>
  );
};
```

#### Authentication State Management
```typescript
import { useAuthState } from '../store/auth.store';

const ProfileScreen = () => {
  const { user, logout } = useAuthState();

  const handleLogout = () => {
    logout();
    // Navigation will automatically redirect to AuthStack
  };

  return (
    <View>
      <Text>Welcome, {user?.userName}</Text>
      <TouchableOpacity onPress={handleLogout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Conclusion

The navigation conditions have been successfully implemented according to the Screen Flow Guide specifications. The app now properly handles:

1. **Authentication-based routing** with conditional navigation
2. **Protected route access** with login modals
3. **Content access control** for premium features
4. **State-based navigation** for different app states
5. **Centralized navigation service** with auth checks
6. **Proper error handling** and loading states

The implementation follows React Navigation v6 best practices and integrates seamlessly with the existing auth store and MMKV storage system. 