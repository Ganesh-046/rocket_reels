const https = require('https');

// Test HLS URLs
const testUrls = [
  'https://d1cuox40kar1pw.cloudfront.net/hls1/686fa33cacf6eb2deb05ebf1/686f8966acf6eb2deb05ebbf/episode-1/master.m3u8',
  'https://www.w3schools.com/html/mov_bbb.mp4'
];

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const loadTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const isHLS = url.includes('.m3u8') || data.includes('#EXTM3U');
        const hasStreamInfo = data.includes('#EXT-X-STREAM-INF');
        
        resolve({
          url,
          status: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: res.headers['content-length'],
          loadTime,
          isHLS,
          hasStreamInfo,
          success: res.statusCode === 200,
          sampleData: data.substring(0, 200) + '...'
        });
      });
    }).on('error', (error) => {
      reject({
        url,
        error: error.message,
        success: false
      });
    });
  });
}

async function runTests() {
  console.log('🔍 Testing HLS Video URLs...\n');
  
  for (const url of testUrls) {
    try {
      const result = await testUrl(url);
      
      console.log(`🔍 Testing: ${url}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Content-Type: ${result.contentType}`);
      console.log(`   Load Time: ${result.loadTime}ms`);
      console.log(`   Is HLS: ${result.isHLS ? '✅ Yes' : '❌ No'}`);
      
      if (result.isHLS) {
        console.log(`   Has Stream Info: ${result.hasStreamInfo ? '✅ Yes' : '❌ No'}`);
      }
      
      console.log(`   Success: ${result.success ? '✅ Yes' : '❌ No'}`);
      console.log(`   Sample Data: ${result.sampleData}\n`);
      
    } catch (error) {
      console.log(`❌ Error testing ${url}: ${error.error}\n`);
    }
  }
  
  console.log('🎉 HLS URL testing completed!');
}

runTests(); 