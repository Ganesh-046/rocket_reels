/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import ThemesContext from './src/context/ThemeContext';
import QueryClientProvider from './src/app/QueryClientProvider';
import { useApiLogger } from './src/hooks/useApiLogger';
import { log } from './src/utils/logger';

function App(): React.JSX.Element {
  // Initialize API logger to intercept all fetch calls
  useApiLogger();
  
  useEffect(() => {
    log.info('APP', 'Rocket Reels App started');
    log.info('APP', 'App version', { version: '1.0.0' });
  }, []);
  
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
