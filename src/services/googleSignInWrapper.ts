import { Platform, NativeModules } from 'react-native';

import { testUrlScheme } from '../utils/urlSchemeTest';

// Safe wrapper for Google Sign-In
class GoogleSignInWrapper {
  private isAvailable = false;
  private GoogleSignin: any = null;
  private statusCodes: any = null;

  constructor() {
    this.checkAvailability();
  }

  private checkAvailability() {
    try {
      // Check if native module exists
      if (!NativeModules.RNGoogleSignin) {
        console.warn('GoogleSignIn: Native module RNGoogleSignin not found');
        return;
      }

      // Try to import the module
      const googleSignInModule = require('@react-native-google-signin/google-signin');
      this.GoogleSignin = googleSignInModule.GoogleSignin;
      this.statusCodes = googleSignInModule.statusCodes;
      
      if (this.GoogleSignin) {
        this.isAvailable = true;
        console.log('GoogleSignIn: Google Sign-In is available');
        
        // Debug: Log the configuration
        console.log('GoogleSignIn: Configuration details', {
          webClientId: '192652101719-9k6jl9p0s47iqd9qsruc16sm8glcfc7q.apps.googleusercontent.com',
          iosClientId: '192652101719-5r5n5ckkm3ir4cpv6atc7l92uapqkggb.apps.googleusercontent.com',
          expectedUrlScheme: 'com.googleusercontent.apps.192652101719-5r5n5ckkm3ir4cpv6atc7l92uapqkggb',
        });

        // Debug: Check if we can get the current configuration
        try {
          const currentConfig = this.GoogleSignin.getCurrentUser();
          console.log('GoogleSignIn: Current configuration check passed');
        } catch (configError) {
          console.warn('GoogleSignIn: Configuration check failed:', configError);
        }
      }
    } catch (error) {
      console.warn('GoogleSignIn: Failed to load Google Sign-In module', error);
      this.isAvailable = false;
    }
  }

  isGoogleSignInAvailable(): boolean {
    return this.isAvailable && !!this.GoogleSignin;
  }

  async configure() {
    if (!this.isGoogleSignInAvailable()) {
      throw new Error('Google Sign-In is not available');
    }

    // Test URL scheme registration first
    console.info('GoogleSignIn', 'Testing URL scheme registration...');
    const urlSchemeRegistered = await testUrlScheme();
    
    if (!urlSchemeRegistered) {
      console.error('GoogleSignIn', 'URL scheme is not registered! This will cause Google Sign-In to fail.');
    }

    // Try minimal configuration first
    const config = {
      webClientId: '192652101719-9k6jl9p0s47iqd9qsruc16sm8glcfc7q.apps.googleusercontent.com',
      iosClientId: '192652101719-5r5n5ckkm3ir4cpv6atc7l92uapqkggb.apps.googleusercontent.com',
      offlineAccess: true,
    };

    console.info('GoogleSignIn', 'Configuring with minimal config:', config);
    this.GoogleSignin.configure(config);
  }

  async signIn() {
    if (!this.isGoogleSignInAvailable()) {
      return {
        success: false,
        error: 'Google Sign-In is not available',
        code: 'NOT_AVAILABLE',
      };
    }

    try {
      await this.configure();
      console.info('GoogleSignIn', 'Starting Google sign in');
      
      if (Platform.OS === 'android') {
        await this.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const signInResult = await this.GoogleSignin.signIn();
      
      // Log the full response structure for debugging
      console.info('GoogleSignIn', 'Raw sign in result:', JSON.stringify(signInResult, null, 2));
      
      // Handle the actual response structure from Google Sign-In
      let userData, idToken, serverAuthCode;
      
      if (signInResult.type === 'success' && signInResult.data) {
        // New structure: { type: 'success', data: { user, idToken, serverAuthCode } }
        userData = signInResult.data.user;
        idToken = signInResult.data.idToken;
        serverAuthCode = signInResult.data.serverAuthCode;
      } else if (signInResult.user) {
        // Old structure: direct user object
        userData = signInResult.user;
        idToken = signInResult.idToken;
        serverAuthCode = signInResult.serverAuthCode;
      } else {
        console.error('GoogleSignIn', 'Invalid sign in result structure:', signInResult);
        return {
          success: false,
          error: 'Invalid response from Google Sign-In',
          code: 'INVALID_RESPONSE',
        };
      }

      // Check if we have user data
      if (!userData) {
        console.error('GoogleSignIn', 'No user data in response:', signInResult);
        return {
          success: false,
          error: 'No user data in Google Sign-In response',
          code: 'NO_USER_DATA',
        };
      }

      // Safely access user properties
      const userId = userData.id || userData.userId || userData.sub || 'unknown';
      const email = userData.email || '';
      const name = userData.name || userData.displayName || userData.givenName || '';

      console.info('GoogleSignIn', 'Sign in successful', {
        userId,
        email,
        name,
      });

      return {
        success: true,
        user: {
          id: userId,
          email,
          name,
          photo: userData.photo,
          givenName: userData.givenName,
          familyName: userData.familyName,
          ...userData, // Include all other user properties
        },
        idToken,
        serverAuthCode,
      };
    } catch (error: any) {
      console.error('GoogleSignIn', 'Sign in failed', error);
      
      if (this.statusCodes && error.code === this.statusCodes.SIGN_IN_CANCELLED) {
        return {
          success: false,
          error: 'User cancelled the sign-in flow',
          code: 'CANCELLED',
        };
      } else if (this.statusCodes && error.code === this.statusCodes.IN_PROGRESS) {
        return {
          success: false,
          error: 'Sign-in is already in progress',
          code: 'IN_PROGRESS',
        };
      } else if (this.statusCodes && error.code === this.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
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

  async signOut() {
    if (!this.isGoogleSignInAvailable()) {
      return { success: false, error: 'Google Sign-In is not available' };
    }

    try {
      await this.GoogleSignin.signOut();
      console.info('GoogleSignIn', 'Sign out successful');
      return { success: true };
    } catch (error) {
      console.error('GoogleSignIn', 'Sign out failed', error);
      return { success: false, error };
    }
  }

  async isSignedIn(): Promise<boolean> {
    if (!this.isGoogleSignInAvailable()) {
      return false;
    }

    try {
      const isSignedIn = await this.GoogleSignin.isSignedIn();
      console.info('GoogleSignIn', 'Check sign in status', { isSignedIn });
      return isSignedIn;
    } catch (error) {
      console.error('GoogleSignIn', 'Error checking sign in status', error);
      return false;
    }
  }
}

export const googleSignInWrapper = new GoogleSignInWrapper(); 