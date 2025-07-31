import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import TrailerList from '../components/TrailerList';
import { useTrailerList } from '../hooks/useTrailerList';
import { Trailer } from '../types/trailer.types';

interface TrailerScreenProps {
  navigation: any;
}

const TrailerScreen: React.FC<TrailerScreenProps> = ({ navigation }) => {
  const {
    trailers,
    isLoading,
    hasError,
    errorMessage,
    hasMore,
    refreshing,
    loadMore,
    refresh,
  } = useTrailerList();

  const handleTrailerPress = (trailer: Trailer) => {
    navigation.navigate('TrailerDetail', { trailer });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <TrailerList
        trailers={trailers}
        onTrailerPress={handleTrailerPress}
        onLoadMore={loadMore}
        onRefresh={refresh}
        refreshing={refreshing}
        loading={isLoading}
        hasMore={hasMore}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default TrailerScreen; 