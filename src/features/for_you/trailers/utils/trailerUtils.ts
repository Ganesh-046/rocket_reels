// ============================================================================
// TRAILER UTILITIES - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import { Dimensions, Platform } from 'react-native';
import { 
  TrailerEpisode, 
  TrailerItem, 
  TrailerQuality, 
  TrailerDimensions,
  TrailerLayout,
  TrailerConfig 
} from '../types';

// ============================================================================
// 📱 RESPONSIVE UTILITIES
// ============================================================================

/**
 * Get device dimensions and responsive info
 */
export const getTrailerDimensions = (): TrailerDimensions => {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  const isTablet = width >= 768;
  
  return {
    width,
    height,
    aspectRatio: width / height,
    isLandscape,
    isTablet,
  };
};

/**
 * Get responsive layout configuration
 */
export const getTrailerLayout = (): TrailerLayout => {
  const dimensions = getTrailerDimensions();
  
  if (dimensions.isTablet) {
    return {
      columns: 3,
      itemHeight: dimensions.height * 0.4,
      spacing: 20,
      padding: 30,
    };
  }
  
  return {
    columns: 2,
    itemHeight: dimensions.height * 0.3,
    spacing: 15,
    padding: 20,
  };
};

// ============================================================================
// 🎬 VIDEO QUALITY UTILITIES
// ============================================================================

/**
 * Get available quality options for a trailer
 */
export const getTrailerQualityOptions = (trailer: TrailerEpisode): TrailerQuality[] => {
  const options: TrailerQuality[] = [];
  
  if (trailer.video_urls['1080p']) {
    options.push({
      label: '1080p HD',
      value: '1080p',
      url: trailer.video_urls['1080p'],
    });
  }
  
  if (trailer.video_urls['720p']) {
    options.push({
      label: '720p HD',
      value: '720p',
      url: trailer.video_urls['720p'],
    });
  }
  
  if (trailer.video_urls.master) {
    options.push({
      label: 'Master',
      value: 'master',
      url: trailer.video_urls.master,
    });
  }
  
  if (trailer.video_urls['480p']) {
    options.push({
      label: '480p',
      value: '480p',
      url: trailer.video_urls['480p'],
    });
  }
  
  if (trailer.video_urls['360p']) {
    options.push({
      label: '360p',
      value: '360p',
      url: trailer.video_urls['360p'],
    });
  }
  
  return options;
};

/**
 * Get best quality URL for trailer based on device capabilities
 */
export const getBestTrailerQuality = (trailer: TrailerEpisode): string => {
  const dimensions = getTrailerDimensions();
  const isHighEndDevice = dimensions.width >= 1080 || dimensions.isTablet;
  
  // For high-end devices, prioritize HD
  if (isHighEndDevice) {
    if (trailer.video_urls['1080p']) return trailer.video_urls['1080p'];
    if (trailer.video_urls['720p']) return trailer.video_urls['720p'];
  }
  
  // For all devices, fall back to available qualities
  if (trailer.video_urls['720p']) return trailer.video_urls['720p'];
  if (trailer.video_urls.master) return trailer.video_urls.master;
  if (trailer.video_urls['480p']) return trailer.video_urls['480p'];
  if (trailer.video_urls['360p']) return trailer.video_urls['360p'];
  
  return trailer.video_url;
};

/**
 * Check if trailer has HD quality
 */
export const hasHDQuality = (trailer: TrailerEpisode): boolean => {
  return !!(trailer.video_urls['1080p'] || trailer.video_urls['720p']);
};

// ============================================================================
// 🔧 DATA PROCESSING UTILITIES
// ============================================================================

/**
 * Process trailer data for display
 */
