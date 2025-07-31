// ============================================================================
// TRAILER SERVICE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

// Use independent trailer API interceptor
import trailerApiInterceptor from '../lib/trailerApiInterceptor';
import { TRAILER_ENDPOINTS, TRAILER_CACHE_TTL } from '../config/trailerApi';
import { TrailerApiResponse } from '../types/trailerApi';
import { 
  TrailerListResponse, 
  TrailerListParams, 
  TrailerItem,
  TrailerEpisode,
  TrailerError 
} from '../types';

// ============================================================================
// 🎬 TRAILER SERVICE CLASS
// ============================================================================

class TrailerService {
  // ============================================================================
  // 📺 TRAILER LIST METHODS
  // ============================================================================

  /**
   * Get trailer list with pagination and filters
   */
  async getTrailerList(params: { adult?: boolean; page?: number } = {}): Promise<TrailerApiResponse<TrailerListResponse>> {
    // Build query string with correct parameters
    const queryParams = new URLSearchParams();
    
    // Always include adult parameter (default to true if not provided)
    queryParams.append('adult', (params.adult ?? true).toString());
    
    // Add page parameter if provided
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    const endpoint = `${TRAILER_ENDPOINTS.CONTENT.TRAILER_LIST}?${queryParams.toString()}`;
    const cacheKey = `trailer_list_${JSON.stringify(params)}`;
    
    console.log('🎬 TrailerService - Full URL:', `https://k9456pbd.rocketreel.co.in/api/v1${endpoint}`);
    
    const response = await trailerApiInterceptor.get<TrailerListResponse>(endpoint, {
      cacheKey,
      cacheTTL: TRAILER_CACHE_TTL.VIDEO_CONTENT,
      isPublic: true, // Mark as public endpoint
    });
    
    console.log('🎬 TrailerService - API Response:', JSON.stringify(response, null, 2));
    console.log('🎬 TrailerService - Endpoint:', endpoint);
    console.log('🎬 TrailerService - Cache Key:', cacheKey);
    
    return response;
  }

  /**
   * Get trailer details by ID
   */
  async getTrailerDetails(trailerId: string): Promise<TrailerApiResponse<TrailerItem>> {
    const endpoint = `${TRAILER_ENDPOINTS.CONTENT.DETAILS}/${trailerId}`;
    const cacheKey = `trailer_details_${trailerId}`;
    
    return trailerApiInterceptor.get<TrailerItem>(endpoint, {
      cacheKey,
      cacheTTL: TRAILER_CACHE_TTL.VIDEO_CONTENT,
    });
  }

  /**
   * Search trailers by query
   */
  async searchTrailers(query: string, params: { adult?: boolean; page?: number } = {}): Promise<TrailerApiResponse<TrailerListResponse>> {
    // For now, just return the basic trailer list since search is not supported in the API
    return this.getTrailerList(params);
  }

  /**
   * Get trailers by genre
   */
  async getTrailersByGenre(genre: string, params: { adult?: boolean; page?: number } = {}): Promise<TrailerApiResponse<TrailerListResponse>> {
    // For now, just return the basic trailer list since genre filtering is not supported in the API
    return this.getTrailerList(params);
  }

  // ============================================================================
  // 📊 TRAILER ANALYTICS METHODS
  // ============================================================================

  /**
   * Track trailer view
   */
  async trackTrailerView(trailerId: string, data: {
    duration: number;
    quality: string;
    userId?: string;
  }): Promise<void> {
    const endpoint = `${TRAILER_ENDPOINTS.CONTENT.UPDATE_VIEW_COUNT}`;
    
    await trailerApiInterceptor.post(endpoint, {
      contentId: trailerId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track trailer interaction
   */
  async trackTrailerInteraction(trailerId: string, action: 'like' | 'share' | 'watch_now' | 'skip', userId?: string): Promise<void> {
    const endpoint = `${TRAILER_ENDPOINTS.USER_INTERACTIONS.TRAILER_LIKE}`;
    
    await trailerApiInterceptor.post(endpoint, {
      trailerId,
      action,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  // ============================================================================
  // 🔧 UTILITY METHODS
  // ============================================================================

  /**
   * Clear all cached data
   */
  clearCache(): void {
    // This would need to be implemented in the apiInterceptor
    console.log('Cache clear requested for trailer service');
  }

  /**
   * Clear specific cache entry
   */
  clearCacheByKey(key: string): void {
    // This would need to be implemented in the apiInterceptor
    console.log(`Cache clear requested for key: ${key}`);
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getTrailerList({ page: 1 });
      return true;
    } catch (error) {
      console.error('Trailer service connection test failed:', error);
      return false;
    }
  }
}

// ============================================================================
// 🎯 TRAILER SERVICE INSTANCE
// ============================================================================

// Create default instance
const trailerService = new TrailerService();

// Export the service instance and class
export { TrailerService, trailerService as default }; 