import { useEffect } from 'react';
import { apiLogger } from '../utils/apiLogger';

// Hook to intercept and log API calls
export const useApiLogger = () => {
  useEffect(() => {
    // Intercept fetch calls
    const originalFetch = global.fetch;
    
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      const headers = init?.headers || {};
      const body = init?.body;
      
      try {
        const response = await originalFetch(input, init);
        
        // Clone response to read body
        const responseClone = response.clone();
        let responseBody;
        
        try {
          responseBody = await responseClone.json();
        } catch {
          // If not JSON, try text
          try {
            responseBody = await responseClone.text();
          } catch {
            responseBody = 'Unable to read response body';
          }
        }
        
        // Log the API call
        apiLogger.logApiCall(
          url,
          method,
          headers as Record<string, string>,
          body,
          responseBody,
          response.status
        );
        
        return response;
      } catch (error) {
        // Log error
        apiLogger.logApiCall(
          url,
          method,
          headers as Record<string, string>,
          body,
          { error: error instanceof Error ? error.message : 'Unknown error' },
          0
        );
        
        throw error as Error;
      }
    };
    
    // Cleanup function
    return () => {
      global.fetch = originalFetch;
    };
  }, []);
};

// Hook to log specific API calls
export const useLogApiCall = () => {
  const logApiCall = (
    endpoint: string,
    method: string,
    headers: Record<string, string>,
    body?: any,
    response?: any,
    statusCode?: number
  ) => {
    apiLogger.logApiCall(endpoint, method, headers, body, response, statusCode);
  };
  
  return { logApiCall };
}; 