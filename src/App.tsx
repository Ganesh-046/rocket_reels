import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './providers/QueryProvider';
import AppNavigator from './navigation/AppNavigator';
import { initializeAuth } from './store/auth.store';

const App = () => {
  useEffect(() => {
    // Initialize auth from storage on app start
    initializeAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AppNavigator />
      </QueryProvider>
    </SafeAreaProvider>
  );
};

export default App; 