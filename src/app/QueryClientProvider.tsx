import React from 'react';
import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';

// Create a client with optimized settings for video platform
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Optimize for video content
      staleTime: 5 * 60 * 1000, // 5 minutes - videos don't change often
      gcTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Don't refetch when app comes to foreground
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: false, // Don't refetch on component mount if data exists
    },
    mutations: {
      retry: 1, // Retry mutations once
      retryDelay: 1000,
    },
  },
});

interface QueryClientProviderProps {
  children: React.ReactNode;
}

const QueryClientProvider: React.FC<QueryClientProviderProps> = ({ children }) => {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
};

export default QueryClientProvider;
