import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import SearchScreen from '../screens/SearchScreen';
import GenreScreen from '../screens/GenreScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MyListScreen from '../screens/MyListScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyWalletScreen from '../screens/MyWalletScreen';
import RefillScreen from '../screens/RefillScreen';
import TransactionScreen from '../screens/TransactionScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import VideoPlayer from '../screens/VideoPlayer';
import WebViewScreen from '../screens/WebViewScreen';

// Existing Screens
import ProfileScreen from '../screens/ProfileScreen';
import ShortsScreen from '../features/discover/screens/ShortsScreen';
import UltraShortsScreen from '../features/discover/screens/UltraShortsScreen';
import RewardsScreen from '../features/profile/screens/RewardsScreen';

// Icons
import Icon from 'react-native-vector-icons/MaterialIcons';

// Store
import { useAuthState, useIsAuthenticated } from '../store/auth.store';
import MMKVStorage from '../lib/mmkv';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'ForYou':
              iconName = 'play-circle-outline';
              break;
            case 'Rewards':
              iconName = 'card-giftcard';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ed9b72',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="ForYou" 
        component={ShortsScreen}
        options={{ tabBarLabel: 'For You' }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{ tabBarLabel: 'Rewards' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Genre" component={GenreScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="MyList" component={MyListScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyWallet" component={MyWalletScreen} />
      <Stack.Screen name="Refill" component={RefillScreen} />
      <Stack.Screen name="Transaction" component={TransactionScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
      <Stack.Screen name="WebView" component={WebViewScreen} />
      <Stack.Screen name="UltraShorts" component={UltraShortsScreen} />
    </Stack.Navigator>
  );
};

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

// Root Navigator with Navigation Conditions
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
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
      console.error('App initialization error:', error);
      setIsLoading(false);
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
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Navigation Conditions as per Screen Flow Guide */}
        
        {/* Condition 1: First Launch → OnboardingScreen */}
        {isFirstLaunch && (
          <Stack.Screen 
            name="Onboarding" 
            component={OnboardingScreen}
            options={{ gestureEnabled: false }}
          />
        )}

        {/* Condition 2: Not Authenticated → AuthStack */}
        {!isFirstLaunch && !isAuthenticated && (
          <Stack.Screen 
            name="AuthStack" 
            component={AuthStack}
            options={{ gestureEnabled: false }}
          />
        )}

        {/* Condition 3: Authenticated → MainStack */}
        {!isFirstLaunch && isAuthenticated && (
          <Stack.Screen 
            name="MainStack" 
            component={MainStack}
            options={{ gestureEnabled: false }}
          />
        )}
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

export default AppNavigator; 