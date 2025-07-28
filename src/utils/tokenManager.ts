import MMKVStorage from '../lib/mmkv';
import { useAuthStore } from '../store/auth.store';

// Token expiration time (24 hours in milliseconds)
const TOKEN_EXPIRY_TIME = 24 * 60 * 60 * 1000;

interface TokenData {
  token: string;
  issuedAt: number;
  expiresAt: number;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshTimer: NodeJS.Timeout | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  // Store token with expiration
  static storeToken(token: string): void {
    try {
      const tokenData: TokenData = {
        token,
        issuedAt: Date.now(),
        expiresAt: Date.now() + TOKEN_EXPIRY_TIME,
      };

      MMKVStorage.set('token_data', tokenData);
      MMKVStorage.setToken(token); // Keep backward compatibility
      
      console.log('🔐 TokenManager - Token stored with expiration:', {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + '...',
        issuedAt: new Date(tokenData.issuedAt).toISOString(),
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
        expiryInHours: TOKEN_EXPIRY_TIME / (1000 * 60 * 60),
      });
    } catch (error) {
      console.error('❌ TokenManager - Failed to store token:', error);
    }
  }

  // Get current token
  static getToken(): string | null {
    try {
      // First try to get from token_data
      const tokenData = MMKVStorage.get('token_data') as TokenData;
      
      if (tokenData && tokenData.token) {
        // Check if token is expired
        if (Date.now() > tokenData.expiresAt) {
          console.log('⚠️ TokenManager - Token expired, clearing...');
          this.clearToken();
          return null;
        }
        
        console.log('🔐 TokenManager - Token retrieved (with expiration):', {
          tokenLength: tokenData.token.length,
          tokenPreview: tokenData.token.substring(0, 20) + '...',
          expiresAt: new Date(tokenData.expiresAt).toISOString(),
          timeUntilExpiry: Math.round((tokenData.expiresAt - Date.now()) / (1000 * 60 * 60) * 100) / 100 + ' hours',
        });
        
        return tokenData.token;
      }

      // Fallback to old storage method
      const fallbackToken = MMKVStorage.getToken();
      if (fallbackToken) {
        console.log('🔐 TokenManager - Token retrieved (fallback method):', {
          tokenLength: fallbackToken.length,
          tokenPreview: fallbackToken.substring(0, 20) + '...',
          note: 'No expiration data available',
        });
      }
      
      return fallbackToken;
    } catch (error) {
      console.error('❌ TokenManager - Failed to get token:', error);
      return null;
    }
  }

  // Check if token is valid
  static isTokenValid(): boolean {
    const token = this.getToken();
    return token !== null;
  }

  // Check if token is expired
  static isTokenExpired(): boolean {
    try {
      const tokenData = MMKVStorage.get('token_data') as TokenData;
      if (!tokenData) return true;
      
      return Date.now() > tokenData.expiresAt;
    } catch (error) {
      console.error('❌ TokenManager - Failed to check token expiration:', error);
      return true;
    }
  }

  // Get token expiration time
  static getTokenExpiration(): Date | null {
    try {
      const tokenData = MMKVStorage.get('token_data') as TokenData;
      return tokenData ? new Date(tokenData.expiresAt) : null;
    } catch (error) {
      console.error('❌ TokenManager - Failed to get token expiration:', error);
      return null;
    }
  }

  // Clear token
  static clearToken(): void {
    try {
      MMKVStorage.remove('token_data');
      MMKVStorage.removeToken();
      console.log('🗑️ TokenManager - Token cleared');
    } catch (error) {
      console.error('❌ TokenManager - Failed to clear token:', error);
    }
  }

  // Refresh token (placeholder for future implementation)
  static async refreshToken(): Promise<boolean> {
    try {
      console.log('🔄 TokenManager - Attempting token refresh...');
      
      // TODO: Implement actual token refresh API call
      // const response = await authService.refreshToken();
      // if (response.success) {
      //   this.storeToken(response.data.token);
      //   return true;
      // }
      
      // For now, just return false
      console.log('⚠️ TokenManager - Token refresh not implemented yet');
      return false;
    } catch (error) {
      console.error('❌ TokenManager - Token refresh failed:', error);
      return false;
    }
  }

  // Setup automatic token refresh
  static setupAutoRefresh(): void {
    const instance = TokenManager.getInstance();
    
    // Clear existing timer
    if (instance.refreshTimer) {
      clearTimeout(instance.refreshTimer);
    }

    // Check token every 5 minutes
    instance.refreshTimer = setInterval(() => {
      if (this.isTokenExpired()) {
        console.log('⏰ TokenManager - Token expired, attempting refresh...');
        this.refreshToken().then((success) => {
          if (!success) {
            // If refresh fails, logout user
            console.log('❌ TokenManager - Refresh failed, logging out user');
            const { logout } = useAuthStore.getState();
            logout();
          }
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Stop automatic token refresh
  static stopAutoRefresh(): void {
    const instance = TokenManager.getInstance();
    if (instance.refreshTimer) {
      clearTimeout(instance.refreshTimer);
      instance.refreshTimer = null;
    }
  }

  // Get token info for debugging
  static getTokenInfo(): {
    hasToken: boolean;
    isExpired: boolean;
    expiresAt: string | null;
    timeUntilExpiry: string | null;
  } {
    const token = this.getToken();
    const expiresAt = this.getTokenExpiration();
    const isExpired = this.isTokenExpired();

    let timeUntilExpiry = null;
    if (expiresAt && !isExpired) {
      const timeLeft = expiresAt.getTime() - Date.now();
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      timeUntilExpiry = `${hours}h ${minutes}m`;
    }

    return {
      hasToken: !!token,
      isExpired,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      timeUntilExpiry,
    };
  }
}

export default TokenManager; 