import { Linking } from 'react-native';


export const testUrlScheme = async () => {
  try {
    // Test if the URL scheme is registered
    const testUrl = 'com.googleusercontent.apps.192652101719-5r5n5ckkm3ir4cpv6atc7l92uapqkggb://test';
    
    console.log('URLSchemeTest: Testing URL scheme:', testUrl);
    
    const canOpen = await Linking.canOpenURL(testUrl);
    console.log('URLSchemeTest: Can open URL:', canOpen);
    
    if (canOpen) {
      console.log('URLSchemeTest: URL scheme is properly registered!');
      return true;
    } else {
              console.error('URLSchemeTest: URL scheme is NOT registered');
      return false;
    }
  } catch (error) {
    console.error('URLSchemeTest: Error testing URL scheme:', error);
    return false;
  }
};

export const testAllUrlSchemes = async () => {
  const schemes = [
    'com.googleusercontent.apps.192652101719-5r5n5ckkm3ir4cpv6atc7l92uapqkggb://test',
    '192652101719-5r5n5ckkm3ir4cpv6atc7l92uapqkggb://test',
    'org.reactjs.native.example.rocket-reels://test',
  ];
  
  for (const scheme of schemes) {
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      console.log('URLSchemeTest:', `Scheme ${scheme}: ${canOpen ? 'REGISTERED' : 'NOT REGISTERED'}`);
    } catch (error) {
              console.error('URLSchemeTest:', `Error testing ${scheme}:`, error);
    }
  }
}; 