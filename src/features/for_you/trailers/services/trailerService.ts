// ============================================================================
// 🎬 TRAILER SERVICE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================
// 
// This file contains all API service methods for the trailer feature.
// All services are designed to be self-contained and portable.
// 
// Usage:
// import { trailerService } from './services/trailerService';
// const trailers = await trailerService.getTrailerList();
// ============================================================================

import { 
  TrailerListResponse, 
  TrailerItem,
  TrailerListParams,
} from '../types';

// Define the API response interface locally
interface TrailerApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================================
// 🎯 CORE TRAILER SERVICE CLASS
// ============================================================================

/**
 * Main trailer service class
 * Provides all API methods for trailer-related operations
 */
class TrailerService {
  /**
   * Get list of trailers
   * @param params - Query parameters
   * @returns Promise with trailer list response
   */
  async getTrailerList(params: TrailerListParams = {}): Promise<TrailerApiResponse<TrailerListResponse>> {
    try {
      console.log('🎬 TrailerService: Fetching trailer list with params:', params);
      
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.adult !== undefined) queryParams.append('adult', params.adult.toString());
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      const endpoint = `/content/trailerList?${queryParams.toString()}`;
      const baseURL = 'https://k9456pbd.rocketreel.co.in/api/v1';
      const fullURL = `${baseURL}${endpoint}`;
      
      console.log('🎬 TrailerService: Making request to:', fullURL);
      
      const response = await fetch(fullURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🎬 TrailerService: Trailer list response:', {
        success: true,
        count: data?.data?.trailers?.length || 0,
      });

