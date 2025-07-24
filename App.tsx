/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState, AppStateStatus } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import ThemesContext from './src/context/ThemeContext';
import QueryClientProvider from './src/app/QueryClientProvider';
import { useApiLogger } from './src/hooks/useApiLogger';
import { log } from './src/utils/logger';
import { setReactNativeReady } from './src/lib/mmkv';

function App(): React.JSX.Element {
  const [isRNReady, setIsRNReady] = useState(false);
  
  // Initialize API logger to intercept all fetch calls
  useApiLogger();
  
  useEffect(() => {
    log.info('APP', 'Rocket Reels App started');
    log.info('APP', 'App version', { version: '1.0.0' });
    console.log('[APP DEBUG] App component mounted');
    console.log('[APP DEBUG] Testing ad system initialization...');
    
    // Ensure React Native is ready before initializing MMKV
    const timer = setTimeout(() => {
      setIsRNReady(true);
      setReactNativeReady(true);
      console.log('[APP DEBUG] React Native is ready, MMKV can be initialized');
    }, 500); // Increased delay to ensure React Native is fully ready
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[APP DEBUG] App became active');
        // Ensure MMKV is ready when app becomes active
        if (!isRNReady) {
          setIsRNReady(true);
          setReactNativeReady(true);
        }
      } else if (nextAppState === 'background') {
        console.log('[APP DEBUG] App went to background');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRNReady]);
  
  return (
    <QueryClientProvider>
      <ThemesContext>
        <SafeAreaProvider>
          <RootNavigator />
        </SafeAreaProvider>
      </ThemesContext>
    </QueryClientProvider>
  );
}

export default App;
