// ============================================================================
// SHARED API INTERCEPTOR - FOR YOU FEATURE
// ============================================================================
// 
// This is a shared API interceptor that can be used by both episodes and trailers.
// It's designed to be configurable and reusable across different features.
// 
// Usage:
// import apiInterceptor from '../common/api-interceptor';
// const response = await apiInterceptor.get('/endpoint');
// ============================================================================

import { Platform } from 'react-native';

// Generic configuration interface
interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  enableLogging: boolean;
  enableAnalytics: boolean;
  userAgent: string;
}

// Generic endpoints interface
interface ApiEndpoints {
  [key: string]: string;
}

// Generic HTTP methods
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Generic content types
const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;

// Generic cache TTL
const CACHE_TTL = {
  VIDEO_CONTENT: 10 * 60 * 1000, // 10 minutes
  USER_DATA: 5 * 60 * 1000, // 5 minutes
  STATIC_CONTENT: 30 * 60 * 1000, // 30 minutes
  AUTH_TOKEN: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Generic error codes
const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  // HTTP Status Codes
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Generic API response interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  status?: number;
  error?: string;
  timestamp?: number;
  requestId?: string;
}

// Request configuration interface
interface RequestConfig {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timeout?: number;
  isPublic?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

// API Error interface
interface ApiError {
  status: number;
  message: string;
}

// Generic storage interface
interface StorageInterface {
  get(key: string): any;
  set(key: string, value: any, ttl?: number): void;
  remove(key: string): void;
  clear(): void;
  getCache(key: string): any;
  setCache(key: string, value: any, ttl?: number): void;
  clearCache(): void;
  getToken(): string | null;
  removeToken(): void;
  removeAuthData(): void;
  removeUser(): void;
  getSize(): number;
}

// API Interceptor Class
class ApiInterceptor {
  private baseURL: string;
  private timeout: number;
  private storage: StorageInterface;
  private config: ApiConfig;

