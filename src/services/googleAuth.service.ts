import { googleSignInWrapper } from './googleSignInWrapper';
import apiService from './api.service';

import { Platform } from 'react-native';

class GoogleAuthService {
  async loginWithGoogle() {
    try {
      console.log('GoogleAuth: Starting Google login flow');
      
      // Step 1: Sign in with Google
      const signInResult = await googleSignInWrapper.signIn();
      
      if (!signInResult.success) {
        return {
          success: false,
          error: signInResult.error,
          code: signInResult.code,
        };
      }

      const { user, idToken, serverAuthCode } = signInResult;

      // Step 2: Prepare data matching your existing API structure
      // Ensure user object has required properties
      const safeUser = {
        id: user.id || user.userId || user.sub || 'unknown',
        email: user.email || '',
        name: user.name || user.displayName || '',
        ...user, // Include all other properties
      };

      // Create a payload that matches the backend's expected structure
      // The backend expects mobileNo and callingCode, but for Google login we'll provide alternatives
      const extendedRes = {
        // Google user data
        googleId: user.id || user.userId || user.sub || 'unknown',
        email: user.email || '',
        name: user.name || user.displayName || user.givenName || '',
        photo: user.photo || '',
        givenName: user.givenName || '',
        familyName: user.familyName || '',
        
        // Required fields for backend (using email as mobileNo for Google login)
        mobileNo: user.email || '', // Use email as mobileNo for Google login
        callingCode: '+1', // Default calling code for Google login
        otp: 'GOOGLE_AUTH', // Special OTP value for Google authentication
        
        // Device and auth data
        deviceToken: 'default-device-token',
        deviceType: Platform.OS,
        firebaseToken: 'default-firebase-token',
        
        // Additional fields
        loginType: 'google', // Specify login type
        idToken: idToken, // Google ID token
        serverAuthCode: serverAuthCode, // Google server auth code
      };

      console.log('GoogleAuth: Sending Google auth data to backend', {
        googleId: extendedRes.googleId,
        email: extendedRes.email,
        name: extendedRes.name,
        loginType: extendedRes.loginType,
      });
      
      // Log the complete payload for debugging
      console.log('GoogleAuth: Complete payload being sent:', JSON.stringify(extendedRes, null, 2));

      // Step 3: Send to your existing backend endpoint
      const backendResponse = await this.sendGoogleAuthToBackend(extendedRes);

      if (backendResponse.success) {
        return {
          success: true,
          data: backendResponse.data,
          googleUser: safeUser,
        };
      } else {
        return {
          success: false,
          error: backendResponse.error,
          code: 'BACKEND_ERROR',
        };
      }
    } catch (error) {
      console.error('GoogleAuth: Google login flow failed', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('native module is not available')) {
          return {
            success: false,
            error: 'Google Sign-In is not available. Please rebuild the app.',
            code: 'NATIVE_MODULE_NOT_AVAILABLE',
          };
        }
        return {
          success: false,
          error: error.message,
          code: 'UNKNOWN_ERROR',
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred',
        code: 'UNKNOWN_ERROR',
      };
    }
  }

  private async sendGoogleAuthToBackend(extendedRes: any) {
    try {
      // Try using the login endpoint with Google data as additional fields
      const googleLoginPayload = {
        // Standard login fields (required by backend)
        mobileNo: extendedRes.email, // Use email as mobileNo
        callingCode: '+1', // Default calling code
        
        // Google-specific data (additional fields)
        googleId: extendedRes.googleId,
        googleName: extendedRes.name,
        googleEmail: extendedRes.email,
        googlePhoto: extendedRes.photo,
        idToken: extendedRes.idToken,
        serverAuthCode: extendedRes.serverAuthCode,
        loginType: 'google',
        
        // Device data
        deviceToken: extendedRes.deviceToken,
        deviceType: extendedRes.deviceType,
        firebaseToken: extendedRes.firebaseToken,
      };

      console.log('GoogleAuth: Trying login endpoint with Google data:', {
        mobileNo: googleLoginPayload.mobileNo,
        callingCode: googleLoginPayload.callingCode,
        googleId: googleLoginPayload.googleId,
        loginType: googleLoginPayload.loginType,
      });

      const response = await fetch('https://k9456pbd.rocketreel.co.in/api/v1/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'public-request': 'true',
        },
        body: JSON.stringify(googleLoginPayload),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('GoogleAuth: Backend response received', {
          status: response.status,
          data: data,
          isNewUser: data?.data?.isNew,
          hasToken: !!data?.data?.token,
          hasUserId: !!data?.data?.userId,
        });
        
        return {
          success: true,
          data: data?.data,
          status: response.status,
        };
      } else {
        console.error('GoogleAuth: Backend request failed', {
          status: response.status,
          error: data?.message,
        });
        
        return {
          success: false,
          error: data?.message || 'Authentication failed',
          code: 'BACKEND_ERROR',
        };
      }
    } catch (error: any) {
      console.error('GoogleAuth: Backend request failed', error);
      return {
        success: false,
        error: error?.message || 'Authentication failed',
        code: 'BACKEND_ERROR',
      };
    }
  }
}

export const googleAuthService = new GoogleAuthService(); 