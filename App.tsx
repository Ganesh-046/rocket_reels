/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import ThemesContext from './src/context/ThemeContext';
import QueryClientProvider from './src/app/QueryClientProvider';

function App(): React.JSX.Element {
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
