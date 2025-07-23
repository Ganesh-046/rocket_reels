import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';
import { useOptimizedFlatList } from '../../hooks/useHomeScreenOptimization';
import Skeleton from '../Skeleton';


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
 // Memoized optimized FlatList config
 const optimizedFlatListConfig = useOptimizedFlatList(data?.length || 0);


 // Memoized item layout for better performance
 const getItemLayout = useCallback((data: any, index: number) => ({
   length: isLargeDevice ? width * 0.35 : width * 0.4,
   offset: (isLargeDevice ? width * 0.35 : width * 0.4) * index,
   index,
 }), [isLargeDevice, width]);


 // Memoized key extractor for stable keys
 const keyExtractor = useCallback((item: any, index: number) => {
   return item.id || item._id || `top-${index}`;
 }, []);


 // Memoized render item wrapper for better performance
 const renderItemWrapper = useCallback((props: any) => {
   return renderItem(props);
 }, [renderItem]);


 // Memoized section header for better performance
 const SectionHeader = useMemo(() => (
   <View style={style.sectionHeader}>
   <View style={{marginBottom: 20, paddingLeft: 15}}>
         <Text style={style.heading}>{title}</Text>
   </View>


     {onSeeAll && (
       <Text
         style={[style.txt, { opacity: loadingStates?.content ? 0.5 : 1 }]}
         onPress={onSeeAll}
         disabled={loadingStates?.content}
       >
         {/* See All */}
       </Text>
     )}
   </View>
 ), [title, onSeeAll, style.sectionHeader, style.heading, style.txt, loadingStates?.content]);


 // Show skeleton loader when loading
 if (loadingStates?.content || loadingStates?.topContent) {
   return (
     <View style={style.sectionContainer}>
       {SectionHeader}
       <View style={styles.skeletonContainer}>
         <FlatList
           data={Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}` }))}
           horizontal
           showsHorizontalScrollIndicator={false}
           renderItem={() => (
             <View style={styles.skeletonItem}>
               <Skeleton variant="card" />
             </View>
           )}
           keyExtractor={(item) => item.id}
           contentContainerStyle={styles.contentContainer}
         />
       </View>
     </View>
   );
 }


 // Early return for empty data
 if (!data || data.length === 0) {
   return (
     <View style={style.sectionContainer}>
       {SectionHeader}
       <View style={styles.emptyContainer}>
         <Text style={[styles.emptyText, { color: colors.PRIMARYWHITE }]}>
           No {title.toLowerCase()} available
         </Text>
       </View>
     </View>
   );
 }


 return (
   <View style={style.sectionContainer}>
     {SectionHeader}
     <FlatList
       data={data}
       horizontal
       renderItem={renderItemWrapper}
       // Performance optimizations
       {...optimizedFlatListConfig}
       // Enhanced scroll behavior
       decelerationRate="fast"
       snapToInterval={isLargeDevice ? width * 0.35 : width * 0.4}
       snapToAlignment="start"
       snapToOffsets={data.map((_, index) => index * (isLargeDevice ? width * 0.35 : width * 0.4))}
       // Better rendering
       initialNumToRender={isLargeDevice ? 4 : 3}
       maxToRenderPerBatch={isLargeDevice ? 4 : 3}
       windowSize={8}
       removeClippedSubviews={true}
       // Enhanced user experience
       contentContainerStyle={styles.contentContainer}
       showsHorizontalScrollIndicator={false}
       // Smooth scrolling
       scrollEventThrottle={16}
       // Memory optimization
       maintainVisibleContentPosition={{
         minIndexForVisible: 0,
         autoscrollToTopThreshold: 10,
       }}
       // Accessibility
       accessibilityLabel={`${title} content list`}
       accessibilityHint={`Scroll horizontally to view more ${title.toLowerCase()}`}
     />
   </View>
 );
};


const styles = StyleSheet.create({
 contentContainer: {
   paddingHorizontal: 10,
 },
 skeletonContainer: {
   paddingVertical: 10,
 },
 skeletonItem: {
   marginHorizontal: 5,
 },
 emptyContainer: {
   height: 120,
   justifyContent: 'center',
   alignItems: 'center',
   paddingHorizontal: 20,
 },
 emptyText: {
   fontSize: 14,
   opacity: 0.7,
   textAlign: 'center',
 },
});


export default TopContentSection; 