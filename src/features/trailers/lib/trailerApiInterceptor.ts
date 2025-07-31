// ============================================================================
// TRAILER API INTERCEPTOR - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import { TRAILER_API_CONFIG, TRAILER_ENDPOINTS, TRAILER_HTTP_METHODS, TRAILER_CONTENT_TYPES, TRAILER_ERROR_CODES, TRAILER_CACHE_TTL } from '../config/trailerApi';
import { TrailerApiResponse } from '../types/trailerApi';
import trailerStorage from './trailerStorage';
import { Platform } from 'react-native';

// Request configuration interface
interface TrailerRequestConfig {
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
interface TrailerApiError {
  status: number;
  message: string;
}

// API Interceptor Class
class TrailerApiInterceptor {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = TRAILER_API_CONFIG.BASE_URL;
    this.timeout = TRAILER_API_CONFIG.TIMEOUT;
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return `trailer_req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Main request method
  async request<T>(
    endpoint: string,
    method: string = TRAILER_HTTP_METHODS.GET,
    data?: any,
    options: {
      isPublic?: boolean;
      cacheKey?: string;
      cacheTTL?: number;
      timeout?: number;
    } = {}
  ): Promise<TrailerApiResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    const {
      isPublic = false,
      cacheKey,
      cacheTTL = TRAILER_CACHE_TTL.USER_DATA,
      timeout = this.timeout,
    } = options;

    // Check cache first for GET requests
    if (method === TRAILER_HTTP_METHODS.GET && cacheKey) {
      const cachedData = await trailerStorage.get(cacheKey);
      if (cachedData) {
        const duration = Date.now() - startTime;
        console.log('⚡ Trailer Cache Hit:', {
          key: cacheKey,
          duration: `${duration}ms`,
        });
              return {
        status: 200,
        data: cachedData as T,
        message: 'Data retrieved from cache',
      };
      }
    }

    try {
      const config = await this.createRequestConfig(endpoint, method, data, {
        isPublic,
        timeout,
      });

      console.log('📤 Trailer Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.body ? (typeof config.body === 'string' ? JSON.parse(config.body) : config.body) : undefined,
      });

      const response = await this.makeRequest<T>(config, requestId);
      const duration = Date.now() - startTime;

      console.log('📥 Trailer Response:', {
        url: config.url,
        status: response.status,
        data: response.data,
        duration: `${duration}ms`,
      });

      // Cache successful GET responses
      if (method === TRAILER_HTTP_METHODS.GET && cacheKey && response.status === 200) {
        await trailerStorage.set(cacheKey, response.data);
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error('❌ Trailer Request Error:', {
        requestId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return this.handleError(error, requestId);
    }
  }

  // Create request configuration
  private async createRequestConfig(
    endpoint: string,
    method: string,
    data?: any,
    options: { isPublic?: boolean; timeout?: number } = {}
  ): Promise<TrailerRequestConfig> {
    const { isPublic = false, timeout = this.timeout } = options;
    const url = `${this.baseURL}${endpoint}`;
    const token = await trailerStorage.get('auth_token') as string;

    const headers: Record<string, string> = {
      'Content-Type': TRAILER_CONTENT_TYPES.JSON,
      'Accept': TRAILER_CONTENT_TYPES.JSON,
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

    const config: TrailerRequestConfig = {
      url,
      method,
      headers,
      timeout,
    };

    // Add body for non-GET requests
    if (method !== TRAILER_HTTP_METHODS.GET && data) {
      if (data instanceof FormData) {
        config.headers['Content-Type'] = TRAILER_CONTENT_TYPES.FORM_DATA;
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    return config;
  }

  // Make the actual HTTP request
  private async makeRequest<T>(config: TrailerRequestConfig, requestId: string): Promise<TrailerApiResponse<T>> {
    const { method, headers, body, timeout } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Trailer Request Timeout:', { timeout: `${timeout}ms` });
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
      
      return responseWithCookies;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Handle errors
  private handleError(error: any, requestId: string): TrailerApiResponse<any> {
    console.error('❌ Trailer API Error:', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error.name === 'AbortError') {
      return {
        status: TRAILER_ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'Request timeout',
        data: null,
      };
    }

    if (error.message?.includes('HTTP 401')) {
      this.handleUnauthorized();
      return {
        status: TRAILER_ERROR_CODES.UNAUTHORIZED,
        message: 'Unauthorized access',
        data: null,
      };
    }

    if (error.message?.includes('HTTP 403')) {
      return {
        status: TRAILER_ERROR_CODES.FORBIDDEN,
        message: 'Access forbidden',
        data: null,
      };
    }

    if (error.message?.includes('HTTP 404')) {
      return {
        status: TRAILER_ERROR_CODES.NOT_FOUND,
        message: 'Resource not found',
        data: null,
      };
    }

    if (error.message?.includes('HTTP 500')) {
      return {
        status: TRAILER_ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        data: null,
      };
    }

    return {
      status: TRAILER_ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Network error',
      data: null,
    };
  }

  // Get error message based on status code
  private getErrorMessage(status: number): string {
    switch (status) {
      case TRAILER_ERROR_CODES.UNAUTHORIZED:
        return 'Unauthorized access';
      case TRAILER_ERROR_CODES.FORBIDDEN:
        return 'Access forbidden';
      case TRAILER_ERROR_CODES.NOT_FOUND:
        return 'Resource not found';
      case TRAILER_ERROR_CODES.INTERNAL_SERVER_ERROR:
        return 'Internal server error';
      case TRAILER_ERROR_CODES.BAD_GATEWAY:
        return 'Bad gateway';
      case TRAILER_ERROR_CODES.SERVICE_UNAVAILABLE:
        return 'Service unavailable';
      default:
        return 'Unknown error';
    }
  }

  // Handle unauthorized access
  private handleUnauthorized(): void {
    console.log('🔐 Trailer API: Unauthorized access detected');
    // Clear auth token
    trailerStorage.remove('auth_token');
  }

  // Retry request with exponential backoff
  private async retryRequest<T>(
    requestFn: () => Promise<TrailerApiResponse<T>>,
    retries: number = TRAILER_API_CONFIG.RETRY_ATTEMPTS,
    delay: number = TRAILER_API_CONFIG.RETRY_DELAY
  ): Promise<TrailerApiResponse<T>> {
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

  // Utility function to delay execution
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET request
  async get<T>(
    endpoint: string,
    options: {
      isPublic?: boolean;
      cacheKey?: string;
      cacheTTL?: number;
      timeout?: number;
    } = {}
  ): Promise<TrailerApiResponse<T>> {
    return this.request<T>(endpoint, TRAILER_HTTP_METHODS.GET, undefined, options);
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<TrailerApiResponse<T>> {
    return this.request<T>(endpoint, TRAILER_HTTP_METHODS.POST, data, options);
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<TrailerApiResponse<T>> {
    return this.request<T>(endpoint, TRAILER_HTTP_METHODS.PUT, data, options);
  }

  // DELETE request
  async delete<T>(
    endpoint: string,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<TrailerApiResponse<T>> {
    return this.request<T>(endpoint, TRAILER_HTTP_METHODS.DELETE, undefined, options);
  }

  // PATCH request
  async patch<T>(
    endpoint: string,
    data?: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<TrailerApiResponse<T>> {
    return this.request<T>(endpoint, TRAILER_HTTP_METHODS.PATCH, data, options);
  }

  // Upload file
  async uploadFile<T>(
    endpoint: string,
    file: any,
    options: {
      isPublic?: boolean;
      timeout?: number;
    } = {}
  ): Promise<TrailerApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<T>(endpoint, TRAILER_HTTP_METHODS.POST, formData, options);
  }

  // Clear cache
  async clearCache(): Promise<void> {
    await trailerStorage.clear();
    console.log('🗑️ Trailer cache cleared');
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    // For now, return 0 since trailerStorage doesn't have getAllKeys
    return 0;
  }
}

// Create and export singleton instance
const trailerApiInterceptor = new TrailerApiInterceptor();
export default trailerApiInterceptor; 