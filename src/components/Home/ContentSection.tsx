import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import ActivityLoader from '../common/ActivityLoader';
import { PressableButton } from '../Button';
import { SvgIcons } from '../common/SvgIcons.tsx';

interface ContentSectionProps {
  title: string;
  data: any[];
  onSeeAll?: () => void;
  renderItem: (props: any) => React.ReactElement;
  loadingStates: any;
  style: any;
  isLargeDevice: boolean;
  appFonts: any;
  columns: number;
  colors: any;
}

const ContentSection: React.FC<ContentSectionProps> = React.memo(({ 
  title, 
  data, 
  onSeeAll, 
  renderItem, 
  loadingStates, 
  style, 
  isLargeDevice, 
  appFonts, 
  columns, 
  colors 
}) => {
  const { width } = Dimensions.get('window');
  
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
  
  const newData = title === 'New Shows' ? data.slice(0, 4) : data;
  const rows = newData.reduce((acc, item, index) => {
    if (index % columns === 0) {
      acc.push([item]);
    } else {
      acc[acc.length - 1].push(item);
    }
    return acc;
  }, []);

  return (
    <View style={style.sectionContainer}>
      <View style={[style.directionContainer, style.sectionHeader]}>
        <Text style={[style.heading, { textTransform: 'uppercase', fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_35 }]}> {title} </Text>
        {onSeeAll && data.length >= newData.length && (
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
      {rows.map((row: any[], rowIndex: number) => (
        <View key={`${title}-row-${rowIndex}`} style={[style.directionContainer, { justifyContent: 'center', flex: 0, marginBottom: width * .01 }]}> 
          {row.map((item: any, index: number) => renderItem({ item, index }))}
        </View>
      ))}
    </View>
  );
});

export default ContentSection; 