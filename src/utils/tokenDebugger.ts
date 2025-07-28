import TokenManager from './tokenManager';
import MMKVStorage from '../lib/mmkv';
import { useAuthStore } from '../store/auth.store';

export class TokenDebugger {
  // Get comprehensive token information
  static getTokenStatus() {
    const tokenInfo = TokenManager.getTokenInfo();
    const authState = useAuthStore.getState();
    
    // Get raw MMKV data for comparison
    const mmkvToken = MMKVStorage.getToken();
    const mmkvAuthData = MMKVStorage.getAuthData();
    const mmkvTokenData = MMKVStorage.get('token_data');
    
    return {
      // TokenManager status
      tokenManager: {
        hasToken: tokenInfo.hasToken,
        isExpired: tokenInfo.isExpired,
        expiresAt: tokenInfo.expiresAt,
        timeUntilExpiry: tokenInfo.timeUntilExpiry,
      },
      
      // Zustand auth state
      authStore: {
        hasToken: !!authState.token,
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        userId: authState.user?._id || null,
        userName: authState.user?.userName || null,
      },
      
      // Raw MMKV data
      mmkv: {
        hasToken: !!mmkvToken,
        hasAuthData: !!mmkvAuthData,
        hasTokenData: !!mmkvTokenData,
        tokenLength: mmkvToken?.length || 0,
        authDataKeys: mmkvAuthData ? Object.keys(mmkvAuthData) : [],
        tokenDataKeys: mmkvTokenData ? Object.keys(mmkvTokenData) : [],
      },
      
      // Storage consistency check
      consistency: {
        tokenManagerHasToken: tokenInfo.hasToken,
        authStoreHasToken: !!authState.token,
        mmkvHasToken: !!mmkvToken,
        allConsistent: tokenInfo.hasToken === !!authState.token && !!authState.token === !!mmkvToken,
      },
    };
  }

  // Log detailed token information
  static logTokenStatus() {
    const status = this.getTokenStatus();
    
    console.log('🔍 TokenDebugger - Token Status:', {
      timestamp: new Date().toISOString(),
      ...status,
    });
    
    return status;
  }

  // Check for token inconsistencies
  static checkInconsistencies() {
    const status = this.getTokenStatus();
    const issues = [];
    
    // Check if all storage methods have the same token state
    if (!status.consistency.allConsistent) {
      issues.push('Token storage inconsistency detected');
    }
    
    // Check if token is expired
    if (status.tokenManager.isExpired) {
      issues.push('Token is expired');
    }
    
    // Check if user is authenticated but no token
    if (status.authStore.isAuthenticated && !status.tokenManager.hasToken) {
      issues.push('User authenticated but no valid token');
    }
    
    // Check if token exists but user not authenticated
    if (status.tokenManager.hasToken && !status.authStore.isAuthenticated) {
      issues.push('Token exists but user not authenticated');
    }
    
    return {
      hasIssues: issues.length > 0,
      issues,
      status,
    };
  }

  // Fix common token issues
  static async fixTokenIssues() {
    const inconsistencies = this.checkInconsistencies();
    
    if (!inconsistencies.hasIssues) {
      console.log('✅ TokenDebugger - No issues found');
      return { success: true, message: 'No issues found' };
    }
    
    console.log('🔧 TokenDebugger - Fixing issues:', inconsistencies.issues);
    
    try {
      const { logout } = useAuthStore.getState();
      
      // Clear all token data
      TokenManager.clearToken();
      MMKVStorage.removeAuthData();
      logout();
      
      console.log('✅ TokenDebugger - Issues fixed, user logged out');
      return { success: true, message: 'Issues fixed, user logged out' };
    } catch (error) {
      console.error('❌ TokenDebugger - Failed to fix issues:', error);
      return { success: false, message: 'Failed to fix issues', error };
    }
  }

  // Test token storage
  static testTokenStorage() {
    const testToken = 'test-token-' + Date.now();
    
    try {
      // Test TokenManager
      TokenManager.storeToken(testToken);
      const retrievedToken = TokenManager.getToken();
      const isValid = TokenManager.isTokenValid();
      
      // Clean up
      TokenManager.clearToken();
      
      return {
        success: true,
        testToken,
        retrievedToken,
        isValid,
        matches: testToken === retrievedToken,
      };
    } catch (error) {
      console.error('❌ TokenDebugger - Token storage test failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Get storage size information
  static getStorageInfo() {
    try {
      const size = MMKVStorage.getSize();
      const tokenInfo = TokenManager.getTokenInfo();
      
      return {
        totalSize: size,
        sizeInKB: Math.round(size / 1024 * 100) / 100,
        hasToken: tokenInfo.hasToken,
        tokenLength: tokenInfo.hasToken ? TokenManager.getToken()?.length || 0 : 0,
      };
    } catch (error) {
      console.error('❌ TokenDebugger - Failed to get storage info:', error);
      return {
        error: error.message,
      };
    }
  }

  // Clear all token-related data
  static clearAllTokenData() {
    try {
      TokenManager.clearToken();
      MMKVStorage.removeAuthData();
      MMKVStorage.removeToken();
      MMKVStorage.remove('token_data');
      
      console.log('🗑️ TokenDebugger - All token data cleared');
      return { success: true, message: 'All token data cleared' };
    } catch (error) {
      console.error('❌ TokenDebugger - Failed to clear token data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export a simple function for easy access
export const debugToken = () => {
  return TokenDebugger.logTokenStatus();
};

export const checkTokenIssues = () => {
  return TokenDebugger.checkInconsistencies();
};

export const fixTokenIssues = () => {
  return TokenDebugger.fixTokenIssues();
};

export const testTokenStorage = () => {
  return TokenDebugger.testTokenStorage();
};

export const getTokenInfo = () => {
  return TokenDebugger.getTokenStatus();
};

// Simple function to log current token
export const logCurrentToken = () => {
  const token = TokenManager.getToken();
  if (token) {
    console.log('🔐 Current Token:', {
      token: token,
      length: token.length,
      timestamp: new Date().toISOString()
    });
  } else {
    console.log('🔐 No token found');
  }
  return token;
}; 