import { MMKV } from 'react-native-mmkv';

// Lazy initialization of MMKV storage for API logs
let apiLogStorageInstance: MMKV | null = null;

const getApiLogStorage = (): MMKV => {
  if (!apiLogStorageInstance) {
    try {
      apiLogStorageInstance = new MMKV();
    } catch (error) {
      console.warn('MMKV initialization failed in apiLogger:', error);
      throw new Error('MMKV not available - React Native may not be ready');
    }
  }
  return apiLogStorageInstance;
};

interface ApiLogEntry {
  timestamp: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  response: any;
  statusCode: number;
  cURL: string;
}

class ApiLogger {
  private logs: ApiLogEntry[] = [];
  private maxLogs = 100; // Keep last 100 logs

  // Log API call and generate cURL
  logApiCall(
    endpoint: string,
    method: string,
    headers: Record<string, string>,
    body?: any,
    response?: any,
    statusCode?: number
  ) {
    const timestamp = new Date().toISOString();
    
    // Generate cURL command
    const cURL = this.generateCURL(endpoint, method, headers, body);
    
    const logEntry: ApiLogEntry = {
      timestamp,
      endpoint,
      method,
      headers,
      body,
      response,
      statusCode: statusCode || 0,
      cURL,
    };

    // Add to logs
    this.logs.unshift(logEntry);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Save to MMKV
    this.saveLogs();

    // Log to console
    console.log('🌐 API Logger - New API Call:', {
      timestamp,
      endpoint,
      method,
      statusCode,
    });
    console.log('📋 cURL Command:');
    console.log(cURL);
    
    if (response) {
      console.log('📄 Response:', JSON.stringify(response, null, 2));
    }
  }

  // Generate cURL command
  private generateCURL(
    endpoint: string,
    method: string,
    headers: Record<string, string>,
    body?: any
  ): string {
    let cURL = `curl -X ${method.toUpperCase()} "${endpoint}"`;
    
    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      cURL += ` \\\n  -H "${key}: ${value}"`;
    });
    
    // Add body if present
    if (body) {
      if (typeof body === 'string') {
        cURL += ` \\\n  -d '${body}'`;
      } else {
        cURL += ` \\\n  -d '${JSON.stringify(body)}'`;
      }
    }
    
    return cURL;
  }

  // Get all logs
  getLogs(): ApiLogEntry[] {
    return [...this.logs];
  }

  // Get logs for specific endpoint
  getLogsForEndpoint(endpoint: string): ApiLogEntry[] {
    return this.logs.filter(log => log.endpoint.includes(endpoint));
  }

  // Get video quality related logs
  getVideoQualityLogs(): ApiLogEntry[] {
    return this.logs.filter(log => 
      log.endpoint.includes('video') || 
      log.endpoint.includes('episode') ||
      log.endpoint.includes('content')
    );
  }

  // Get latest log
  getLatestLog(): ApiLogEntry | null {
    return this.logs[0] || null;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.saveLogs();
    console.log('🗑️ API Logger - Logs cleared');
  }

  // Save logs to MMKV
  private saveLogs() {
    try {
      const storage = getApiLogStorage();
      storage.set('apiLogs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving API logs:', error);
    }
  }

  // Load logs from MMKV
  loadLogs() {
    try {
      const storage = getApiLogStorage();
      const savedLogs = storage.getString('apiLogs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Error loading API logs:', error);
    }
  }

  // Export logs as text
  exportLogsAsText(): string {
    let exportText = 'API Logs Export\n';
    exportText += '================\n\n';
    
    this.logs.forEach((log, index) => {
      exportText += `Log ${index + 1} - ${log.timestamp}\n`;
      exportText += `Endpoint: ${log.endpoint}\n`;
      exportText += `Method: ${log.method}\n`;
      exportText += `Status: ${log.statusCode}\n`;
      exportText += `cURL:\n${log.cURL}\n`;
      
      if (log.response) {
        exportText += `Response: ${JSON.stringify(log.response, null, 2)}\n`;
      }
      
      exportText += '\n---\n\n';
    });
    
    return exportText;
  }

  // Log video quality URLs specifically
  logVideoQualityUrls(videoId: string, videoUrls: any) {
    console.log('🎬 Video Quality URLs for:', videoId);
    console.log('📋 Available Qualities:');
    
    Object.entries(videoUrls).forEach(([quality, url]) => {
      if (url) {
        console.log(`  ${quality}: ${url}`);
        
        // Generate cURL for each quality URL
        const cURL = this.generateCURL(
          url as string,
          'GET',
          {
            'User-Agent': 'Instagram/219.0.0.29.118 Android',
            'Accept': 'video/mp4,video/*,*/*;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
          }
        );
        
        console.log(`  cURL for ${quality}:`);
        console.log(cURL);
        console.log('');
      }
    });
  }
}

// Export singleton instance
export const apiLogger = new ApiLogger();

// Initialize by loading saved logs (but only when needed)
// Don't call loadLogs() immediately to avoid MMKV initialization during import 