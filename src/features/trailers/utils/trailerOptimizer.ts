import { Trailer, TrailerOptimizationConfig } from '../types/trailer.types';

class TrailerOptimizer {
  private config: TrailerOptimizationConfig = {
    preloadEnabled: true,
    maxPreloadCount: 5,
    preloadDistance: 3,
    instantPlayEnabled: true,
    aggressivePreloading: true,
    cacheEnabled: true,
    maxCacheSize: 100 * 1024 * 1024, // 100MB
  };

  // Get optimized video URL based on network conditions
  getOptimizedVideoUrl(trailer: Trailer, quality: string = 'auto'): string {
    const videoUrls = trailer.video_urls;
    
    if (quality === 'auto') {
      // Auto-select quality based on network conditions
      return this.getAutoQualityUrl(videoUrls);
    }
    
    return videoUrls[quality] || videoUrls.master;
  }

  // Auto-select quality based on network conditions
  private getAutoQualityUrl(videoUrls: Trailer['video_urls']): string {
    // This would typically check network conditions
    // For now, default to 720p for good balance
    return videoUrls['720p'] || videoUrls.master;
  }

  // Preload trailers for better performance
  preloadTrailers(trailers: Trailer[], currentIndex: number): void {
    if (!this.config.preloadEnabled) return;

    const startIndex = Math.max(0, currentIndex - this.config.preloadDistance);
    const endIndex = Math.min(trailers.length - 1, currentIndex + this.config.preloadDistance);

    for (let i = startIndex; i <= endIndex; i++) {
      if (i !== currentIndex) {
        this.preloadTrailer(trailers[i]);
      }
    }
  }

  // Preload individual trailer
  private preloadTrailer(trailer: Trailer): void {
    const videoUrl = this.getOptimizedVideoUrl(trailer);
    
    // Create a hidden video element to preload
    if (typeof document !== 'undefined') {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.preload = 'metadata';
      video.style.display = 'none';
      document.body.appendChild(video);
      
      // Remove after preload
      setTimeout(() => {
        document.body.removeChild(video);
      }, 5000);
    }
  }

  // Get buffer configuration for video player
  getBufferConfig(): any {
    return {
      minBufferMs: 1000,
      maxBufferMs: 5000,
      bufferForPlaybackMs: 500,
      bufferForPlaybackAfterRebufferMs: 1000,
    };
  }

  // Optimize trailer for instant play
  optimizeForInstantPlay(trailer: Trailer): Trailer {
    if (!this.config.instantPlayEnabled) return trailer;

    // Add instant play optimizations
    return {
      ...trailer,
      // Add any instant play specific optimizations
    };
  }

  // Get trailer thumbnail with optimization
  getOptimizedThumbnail(trailer: Trailer, size: 'small' | 'medium' | 'large' = 'medium'): string {
    const baseUrl = trailer.thumbnail;
    
    // Add size parameters for CDN optimization
    const sizeMap = {
      small: 'w=300&h=200',
      medium: 'w=600&h=400',
      large: 'w=1200&h=800',
    };
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${sizeMap[size]}&q=80&f=auto`;
  }

  // Calculate trailer priority for preloading
  calculatePreloadPriority(trailer: Trailer, userPreferences: any): number {
    let priority = 0;
    
    // Higher priority for liked content
    if (trailer.isLiked) priority += 10;
    
    // Higher priority for saved content
    if (trailer.isSaved) priority += 8;
    
    // Higher priority for high-rated content
    if (trailer.rating && trailer.rating > 4.0) priority += 6;
    
    // Higher priority for popular content
    if (trailer.viewCount && trailer.viewCount > 10000) priority += 4;
    
    // Higher priority for user's preferred genre
    if (userPreferences?.preferredGenres?.includes(trailer.genre)) priority += 5;
    
    return priority;
  }

  // Get trailer analytics data
  getAnalyticsData(trailer: Trailer, action: 'view' | 'play' | 'like' | 'share'): any {
    return {
      trailerId: trailer._id,
      contentId: trailer.contentId,
      action,
      timestamp: new Date().toISOString(),
      quality: 'auto', // This would be the actual quality being used
      duration: trailer.duration,
      genre: trailer.genre,
      language: trailer.language,
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<TrailerOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): TrailerOptimizationConfig {
    return { ...this.config };
  }
}

export default new TrailerOptimizer(); 