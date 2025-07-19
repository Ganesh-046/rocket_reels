import { Platform, Dimensions } from 'react-native';

interface VideoQuality {
  label: string;
  resolution: string;
  bitrate: number; // kbps
  url: string;
  size: number; // MB
}

interface AdaptiveConfig {
  enableAutoQuality: boolean;
  qualitySwitchThreshold: number; // seconds
  lowBandwidthThreshold: number; // kbps
  highBandwidthThreshold: number; // kbps
  enableQualityCaching: boolean;
}

class AdaptiveQualitySelector {
  private config: AdaptiveConfig;
  private currentQuality: string = 'auto';
  private networkType: string = 'unknown';
  private bandwidth: number = 0;
  private qualityCache: Map<string, VideoQuality[]> = new Map();

  constructor(config: Partial<AdaptiveConfig> = {}) {
    this.config = {
      enableAutoQuality: true,
      qualitySwitchThreshold: 3,
      lowBandwidthThreshold: 500, // 500 kbps
      highBandwidthThreshold: 2000, // 2 Mbps
      enableQualityCaching: true,
      ...config,
    };

    this.initializeNetworkMonitoring();
  }

  private async initializeNetworkMonitoring() {
    // Simplified network monitoring without NetInfo dependency
    this.networkType = 'wifi'; // Default assumption
    this.bandwidth = this.estimateBandwidth();
    
    console.log(`🌐 Network initialized: ${this.networkType}, estimated bandwidth: ${this.bandwidth}kbps`);
  }

  private estimateBandwidth(): number {
    // Simplified bandwidth estimation based on platform
    if (Platform.OS === 'ios') {
      return 3000; // Assume good network on iOS
    } else {
      return 2000; // Assume moderate network on Android
    }
  }

  // Generate quality variants for a video
  generateQualityVariants(baseUrl: string, videoId: string): VideoQuality[] {
    const cacheKey = `${baseUrl}_${videoId}`;
    
    if (this.config.enableQualityCaching && this.qualityCache.has(cacheKey)) {
      return this.qualityCache.get(cacheKey)!;
    }

    const qualities: VideoQuality[] = [
      {
        label: '144p',
        resolution: '256x144',
        bitrate: 100,
        url: this.generateQualityUrl(baseUrl, '144p'),
        size: 5, // Estimated size in MB
      },
      {
        label: '240p',
        resolution: '426x240',
        bitrate: 250,
        url: this.generateQualityUrl(baseUrl, '240p'),
        size: 12,
      },
      {
        label: '360p',
        resolution: '640x360',
        bitrate: 500,
        url: this.generateQualityUrl(baseUrl, '360p'),
        size: 25,
      },
      {
        label: '480p',
        resolution: '854x480',
        bitrate: 1000,
        url: this.generateQualityUrl(baseUrl, '480p'),
        size: 50,
      },
      {
        label: '720p',
        resolution: '1280x720',
        bitrate: 2000,
        url: this.generateQualityUrl(baseUrl, '720p'),
        size: 100,
      },
      {
        label: '1080p',
        resolution: '1920x1080',
        bitrate: 4000,
        url: this.generateQualityUrl(baseUrl, '1080p'),
        size: 200,
      },
    ];

    if (this.config.enableQualityCaching) {
      this.qualityCache.set(cacheKey, qualities);
    }

    return qualities;
  }

