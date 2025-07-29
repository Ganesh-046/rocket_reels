import { Platform } from 'react-native';
import iosVideoDebugger from './iosVideoDebugger';

export const testIOSVideoConfiguration = () => {
  if (Platform.OS !== 'ios') {
    console.log('⚠️ This test is for iOS only');
    return;
  }

  console.log('🧪 Testing iOS Video Configuration...');

  // Test 1: Check common video URLs
  const testUrls = [
    'https://d1cuox40kar1pw.cloudfront.net/video.mp4',
    'https://d1cuox40kar1pw.cloudfront.net/video.m3u8',
    'http://example.com/video.mp4', // Should fail
    'https://example.com/video.avi', // Should fail
  ];

  testUrls.forEach((url, index) => {
    const issues = iosVideoDebugger.checkCommonIOSIssues(url);
    console.log(`Test ${index + 1} - URL: ${url.substring(0, 50)}...`);
    if (issues.length > 0) {
      console.log('❌ Issues found:', issues);
    } else {
      console.log('✅ No issues found');
    }
  });

  // Test 2: Get iOS video configuration
  const config = iosVideoDebugger.getIOSVideoConfigRecommendations();
  console.log('📋 iOS Video Configuration:', config);

  // Test 3: Check debugger functionality
  iosVideoDebugger.logVideoLoad(
    { duration: 120, naturalSize: { width: 1920, height: 1080 } },
    'https://test.com/video.mp4',
    'test-episode-id'
  );

  iosVideoDebugger.logVideoError(
    { error: { code: 1001, domain: 'AVFoundationErrorDomain' } },
    'https://test.com/video.mp4',
    'test-episode-id'
  );

  const logs = iosVideoDebugger.getDebugLogs();
  console.log('📝 Debug logs generated:', logs.length);

  console.log('✅ iOS Video Configuration Test Complete');
};

export const validateVideoURL = (url: string): boolean => {
  if (!url) return false;

  // Check HTTPS requirement
  if (!url.startsWith('https://')) {
    console.log('❌ URL must use HTTPS for iOS');
    return false;
  }

  // Check supported formats
  const supportedFormats = ['.mp4', '.m3u8', '.mov', '.m4v'];
  const hasSupportedFormat = supportedFormats.some(format => 
    url.toLowerCase().includes(format)
  );
  
  if (!hasSupportedFormat) {
    console.log('❌ URL must have a supported video format');
    return false;
  }

  // Check CDN domains
  const cdnDomains = ['cloudfront.net', 'd1cuox40kar1pw.cloudfront.net'];
  const hasCDN = cdnDomains.some(domain => url.includes(domain));
  
  if (!hasCDN) {
    console.log('⚠️ URL is not from a known CDN - may have network issues');
  }

  console.log('✅ Video URL is valid for iOS');
  return true;
}; 