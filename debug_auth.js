// Debug script to check authentication state
const MMKVStorage = require('./src/lib/mmkv').default;

console.log('🔍 Checking Authentication State...');

// Check if MMKV is available
try {
  const token = MMKVStorage.getToken();
  const user = MMKVStorage.getUser();
  const authData = MMKVStorage.getAuthData();
  
  console.log('🔑 Token Status:', {
    hasToken: !!token,
    tokenLength: token?.length,
    tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token',
  });
  
  console.log('👤 User Status:', {
    hasUser: !!user,
    userId: user?._id,
    userName: user?.userName,
    userEmail: user?.userEmail,
  });
  
  console.log('💾 Auth Data Status:', {
    hasAuthData: !!authData,
    hasUser: !!authData?.user,
    hasToken: !!authData?.token,
  });
  
  if (token) {
    console.log('✅ Token is present and stored!');
  } else {
    console.log('❌ No token found in storage');
  }
  
} catch (error) {
  console.log('❌ Error checking auth state:', error.message);
} 