      return {
        success: true,
        message: 'Trailers fetched successfully',
        data: data,
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error fetching trailer list:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch trailers',
        data: { data: { trailers: [] } },
      };
    }
  }

  /**
   * Get trailer details by ID
   * @param trailerId - Trailer ID
   * @returns Promise with trailer details
   */
  async getTrailerDetails(trailerId: string): Promise<TrailerApiResponse<TrailerItem>> {
    try {
      console.log('🎬 TrailerService: Fetching trailer details for ID:', trailerId);
      
      const baseURL = 'https://k9456pbd.rocketreel.co.in/api/v1';
      const fullURL = `${baseURL}/content/details/${trailerId}`;
      
      const response = await fetch(fullURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🎬 TrailerService: Trailer details response:', {
        success: true,
        trailerId,
      });

      return {
        success: true,
        message: 'Trailer details fetched successfully',
        data: data,
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error fetching trailer details:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch trailer details',
        data: {} as TrailerItem,
      };
    }
  }

  /**
   * Search trailers
   * @param query - Search query
   * @param params - Additional parameters
   * @returns Promise with search results
   */
  async searchTrailers(query: string, params: TrailerListParams = {}): Promise<TrailerApiResponse<{
    trailers: TrailerItem[];
    total: number;
    query: string;
  }>> {
    try {
      console.log('🎬 TrailerService: Searching trailers with query:', query);
      
      // For now, just return the basic trailer list since search is not supported
      const result = await this.getTrailerList(params);
      
      return {
        success: result.success,
        message: result.message,
        data: {
          trailers: result.data?.data?.trailers || [],
          total: result.data?.data?.trailers?.length || 0,
          query,
        },
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error searching trailers:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search trailers',
        data: {
          trailers: [],
          total: 0,
          query,
        },
      };
    }
  }

  /**
   * Get trailers by genre
   * @param genre - Genre name
   * @param params - Additional parameters
   * @returns Promise with genre-specific trailers
   */
  async getTrailersByGenre(genre: string, params: TrailerListParams = {}): Promise<TrailerApiResponse<TrailerListResponse>> {
    try {
      console.log('🎬 TrailerService: Fetching trailers by genre:', genre);
      
      // For now, just return the basic trailer list since genre filtering is not supported
      return await this.getTrailerList(params);
    } catch (error) {
      console.error('🎬 TrailerService: Error fetching trailers by genre:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch trailers by genre',
        data: { data: { trailers: [] } },
      };
    }
  }

  /**
   * Get trending trailers
   * @param params - Query parameters
   * @returns Promise with trending trailers
   */
  async getTrendingTrailers(params: TrailerListParams = {}): Promise<TrailerApiResponse<TrailerListResponse>> {
    try {
      console.log('🎬 TrailerService: Fetching trending trailers');
      
      // For now, just return the basic trailer list
      return await this.getTrailerList(params);
    } catch (error) {
      console.error('🎬 TrailerService: Error fetching trending trailers:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch trending trailers',
        data: { data: { trailers: [] } },
      };
    }
  }

  /**
   * Get latest trailers
   * @param params - Query parameters
   * @returns Promise with latest trailers
   */
  async getLatestTrailers(params: TrailerListParams = {}): Promise<TrailerApiResponse<TrailerListResponse>> {
    try {
      console.log('🎬 TrailerService: Fetching latest trailers');
      
      // For now, just return the basic trailer list
      return await this.getTrailerList(params);
    } catch (error) {
      console.error('🎬 TrailerService: Error fetching latest trailers:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch latest trailers',
        data: { data: { trailers: [] } },
      };
    }
  }

  /**
   * Get trailer recommendations
   * @param trailerId - Base trailer ID for recommendations
   * @param params - Additional parameters
   * @returns Promise with recommended trailers
   */
  async getTrailerRecommendations(
    trailerId: string, 
    params: TrailerListParams = {}
  ): Promise<TrailerApiResponse<TrailerListResponse>> {
    try {
      console.log('🎬 TrailerService: Fetching recommendations for trailer:', trailerId);
      
      // For now, just return the basic trailer list
      return await this.getTrailerList(params);
    } catch (error) {
      console.error('🎬 TrailerService: Error fetching recommendations:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        data: { data: { trailers: [] } },
      };
    }
  }

  // ============================================================================
  // 🎯 ANALYTICS AND TRACKING METHODS
  // ============================================================================

  /**
   * Track trailer view
   * @param analytics - View analytics data
   * @returns Promise with tracking response
   */
  async trackTrailerView(analytics: any): Promise<TrailerApiResponse<any>> {
    try {
      console.log('🎬 TrailerService: Tracking trailer view:', {
        trailerId: analytics.trailerId,
        duration: analytics.duration,
        quality: analytics.quality,
      });
      
      const baseURL = 'https://k9456pbd.rocketreel.co.in/api/v1';
      const fullURL = `${baseURL}/content/updateViewCount`;
      
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(analytics),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🎬 TrailerService: View tracking response:', {
        success: true,
        trailerId: analytics.trailerId,
      });

      return {
        success: true,
        message: 'View tracked successfully',
        data: data,
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error tracking trailer view:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to track view',
        data: {},
      };
    }
  }

  /**
   * Track trailer interaction
   * @param analytics - Interaction analytics data
   * @returns Promise with tracking response
   */
  async trackTrailerInteraction(analytics: any): Promise<TrailerApiResponse<any>> {
    try {
      console.log('🎬 TrailerService: Tracking trailer interaction:', {
        trailerId: analytics.trailerId,
        action: analytics.action,
      });
      
      const baseURL = 'https://k9456pbd.rocketreel.co.in/api/v1';
      const fullURL = `${baseURL}/user/profile/like/trailer`;
      
      const response = await fetch(fullURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(analytics),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('🎬 TrailerService: Interaction tracking response:', {
        success: true,
        trailerId: analytics.trailerId,
        action: analytics.action,
      });

      return {
        success: true,
        message: 'Interaction tracked successfully',
        data: data,
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error tracking trailer interaction:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to track interaction',
        data: {},
      };
    }
  }

  // ============================================================================
  // 🎯 UTILITY AND MAINTENANCE METHODS
  // ============================================================================

  /**
   * Test API connection
   * @returns Promise with connection status
   */
  async testConnection(): Promise<TrailerApiResponse<{ status: string; timestamp: number }>> {
    try {
      console.log('🎬 TrailerService: Testing API connection');
      
      const result = await this.getTrailerList({ page: 1 });
      
      return {
        success: result.success,
        message: result.success ? 'Connection successful' : 'Connection failed',
        data: {
          status: result.success ? 'connected' : 'disconnected',
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('🎬 TrailerService: Connection test failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
        data: {
          status: 'disconnected',
          timestamp: Date.now(),
        },
      };
    }
  }

  /**
   * Clear all cached data
   * @returns Promise with cache clear status
   */
  async clearCache(): Promise<TrailerApiResponse<{ cleared: boolean; entriesRemoved: number }>> {
    try {
      console.log('🎬 TrailerService: Clearing cache');
      
      // For now, just return success since we're not using complex caching
      return {
        success: true,
        message: 'Cache cleared successfully',
        data: {
          cleared: true,
          entriesRemoved: 0,
        },
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error clearing cache:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to clear cache',
        data: {
          cleared: false,
          entriesRemoved: 0,
        },
      };
    }
  }

  /**
   * Get cache statistics
   * @returns Promise with cache stats
   */
  async getCacheStats(): Promise<TrailerApiResponse<{
    totalEntries: number;
    memoryUsage: number;
    hitRate: number;
    missRate: number;
  }>> {
    try {
      console.log('🎬 TrailerService: Getting cache statistics');
      
      // For now, return empty stats since we're not using complex caching
      return {
        success: true,
        message: 'Cache stats retrieved successfully',
        data: {
          totalEntries: 0,
          memoryUsage: 0,
          hitRate: 0,
          missRate: 0,
        },
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error getting cache stats:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get cache stats',
        data: {
          totalEntries: 0,
          memoryUsage: 0,
          hitRate: 0,
          missRate: 0,
        },
      };
    }
  }

  /**
   * Get service health status
   * @returns Promise with health status
   */
  async getHealthStatus(): Promise<TrailerApiResponse<{
    status: 'healthy' | 'degraded' | 'down';
    services: Record<string, boolean>;
    timestamp: number;
  }>> {
    try {
      console.log('🎬 TrailerService: Getting health status');
      
      const connectionTest = await this.testConnection();
      
      return {
        success: connectionTest.success,
        message: connectionTest.message,
        data: {
          status: connectionTest.success ? 'healthy' : 'down',
          services: {
            api: connectionTest.success,
            cache: true,
          },
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error('🎬 TrailerService: Error getting health status:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get health status',
        data: {
          status: 'down',
          services: {
            api: false,
            cache: false,
          },
          timestamp: Date.now(),
        },
      };
    }
  }
}

// ============================================================================
// 🎬 TRAILER SERVICE EXPORTS
// ============================================================================

// Create and export singleton instance
const trailerService = new TrailerService();

export default trailerService;
export { TrailerService }; 