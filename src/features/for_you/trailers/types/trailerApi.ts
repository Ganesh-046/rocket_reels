// ============================================================================
// 🎬 TRAILER API TYPES - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================
// 
// This file contains all API-related TypeScript types for the trailer feature.
// All types are designed to be self-contained and portable.
// 
// Usage:
// import { TrailerApiResponse, TrailerApiRequest } from './types/trailerApi';
// ============================================================================

import {
  TrailerItem,
  TrailerListResponse,
  TrailerListParams,
  TrailerVideoQuality,
  TrailerError,
} from './index';

// ============================================================================
// 🎯 CORE API TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface TrailerApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: TrailerError;
  timestamp?: number;
  requestId?: string;
}

/**
 * API request configuration
 */
export interface TrailerApiRequest {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
}

/**
 * API cache configuration
 */
export interface TrailerApiCacheConfig {
  cacheKey: string;
  cacheTTL: number;
  cacheStrategy: 'memory' | 'persistent' | 'both';
}

/**
 * API configuration
 */
export interface TrailerApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  enableLogging: boolean;
}

// ============================================================================
// 🎬 TRAILER-SPECIFIC API TYPES
// ============================================================================

/**
 * Trailer list API response
 */
export type TrailerListApiResponse = TrailerApiResponse<TrailerListResponse>;

/**
 * Single trailer API response
 */
export type TrailerDetailsApiResponse = TrailerApiResponse<TrailerItem>;

/**
 * Trailer search API response
 */
export type TrailerSearchApiResponse = TrailerApiResponse<{
  trailers: TrailerItem[];
  total: number;
  query: string;
}>;

/**
 * Trailer genre API response
 */
export type TrailerGenreApiResponse = TrailerApiResponse<{
  genres: Array<{
    name: string;
    slug: string;
    count: number;
  }>;
}>;

// ============================================================================
// 🎯 API REQUEST TYPES
// ============================================================================

/**
 * Trailer list request parameters
 */
export interface TrailerListRequestParams extends TrailerListParams {
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'releasingDate' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

/**
 * Trailer search request parameters
 */
export interface TrailerSearchRequestParams {
  query: string;
  page?: number;
  limit?: number;
  genre?: string;
  adult?: boolean;
}

/**
 * Trailer details request parameters
 */
export interface TrailerDetailsRequestParams {
  trailerId: string;
  includeAnalytics?: boolean;
  includeRelated?: boolean;
}

/**
 * Trailer genre request parameters
 */
export interface TrailerGenreRequestParams {
  genre?: string;
  page?: number;
  limit?: number;
  adult?: boolean;
}

// ============================================================================
// 🎯 API ERROR TYPES
// ============================================================================

/**
 * API error codes
 */
export enum TrailerApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * API error response
 */
export interface TrailerApiError {
  code: TrailerApiErrorCode;
  message: string;
  details?: any;
  timestamp: number;
  requestId?: string;
}

// ============================================================================
// 🎯 API ANALYTICS TYPES
// ============================================================================

/**
 * Trailer view analytics
 */
export interface TrailerViewAnalytics {
  trailerId: string;
  userId?: string;
  duration: number;
  quality: TrailerVideoQuality;
  timestamp: number;
  deviceInfo?: {
    platform: string;
    version: string;
    model: string;
  };
}

/**
 * Trailer interaction analytics
 */
export interface TrailerInteractionAnalytics {
  trailerId: string;
  userId?: string;
  action: 'like' | 'share' | 'favorite' | 'watch' | 'skip';
  timestamp: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// 🎯 API CACHE TYPES
// ============================================================================

/**
 * Cache entry structure
 */
export interface TrailerCacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

/**
 * Cache statistics
 */
export interface TrailerCacheStats {
  totalEntries: number;
  memoryUsage: number;
  hitRate: number;
  missRate: number;
  averageTTL: number;
}

// ============================================================================
// 🎯 API CONFIGURATION TYPES
// ============================================================================

/**
 * API endpoint configuration
 */
export interface TrailerApiEndpoints {
  trailers: string;
  trailerDetails: string;
  search: string;
  genres: string;
  analytics: string;
  interactions: string;
}

/**
 * API middleware configuration
 */
export interface TrailerApiMiddleware {
  request?: (config: TrailerApiRequest) => TrailerApiRequest;
  response?: (response: TrailerApiResponse) => TrailerApiResponse;
  error?: (error: TrailerApiError) => TrailerApiError;
}

// ============================================================================
// 🎬 TRAILER API FEATURE EXPORTS
// ============================================================================

// All types are automatically exported as they are defined as interfaces
// This ensures type safety and developer-friendly imports 