  private generateQualityUrl(baseUrl: string, quality: string): string {
    // In production, you'd have a CDN that serves different qualities
    // For demo, we'll append quality parameter
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}quality=${quality}`;
  }

  // Select optimal quality based on current conditions
  selectOptimalQuality(qualities: VideoQuality[]): VideoQuality {
    if (!this.config.enableAutoQuality) {
      // Return highest quality if auto-quality is disabled
      return qualities[qualities.length - 1];
    }

    // Consider device performance
    const devicePerformance = this.getDevicePerformance();
    
    // Consider network conditions
    const networkQuality = this.getNetworkQuality();
    
    // Consider screen size
    const screenSize = this.getScreenSize();

    // Calculate optimal quality index
    let optimalIndex = this.calculateOptimalQualityIndex(
      qualities,
      this.bandwidth,
      devicePerformance,
      networkQuality,
      screenSize
    );

    // Ensure index is within bounds
    optimalIndex = Math.max(0, Math.min(optimalIndex, qualities.length - 1));

    const selectedQuality = qualities[optimalIndex];
    
    console.log(`🎯 Selected quality: ${selectedQuality.label} (${selectedQuality.bitrate}kbps) for ${this.bandwidth}kbps bandwidth`);
    
    return selectedQuality;
  }

  private getDevicePerformance(): 'low' | 'medium' | 'high' {
    // Simple device performance detection
    const { width, height } = Dimensions.get('window');
    const screenArea = width * height;
    
    if (Platform.OS === 'ios') {
      // iOS devices generally have good performance
      return screenArea > 2000000 ? 'high' : 'medium';
    } else {
      // Android performance varies more
      return screenArea > 2000000 ? 'high' : screenArea > 1000000 ? 'medium' : 'low';
    }
  }

  private getNetworkQuality(): 'poor' | 'fair' | 'good' | 'excellent' {
    if (this.bandwidth < this.config.lowBandwidthThreshold) {
      return 'poor';
    } else if (this.bandwidth < 1000) {
      return 'fair';
    } else if (this.bandwidth < this.config.highBandwidthThreshold) {
      return 'good';
    } else {
      return 'excellent';
    }
  }

  private getScreenSize(): 'small' | 'medium' | 'large' {
    const { width, height } = Dimensions.get('window');
    const screenArea = width * height;
    
    if (screenArea < 500000) return 'small';
    if (screenArea < 1500000) return 'medium';
    return 'large';
  }

  private calculateOptimalQualityIndex(
    qualities: VideoQuality[],
    bandwidth: number,
    devicePerformance: string,
    networkQuality: string,
    screenSize: string
  ): number {
    // Start with bandwidth-based selection
    let index = qualities.findIndex(q => q.bitrate <= bandwidth * 0.8);
    
    if (index === -1) {
      index = 0; // Fallback to lowest quality
    }

    // Adjust based on device performance
    if (devicePerformance === 'low') {
      index = Math.max(0, index - 2);
    } else if (devicePerformance === 'high') {
      index = Math.min(qualities.length - 1, index + 1);
    }

    // Adjust based on network quality
    if (networkQuality === 'poor') {
      index = Math.max(0, index - 1);
    } else if (networkQuality === 'excellent') {
      index = Math.min(qualities.length - 1, index + 1);
    }

    // Adjust based on screen size
    if (screenSize === 'small') {
      index = Math.max(0, index - 1);
    } else if (screenSize === 'large') {
      index = Math.min(qualities.length - 1, index + 1);
    }

    return index;
  }

  // Get current network information
  getNetworkInfo() {
    return {
      type: this.networkType,
      bandwidth: this.bandwidth,
      quality: this.getNetworkQuality(),
    };
  }

  // Force quality selection
  setQuality(quality: string) {
    this.currentQuality = quality;
    console.log(`🎯 Quality manually set to: ${quality}`);
  }

  // Get current quality setting
  getCurrentQuality(): string {
    return this.currentQuality;
  }

  // Clear quality cache
  clearQualityCache(): void {
    this.qualityCache.clear();
    console.log('🧹 Quality cache cleared');
  }

  // Get quality cache statistics
  getQualityCacheStats() {
    return {
      cachedVideos: this.qualityCache.size,
      networkType: this.networkType,
      bandwidth: this.bandwidth,
      currentQuality: this.currentQuality,
    };
  }
}

// Export singleton instance
export const adaptiveQualitySelector = new AdaptiveQualitySelector();

// Export types
export type { VideoQuality, AdaptiveConfig }; 