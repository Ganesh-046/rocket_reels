import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import UltraShortsScreen from './UltraShortsScreen';

interface DiscoverScreenProps {
  navigation: any;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ navigation }) => {
  return <UltraShortsScreen navigation={navigation} />;
};

export default DiscoverScreen;
