import React, { useCallback, useContext, useEffect, useState } from 'react';
import { BackHandler, FlatList, View, Dimensions, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Hooks and context
import { useTheme } from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';
import { useAuthUser } from '../../../store/auth.store';

// Components
import ActivityLoader from '../../../components/common/ActivityLoader';
import EmptyMessage from '../../../components/common/EmptyMessage';
import MovieCard from '../../../components/Cards/MovieCard';

// API Service
import apiService from '../../../services/api.service';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      title?: string;
      type?: string;
      item?: {
        slug: string;
        name: string;
      };
    };
  };
}

const MovieListScreen: React.FC<NavigationProps> = ({ route, navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  
  // State
  const [contentData, setContentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pages, setPages] = useState({
    page: 1,
    hasNext: true
  });
  const [columns] = useState(isLargeDevice ? 3 : 2);

  // Mock context data - replace with actual context
  const isAdult = false;
  const subGenreData: any[] = [];
  const genreData: any[] = [];
  const languageData: any[] = [];

  useEffect(() => {
    if (route.params?.item || route.params?.title) {
      onRenderContentList();
    }
  }, [isAdult]);

  const onRenderContentList = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 1,
        limit: 20
      };

      // Set specific parameters based on route params
      if (route.params?.type === 'Target' && route.params?.item?.slug) {
        // For target audience, we might need a different endpoint
        console.log('Target audience filter:', route.params.item.slug);
      } else if (route.params?.type === 'Lng' && route.params?.item?.slug) {
        params.language = route.params.item.slug;
      } else if (route.params?.type === 'Genre' && route.params?.item?.slug) {
        params.genre = route.params.item.slug;
      }

      console.log('🎬 Fetching content list with params:', params);
      const response = await apiService.getContentList(params);
      console.log('🎬 Content list response:', response);
      
      if (response.status === 200 && response.data) {
        setContentData(response.data.result || []);
        setPages(prev => ({ ...prev, page: 1, hasNext: response.data.hasNext || false }));
        console.log('✅ Content list set:', response.data.result?.length, 'items');
      } else {
        console.warn('⚠️ Content list response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get content list error:', error);
      Alert.alert('Error', 'Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContentData = () => {
    if (loading) {
      return [];
    }
    return contentData;
  };

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;

    if (!isNearBottom || !pages.hasNext || loading) return;

    const nextPage = pages.page + 1;
    setPages(prev => ({ ...prev, page: nextPage }));
    
    // Load more content
    loadMoreContent(nextPage);
  }, [pages.page, pages.hasNext, loading]);

  const loadMoreContent = async (page: number) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: 20
      };

      // Set specific parameters based on route params
      if (route.params?.type === 'Target' && route.params?.item?.slug) {
        // For target audience, we might need a different endpoint
        console.log('Target audience filter:', route.params.item.slug);
      } else if (route.params?.type === 'Lng' && route.params?.item?.slug) {
        params.language = route.params.item.slug;
      } else if (route.params?.type === 'Genre' && route.params?.item?.slug) {
        params.genre = route.params.item.slug;
      }

      const response = await apiService.getContentList(params);
      if (response.status === 200) {
        setContentData(prev => [...prev, ...(response.data.result || [])]);
        setPages(prev => ({ ...prev, hasNext: response.data.hasNext || false }));
      }
    } catch (error) {
      console.error('Load more content error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onPressBack = async () => {
    navigation.goBack();
  };

  const onBackHandler = () => {
    navigation.goBack();
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackHandler);
    return () => backHandler.remove();
  }, []);

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={onPressBack}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>
        {route?.params?.title || 'Recommended'}
      </Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={style.emptyContainer}>
      <Icon name="movie" size={80} color="rgba(255, 255, 255, 0.5)" />
      <Text style={style.emptyTitle}>No shows found</Text>
      <Text style={style.emptySubtitle}>
        We couldn't find any shows matching your criteria.
      </Text>
    </View>
  );

  return (
    <LinearGradient 
      start={{ x: 0, y: 0 }} 
      end={{ x: 1, y: 1 }} 
      colors={['#ed9b72', '#7d2537']}
      style={[style.container, { paddingTop: insets.top }]}
    >
      {renderHeader()}
      
      {loading && contentData.length === 0 ? (
        <View style={style.loadingContainer}>
          <ActivityLoader loaderColor={colors.PRIMARYWHITE} />
        </View>
      ) : (
        <FlatList
          key={columns}
          numColumns={columns}
          data={renderContentData()}
          renderItem={({ item, index }) => (
            <MovieCard 
              key={index} 
              item={item} 
              index={index} 
              navigation={navigation} 
            />
          )}
          ListEmptyComponent={renderEmptyComponent}
          keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          contentContainerStyle={style.listContainer}
          columnWrapperStyle={style.columnWrapper}
        />
      )}
    </LinearGradient>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.TRANSPARENT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  backButton: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
    height: isLargeDevice ? width * 0.08 : width * 0.12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  headerSpacer: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: isLargeDevice ? width * 0.04 : width * 0.08,
    minHeight: height * 0.6,
  },
  emptyTitle: {
    fontSize: isLargeDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: isLargeDevice ? width * 0.02 : width * 0.04,
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  emptySubtitle: {
    fontSize: isLargeDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: isLargeDevice ? 20 : 24,
  },
});

export default MovieListScreen; 