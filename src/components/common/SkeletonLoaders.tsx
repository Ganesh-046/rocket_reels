import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Skeleton, { 
  BannerSkeleton, 
  MovieCardSkeleton, 
  TopContentSkeleton, 
  GenreTabSkeleton,
  MasonryCardSkeleton 
} from '../Skeleton';

const { width: screenWidth } = Dimensions.get('window');

// Netflix-style section skeleton
export const SectionSkeleton = ({ title = true, horizontal = true, numItems = 6 }: {
  title?: boolean;
  horizontal?: boolean;
  numItems?: number;
}) => (
  <View style={styles.sectionContainer}>
    {title && (
      <View style={styles.sectionHeader}>
        <Skeleton variant="text" width="40%" height={20} borderRadius={4} />
        <Skeleton variant="text" width="15%" height={16} borderRadius={4} />
      </View>
    )}
    <View style={[styles.sectionContent, horizontal && styles.horizontalContent]}>
      {Array.from({ length: numItems }).map((_, index) => (
        <View key={index} style={horizontal ? styles.horizontalItem : styles.gridItem}>
          <MovieCardSkeleton />
        </View>
      ))}
    </View>
  </View>
);

// Netflix-style masonry skeleton
export const MasonrySkeleton = () => (
  <View style={styles.masonryContainer}>
    <View style={styles.masonryColumn}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={`left-${index}`} style={styles.masonryItem}>
          <MasonryCardSkeleton />
        </View>
      ))}
    </View>
    <View style={styles.masonryColumn}>
      {Array.from({ length: 6 }).map((_, index) => (
        <View key={`right-${index}`} style={styles.masonryItem}>
          <MasonryCardSkeleton />
        </View>
      ))}
    </View>
  </View>
);

// Netflix-style top content skeleton
export const TopContentSectionSkeleton = () => (
  <View style={styles.sectionContainer}>
    <View style={styles.sectionHeader}>
      <Skeleton variant="text" width="40%" height={20} borderRadius={4} />
      <Skeleton variant="text" width="15%" height={16} borderRadius={4} />
    </View>
    <View style={styles.horizontalContent}>
      {Array.from({ length: 10 }).map((_, index) => (
        <View key={index} style={styles.horizontalItem}>
          <TopContentSkeleton />
        </View>
      ))}
    </View>
  </View>
);

// Netflix-style genre tabs skeleton
export const GenreTabsSkeleton = () => (
  <View style={styles.genreTabsContainer}>
    {Array.from({ length: 8 }).map((_, index) => (
      <View key={index} style={styles.genreTabItem}>
        <GenreTabSkeleton />
      </View>
    ))}
  </View>
);

// Netflix-style full home page skeleton
export const HomePageSkeleton = () => (
  <View style={styles.homePageContainer}>
    {/* Header with genre tabs */}
    <View style={styles.headerContainer}>
      <GenreTabsSkeleton />
      <View style={styles.searchButton}>
        <Skeleton variant="avatar" />
      </View>
    </View>

    {/* Banner */}
    <BannerSkeleton />

    {/* Top 10 Shows */}
    <TopContentSectionSkeleton />

    {/* All Shows */}
    <SectionSkeleton title={true} horizontal={false} numItems={6} />
  </View>
);

// Netflix-style category page skeleton
export const CategoryPageSkeleton = () => (
  <View style={styles.categoryPageContainer}>
    {/* Header */}
    <View style={styles.headerContainer}>
      <GenreTabsSkeleton />
      <View style={styles.searchButton}>
        <Skeleton variant="avatar" />
      </View>
    </View>

    {/* Masonry Layout */}
    <MasonrySkeleton />
  </View>
);

const styles = StyleSheet.create({
  homePageContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  categoryPageContainer: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchButton: {
    marginLeft: 12,
  },
  genreTabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    flex: 1,
  },
  genreTabItem: {
    marginRight: 8,
  },
  sectionContainer: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  horizontalContent: {
    flexDirection: 'row',
  },
  horizontalItem: {
    marginRight: 8,
  },
  gridItem: {
    marginBottom: 8,
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  masonryColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  masonryItem: {
    marginBottom: 10,
  },
}); 