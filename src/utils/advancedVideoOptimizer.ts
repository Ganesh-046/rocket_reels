import { Platform } from 'react-native';
import { instagramVideoCache } from './instagramOptimizedVideoCache';

// Instagram-level performance configuration
const ADVANCED_PERFORMANCE_CONFIG = {
  // Video loading
  chunkSize: 1024 * 1024, // 1MB chunks for progressive loading
  maxConcurrentChunks: 3,
  preloadDistance: 1, // Only preload 1 video ahead
  
  // Memory management
  maxMemoryUsage: 150 * 1024 * 1024, // 150MB limit
  texturePoolSize: 5, // Keep 5 video textures in memory
  cleanupThreshold: 0.8, // 80% memory usage triggers cleanup
  
  // Network optimization
  wifiBitrate: 2000000, // 2Mbps for WiFi
  mobileBitrate: 1000000, // 1Mbps for mobile
  lowBitrate: 500000, // 500Kbps for slow connections
  
  // Performance thresholds
  scrollVelocityThreshold: 30,
  frameRateTarget: 30, // Target 30fps for better performance
  bufferSize: 1024 * 1024, // 1MB buffer
};

interface VideoChunk {
  id: string;
  url: string;
  startByte: number;
  endByte: number;
  data?: ArrayBuffer;
  isLoaded: boolean;
}

interface VideoTexture {
  id: string;
  textureId: string;
  lastUsed: number;
  size: number;
}

interface NetworkInfo {
  type: 'wifi' | 'cellular' | 'none';
  isConnected: boolean;
  isFast: boolean;
}

class AdvancedVideoOptimizer {
  private activeChunks: Map<string, VideoChunk[]> = new Map();
  private texturePool: Map<string, VideoTexture> = new Map();
  private networkInfo: NetworkInfo = { type: 'none', isConnected: false, isFast: false };
  private memoryUsage = 0;
  private isProcessingChunks = false;

  constructor() {
    this.initializeNetworkMonitoring();
  }

  // Initialize network monitoring
  private initializeNetworkMonitoring() {
    // Simplified network monitoring without NetInfo dependency
    this.networkInfo = {
      type: 'wifi', // Default to wifi for better performance
      isConnected: true,
      isFast: true,
    };
  }

  // Progressive video loading with chunks
  async loadVideoProgressively(videoId: string, videoUrl: string): Promise<string> {
    try {
      // Check if already loading
      if (this.activeChunks.has(videoId)) {
        return videoUrl; // Return URL while loading
      }

      // Get video size first
      const videoSize = await this.getVideoSize(videoUrl);
      if (!videoSize) {
        return this.fallbackToDirectLoad(videoId, videoUrl);
      }

      // Create chunks
      const chunks = this.createChunks(videoId, videoUrl, videoSize);
      this.activeChunks.set(videoId, chunks);

      // Start loading first chunk immediately
      await this.loadChunk(chunks[0]);
      
      // Start background loading of remaining chunks
      this.loadRemainingChunks(chunks.slice(1));

      return videoUrl; // Return URL while loading progressively
    } catch (error) {
      console.error('Progressive loading failed:', error);
      return this.fallbackToDirectLoad(videoId, videoUrl);
    }
  }

