import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigationTypes';
import DiscoverScreen from '../features/discover/screens/DiscoverScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import ReelDetailScreen from '../features/reels/screens/ReelDetailsModal';
import CustomTabBar from './CustomTabBar';
import Shorts from '../features/reels/screens/ReelPlayerScreen';
import RewardsScreen from '../features/profile/screens/RewardsScreen';
import EpisodePlayerScreen from '../features/reels/screens/EpisodePlayerScreen';
import HomeScreen from '../screens/HomeScreen';
import WebViewScreen from '../screens/WebViewScreen';

// Profile Screens
import EditProfileScreen from '../features/profile/screens/EditProfileScreen';
import HistoryScreen from '../features/profile/screens/HistoryScreen';
import MyListScreen from '../features/profile/screens/MyListScreen';
import TransactionScreen from '../features/profile/screens/TransactionScreen';
import MyWalletScreen from '../features/profile/screens/MyWalletScreen';
import RefillScreen from '../features/profile/screens/RefillScreen';
import SubscriptionScreen from '../features/profile/screens/SubscriptionScreen';
import EpisodeUnlockedScreen from '../features/profile/screens/EpisodeUnlockedScreen';
import RewardHistoryScreen from '../features/profile/screens/RewardHistoryScreen';
import TargetAudienceScreen from '../features/profile/screens/TargetAudienceScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} /> 
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function BottomTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="ReelDetail" component={ReelDetailScreen} />
      <Stack.Screen name="Shorts" component={Shorts} />
      <Stack.Screen name="EpisodePlayer" component={EpisodePlayerScreen} />
      
      {/* Profile Screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="MyList" component={MyListScreen} />
      <Stack.Screen name="Transaction" component={TransactionScreen} />
      <Stack.Screen name="MyWallet" component={MyWalletScreen} />
      <Stack.Screen name="Refill" component={RefillScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="EpisodeUnlocked" component={EpisodeUnlockedScreen} />
      <Stack.Screen name="RewardHistory" component={RewardHistoryScreen} />
      <Stack.Screen name="TargetAudience" component={TargetAudienceScreen} />
      <Stack.Screen name="WebView" component={WebViewScreen} />
    </Stack.Navigator>
  );
}
