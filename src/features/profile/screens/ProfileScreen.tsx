import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen: React.FC = () => {
  const userStats = {
    reels: 24,
    followers: 1234,
    following: 567,
    likes: 8901,
  };

  const recentReels = [
    { id: '1', title: 'My First Reel', views: '1.2K', thumbnail: '🎬' },
    { id: '2', title: 'Epic Moment', views: '856', thumbnail: '⚡' },
    { id: '3', title: 'Fun Times', views: '2.1K', thumbnail: '😄' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-gray-700 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">👤</Text>
            </View>
            <Text className="text-white text-xl font-bold">John Doe</Text>
            <Text className="text-gray-400">@johndoe</Text>
            <Text className="text-white text-center mt-2">
              Movie enthusiast sharing epic moments from films
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row justify-around mb-6 bg-gray-800 rounded-lg p-4">
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{userStats.reels}</Text>
              <Text className="text-gray-400 text-sm">Reels</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{userStats.followers}</Text>
              <Text className="text-gray-400 text-sm">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{userStats.following}</Text>
              <Text className="text-gray-400 text-sm">Following</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-xl font-bold">{userStats.likes}</Text>
              <Text className="text-gray-400 text-sm">Likes</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mb-6">
            <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg p-3 mr-2">
              <Text className="text-white text-center font-semibold">Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-gray-700 rounded-lg p-3 ml-2">
              <Text className="text-white text-center font-semibold">Share Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Reels */}
          <View>
            <Text className="text-white text-lg font-semibold mb-4">Recent Reels</Text>
            {recentReels.map((reel) => (
              <TouchableOpacity
                key={reel.id}
                className="flex-row items-center bg-gray-800 rounded-lg p-4 mb-3"
              >
                <View className="w-16 h-16 bg-gray-700 rounded-lg items-center justify-center mr-4">
                  <Text className="text-2xl">{reel.thumbnail}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">{reel.title}</Text>
                  <Text className="text-gray-400">{reel.views} views</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
