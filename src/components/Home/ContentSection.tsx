import React, { useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { theme } from '../../theme';
import { useOptimizedFlatList } from '../../hooks/useHomeScreenOptimization';
import Skeleton from '../Skeleton';

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

const { width } = Dimensions.get('window');

const ContentSection: React.FC<ContentSectionProps> = ({
  title,
  data,
  onSeeAll,
  renderItem,
  loadingStates,
  style,
  isLargeDevice,
  appFonts,
  columns,
  colors,
}) => {
  // Memoized optimized FlatList config
  const optimizedFlatListConfig = useOptimizedFlatList(data?.length || 0);

  // Calculate item width for 2 items per row
  const itemWidth = useMemo(() => (width - 48) / 2, [width]); // 48 = padding (16) + gap between items (16)
  const itemSpacing = 16;

  // Memoized key extractor for stable keys
  const keyExtractor = useCallback((item: any, index: number) => {
    return item.id || item._id || `item-${index}`;
  }, []);

  // Memoized render item wrapper for better performance
  const renderItemWrapper = useCallback((props: any) => {
    return renderItem(props);
  }, [renderItem]);

  // Memoized item layout for better performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemWidth + itemSpacing,
    offset: (itemWidth + itemSpacing) * Math.floor(index / 2),
    index,
  }), [itemWidth, itemSpacing]);

  // Memoized section header for better performance
  const SectionHeader = useMemo(() => (
    <View style={style.sectionHeader}>
      <Text style={style.heading}>{title}</Text>
      {onSeeAll && (
        <Text 
          style={[style.txt, { opacity: loadingStates?.content ? 0.5 : 1 }]} 
          onPress={onSeeAll}
          disabled={loadingStates?.content}
        >
          See All
        </Text>
      )}
    </View>
  ), [title, onSeeAll, style.sectionHeader, style.heading, style.txt, loadingStates?.content]);

  // Memoized column wrapper style
  const columnWrapperStyle = useMemo(() => ({
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    marginBottom: itemSpacing
  }), [itemSpacing]);

  // Show skeleton loader when loading
  if (loadingStates?.content || loadingStates?.contentList) {
    return (
      <View style={style.sectionContainer}>
        {SectionHeader}
        <View style={styles.skeletonContainer}>
          <FlatList
            data={Array.from({ length: 12 }, (_, i) => ({ id: `skeleton-${i}` }))}
            numColumns={2}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            renderItem={() => (
              <View style={styles.skeletonItem}>
                <Skeleton variant="masonry" />
              </View>
            )}
            keyExtractor={(item) => item.id}
            columnWrapperStyle={columnWrapperStyle}
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
        numColumns={2} // Show 2 items per row
        horizontal={false} // Vertical layout
        renderItem={renderItemWrapper}
        // Performance optimizations
        {...optimizedFlatListConfig}
        // Better rendering
        initialNumToRender={isLargeDevice ? 8 : 6} // Show more items on large devices
        maxToRenderPerBatch={isLargeDevice ? 8 : 6} // Render more items per batch on large devices
        windowSize={10} // Keep 10 items in memory
        removeClippedSubviews={true}
        // Layout optimizations
        columnWrapperStyle={columnWrapperStyle}
        contentContainerStyle={styles.contentContainer}
        // Enhanced user experience
        showsVerticalScrollIndicator={false}
        // Smooth scrolling
        scrollEventThrottle={16}
        // Memory optimization
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        // Accessibility
        accessibilityLabel={`${title} content grid`}
        accessibilityHint={`Grid layout with ${columns} items per row`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
  skeletonContainer: {
    paddingVertical: 10,
  },
  skeletonItem: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 10,
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

export default ContentSection; 