import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

interface ProgressiveImageConfig {
  lowResQuality: number;
  highResQuality: number;
  fadeDuration: number;
  enableBlur: boolean;
  cachePolicy: 'memory' | 'disk' | 'both';
}

interface ImageSource {
  lowRes: string;
  highRes: string;
  thumbnail?: string;
}

class ProgressiveImageLoader {
  private config: ProgressiveImageConfig;
  private imageCache: Map<string, boolean> = new Map();
  private loadingQueue: Set<string> = new Set();

  constructor(config: Partial<ProgressiveImageConfig> = {}) {
    this.config = {
      lowResQuality: 0.3,
      highResQuality: 1.0,
      fadeDuration: 300,
      enableBlur: true,
      cachePolicy: 'both',
      ...config,
    };
  }

  // Generate progressive image URLs
  generateProgressiveUrls(originalUrl: string): ImageSource {
    // For demo purposes, we'll use different image sizes
    // In production, you'd have a CDN that serves different resolutions
    
    const urlParts = originalUrl.split('?');
    const baseUrl = urlParts[0];
    const params = urlParts[1] || '';
    
    // Generate low-res version (smaller size)
    const lowResUrl = `${baseUrl}?w=200&h=300&q=${this.config.lowResQuality * 100}&${params}`;
    
    // Generate high-res version (original or larger)
    const highResUrl = `${baseUrl}?w=400&h=600&q=${this.config.highResQuality * 100}&${params}`;
    
    // Generate thumbnail version (very small)
    const thumbnailUrl = `${baseUrl}?w=100&h=150&q=50&${params}`;

    return {
      lowRes: lowResUrl,
      highRes: highResUrl,
      thumbnail: thumbnailUrl,
    };
  }

  // Preload images progressively
  async preloadImages(imageSources: ImageSource[]): Promise<void> {
    const preloadPromises = imageSources.map(source => this.preloadImage(source));
    
    try {
      await Promise.allSettled(preloadPromises);
      console.log(`🚀 Preloaded ${imageSources.length} progressive images`);
    } catch (error) {
      console.error('Progressive image preload error:', error);
    }
  }

  // Preload single image progressively
  async preloadImage(imageSource: ImageSource): Promise<void> {
    const cacheKey = imageSource.highRes;
    
    if (this.imageCache.has(cacheKey) || this.loadingQueue.has(cacheKey)) {
      return;
    }

    this.loadingQueue.add(cacheKey);

    try {
      // First, preload low-res version
      await this.preloadImageUrl(imageSource.lowRes);
      
      // Then preload high-res version
      await this.preloadImageUrl(imageSource.highRes);
      
      this.imageCache.set(cacheKey, true);
      console.log(`✅ Progressive image loaded: ${cacheKey}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload progressive image: ${cacheKey}`, error);
    } finally {
      this.loadingQueue.delete(cacheKey);
    }
  }

  // Preload single image URL
  private async preloadImageUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use FastImage for better caching
      FastImage.preload([{ uri: url }]);
      
      // Also preload with regular Image for fallback
      Image.prefetch(url)
        .then(() => resolve())
        .catch(reject);
    });
  }

  // Check if image is cached
  isImageCached(imageUrl: string): boolean {
    return this.imageCache.has(imageUrl);
  }

  // Get image loading status
  getImageStatus(imageUrl: string): 'cached' | 'loading' | 'not-loaded' {
    if (this.imageCache.has(imageUrl)) {
      return 'cached';
    } else if (this.loadingQueue.has(imageUrl)) {
      return 'loading';
    } else {
      return 'not-loaded';
    }
  }

  // Clear image cache
  clearCache(): void {
    this.imageCache.clear();
    this.loadingQueue.clear();
    console.log('🧹 Progressive image cache cleared');
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cachedImages: this.imageCache.size,
      loadingImages: this.loadingQueue.size,
      totalImages: this.imageCache.size + this.loadingQueue.size,
    };
  }
}

// Export singleton instance
export const progressiveImageLoader = new ProgressiveImageLoader();

// Export types
export type { ProgressiveImageConfig, ImageSource }; 