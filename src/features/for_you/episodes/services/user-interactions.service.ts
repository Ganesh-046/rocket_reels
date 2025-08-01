import apiInterceptor from '../lib/api-interceptor';
import { ENDPOINTS, CACHE_TTL } from '../config/api';
import {
  ApiResponse,
  ContentItem,
  WatchHistory,
} from '../types/api';

// User Interactions Service
class UserInteractionsService {
  // Watchlist Management
  async getWatchlist(userId: string): Promise<ApiResponse<ContentItem[]>> {
    return apiInterceptor.get<ContentItem[]>(`${ENDPOINTS.USER_INTERACTIONS.GET_WATCHLIST}/${userId}`, {
      cacheKey: `watchlist_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async getWatchlistIds(userId: string): Promise<ApiResponse<string[]>> {
    return apiInterceptor.get<string[]>(`${ENDPOINTS.USER_INTERACTIONS.GET_WATCHLIST_IDS}/${userId}`, {
      cacheKey: `watchlist_ids_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async addToWatchlist(userId: string, contentId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.put(`${ENDPOINTS.USER_INTERACTIONS.ADD_TO_WATCHLIST}/${userId}`, { contentId });
  }

  async removeFromWatchlist(userId: string, contentId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.put(`${ENDPOINTS.USER_INTERACTIONS.REMOVE_FROM_WATCHLIST}/${userId}`, { contentId });
  }

  // Like/Dislike Management
  async likeDislikeContent(userId: string, episodeId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.put(`${ENDPOINTS.USER_INTERACTIONS.LIKE_DISLIKE}/${userId}`, { episodeId });
  }

  async getLikedContent(userId: string): Promise<ApiResponse<string[]>> {
    return apiInterceptor.get<string[]>(`${ENDPOINTS.USER_INTERACTIONS.GET_LIKED_CONTENT}/${userId}`, {
      cacheKey: `liked_content_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async likeTrailer(userId: string, contentId: string): Promise<ApiResponse<any>> {
    return apiInterceptor.put(`${ENDPOINTS.USER_INTERACTIONS.TRAILER_LIKE}/${userId}`, { contentId });
  }

  async getTrailerLikes(userId: string): Promise<ApiResponse<string[]>> {
    return apiInterceptor.get<string[]>(`${ENDPOINTS.USER_INTERACTIONS.GET_TRAILER_LIKES}/${userId}`, {
      cacheKey: `trailer_likes_${userId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Watch History Management
  async addWatchHistory(data: {
    contentId: string;
    episodeId?: string;
    duration: number;
    progress: number;
  }): Promise<ApiResponse<any>> {
    return apiInterceptor.put(ENDPOINTS.CONTENT.ADD_WATCH_HISTORY, data);
  }

  async getWatchHistory(contentId: string): Promise<ApiResponse<WatchHistory>> {
    return apiInterceptor.get<WatchHistory>(`${ENDPOINTS.CONTENT.WATCH_HISTORY}/${contentId}`, {
      cacheKey: `watch_history_${contentId}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async updateViewCount(contentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.put<{ message: string }>(`${ENDPOINTS.CONTENT.UPDATE_VIEW_COUNT}/${contentId}`);
  }
}

// Create singleton instance
const userInteractionsService = new UserInteractionsService();

export default userInteractionsService; 