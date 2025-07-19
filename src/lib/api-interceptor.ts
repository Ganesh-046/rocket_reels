import { API_CONFIG, ENDPOINTS, HTTP_METHODS, CONTENT_TYPES, ERROR_CODES, CACHE_TTL } from '../config/api';
import { ApiResponse } from '../types/api';
import MMKVStorage from './mmkv';
import { Platform } from 'react-native';

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

// API Interceptor Class
class ApiInterceptor {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Enhanced logging utility
  private logRequest(config: RequestConfig, requestId: string): void {
    console.log(`🌐 [${requestId}] REQUEST:`, {
      method: config.method,
      url: config.url,
      headers: config.headers,
      body: config.body ? (typeof config.body === 'string' ? JSON.parse(config.body) : config.body) : undefined,
      timeout: config.timeout,
      timestamp: new Date().toISOString(),
    });
  }

  private logResponse(response: any, requestId: string, duration: number): void {
    console.log(`✅ [${requestId}] RESPONSE:`, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }

  private logError(error: any, requestId: string, duration: number): void {
    console.error(`❌ [${requestId}] ERROR:`, {
      error: error.message || error,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      stack: error.stack,
    });
  }

  private logCache(cacheKey: string, action: 'HIT' | 'MISS' | 'SET'): void {
    console.log(`💾 [CACHE] ${action}:`, {
      key: cacheKey,
      timestamp: new Date().toISOString(),
    });
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

    console.log(`🚀 [${requestId}] STARTING REQUEST:`, {
      endpoint,
      method,
      isPublic,
      cacheKey,
      timestamp: new Date().toISOString(),
    });

    // Check cache first for GET requests
    if (method === HTTP_METHODS.GET && cacheKey) {
      const cachedData = MMKVStorage.getCache<T>(cacheKey);
      if (cachedData) {
        this.logCache(cacheKey, 'HIT');
        const duration = Date.now() - startTime;
        console.log(`⚡ [${requestId}] CACHE HIT (${duration}ms):`, {
          data: cachedData,
          timestamp: new Date().toISOString(),
        });
        return {
          status: 200,
          data: cachedData,
          message: 'Data retrieved from cache',
        };
      } else {
        this.logCache(cacheKey, 'MISS');
      }
    }

    try {
      const config = await this.createRequestConfig(endpoint, method, data, {
        isPublic,
        timeout,
      });

      this.logRequest(config, requestId);

      const response = await this.makeRequest<T>(config, requestId);
      const duration = Date.now() - startTime;

      this.logResponse(response, requestId, duration);

      // Cache successful GET responses
      if (method === HTTP_METHODS.GET && cacheKey && response.status) {
        MMKVStorage.setCache(cacheKey, response.data, cacheTTL);
        this.logCache(cacheKey, 'SET');
      }

      console.log(`🎉 [${requestId}] REQUEST COMPLETED (${duration}ms)`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logError(error, requestId, duration);
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
    const token = MMKVStorage.getToken();

    const headers: Record<string, string> = {
      'Content-Type': CONTENT_TYPES.JSON,
      'Accept': CONTENT_TYPES.JSON,
      'public-request': isPublic.toString(),
    };

    // Add authorization header for private requests
    if (!isPublic && token) {
      headers['accesstoken'] = `Bearer ${token}`;
    }

    // Add device information
    headers['device-type'] = Platform.OS;
    headers['app-version'] = '1.0.0'; // You can get this from app config

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
      console.log(`⏰ [${requestId}] REQUEST TIMEOUT (${timeout}ms)`);
      controller.abort();
    }, timeout);

    try {
      console.log(`📡 [${requestId}] SENDING REQUEST...`);
      
      const response = await fetch(config.url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`📥 [${requestId}] RESPONSE RECEIVED:`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      console.log(`📊 [${requestId}] RESPONSE DATA:`, {
        data: responseData,
        size: JSON.stringify(responseData).length,
      });

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Handle errors
  private handleError(error: any, requestId: string): ApiResponse<any> {
    console.error(`💥 [${requestId}] ERROR HANDLING:`, {
      error: error.message || error,
      type: error.constructor.name,
      timestamp: new Date().toISOString(),
    });

    let apiError: ApiError = {
      status: 500,
      message: 'An unexpected error occurred',
    };

    if (error.name === 'AbortError') {
      apiError = {
        status: 408,
        message: 'Request timeout',
      };
      console.log(`⏰ [${requestId}] TIMEOUT ERROR`);
    } else if (error.message?.includes('HTTP')) {
      const statusMatch = error.message.match(/HTTP (\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 500;

      apiError = {
        status,
        message: this.getErrorMessage(status),
      };

      console.log(`🚫 [${requestId}] HTTP ERROR ${status}:`, apiError.message);

      // Handle specific error codes
      if (status === ERROR_CODES.UNAUTHORIZED) {
        this.handleUnauthorized();
      }
    } else if (error.message) {
      apiError.message = error.message;
    }

    return {
      status: 500,
      data: null,
      message: apiError.message,
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
    // Clear auth data and redirect to login
    MMKVStorage.removeAuthData();
    MMKVStorage.removeToken();
    MMKVStorage.removeUser();
    
    // You can emit an event here to notify the app about logout
    // EventEmitter.emit('LOGOUT');
  }

  // Retry mechanism
  private async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    retries: number = API_CONFIG.RETRY_ATTEMPTS,
    delay: number = API_CONFIG.RETRY_DELAY
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
    MMKVStorage.clearCache();
  }

  // Get cache size
  getCacheSize(): number {
    return MMKVStorage.getSize();
  }
}

// Create singleton instance
const apiInterceptor = new ApiInterceptor();

export default apiInterceptor; 