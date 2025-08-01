// ============================================================================
// EPISODE SERVICE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import episodeApiInterceptor from '../lib/episodeApiInterceptor';
import { EPISODE_ENDPOINTS, EPISODE_CACHE_TTL } from '../config/episodeApi';
import { EpisodeApiResponse } from '../types/episodeApi';
import { 
  EpisodeListResponse, 
  EpisodeListParams, 
  EpisodeItem,
  EpisodeError
} from '../types';

// ============================================================================
// 🎬 EPISODE SERVICE CLASS
// ============================================================================

class EpisodeService {
  /**
   * Get episode list with pagination and filters
   */
  async getEpisodeList(params: EpisodeListParams): Promise<EpisodeApiResponse<EpisodeListResponse>> {
    // Build query string with correct parameters
    const queryParams = new URLSearchParams();
    
    // Always include contentId parameter
    queryParams.append('contentId', params.contentId);
    
    // Add page parameter if provided
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    // Add limit parameter if provided
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    
    const endpoint = `${EPISODE_ENDPOINTS.CONTENT.EPISODE_LIST}?${queryParams.toString()}`;
    const cacheKey = `episode_list_${params.contentId}_${JSON.stringify(params)}`;
    
    console.log('🎬 EpisodeService - Full URL:', `https://k9456pbd.rocketreel.co.in/api/v1${endpoint}`);
    
    const response = await episodeApiInterceptor.get<EpisodeListResponse>(endpoint, {
      cacheKey,
      cacheTTL: EPISODE_CACHE_TTL.VIDEO_CONTENT,
      isPublic: true, // Mark as public endpoint
    });
    
    console.log('🎬 EpisodeService - API Response:', JSON.stringify(response, null, 2));
    console.log('🎬 EpisodeService - Endpoint:', endpoint);
    console.log('🎬 EpisodeService - Cache Key:', cacheKey);
    
    return response;
  }

  /**
   * Get episode details by ID
   */
  async getEpisodeDetails(episodeId: string): Promise<EpisodeApiResponse<EpisodeItem>> {
    const endpoint = `${EPISODE_ENDPOINTS.CONTENT.EPISODE_DETAILS}/${episodeId}`;
    const cacheKey = `episode_details_${episodeId}`;
    
    return episodeApiInterceptor.get<EpisodeItem>(endpoint, {
      cacheKey,
      cacheTTL: EPISODE_CACHE_TTL.VIDEO_CONTENT,
    });
  }

  /**
   * Search episodes by query
   */
  async searchEpisodes(query: string, params: EpisodeListParams): Promise<EpisodeApiResponse<EpisodeListResponse>> {
    // For now, just return the basic episode list since search is not supported in the API
    return this.getEpisodeList(params);
  }

  /**
   * Get episodes by content
   */
  async getEpisodesByContent(contentId: string, params: { page?: number; limit?: number } = {}): Promise<EpisodeApiResponse<EpisodeListResponse>> {
    return this.getEpisodeList({ contentId, ...params });
  }

  /**
   * Track episode view
   */
  async trackEpisodeView(episodeId: string, data: {
    duration: number;
    quality: string;
    userId?: string;
  }): Promise<void> {
    const endpoint = `${EPISODE_ENDPOINTS.CONTENT.UPDATE_VIEW_COUNT}`;
    
    await episodeApiInterceptor.post(endpoint, {
      contentId: episodeId,
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track episode interaction
   */
  async trackEpisodeInteraction(episodeId: string, action: 'like' | 'share' | 'watch_now' | 'skip', userId?: string): Promise<void> {
    const endpoint = `${EPISODE_ENDPOINTS.USER_INTERACTIONS.EPISODE_LIKE}`;
    
    await episodeApiInterceptor.post(endpoint, {
      episodeId,
      action,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Like/dislike episode
   */
  async likeEpisode(userId: string, episodeId: string): Promise<EpisodeApiResponse<any>> {
    const endpoint = `${EPISODE_ENDPOINTS.USER_INTERACTIONS.EPISODE_LIKE}`;
    
    return episodeApiInterceptor.post(endpoint, {
      userId,
      episodeId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get liked episodes
   */
  async getLikedEpisodes(userId: string): Promise<EpisodeApiResponse<string[]>> {
    const endpoint = `${EPISODE_ENDPOINTS.USER_INTERACTIONS.GET_EPISODE_LIKES}`;
    
    return episodeApiInterceptor.get<string[]>(endpoint, {
      cacheKey: `liked_episodes_${userId}`,
      cacheTTL: EPISODE_CACHE_TTL.USER_DATA,
    });
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await episodeApiInterceptor.get<any>('/health', {
        cacheKey: 'episode_health_check',
        cacheTTL: 60000, // 1 minute
        isPublic: true,
      });
      return response.status === 200;
    } catch (error) {
      console.error('❌ EpisodeService - Connection test failed:', error);
      return false;
    }
  }

  /**
   * Clear episode cache
   */
  async clearCache(): Promise<void> {
    await episodeApiInterceptor.clearCache();
    console.log('🗑️ EpisodeService - Cache cleared');
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ size: number; keys: string[] }> {
    const size = await episodeApiInterceptor.getCacheSize();
    const keys = await episodeApiInterceptor.getCacheSize(); // This would need to be implemented
    return { size, keys: [] };
  }
}

// Create and export singleton instance
const episodeService = new EpisodeService();
export default episodeService; 