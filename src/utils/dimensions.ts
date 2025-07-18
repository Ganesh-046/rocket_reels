import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const dimensions = {
  width,
  height,
  navBarHeight: 44, // Default navigation bar height
};

export default dimensions; 