  private async getVideoSize(videoUrl: string): Promise<number | null> {
    try {
      const response = await fetch(videoUrl, { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      return contentLength ? parseInt(contentLength) : null;
    } catch (error) {
      console.warn('Could not get video size:', error);
      return null;
    }
  }

  private createChunks(videoId: string, videoUrl: string, videoSize: number): VideoChunk[] {
    const chunks: VideoChunk[] = [];
    const chunkSize = ADVANCED_PERFORMANCE_CONFIG.chunkSize;
    
    for (let start = 0; start < videoSize; start += chunkSize) {
      const end = Math.min(start + chunkSize - 1, videoSize - 1);
      chunks.push({
        id: `${videoId}-chunk-${start}`,
        url: videoUrl,
        startByte: start,
        endByte: end,
        isLoaded: false,
      });
    }
    
    return chunks;
  }

  private async loadChunk(chunk: VideoChunk): Promise<void> {
    try {
      const response = await fetch(chunk.url, {
        headers: {
          'Range': `bytes=${chunk.startByte}-${chunk.endByte}`,
          'User-Agent': 'Instagram/219.0.0.29.118 Android',
        },
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        chunk.data = arrayBuffer;
        chunk.isLoaded = true;
        this.memoryUsage += arrayBuffer.byteLength;
        
        console.log(`✅ Loaded chunk: ${chunk.id} (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB)`);
      }
    } catch (error) {
      console.error(`Failed to load chunk ${chunk.id}:`, error);
    }
  }

  private async loadRemainingChunks(chunks: VideoChunk[]): Promise<void> {
    if (this.isProcessingChunks) return;
    
    this.isProcessingChunks = true;
    
    for (let i = 0; i < chunks.length; i += ADVANCED_PERFORMANCE_CONFIG.maxConcurrentChunks) {
      const chunkBatch = chunks.slice(i, i + ADVANCED_PERFORMANCE_CONFIG.maxConcurrentChunks);
      
      await Promise.allSettled(chunkBatch.map(chunk => this.loadChunk(chunk)));
      
      // Check memory usage and cleanup if needed
      await this.checkMemoryUsage();
    }
    
    this.isProcessingChunks = false;
  }

  private async fallbackToDirectLoad(videoId: string, videoUrl: string): Promise<string> {
    console.log(`🔄 Falling back to direct load for ${videoId}`);
    return instagramVideoCache.getVideoStream(videoId, videoUrl);
  }

  // Memory management
  private async checkMemoryUsage(): Promise<void> {
    if (this.memoryUsage > ADVANCED_PERFORMANCE_CONFIG.maxMemoryUsage * ADVANCED_PERFORMANCE_CONFIG.cleanupThreshold) {
      await this.cleanupMemory();
    }
  }

  private async cleanupMemory(): Promise<void> {
    console.log('🧹 Advanced memory cleanup triggered');
    
    // Cleanup old textures
    const textures = Array.from(this.texturePool.entries());
    textures.sort(([, a], [, b]) => a.lastUsed - b.lastUsed);
    
    const toRemove = textures.slice(0, Math.floor(textures.length * 0.3)); // Remove 30% oldest
    
    for (const [id] of toRemove) {
      this.texturePool.delete(id);
    }
    
    // Cleanup old chunks
    const chunks = Array.from(this.activeChunks.entries());
    for (const [videoId, videoChunks] of chunks) {
      const loadedChunks = videoChunks.filter(chunk => chunk.isLoaded);
      if (loadedChunks.length === videoChunks.length) {
        // All chunks loaded, remove from active
        this.activeChunks.delete(videoId);
      }
    }
    
    this.memoryUsage = Math.max(0, this.memoryUsage * 0.7); // Reduce by 30%
  }

  // Texture pool management
  getTexture(videoId: string): VideoTexture | null {
    const texture = this.texturePool.get(videoId);
    if (texture) {
      texture.lastUsed = Date.now();
      return texture;
    }
    return null;
  }

  addTexture(videoId: string, textureId: string, size: number): void {
    // Remove oldest texture if pool is full
    if (this.texturePool.size >= ADVANCED_PERFORMANCE_CONFIG.texturePoolSize) {
      const oldest = Array.from(this.texturePool.entries())
        .sort(([, a], [, b]) => a.lastUsed - b.lastUsed)[0];
      if (oldest) {
        this.texturePool.delete(oldest[0]);
      }
    }
    
    this.texturePool.set(videoId, {
      id: videoId,
      textureId,
      lastUsed: Date.now(),
      size,
    });
  }

  // Network-aware video configuration
  getOptimizedVideoConfig(): any {
    const bitrate = this.getOptimalBitrate();
    const frameRate = this.getOptimalFrameRate();
    
    return {
      bufferConfig: {
        minBufferMs: 500,
        maxBufferMs: 2000,
        bufferForPlaybackMs: 100,
        bufferForPlaybackAfterRebufferMs: 500,
      },
      maxBitRate: bitrate,
      frameRate: frameRate,
      resizeMode: 'cover' as const,
      repeat: false,
      playInBackground: false,
      playWhenInactive: false,
      ignoreSilentSwitch: 'ignore' as const,
      progressUpdateInterval: 100,
      // Platform-specific optimizations
      ...(Platform.OS === 'ios' ? {
        allowsExternalPlayback: false,
        automaticallyWaitsToMinimizeStalling: true,
      } : {
        useTextureView: true,
        bufferType: 'surface',
      }),
    };
  }

  private getOptimalBitrate(): number {
    if (!this.networkInfo.isConnected) return ADVANCED_PERFORMANCE_CONFIG.lowBitrate;
    
    switch (this.networkInfo.type) {
      case 'wifi':
        return ADVANCED_PERFORMANCE_CONFIG.wifiBitrate;
      case 'cellular':
        return this.networkInfo.isFast 
          ? ADVANCED_PERFORMANCE_CONFIG.mobileBitrate 
          : ADVANCED_PERFORMANCE_CONFIG.lowBitrate;
      default:
        return ADVANCED_PERFORMANCE_CONFIG.lowBitrate;
    }
  }

  private getOptimalFrameRate(): number {
    // Lower frame rate for better performance on slower devices
    return ADVANCED_PERFORMANCE_CONFIG.frameRateTarget;
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      memoryUsage: this.memoryUsage,
      activeChunks: this.activeChunks.size,
      texturePoolSize: this.texturePool.size,
      networkType: this.networkInfo.type,
      isConnected: this.networkInfo.isConnected,
      isFast: this.networkInfo.isFast,
    };
  }

  // Cleanup
  cleanup() {
    this.activeChunks.clear();
    this.texturePool.clear();
    this.memoryUsage = 0;
    this.isProcessingChunks = false;
  }
}

export const advancedVideoOptimizer = new AdvancedVideoOptimizer(); 