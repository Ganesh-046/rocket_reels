import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

const ReelPlayerScreen: React.FC = () => {
  const currentReel = {
    title: 'Epic Battle Sequence',
    author: 'ActionFilms',
    description: 'An incredible battle scene from the latest action movie',
    likes: '125K',
    comments: '8.5K',
    shares: '12K',
    duration: '0:45',
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-1">
        {/* Video Player Placeholder */}
        <View className="flex-1 bg-gray-900 items-center justify-center">
          <Text className="text-white text-8xl mb-4">🎬</Text>
          <Text className="text-white text-xl font-bold mb-2">{currentReel.title}</Text>
          <Text className="text-gray-400 mb-4">by {currentReel.author}</Text>
          <Text className="text-white text-center px-8">{currentReel.description}</Text>
          
          {/* Play Button */}
          <TouchableOpacity className="bg-blue-500 rounded-full w-20 h-20 items-center justify-center mt-8">
            <Text className="text-white text-3xl">▶️</Text>
          </TouchableOpacity>
        </View>

        {/* Action Bar */}
        <View className="absolute right-4 bottom-32 items-center">
          <TouchableOpacity className="items-center mb-6">
            <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mb-1">
              <Text className="text-2xl">❤️</Text>
            </View>
            <Text className="text-white text-sm">{currentReel.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mb-6">
            <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mb-1">
              <Text className="text-2xl">💬</Text>
            </View>
            <Text className="text-white text-sm">{currentReel.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center mb-6">
            <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mb-1">
              <Text className="text-2xl">📤</Text>
            </View>
            <Text className="text-white text-sm">{currentReel.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <View className="w-12 h-12 bg-gray-800 rounded-full items-center justify-center mb-1">
              <Text className="text-2xl">⏭️</Text>
            </View>
            <Text className="text-white text-sm">Next</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <Text className="text-white text-lg font-bold mb-1">{currentReel.title}</Text>
          <Text className="text-gray-300 mb-2">by {currentReel.author}</Text>
          <Text className="text-gray-400 text-sm">{currentReel.duration}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReelPlayerScreen;
