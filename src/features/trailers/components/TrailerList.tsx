import React from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Text,
} from 'react-native';
import TrailerCard from './TrailerCard';
import { TrailerListProps, Trailer } from '../types/trailer.types';

const TrailerList: React.FC<TrailerListProps> = ({
  trailers,
  onTrailerPress,
  onLoadMore,
  onRefresh,
  refreshing = false,
  loading = false,
  hasMore = false,
  style,
}) => {
  const renderTrailer = ({ item }: { item: Trailer }) => (
    <TrailerCard
      trailer={item}
      onPress={onTrailerPress}
      onLike={(trailerId) => {
        // Handle like action
        console.log('Like trailer:', trailerId);
      }}
      onShare={(trailer) => {
        // Handle share action
        console.log('Share trailer:', trailer.title);
      }}
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#ff4757" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>No trailers found</Text>
    </View>
  );

  const handleEndReached = () => {
    if (hasMore && !loading) {
      onLoadMore?.();
    }
  };

  return (
    <FlatList
      data={trailers}
      renderItem={renderTrailer}
      keyExtractor={(item) => item._id}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#ff4757"
          colors={["#ff4757"]}
        />
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TrailerList; 