  constructor(config: ApiConfig, storage: StorageInterface) {
    this.config = config;
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.storage = storage;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Main request method
  async request<T>(
    endpoint: string,
    method: string = HTTP_METHODS.GET,
    data?: any,
    options: {
      isPublic?: boolean;
      cacheKey?: string;
      cacheTTL?: number;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    const {
      isPublic = false,
      cacheKey,
      cacheTTL = CACHE_TTL.USER_DATA,
      timeout = this.timeout,
    } = options;

    // Check cache first for GET requests
    if (method === HTTP_METHODS.GET && cacheKey && this.config.enableCaching) {
      const cachedData = this.storage.getCache(cacheKey);
      if (cachedData) {
        const duration = Date.now() - startTime;
        if (this.config.enableLogging) {
          console.log('⚡ Cache Hit:', {
            key: cacheKey,
            duration: `${duration}ms`,
          });
        }
        return {
          success: true,
          data: cachedData,
          message: 'Data retrieved from cache',
          requestId,
        };
      }
    }

    try {
      const config = await this.createRequestConfig(endpoint, method, data, {
        isPublic,
        timeout,
      });

      if (this.config.enableLogging) {
        console.log('📤 Request:', {
          method: config.method.toUpperCase(),
          url: config.url,
          headers: config.headers,
          data: config.body ? (typeof config.body === 'string' ? JSON.parse(config.body) : config.body) : undefined,
        });
      }

      const response = await this.makeRequest<T>(config, requestId);
      const duration = Date.now() - startTime;

      if (this.config.enableLogging) {
        console.log('📥 Response:', {
          url: config.url,
          success: response.success,
          data: response.data,
          duration: `${duration}ms`,
        });
      }

      // Cache successful GET responses
      if (method === HTTP_METHODS.GET && cacheKey && response.success && this.config.enableCaching) {
        this.storage.setCache(cacheKey, response.data, cacheTTL);
        if (this.config.enableLogging) {
          console.log('💾 Cache Set:', { key: cacheKey });
        }
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (this.config.enableLogging) {
        console.error('❌ Request Error:', {
          url: `${this.baseURL}${endpoint}`,
          method: method.toUpperCase(),
          error: error instanceof Error ? error.message : String(error),
          duration: `${duration}ms`,
        });
      }
      return this.handleError(error, requestId);
    }
  }

  // Create request configuration
  private async createRequestConfig(
    endpoint: string,
    method: string,
    data?: any,
    options: { isPublic?: boolean; timeout?: number } = {}
  ): Promise<RequestConfig> {
    const { isPublic = false, timeout = this.timeout } = options;
    const url = `${this.baseURL}${endpoint}`;
    const token = this.storage.getToken();

    const headers: Record<string, string> = {
      'Content-Type': CONTENT_TYPES.JSON,
      'Accept': CONTENT_TYPES.JSON,
      'User-Agent': this.config.userAgent,
    };

    // Add public-request header for public endpoints
    if (isPublic) {
      headers['public-request'] = 'true';
    }

    // Add authorization header for private requests
    if (!isPublic && token) {
      headers.accesstoken = token;
    }

    // Add device information
    headers['device-type'] = Platform.OS;
    headers['app-version'] = '1.0.0';

    const config: RequestConfig = {
      url,
      method,
      headers,
      timeout,
    };

    // Add body for non-GET requests
    if (method !== HTTP_METHODS.GET && data) {
      if (data instanceof FormData) {
        config.headers['Content-Type'] = CONTENT_TYPES.FORM_DATA;
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    return config;
  }

  // Make the actual HTTP request
  private async makeRequest<T>(config: RequestConfig, requestId: string): Promise<ApiResponse<T>> {
    const { method, headers, body, timeout } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (this.config.enableLogging) {
        console.log('⏰ Request Timeout:', { timeout: `${timeout}ms` });
      }
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(config.url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Extract cookies from response headers for video authentication
      const cookies: Record<string, string> = {};
      const setCookieHeaders = response.headers.get('set-cookie');
      
      if (setCookieHeaders) {
        // Parse multiple Set-Cookie headers
        const cookieStrings = setCookieHeaders.split(',');
        cookieStrings.forEach(cookieString => {
          const [cookiePart] = cookieString.split(';');
          const [name, value] = cookiePart.split('=');
          if (name && value) {
            cookies[name.trim()] = value.trim();
          }
        });
      }
      
      // Add cookies to response data for video authentication
      const responseWithCookies = {
        ...responseData,
        cookies: Object.keys(cookies).length > 0 ? cookies : undefined
      };
      
      return {
        success: true,
        data: responseWithCookies,
        message: 'Request successful',
        requestId,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Handle errors
  private handleError(error: any, requestId: string): ApiResponse<any> {
    let apiError: ApiError = {
      status: 500,
      message: 'An unexpected error occurred',
    };

    if (error.name === 'AbortError') {
      apiError = {
        status: 408,
        message: 'Request timeout',
      };
    } else if (error.message?.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 500;

      apiError = {
        status,
        message: this.getErrorMessage(status),
      };

      // Handle specific error codes
      if (status === ERROR_CODES.UNAUTHORIZED) {
        this.handleUnauthorized();
      }
    } else if (error.message) {
      apiError.message = error.message;
    }

    return {
      success: false,
      data: null,
      message: apiError.message,
      requestId,
    };
  }

  // Get error message based on status code
  private getErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 408:
        return 'Request timeout';
      case 500:
        return 'Internal server error';
      case 502:
        return 'Bad gateway';
      case 503:
        return 'Service unavailable';
      default:
        return 'An error occurred';
    }
  }

  // Handle unauthorized access
  private handleUnauthorized(): void {
    // Clear auth data
    this.storage.removeAuthData();
    this.storage.removeToken();
    this.storage.removeUser();
    
    if (this.config.enableLogging) {
      console.log('🔐 API: Unauthorized access detected, cleared auth data');
    }
  }

  // Retry mechanism
  private async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    retries: number = this.config.retryAttempts,
    delay: number = this.config.retryDelay
  ): Promise<ApiResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0) {
        await this.delay(delay);
        return this.retryRequest(requestFn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for different HTTP methods
  async get<T>(
    endpoint: string,
    options: {
      isPublic?: boolean;
      cacheKey?: string;
      cacheTTL?: number;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.GET, undefined, options);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.POST, data, options);
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.PUT, data, options);
  }

  async delete<T>(
    endpoint: string,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.DELETE, undefined, options);
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, HTTP_METHODS.PATCH, data, options);
  }

  // Upload file method
  async uploadFile<T>(
    endpoint: string,
    file: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>(endpoint, HTTP_METHODS.POST, formData, options);
  }

  // Clear cache
  clearCache(): void {
    this.storage.clearCache();
    if (this.config.enableLogging) {
      console.log('🗑️ Cache cleared');
    }
  }

  // Get cache size
  getCacheSize(): number {
    return this.storage.getSize();
  }
}

// Export the class and constants for use by features
export { ApiInterceptor, HTTP_METHODS, CONTENT_TYPES, CACHE_TTL, ERROR_CODES };
export type { ApiResponse, ApiConfig, StorageInterface, RequestConfig, ApiError }; 