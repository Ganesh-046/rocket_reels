import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AdTestScreen from '../screens/AdTestScreen';

// Main Navigation
import BottomTabNavigator from './BottomTabNavigator';

// Store
import { useAuthState, useIsAuthenticated } from '../store/auth.store';
import MMKVStorage from '../lib/mmkv';

// Navigation Service
import { setNavigationRef } from './NavigationService';

const Stack = createNativeStackNavigator();

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ed9b72" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// No Internet Screen Component
const NoInternetScreen = () => (
  <View style={styles.noInternetContainer}>
    <Icon name="wifi-off" size={64} color="#ff4757" />
    <Text style={styles.noInternetTitle}>No Internet Connection</Text>
    <Text style={styles.noInternetSubtitle}>
      Please check your connection and try again
    </Text>
  </View>
);

// Auth Stack Navigator
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
};

const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    console.log('[ROOT DEBUG] RootNavigator component mounted');
    console.log('[ROOT DEBUG] isAuthenticated:', isAuthenticated);
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if first launch
      const hasLaunched = MMKVStorage.get('hasLaunched');
      if (!hasLaunched) {
        setIsFirstLaunch(true);
        MMKVStorage.set('hasLaunched', true);
      }

      // Simulate loading delay (1 second as per spec)
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      setIsLoading(false);
    }
  };

  // Determine initial route
  const getInitialRouteName = () => {
    if (isFirstLaunch) {
      return 'Onboarding';
    } else if (isAuthenticated) {
      return 'Main';
    } else {
      return 'Auth';
    }
  };

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show no internet screen when offline (simplified for now)
  if (!isOnline) {
    return <NoInternetScreen />;
  }

  return (
    <NavigationContainer
      ref={(ref) => {
        setNavigationRef(ref);
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={getInitialRouteName()}
      >
        {/* Onboarding Screen */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{ gestureEnabled: false }}
        />
        
        {/* Auth Stack */}
        <Stack.Screen 
          name="Auth" 
          component={AuthStack}
          options={{ gestureEnabled: false }}
        />
        
        {/* Main App */}
        <Stack.Screen 
          name="Main" 
          component={BottomTabNavigator}
          options={{ gestureEnabled: false }}
        />
        
        {/* Ad Test Screen */}
        <Stack.Screen 
          name="AdTest" 
          component={AdTestScreen}
          options={{ 
            headerShown: true,
            title: 'Ad System Test',
            headerStyle: { backgroundColor: '#1a1a1a' },
            headerTintColor: '#ffffff'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ed9b72',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  noInternetContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 40,
  },
  noInternetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  noInternetSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RootNavigator;