export const processTrailerData = (trailerData: any): TrailerEpisode[] => {
  if (!trailerData?.data?.trailers || !Array.isArray(trailerData.data.trailers)) {
    return [];
  }

  return trailerData.data.trailers
    .map((item: TrailerItem, index: number) => {
      // Extract video URL with quality prioritization
      let videoUrl = '';
      let videoUrls: any = {};
      
      if (item.trailerUrl?.media?.video_urls) {
        videoUrls = item.trailerUrl.media.video_urls;
      }
      
      // Prioritize HD qualities
      if (videoUrls['1080p']) {
        videoUrl = videoUrls['1080p'];
      } else if (videoUrls['720p']) {
        videoUrl = videoUrls['720p'];
      } else if (videoUrls.master) {
        videoUrl = videoUrls.master;
      } else if (videoUrls['480p']) {
        videoUrl = videoUrls['480p'];
      } else if (videoUrls['360p']) {
        videoUrl = videoUrls['360p'];
      } else if (item.trailerUrl?.video) {
        videoUrl = item.trailerUrl.video;
      }

      // Extract thumbnail
      let thumbnail = '';
      if (item.trailerUrl?.media?.thumbnail) {
        thumbnail = item.trailerUrl.media.thumbnail;
      } else if (item.backdropImage) {
        thumbnail = item.backdropImage;
      }

      // Only include items with valid video URLs
      if (!videoUrl) {
        return null;
      }

      return {
        _id: item._id || `trailer-${index}`,
        title: item.title || 'Untitled',
        description: item.description || '',
        video_urls: {
          master: videoUrl,
          '1080p': videoUrls['1080p'] || videoUrl,
          '720p': videoUrls['720p'] || videoUrl,
          '480p': videoUrls['480p'] || videoUrl,
          '360p': videoUrls['360p'] || videoUrl,
        },
        video_url: videoUrl,
        thumbnail: thumbnail,
        backdropImage: item.backdropImage,
        likes: item.favourites || 0,
        author: item.targetAudience?.name || 'Unknown',
        duration: 15,
        views: '1K',
        genres: item.genres || [],
        releasingDate: item.releasingDate,
        targetAudience: item.targetAudience,
        trailerUrl: item.trailerUrl,
        contentId: item.contentId,
      } as TrailerEpisode;
    })
    .filter(Boolean) as TrailerEpisode[];
};

/**
 * Filter trailers by genre
 */
export const filterTrailersByGenre = (trailers: TrailerEpisode[], genre: string): TrailerEpisode[] => {
  if (!genre) return trailers;
  
  return trailers.filter(trailer => 
    trailer.genres?.some(g => g.name.toLowerCase().includes(genre.toLowerCase()))
  );
};

/**
 * Search trailers by title or description
 */
export const searchTrailers = (trailers: TrailerEpisode[], query: string): TrailerEpisode[] => {
  if (!query) return trailers;
  
  const searchTerm = query.toLowerCase();
  
  return trailers.filter(trailer => 
    trailer.title.toLowerCase().includes(searchTerm) ||
    trailer.description.toLowerCase().includes(searchTerm) ||
    trailer.author.toLowerCase().includes(searchTerm)
  );
};

// ============================================================================
// 📊 ANALYTICS UTILITIES
// ============================================================================

/**
 * Track trailer view event
 */
export const trackTrailerView = (trailerId: string, duration: number, quality: string) => {
  const event = {
    trailerId,
    duration,
    quality,
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
    deviceInfo: getTrailerDimensions(),
  };
  
  console.log('🎬 Trailer view tracked:', event);
  // Here you would send to analytics service
  return event;
};

/**
 * Track trailer interaction
 */
export const trackTrailerInteraction = (trailerId: string, action: string) => {
  const event = {
    trailerId,
    action,
    timestamp: new Date().toISOString(),
    platform: Platform.OS,
  };
  
  console.log('🎬 Trailer interaction tracked:', event);
  // Here you would send to analytics service
  return event;
};

// ============================================================================
// 🎯 CONFIGURATION UTILITIES
// ============================================================================

/**
 * Get default trailer configuration
 */
export const getDefaultTrailerConfig = (): TrailerConfig => {
  const dimensions = getTrailerDimensions();
  
  return {
    autoPlay: true,
    loopVideos: false,
    preloadCount: dimensions.isTablet ? 3 : 2,
    qualityPreference: dimensions.isTablet ? 'hd' : 'auto',
    enableAnalytics: true,
    cacheEnabled: true,
    cacheSize: 100 * 1024 * 1024, // 100MB
  };
};

/**
 * Validate trailer configuration
 */
export const validateTrailerConfig = (config: Partial<TrailerConfig>): TrailerConfig => {
  const defaultConfig = getDefaultTrailerConfig();
  
  return {
    ...defaultConfig,
    ...config,
    preloadCount: Math.max(1, Math.min(5, config.preloadCount || defaultConfig.preloadCount)),
    cacheSize: Math.max(50 * 1024 * 1024, Math.min(500 * 1024 * 1024, config.cacheSize || defaultConfig.cacheSize)),
  };
};

// ============================================================================
// 🔧 PERFORMANCE UTILITIES
// ============================================================================

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoize expensive calculations
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T
): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// All functions are automatically exported as they are defined 