import apiInterceptor from '../lib/api-interceptor';
import { ENDPOINTS, CACHE_TTL } from '../config/api';
import {
  ApiResponse,
  ContentItem,
  ContentDetailResponse,
  ContentListResponse,
  Episode,
  Genre,
  Language,
  ContentListRequest,
  TrailerListResponse,
  LatestContentResponse,
  TopContentResponse,
  UpcomingContentResponse,
  CustomizedContentResponse,
  BannerItem,
} from '../types/api';

// Additional type definitions for missing types
interface ContentDetail extends ContentDetailResponse {}
interface Season {
  _id: string;
  seasonNumber: number;
  episodes: Episode[];
}
interface VideoAccess {
  episodeId: string;
  accessGranted: boolean;
  unlockMethod?: string;
}
interface WatchHistory {
  contentId: string;
  episodeId?: string;
  duration: number;
  lastWatchedAt: string;
}
interface PaginationParams {
  page?: number;
  limit?: number;
}
interface PaginatedResponse<T> {
  data: T[];
  hasNext: boolean;
  page: number;
}
interface Banner {
  _id: string;
  image: string;
  title: string;
  description: string;
}
interface SubGenre {
  _id: string;
  name: string;
  genreId: string;
}

// Content Service
class ContentService {
  // Get Content List
  async getContentList(params: ContentListRequest = {}): Promise<ApiResponse<ContentListResponse>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = queryString ? `${ENDPOINTS.CONTENT.LIST}?${queryString}` : ENDPOINTS.CONTENT.LIST;
    
