import { Platform, NativeModules } from 'react-native';


// Conditional import to prevent crashes when native module is not available
let GoogleSignin: any = null;
let statusCodes: any = null;

try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
} catch (error) {
        console.warn('GoogleSignIn: Native module not available', error);
}

// Google Sign-In Configuration - Using your existing Firebase project
const configureGoogleSignIn = () => {
  if (!GoogleSignin) {
    throw new Error('GoogleSignin is not available');
  }
  
  GoogleSignin.configure({
    // Web client ID from your Firebase project
    webClientId: '192652101719-9k6jl9p0s47iqd9qsruc16sm8glcfc7q.apps.googleusercontent.com',
    // iOS client ID from your Firebase project
    iosClientId: '192652101719-5r5n5ckkm3ir4cpv6atc7l92uapqkggb.apps.googleusercontent.com',
    // Android client ID from your Firebase project
    androidClientId: '192652101719-6gk78l7at3udli0dginb79mhhumqm3rt.apps.googleusercontent.com',
    // Offline access for refresh tokens
    offlineAccess: true,
    // Force code for refresh token
    forceCodeForRefreshToken: true,
  });
};

// Google Sign-In Service
class GoogleSignInService {
  private isConfigured = false;

  constructor() {
    // Don't configure immediately - wait for first use
  }

  private ensureConfigured() {
    if (!this.isConfigured) {
      // Check if GoogleSignin is available
      if (!GoogleSignin) {
        throw new Error('Google Sign-In is not available. Please ensure the native module is properly linked and rebuild the app.');
      }
      
      // Check if native module is available
      if (!NativeModules.RNGoogleSignin) {
        throw new Error('Google Sign-In native module is not available. Please ensure the module is properly linked and rebuild the app.');
      }
      
      try {
        configureGoogleSignIn();
        this.isConfigured = true;
      } catch (error) {
        console.error('GoogleSignIn: Failed to configure Google Sign-In', error);
        throw new Error('Google Sign-In is not available. Please ensure the native module is properly linked.');
      }
    }
  }

  /**
   * Check if user is signed in
   */
  async isSignedIn(): Promise<boolean> {
    try {
      this.ensureConfigured();
      if (!GoogleSignin) {
        return false;
      }
      const isSignedIn = await GoogleSignin.isSignedIn();
      console.log('GoogleSignIn: Check sign in status', { isSignedIn });
      return isSignedIn;
    } catch (error) {
              console.error('GoogleSignIn: Error checking sign in status', error);
      return false;
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    try {
      this.ensureConfigured();
      if (!GoogleSignin) {
        return null;
      }
      const userInfo = await GoogleSignin.getCurrentUser();
              console.log('GoogleSignIn: Get current user', { userId: userInfo?.user?.id });
      return userInfo;
    } catch (error) {
              console.error('GoogleSignIn: Error getting current user', error);
      return null;
    }
  }

  /**
   * Sign in with Google - Using your existing Firebase approach
   */
  async signIn() {
    try {
      this.ensureConfigured();
      if (!GoogleSignin) {
        return {
          success: false,
          error: 'Google Sign-In is not available',
          code: 'NOT_AVAILABLE',
        };
      }
      
      console.log('GoogleSignIn: Starting Google sign in');
      
      // Check if Play Services are available (Android only)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      // Sign in with Google
      const signInResult = await GoogleSignin.signIn();
      
              console.log('GoogleSignIn: Sign in successful', {
        userId: signInResult.user.id,
        email: signInResult.user.email,
        name: signInResult.user.name,
      });

      return {
        success: true,
        user: signInResult.user,
        idToken: signInResult.idToken,
        serverAuthCode: signInResult.serverAuthCode,
      };
    } catch (error: any) {
              console.error('GoogleSignIn: Sign in failed', error);
      
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: 'User cancelled the sign-in flow',
          code: 'CANCELLED',
        };
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: 'Sign-in is already in progress',
          code: 'IN_PROGRESS',
        };
      } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return {
          success: false,
          error: 'Play Services not available',
          code: 'PLAY_SERVICES_NOT_AVAILABLE',
        };
      } else {
        return {
          success: false,
          error: error.message || 'Sign-in failed',
          code: 'UNKNOWN_ERROR',
        };
      }
    }
  }

  /**
   * Sign out from Google
   */
  async signOut() {
    try {
      this.ensureConfigured();
      if (!GoogleSignin) {
        return { success: false, error: 'Google Sign-In is not available' };
      }
      await GoogleSignin.signOut();
              console.log('GoogleSignIn: Sign out successful');
      return { success: true };
    } catch (error) {
              console.error('GoogleSignIn: Sign out failed', error);
      return { success: false, error };
    }
  }

  /**
   * Revoke access
   */
  async revokeAccess() {
    try {
      this.ensureConfigured();
      if (!GoogleSignin) {
        return { success: false, error: 'Google Sign-In is not available' };
      }
      await GoogleSignin.revokeAccess();
              console.log('GoogleSignIn: Revoke access successful');
      return { success: true };
    } catch (error) {
              console.error('GoogleSignIn: Revoke access failed', error);
      return { success: false, error };
    }
  }

  /**
   * Get tokens
   */
  async getTokens() {
    try {
      this.ensureConfigured();
      if (!GoogleSignin) {
        return { success: false, error: 'Google Sign-In is not available' };
      }
      const tokens = await GoogleSignin.getTokens();
              console.log('GoogleSignIn: Get tokens successful');
      return { success: true, tokens };
    } catch (error) {
              console.error('GoogleSignIn: Get tokens failed', error);
      return { success: false, error };
    }
  }
}

// Export singleton instance
export const googleSignInService = new GoogleSignInService();

// Export types
export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  familyName?: string;
  givenName?: string;
}

export interface GoogleSignInResult {
  success: boolean;
  user?: GoogleUser;
  idToken?: string;
  serverAuthCode?: string;
  error?: string;
  code?: string;
} 