import { createNavigationContainerRef } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useAuthState } from '../store/auth.store';

export const navigationRef = createNavigationContainerRef();

// Navigation Service for handling authentication-based navigation
export class NavigationService {
  // Navigate to a screen with authentication check
  static navigate(name: string, params?: any) {
    if (navigationRef.isReady()) {
      (navigationRef as any).navigate(name, params);
    }
  }

  // Navigate to protected screens (requires authentication)
  static navigateToProtected(name: string, params?: any) {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate(name, params);
    } else {
      this.showLoginModal();
    }
  }

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

  // Navigate to purchase screens with authentication check
  static navigateToPurchase(screen: 'Refill' | 'Subscription', params?: any) {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate(screen, params);
    } else {
      this.showLoginModal();
    }
  }

  // Navigate to profile features with authentication check
  static navigateToProfile(screen: string, params?: any) {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate(screen, params);
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign In',
          onPress: () => this.navigate('AuthStack'),
        },
      ]
    );
  }

  // Navigate to detail screen with authentication check for premium content
  static navigateToDetail(movieId: string, isPremium: boolean = false) {
    if (isPremium) {
      const isAuthenticated = this.isAuthenticated();
      
      if (isAuthenticated) {
        this.navigate('Detail', { movieId });
      } else {
        this.showLoginModal();
      }
    } else {
      this.navigate('Detail', { movieId });
    }
  }

  // Navigate to search with filters
  static navigateToSearch(initialQuery?: string, filters?: any) {
    this.navigate('Search', { initialQuery, filters });
  }

  // Navigate to genre with sorting
  static navigateToGenre(genreName: string, sortBy?: string) {
    this.navigate('Genre', { genreName, sortBy });
  }

  // Navigate to web view for external links
  static navigateToWebView(url: string, title?: string) {
    this.navigate('WebView', { url, title });
  }

  // Navigate to transaction history
  static navigateToTransaction(filter?: 'all' | 'credit' | 'debit') {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate('Transaction', { filter });
    } else {
      this.showLoginModal();
    }
  }

  // Navigate to wallet
  static navigateToWallet() {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate('MyWallet');
    } else {
      this.showLoginModal();
    }
  }

  // Navigate to history
  static navigateToHistory() {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate('History');
    } else {
      this.showLoginModal();
    }
  }

  // Navigate to edit profile
  static navigateToEditProfile() {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate('EditProfile');
    } else {
      this.showLoginModal();
    }
  }

  // Navigate to subscription
  static navigateToSubscription() {
    const isAuthenticated = this.isAuthenticated();
    
    if (isAuthenticated) {
      this.navigate('Subscription');
    } else {
      this.showLoginModal();
    }
  }

  // Navigate back
  static goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  }

  // Reset navigation to specific screen
  static reset(name: string, params?: any) {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name, params }],
      });
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    // This should be implemented based on your auth store
    // For now, we'll use a simple check
    return false; // Replace with actual auth check
  }

  // Navigate to main stack after successful authentication
  static navigateToMain() {
    this.reset('MainStack');
  }

  // Navigate to auth stack after logout
  static navigateToAuth() {
    this.reset('AuthStack');
  }

  // Navigate to onboarding
  static navigateToOnboarding() {
    this.reset('Onboarding');
  }
}

// Hook for using navigation service in components
export const useNavigationService = () => {
  const { user } = useAuthState();
  
  return {
    navigate: NavigationService.navigate,
    navigateToProtected: NavigationService.navigateToProtected,
    navigateToVideo: NavigationService.navigateToVideo,
    navigateToWatchlist: NavigationService.navigateToWatchlist,
    navigateToPurchase: NavigationService.navigateToPurchase,
    navigateToProfile: NavigationService.navigateToProfile,
    showLoginModal: NavigationService.showLoginModal,
    navigateToDetail: NavigationService.navigateToDetail,
    navigateToSearch: NavigationService.navigateToSearch,
    navigateToGenre: NavigationService.navigateToGenre,
    navigateToWebView: NavigationService.navigateToWebView,
    navigateToTransaction: NavigationService.navigateToTransaction,
    navigateToWallet: NavigationService.navigateToWallet,
    navigateToHistory: NavigationService.navigateToHistory,
    navigateToEditProfile: NavigationService.navigateToEditProfile,
    navigateToSubscription: NavigationService.navigateToSubscription,
    goBack: NavigationService.goBack,
    reset: NavigationService.reset,
    navigateToMain: NavigationService.navigateToMain,
    navigateToAuth: NavigationService.navigateToAuth,
    navigateToOnboarding: NavigationService.navigateToOnboarding,
    isAuthenticated: !!user,
  };
};

// Navigation conditions as per screen flow guide
export const NavigationConditions = {
  // Authentication-based navigation
  AUTHENTICATION: {
    WATCH_VIDEO: (isAuthenticated: boolean) => 
      isAuthenticated ? 'play_directly' : 'show_login_modal',
    ADD_TO_LIST: (isAuthenticated: boolean) => 
      isAuthenticated ? 'add_to_watchlist' : 'show_login_modal',
    PURCHASE: (isAuthenticated: boolean) => 
      isAuthenticated ? 'process_payment' : 'show_login_modal',
    PROFILE_ACCESS: (isAuthenticated: boolean) => 
      isAuthenticated ? 'full_access' : 'limited_access',
  },

  // Content-based navigation
  CONTENT: {
    MOVIE_SHOW: 'DetailScreen',
    EPISODE: 'VideoPlayer',
    GENRE: 'GenreScreen',
    SEARCH: 'SearchScreen',
    BANNER: 'PromoDetailScreen',
  },

  // State-based navigation
  STATE: {
    FIRST_LAUNCH: 'OnboardingScreen',
    OFFLINE: 'NoInternetScreen',
    LOADING: 'ActivityLoader',
    ERROR: 'ErrorScreen',
  },
};

// Protected routes that require authentication
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

// Public routes that don't require authentication
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