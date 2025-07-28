import React from 'react';
import { View, Text, FlatList } from 'react-native';
import ActivityLoader from '../common/ActivityLoader';
import { PressableButton } from '../Button';
import { SvgIcons } from '../common/SvgIcons.tsx';

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

const TopContentSection: React.FC<TopContentSectionProps> = React.memo(({ 
  title, 
  data, 
  onSeeAll, 
  renderItem, 
  loadingStates, 
  style, 
  isLargeDevice, 
  appFonts, 
  colors 
}) => {
  if (!data?.length) {
    return loadingStates.content ? (
      <View style={style.sectionContainer}>
        <View style={[style.directionContainer, style.sectionHeader]}>
          <Text style={[style.heading, { textTransform: 'uppercase', fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_35 }]}> {title} </Text>
        </View>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <ActivityLoader />
        </View>
      </View>
    ) : null;
  }

  return (
    <View style={style.sectionContainer}>
      <View style={[style.directionContainer, style.sectionHeader]}>
        <Text style={[style.heading, { textTransform: 'uppercase', fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_35 }]}> {title} </Text>
        {onSeeAll && (
          <PressableButton
            onPress={onSeeAll}
            style={style.seeMoreButton}
            disabled={loadingStates.content}
          >
            <Text style={[style.txt, { opacity: loadingStates.content ? 0.5 : 1 }]}>See More</Text>
            <SvgIcons name={'arrow-right'} color={colors.PRIMARYWHITEFOUR} size={isLargeDevice ? 20 : 16} viewBox="0 0 64 64" strokeWidth={1.5} />
          </PressableButton>
        )}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item, index) => `${title}-${item.id || item._id}-${index}`}
        renderItem={({ item, index }) => renderItem({ item, index })}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
});

export default TopContentSection; 