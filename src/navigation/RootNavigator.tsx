import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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

// Navigation Service
import { setNavigationRef } from './NavigationService';

import MMKVStorage from '../lib/mmkv';

const Stack = createNativeStackNavigator();

// Debug Button Component
const DebugButton = ({ 
  title, 
  color, 
  onPress, 
  style 
}: { 
  title: string; 
  color: string; 
  onPress: () => void; 
  style?: any; 
}) => (
  <TouchableOpacity
    style={[styles.debugButton, { backgroundColor: color }, style]}
    onPress={onPress}
  >
    <Text style={styles.debugButtonText}>{title}</Text>
  </TouchableOpacity>
);

// Loading Screen Component
const LoadingScreen = ({ onDebugPress }: { onDebugPress: () => void }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#ed9b72" />
    <Text style={styles.loadingText}>Loading...</Text>
    
    {/* Debug Button */}
    <DebugButton
      title="🔍 Debug Loading"
      color="#ff4757"
      onPress={onDebugPress}
      style={styles.debugButtonTopRight}
    />
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
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const value = MMKVStorage.get('alreadyLaunched');
      
      if (value === false) {
        MMKVStorage.set('alreadyLaunched', true);
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      setIsFirstLaunch(false);
    }
  };

  // Debug function to show current state
  const showDebugInfo = () => {
    Alert.alert(
      '🔍 Debug Info',
      `First Launch: ${isFirstLaunch}\nAuthenticated: ${isAuthenticated}\nAlready Launched: ${MMKVStorage.get('alreadyLaunched')}\nUser: ${MMKVStorage.get('user') ? 'Logged in' : 'Not logged in'}\nToken: ${MMKVStorage.get('token') ? 'Present' : 'Not present'}`,
      [
        { text: 'Reset Already Launched', onPress: () => {
          MMKVStorage.remove('alreadyLaunched');
          Alert.alert('Reset', 'Already launched has been reset. Restart the app to see onboarding again.');
        }},
        { text: 'Clear All Data', onPress: () => {
          MMKVStorage.clearAll();
          Alert.alert('Clear All', 'All app data has been cleared. Restart the app to see onboarding again.');
        }},
        { text: 'OK' }
      ]
    );
  };

  // Show loading screen while checking first launch
  if (isFirstLaunch === null) {
    return <LoadingScreen onDebugPress={showDebugInfo} />;
  }

  // Show no internet screen when offline (simplified for now)
  if (!isOnline) {
    return (
      <View style={styles.noInternetContainer}>
        <Icon name="wifi-off" size={64} color="#ff4757" />
        <Text style={styles.noInternetTitle}>No Internet Connection</Text>
        <Text style={styles.noInternetSubtitle}>
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  // Determine route name based on first launch
  let routeName: string;
  if (isFirstLaunch === true) {
    routeName = 'Onboarding';
  } else {
    routeName = 'Main';
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
        initialRouteName={routeName}
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
  debugButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
  },
  debugButtonTopRight: {
    top: 50,
    right: 20,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default RootNavigator;
