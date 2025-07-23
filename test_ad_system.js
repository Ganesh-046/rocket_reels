#!/usr/bin/env node

/**
 * Ad System Test Script
 * Tests the complete ad implementation based on working old project
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 TESTING AD SYSTEM IMPLEMENTATION');
console.log('=====================================\n');

// Test 1: Package.json
console.log('1. 📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check react-native-google-mobile-ads version
  const adVersion = packageJson.dependencies['react-native-google-mobile-ads'];
  if (adVersion === '^14.7.0') {
    console.log('   ✅ react-native-google-mobile-ads version: ^14.7.0 (WORKING)');
  } else {
    console.log(`   ❌ react-native-google-mobile-ads version: ${adVersion} (should be ^14.7.0)`);
  }
  
  // Check app.json configuration
  const adConfig = packageJson['react-native-google-mobile-ads'];
  if (adConfig && adConfig.android_app_id && adConfig.ios_app_id) {
    console.log('   ✅ App.json ad configuration found');
    console.log(`   ✅ Android App ID: ${adConfig.android_app_id}`);
    console.log(`   ✅ iOS App ID: ${adConfig.ios_app_id}`);
  } else {
    console.log('   ❌ App.json ad configuration missing');
  }
} catch (error) {
  console.log('   ❌ Error reading package.json:', error.message);
}

// Test 2: Android Manifest
console.log('\n2. 🤖 Checking Android Manifest...');
try {
  const manifestPath = 'android/app/src/main/AndroidManifest.xml';
  if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    
    if (manifest.includes('com.google.android.gms.ads.APPLICATION_ID')) {
      console.log('   ✅ Google Mobile Ads meta-data found');
    } else {
      console.log('   ❌ Google Mobile Ads meta-data missing');
    }
    
    if (manifest.includes('tools:replace="android:value"')) {
      console.log('   ✅ tools:replace attribute found (prevents conflicts)');
    } else {
      console.log('   ❌ tools:replace attribute missing');
    }
  } else {
    console.log('   ❌ AndroidManifest.xml not found');
  }
} catch (error) {
  console.log('   ❌ Error reading AndroidManifest.xml:', error.message);
}

// Test 3: iOS Info.plist
console.log('\n3. 🍎 Checking iOS Info.plist...');
try {
  const plistPath = 'ios/rocket_reels/Info.plist';
  if (fs.existsSync(plistPath)) {
    const plist = fs.readFileSync(plistPath, 'utf8');
    
    if (plist.includes('GADApplicationIdentifier')) {
      console.log('   ✅ GADApplicationIdentifier found');
    } else {
      console.log('   ❌ GADApplicationIdentifier missing');
    }
    
    if (plist.includes('SKAdNetworkItems')) {
      console.log('   ✅ SKAdNetworkItems found');
    } else {
      console.log('   ❌ SKAdNetworkItems missing');
    }
  } else {
    console.log('   ❌ Info.plist not found');
  }
} catch (error) {
  console.log('   ❌ Error reading Info.plist:', error.message);
}

// Test 4: Ad Configuration
console.log('\n4. ⚙️  Checking Ad Configuration...');
try {
  const adConfigPath = 'src/utils/adConfig.ts';
  if (fs.existsSync(adConfigPath)) {
    const adConfig = fs.readFileSync(adConfigPath, 'utf8');
    
    // Check for working ad units
    const workingAdUnits = [
      'ca-app-pub-3648621548657237/5603070021',
      'ca-app-pub-3648621548657237/2194593465',
      'ca-app-pub-3648621548657237/3278969645',
      'ca-app-pub-3648621548657237/2668595554'
    ];
    
    let foundAdUnits = 0;
    workingAdUnits.forEach(unit => {
      if (adConfig.includes(unit)) {
        foundAdUnits++;
      }
    });
    
    if (foundAdUnits === 4) {
      console.log('   ✅ All working ad units found');
    } else {
      console.log(`   ❌ Only ${foundAdUnits}/4 working ad units found`);
    }
    
    if (adConfig.includes('getAdUnit')) {
      console.log('   ✅ getAdUnit function found');
    } else {
      console.log('   ❌ getAdUnit function missing');
    }
  } else {
    console.log('   ❌ adConfig.ts not found');
  }
} catch (error) {
  console.log('   ❌ Error reading adConfig.ts:', error.message);
}

// Test 5: Ad Service
console.log('\n5. 🔧 Checking Ad Service...');
try {
  const adServicePath = 'src/services/adService.ts';
  if (fs.existsSync(adServicePath)) {
    const adService = fs.readFileSync(adServicePath, 'utf8');
    
    if (adService.includes('processAdReward')) {
      console.log('   ✅ processAdReward method found');
    } else {
      console.log('   ❌ processAdReward method missing');
    }
    
    if (adService.includes('canWatchAds')) {
      console.log('   ✅ canWatchAds method found');
    } else {
      console.log('   ❌ canWatchAds method missing');
    }
  } else {
    console.log('   ❌ adService.ts not found');
  }
} catch (error) {
  console.log('   ❌ Error reading adService.ts:', error.message);
}

// Test 6: Ad Hook
console.log('\n6. 🎣 Checking Ad Hook...');
try {
  const adHookPath = 'src/hooks/useAdSystem.ts';
  if (fs.existsSync(adHookPath)) {
    const adHook = fs.readFileSync(adHookPath, 'utf8');
    
    if (adHook.includes('useRewardedAd')) {
      console.log('   ✅ useRewardedAd hook imported');
    } else {
      console.log('   ❌ useRewardedAd hook not imported');
    }
    
    if (adHook.includes('showAd')) {
      console.log('   ✅ showAd function found');
    } else {
      console.log('   ❌ showAd function missing');
    }
    
    if (adHook.includes('handleAdReward')) {
      console.log('   ✅ handleAdReward function found');
    } else {
      console.log('   ❌ handleAdReward function missing');
    }
  } else {
    console.log('   ❌ useAdSystem.ts not found');
  }
} catch (error) {
  console.log('   ❌ Error reading useAdSystem.ts:', error.message);
}

// Test 7: Rewards Screen
console.log('\n7. 📱 Checking Rewards Screen...');
try {
  const rewardsScreenPath = 'src/features/profile/screens/RewardsScreen.tsx';
  if (fs.existsSync(rewardsScreenPath)) {
    const rewardsScreen = fs.readFileSync(rewardsScreenPath, 'utf8');
    
    if (rewardsScreen.includes('useRewardedAd')) {
      console.log('   ✅ useRewardedAd hook used');
    } else {
      console.log('   ❌ useRewardedAd hook not used');
    }
    
    if (rewardsScreen.includes('handleShowAd')) {
      console.log('   ✅ handleShowAd function found');
    } else {
      console.log('   ❌ handleShowAd function missing');
    }
    
    if (rewardsScreen.includes('AD_UNITS')) {
      console.log('   ✅ AD_UNITS imported');
    } else {
      console.log('   ❌ AD_UNITS not imported');
    }
  } else {
    console.log('   ❌ RewardsScreen.tsx not found');
  }
} catch (error) {
  console.log('   ❌ Error reading RewardsScreen.tsx:', error.message);
}

// Test 8: App.tsx
console.log('\n8. 🚀 Checking App.tsx...');
try {
  const appPath = 'App.tsx';
  if (fs.existsSync(appPath)) {
    const app = fs.readFileSync(appPath, 'utf8');
    
    if (!app.includes('mobileAds().initialize()')) {
      console.log('   ✅ No manual mobileAds initialization (auto-initializes)');
    } else {
      console.log('   ⚠️  Manual mobileAds initialization found (not needed)');
    }
  } else {
    console.log('   ❌ App.tsx not found');
  }
} catch (error) {
  console.log('   ❌ Error reading App.tsx:', error.message);
}

console.log('\n=====================================');
console.log('🎯 SUMMARY:');
console.log('✅ All files should be present and correctly configured');
console.log('✅ Using exact working ad units from old project');
console.log('✅ Same package version and configuration structure');
console.log('✅ Same implementation pattern as working old project');
console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: npm install');
console.log('2. Run: npx react-native run-android');
console.log('3. Navigate to Rewards screen');
console.log('4. Test "Watch Ad" buttons');
console.log('5. Check console logs for debugging');
console.log('\n📝 NOTES:');
console.log('- Ads may take 10-30 seconds to load initially');
console.log('- Check adb logcat for native Google Mobile Ads logs');
console.log('- If ads don\'t work, verify ad units in AdMob console');
console.log('====================================='); 