    return apiInterceptor.get<ContentListResponse>(endpoint, {
      cacheKey: `content_list_${JSON.stringify(params)}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Trailer List - Fixed to match original API format
  async getTrailerList(params: { adult?: boolean; page?: number } = {}): Promise<ApiResponse<TrailerListResponse>> {
    // Build query string with correct parameters
    const queryParams = new URLSearchParams();
    
    // Always include adult parameter (default to true if not provided)
    queryParams.append('adult', (params.adult ?? true).toString());
    
    // Add page parameter if provided
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    
    const endpoint = `${ENDPOINTS.CONTENT.TRAILER_LIST}?${queryParams.toString()}`;
    
    return apiInterceptor.get<TrailerListResponse>(endpoint, {
      cacheKey: `trailer_list_${JSON.stringify(params)}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Content Details
  async getContentDetails(id: string, userId?: string, token?: string): Promise<ApiResponse<ContentDetail>> {
    const params = userId && token ? `?userid=${userId}&token=${token}` : '';
    const endpoint = `${ENDPOINTS.CONTENT.DETAILS}/${id}${params}`;
    
    return apiInterceptor.get<ContentDetail>(endpoint, {
      cacheKey: `content_details_${id}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Season Content
  async getSeasonContent(id: string): Promise<ApiResponse<Season[]>> {
    return apiInterceptor.get<Season[]>(`${ENDPOINTS.CONTENT.SEASON_LIST}/${id}`, {
      cacheKey: `season_content_${id}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Video Access
  async getVideoAccess(episodeId: string): Promise<ApiResponse<VideoAccess>> {
    return apiInterceptor.get<VideoAccess>(`${ENDPOINTS.CONTENT.VIDEO_ACCESS}/${episodeId}`);
  }

  // Get Watch History
  async getWatchHistory(contentId: string): Promise<ApiResponse<WatchHistory>> {
    return apiInterceptor.get<WatchHistory>(`${ENDPOINTS.CONTENT.WATCH_HISTORY}/${contentId}`);
  }

  // Update View Count
  async updateViewCount(contentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.put<{ message: string }>(`${ENDPOINTS.CONTENT.UPDATE_VIEW_COUNT}/${contentId}`);
  }

  // Add Watch History
  async addWatchHistory(data: {
    contentId: string;
    episodeId?: string;
    duration: number;
    progress: number;
  }): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.put<{ message: string }>(ENDPOINTS.CONTENT.ADD_WATCH_HISTORY, data);
  }

  // Get Latest Content
  async getLatestContent(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = queryString ? `${ENDPOINTS.CONTENT.NEW_RELEASES}?${queryString}` : ENDPOINTS.CONTENT.NEW_RELEASES;
    
    return apiInterceptor.get<PaginatedResponse<ContentItem>>(endpoint, {
      cacheKey: `latest_content_${JSON.stringify(params)}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Top Content
  async getTopContent(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = queryString ? `${ENDPOINTS.CONTENT.TOP_TEN}?${queryString}` : ENDPOINTS.CONTENT.TOP_TEN;
    
    return apiInterceptor.get<PaginatedResponse<ContentItem>>(endpoint, {
      cacheKey: `top_content_${JSON.stringify(params)}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Upcoming Content
  async getUpcomingContent(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = queryString ? `${ENDPOINTS.CONTENT.UPCOMING}?${queryString}` : ENDPOINTS.CONTENT.UPCOMING;
    
    return apiInterceptor.get<PaginatedResponse<ContentItem>>(endpoint, {
      cacheKey: `upcoming_content_${JSON.stringify(params)}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Customized List
  async getCustomizedList(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = queryString ? `${ENDPOINTS.CONTENT.CUSTOMIZED_LIST}?${queryString}` : ENDPOINTS.CONTENT.CUSTOMIZED_LIST;
    
    return apiInterceptor.get<PaginatedResponse<ContentItem>>(endpoint, {
      cacheKey: `customized_list_${JSON.stringify(params)}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Special Interest Content
  async getSpecialInterestContent(): Promise<ApiResponse<ContentItem[]>> {
    return apiInterceptor.get<ContentItem[]>(ENDPOINTS.CONTENT.SPECIAL_INTEREST, {
      cacheKey: 'special_interest_content',
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Target Audience Content
  async getTargetAudienceContent(params: PaginationParams = {}): Promise<ApiResponse<PaginatedResponse<ContentItem>>> {
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    const endpoint = queryString ? `${ENDPOINTS.CONTENT.TARGET_AUDIENCE}?${queryString}` : ENDPOINTS.CONTENT.TARGET_AUDIENCE;
    
    return apiInterceptor.get<PaginatedResponse<ContentItem>>(endpoint, {
      cacheKey: `target_audience_content_${JSON.stringify(params)}`,
      cacheTTL: CACHE_TTL.VIDEO_CONTENT,
    });
  }

  // Get Banner Data
  async getBannerData(): Promise<ApiResponse<Banner[]>> {
    return apiInterceptor.get<Banner[]>(ENDPOINTS.CONTENT.PROMOTIONAL, {
      cacheKey: 'banner_data',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Get Genres
  async getGenres(): Promise<ApiResponse<Genre[]>> {
    return apiInterceptor.get<Genre[]>(ENDPOINTS.CONTENT.GENRE_LIST, {
      cacheKey: 'genres',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Get Sub Genres
  async getSubGenres(): Promise<ApiResponse<SubGenre[]>> {
    return apiInterceptor.get<SubGenre[]>(ENDPOINTS.CONTENT.SUBGENRE_LIST, {
      cacheKey: 'sub_genres',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Get Languages
  async getLanguages(): Promise<ApiResponse<Language[]>> {
    return apiInterceptor.get<Language[]>(ENDPOINTS.CONTENT.LANGUAGE_LIST, {
      cacheKey: 'languages',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Get Content Details with Episodes (for EpisodePlayerScreen)
  async getContentDetailsWithEpisodes(contentId: string, userId?: string, token?: string): Promise<ApiResponse<ContentDetailResponse>> {
    const params = userId && token ? `?userid=${userId}&token=${token}` : '';
    const endpoint = `${ENDPOINTS.CONTENT.DETAILS}/${contentId}${params}`;
    
    console.log('🌐 ContentService - getContentDetailsWithEpisodes:', {
      contentId,
      userId: userId ? 'Present' : 'Not provided',
      token: token ? 'Present' : 'Not provided',
      endpoint
    });
    
    try {
      const result = await apiInterceptor.get<ContentDetailResponse>(endpoint, {
        cacheKey: `content_details_episodes_${contentId}`,
        cacheTTL: CACHE_TTL.VIDEO_CONTENT,
      });
      
      console.log('✅ ContentService - getContentDetailsWithEpisodes success:', {
        contentId,
        hasData: !!result.data,
        episodesCount: result.data?.episodes ? Object.keys(result.data.episodes).length : 0
      });
      
      return result;
    } catch (error) {
      console.error('❌ ContentService - getContentDetailsWithEpisodes error:', {
        contentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Get Unlocked Episodes
  async getUnlockedEpisodes(contentId: string): Promise<ApiResponse<{ episodeId: string; unlockType: string; unlockedAt: string }[]>> {
    return apiInterceptor.get<{ episodeId: string; unlockType: string; unlockedAt: string }[]>(
      `${ENDPOINTS.REWARDS.GET_UNLOCKED_EPISODE}/${contentId}`,
      {
        cacheKey: `unlocked_episodes_${contentId}`,
        cacheTTL: CACHE_TTL.VIDEO_CONTENT,
      }
    );
  }

  // Unlock Episode with Coins
  async unlockEpisodeWithCoins(data: {
    episodeId: string;
    userId: string;
    coins: number;
  }): Promise<ApiResponse<{ episodeId: string; unlockType: string; unlockedAt: string; remainingCoins: number }>> {
    return apiInterceptor.post<{ episodeId: string; unlockType: string; unlockedAt: string; remainingCoins: number }>(
      ENDPOINTS.REWARDS.UNLOCK_COINS,
      data
    );
  }

  // Unlock Episode with Ads
  async unlockEpisodeWithAds(data: {
    episodeId: string;
    userId: string;
    adType: string;
  }): Promise<ApiResponse<{ episodeId: string; unlockType: string; unlockedAt: string }>> {
    return apiInterceptor.post<{ episodeId: string; unlockType: string; unlockedAt: string }>(
      ENDPOINTS.REWARDS.UNLOCK_ADS,
      data
    );
  }
}

// Create singleton instance
const contentService = new ContentService();

export default contentService; 