import { Trailer, TrailerServiceResponse, TrailerFilters } from '../types/trailer.types';

class TrailerService {
  private baseURL: string = 'https://api.example.com';

  // Get all trailers with pagination and filters
  async getTrailers(page: number = 1, limit: number = 20, filters?: TrailerFilters): Promise<TrailerServiceResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.genre && { genre: filters.genre }),
        ...(filters?.language && { language: filters.language }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
      });

      const response = await fetch(`${this.baseURL}/trailers?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.trailers,
        message: 'Trailers fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching trailers:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trailers',
      };
    }
  }

  // Get trailer by ID
  async getTrailerById(id: string): Promise<TrailerServiceResponse> {
    try {
      const response = await fetch(`${this.baseURL}/trailers/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.trailer,
        message: 'Trailer fetched successfully',
      };
    } catch (error) {
      console.error('Error fetching trailer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trailer',
      };
    }
  }

  // Like/unlike trailer
  async toggleLike(trailerId: string): Promise<TrailerServiceResponse> {
    try {
      const response = await fetch(`${this.baseURL}/trailers/${trailerId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.trailer,
        message: 'Trailer like toggled successfully',
      };
    } catch (error) {
      console.error('Error toggling trailer like:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle trailer like',
      };
    }
  }

  // Record trailer view
  async recordView(trailerId: string): Promise<TrailerServiceResponse> {
    try {
      const response = await fetch(`${this.baseURL}/trailers/${trailerId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Trailer view recorded successfully',
      };
    } catch (error) {
      console.error('Error recording trailer view:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record trailer view',
      };
    }
  }

  // Get auth token from storage
  private getAuthToken(): string {
    return '';
  }

  // Mock data for development/testing
  getMockTrailers(): Trailer[] {
    return [
      {
        _id: '1',
        title: 'Amazing Movie Trailer',
        description: 'An incredible journey through time and space',
        thumbnail: 'https://example.com/thumbnail1.jpg',
        duration: 120,
        video_urls: {
          '1080p': 'https://example.com/trailer1_1080p.mp4',
          '720p': 'https://example.com/trailer1_720p.mp4',
          '480p': 'https://example.com/trailer1_480p.mp4',
          '360p': 'https://example.com/trailer1_360p.mp4',
          master: 'https://example.com/trailer1_master.mp4',
        },
        contentId: 'content1',
        language: 'English',
        genre: 'Action',
        releaseDate: '2024-01-15',
        rating: 4.5,
        viewCount: 15000,
        likeCount: 1200,
        isLiked: false,
        isSaved: false,
        status: 'unlocked',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];
  }
}

export default new TrailerService(); 