import { Platform } from 'react-native';

interface VideoError {
  error?: {
    code?: number;
    domain?: string;
    description?: string;
  };
  errorString?: string;
}

interface VideoLoadData {
  duration?: number;
  naturalSize?: {
    width?: number;
    height?: number;
  };
  currentTime?: number;
}

class IOSVideoDebugger {
  private static instance: IOSVideoDebugger;
  private debugLogs: string[] = [];

  static getInstance(): IOSVideoDebugger {
    if (!IOSVideoDebugger.instance) {
      IOSVideoDebugger.instance = new IOSVideoDebugger();
    }
    return IOSVideoDebugger.instance;
  }

  logVideoError(error: VideoError, videoUrl?: string, episodeId?: string) {
    if (Platform.OS !== 'ios') return;

    const errorInfo = {
      timestamp: new Date().toISOString(),
      episodeId,
      videoUrl: videoUrl?.substring(0, 100) + '...',
      errorCode: error.error?.code,
      errorDomain: error.error?.domain,
      errorDescription: error.error?.description,
      errorString: error.errorString,
    };

    console.log('🔍 iOS Video Error:', errorInfo);
    this.debugLogs.push(`ERROR: ${JSON.stringify(errorInfo)}`);
  }

  logVideoLoad(data: VideoLoadData, videoUrl?: string, episodeId?: string) {
    if (Platform.OS !== 'ios') return;

    const loadInfo = {
      timestamp: new Date().toISOString(),
      episodeId,
      videoUrl: videoUrl?.substring(0, 100) + '...',
      duration: data.duration,
      naturalSize: data.naturalSize,
      currentTime: data.currentTime,
    };

    console.log('🔍 iOS Video Load:', loadInfo);
    this.debugLogs.push(`LOAD: ${JSON.stringify(loadInfo)}`);
  }

  logVideoReady(episodeId?: string) {
    if (Platform.OS !== 'ios') return;

    const readyInfo = {
      timestamp: new Date().toISOString(),
      episodeId,
    };

    console.log('🔍 iOS Video Ready:', readyInfo);
    this.debugLogs.push(`READY: ${JSON.stringify(readyInfo)}`);
  }

  logVideoBuffer(isBuffering: boolean, episodeId?: string) {
    if (Platform.OS !== 'ios') return;

    const bufferInfo = {
      timestamp: new Date().toISOString(),
      episodeId,
      isBuffering,
    };

    console.log('🔍 iOS Video Buffer:', bufferInfo);
    this.debugLogs.push(`BUFFER: ${JSON.stringify(bufferInfo)}`);
  }

  getDebugLogs(): string[] {
    return this.debugLogs;
  }

  clearDebugLogs(): void {
    this.debugLogs = [];
  }

  // Check for common iOS video issues
  checkCommonIOSIssues(videoUrl?: string): string[] {
    const issues: string[] = [];

    if (!videoUrl) {
      issues.push('No video URL provided');
      return issues;
    }

    // Check for HTTPS requirement
    if (!videoUrl.startsWith('https://')) {
      issues.push('Video URL is not HTTPS - iOS requires HTTPS for network requests');
    }

    // Check for supported video formats
    const supportedFormats = ['.mp4', '.m3u8', '.mov', '.m4v'];
    const hasSupportedFormat = supportedFormats.some(format => 
      videoUrl.toLowerCase().includes(format)
    );
    
    if (!hasSupportedFormat) {
      issues.push('Video URL does not have a supported format for iOS');
    }

    // Check for CDN domains
    const cdnDomains = ['cloudfront.net', 'd1cuox40kar1pw.cloudfront.net'];
    const hasCDN = cdnDomains.some(domain => videoUrl.includes(domain));
    
    if (!hasCDN) {
      issues.push('Video URL is not from a known CDN - may have network issues');
    }

    return issues;
  }

  // Generate iOS video configuration recommendations
  getIOSVideoConfigRecommendations(): object {
    return {
      // iOS-specific video configuration
      allowsExternalPlayback: false,
      automaticallyWaitsToMinimizeStalling: false,
      playInBackground: false,
      playWhenInactive: false,
      ignoreSilentSwitch: "ignore",
      audioOnly: false,
      useTextureView: false,
      bufferType: 'surface',
      
      // Buffer configuration for iOS
      bufferConfig: {
        minBufferMs: 1000,
        maxBufferMs: 5000,
        bufferForPlaybackMs: 500,
        bufferForPlaybackAfterRebufferMs: 1000,
      },
      
      // Headers for better iOS compatibility
      headers: {
        'User-Agent': 'RocketReel/1.0 iOS',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, video/mp2t, video/mp4, video/*',
        'Cache-Control': 'max-age=3600',
        'Accept-Encoding': 'gzip, deflate',
      },
    };
  }
}

export default IOSVideoDebugger.getInstance(); 