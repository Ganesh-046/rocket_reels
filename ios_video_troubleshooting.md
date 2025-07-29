# iOS Video Troubleshooting Guide

## Issue: Videos are visible on Android but not on iOS

### Root Causes Identified:

1. **iOS Audio Session Configuration**
   - iOS requires proper audio session setup for video playback
   - Missing background audio mode in Info.plist
   - Audio session not properly initialized

2. **Network Security Configuration**
   - iOS has stricter network security requirements
   - HTTPS requirements for network requests
   - Domain-specific security exceptions needed

3. **Platform-Specific Video Configuration**
   - iOS-specific video properties not properly set
   - Missing iOS video rendering optimizations
   - Incorrect buffer configuration for iOS

4. **Missing Permissions and Capabilities**
   - Background audio mode not enabled
   - Video playback capabilities not properly configured

### Solutions Implemented:

#### 1. Enhanced iOS Audio Session Management
```javascript
// Improved audio session setup with fallback
const setupIOSAudioSession = () => {
  if (Platform.OS === 'ios') {
    try {
      const { AudioSession } = require('react-native-video');
      if (AudioSession) {
        AudioSession.setCategory('AVAudioSessionCategoryPlayback', false);
        AudioSession.setMode('AVAudioSessionModeMoviePlayback');
        AudioSession.setActive(true);
      }
    } catch (error) {
      // Fallback to react-native AudioSession
      const { AudioSession } = require('react-native');
      if (AudioSession) {
        AudioSession.setCategory('playback');
        AudioSession.setActive(true);
      }
    }
  }
};
```

#### 2. Updated Info.plist Configuration
```xml
<!-- Added background audio mode -->
<key>UIBackgroundModes</key>
<array>
    <string>audio</string>
</array>

<!-- Updated network security for video domains -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>d1cuox40kar1pw.cloudfront.net</key>
        <dict>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
            <key>NSExceptionRequiresForwardSecrecy</key>
            <true/>
        </dict>
    </dict>
</dict>
```

#### 3. iOS-Specific Video Configuration
```javascript
// Platform-specific optimizations
{...(Platform.OS === 'ios' ? {
  allowsExternalPlayback: false,
  automaticallyWaitsToMinimizeStalling: false,
  playInBackground: false,
  playWhenInactive: false,
  ignoreSilentSwitch: "ignore",
  audioOnly: false,
  useTextureView: false,
  bufferType: 'surface',
} : {
  useTextureView: true,
  bufferType: 'surface',
})}
```

#### 4. iOS Video Debugger
Created a comprehensive iOS video debugging utility that:
- Logs video errors with detailed information
- Checks for common iOS video issues
- Provides iOS-specific video configuration recommendations
- Monitors video loading and buffering states

### Testing Steps:

1. **Clean Build and Install**
   ```bash
   cd ios
   rm -rf build
   pod install
   cd ..
   npx react-native run-ios
   ```

2. **Check Console Logs**
   - Look for iOS video debugger logs
   - Monitor for audio session setup messages
   - Check for network security warnings

3. **Verify Video URLs**
   - Ensure all video URLs use HTTPS
   - Check that URLs are from supported CDN domains
   - Verify video format compatibility

4. **Test Different Video Formats**
   - Test with .mp4 files
   - Test with .m3u8 HLS streams
   - Test with different bitrates

### Common iOS Video Issues and Solutions:

#### Issue 1: Video not loading
**Solution**: Check network security settings and ensure HTTPS URLs

#### Issue 2: Video loads but doesn't play
**Solution**: Verify audio session setup and background audio mode

#### Issue 3: Video plays but no audio
**Solution**: Check audio session configuration and device volume

#### Issue 4: Video stutters or buffers excessively
**Solution**: Adjust buffer configuration for iOS-specific requirements

### Debugging Commands:

```bash
# Check iOS video debugger logs
adb logcat | grep "iOS Video"

# Monitor network requests
# Use Xcode Network Inspector or Charles Proxy

# Check audio session status
# Use Xcode Debug Console
```

### Additional Recommendations:

1. **Use iOS Simulator for Testing**
   - Test on different iOS versions
   - Test with different device types

2. **Monitor Performance**
   - Use Xcode Instruments for performance analysis
   - Monitor memory usage during video playback

3. **Test Network Conditions**
   - Test with slow network conditions
   - Test with different network types (WiFi, Cellular)

4. **Verify Video Encoding**
   - Ensure videos are encoded with iOS-compatible codecs
   - Use H.264 or H.265 codecs for best compatibility

### Emergency Fixes:

If videos still don't work on iOS:

1. **Force HTTPS for all video URLs**
2. **Add all video domains to NSExceptionDomains**
3. **Simplify video configuration to basic settings**
4. **Test with a known working video URL first**

### Contact Information:

For additional support, check the iOS video debugger logs and provide:
- iOS version
- Device model
- Video URL format
- Console error messages
- Debug logs from iosVideoDebugger 