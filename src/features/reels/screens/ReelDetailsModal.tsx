import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ReelDetailsModal: React.FC = () => {
  const reelDetails = {
    title: 'Epic Battle Sequence',
    description: 'An incredible battle scene from the latest action movie. Watch as our hero faces impossible odds!',
    author: 'ActionFilms',
    views: '2.1M',
    likes: '125K',
    comments: '8.5K',
    shares: '12K',
    duration: '0:45',
    category: 'Action',
    tags: ['action', 'battle', 'epic', 'hero'],
  };

  const comments = [
    { id: '1', author: 'MovieFan123', text: 'This scene is absolutely incredible! 🔥', likes: 234 },
    { id: '2', author: 'ActionLover', text: 'The choreography is mind-blowing', likes: 156 },
    { id: '3', author: 'CinemaBuff', text: 'Can\'t wait to see the full movie', likes: 89 },
  ];

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity>
              <Text className="text-blue-500 text-lg">← Back</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-semibold">Reel Details</Text>
            <TouchableOpacity>
              <Text className="text-blue-500 text-lg">Share</Text>
            </TouchableOpacity>
          </View>

          {/* Video Placeholder */}
          <View className="bg-gray-800 rounded-lg h-64 items-center justify-center mb-6">
            <Text className="text-white text-6xl mb-2">🎬</Text>
            <Text className="text-white text-lg">{reelDetails.duration}</Text>
          </View>

          {/* Reel Info */}
          <View className="mb-6">
            <Text className="text-white text-xl font-bold mb-2">{reelDetails.title}</Text>
            <Text className="text-gray-400 mb-4">by {reelDetails.author}</Text>
            <Text className="text-white mb-4">{reelDetails.description}</Text>
            
            {/* Stats */}
            <View className="flex-row justify-around bg-gray-800 rounded-lg p-4 mb-4">
              <View className="items-center">
                <Text className="text-white font-bold">{reelDetails.views}</Text>
                <Text className="text-gray-400 text-sm">Views</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold">{reelDetails.likes}</Text>
                <Text className="text-gray-400 text-sm">Likes</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold">{reelDetails.comments}</Text>
                <Text className="text-gray-400 text-sm">Comments</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold">{reelDetails.shares}</Text>
                <Text className="text-gray-400 text-sm">Shares</Text>
              </View>
            </View>

            {/* Category and Tags */}
            <View className="mb-4">
              <Text className="text-white font-semibold mb-2">Category: {reelDetails.category}</Text>
              <View className="flex-row flex-wrap">
                {reelDetails.tags.map((tag, index) => (
                  <View key={index} className="bg-blue-500 rounded-full px-3 py-1 mr-2 mb-2">
                    <Text className="text-white text-sm">#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Comments */}
          <View>
            <Text className="text-white text-lg font-semibold mb-4">Comments ({reelDetails.comments})</Text>
            {comments.map((comment) => (
              <View key={comment.id} className="bg-gray-800 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-white font-semibold">{comment.author}</Text>
                  <Text className="text-gray-400 text-sm">{comment.likes} likes</Text>
                </View>
                <Text className="text-white">{comment.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReelDetailsModal;
