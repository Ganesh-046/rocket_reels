import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';

interface TopContentSectionProps {
  title: string;
  data: any[];
  onSeeAll?: () => void;
  renderItem: (props: any) => React.ReactElement;
  loadingStates: any;
  style: any;
  isLargeDevice: boolean;
  appFonts: any;
  colors: any;
}

const { width } = Dimensions.get('window');

const TopContentSection: React.FC<TopContentSectionProps> = ({
  title,
  data,
  onSeeAll,
  renderItem,
  loadingStates,
  style,
  isLargeDevice,
  appFonts,
  colors,
}) => {
  if (!data || data.length === 0) return null;

  return (
    <View style={style.sectionContainer}>
      <View style={style.sectionHeader}>
        <Text style={style.heading}>{title}</Text>
        {onSeeAll && (
          <Text style={style.txt} onPress={onSeeAll}>
            See All
          </Text>
        )}
      </View>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || item._id || `top-${index}`}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={8}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: width * 0.4,
          offset: width * 0.4 * index,
          index,
        })}
      />
    </View>
  );
};

export default TopContentSection; 