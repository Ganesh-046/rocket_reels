import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RewardsScreen: React.FC = () => {
  const userPoints = 1250;
  const availableRewards = [
    { id: '1', name: 'Premium Badge', points: 500, icon: '🏆' },
    { id: '2', name: 'Creator Status', points: 1000, icon: '⭐' },
    { id: '3', name: 'Early Access', points: 2000, icon: '🚀' },
    { id: '4', name: 'VIP Features', points: 5000, icon: '👑' },
  ];

  const achievements = [
    { id: '1', name: 'First Reel', description: 'Uploaded your first reel', icon: '🎬', earned: true },
    { id: '2', name: 'Viral Sensation', description: 'Reached 10K views', icon: '🔥', earned: true },
    { id: '3', name: 'Content Creator', description: 'Uploaded 10 reels', icon: '📹', earned: false },
    { id: '4', name: 'Community Star', description: 'Gained 1K followers', icon: '🌟', earned: false },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Text className="text-white text-2xl font-bold mb-6">Rewards</Text>
          
          {/* Points Display */}
          <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6">
            <Text className="text-white text-center text-lg mb-2">Your Points</Text>
            <Text className="text-white text-center text-4xl font-bold">{userPoints}</Text>
            <Text className="text-white text-center opacity-80">Keep creating to earn more!</Text>
          </View>

          {/* Available Rewards */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Available Rewards</Text>
            {availableRewards.map((reward) => (
              <TouchableOpacity
                key={reward.id}
                className={`flex-row items-center p-4 rounded-lg mb-3 ${
                  userPoints >= reward.points ? 'bg-gray-800' : 'bg-gray-900 opacity-50'
                }`}
                disabled={userPoints < reward.points}
              >
                <Text className="text-3xl mr-4">{reward.icon}</Text>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg">{reward.name}</Text>
                  <Text className="text-gray-400">{reward.points} points</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${
                  userPoints >= reward.points ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  <Text className="text-white text-sm font-semibold">
                    {userPoints >= reward.points ? 'Claim' : 'Locked'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Achievements */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">Achievements</Text>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                className={`flex-row items-center p-4 rounded-lg mb-3 ${
                  achievement.earned ? 'bg-gray-800' : 'bg-gray-900 opacity-50'
                }`}
              >
                <Text className="text-3xl mr-4">{achievement.icon}</Text>
                <View className="flex-1">
                  <Text className="text-white font-semibold text-lg">{achievement.name}</Text>
                  <Text className="text-gray-400">{achievement.description}</Text>
                </View>
                <View className={`w-6 h-6 rounded-full items-center justify-center ${
                  achievement.earned ? 'bg-green-500' : 'bg-gray-600'
                }`}>
                  <Text className="text-white text-sm">✓</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RewardsScreen; 