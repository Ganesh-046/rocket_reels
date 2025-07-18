import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigationTypes';
import HomeScreen from '../features/reels/screens/ReelsFeedScreen';
import DiscoverScreen from '../features/discover/screens/DiscoverScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import ReelDetailScreen from '../features/reels/screens/ReelDetailsModal';
import CustomTabBar from './CustomTabBar';
import Shorts from '../features/reels/screens/ReelPlayerScreen';
import RewardsScreen from '../features/profile/screens/RewardsScreen';
import EpisodePlayerScreen from '../features/reels/screens/EpisodePlayerScreen';

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
    </Stack.Navigator>
  );
}
