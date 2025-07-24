import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Dimensions, Text, TouchableOpacity, Alert } from 'react-native';
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
import GenreCard from '../../../components/Cards/GenreCard';

// API Service
import apiService from '../../../services/api.service';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const GenreScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  
  // State
  const [genreData, setGenreData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [columns] = useState(isLargeDevice ? 4 : 2);

  useEffect(() => {
    getGenres();
  }, []);

  // API Functions
  const getGenres = async () => {
    try {
      setLoading(true);
      console.log('🎭 Fetching genres...');
      const response = await apiService.getGenres();
      console.log('🎭 Genres response:', response);
      
      if (response.status === 200 && response.data) {
        setGenreData(response.data);
        console.log('✅ Genres set:', response.data);
      } else {
        console.warn('⚠️ Genres response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get genres error:', error);
      Alert.alert('Error', 'Failed to load genres. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter out manually added genres ("All" and "Upcoming") to show only dynamic genres
  const dynamicGenres = genreData?.filter(genre => 
    genre.slug !== 'all' && genre.slug !== 'upcoming'
  ) || [];

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>Genres</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={style.emptyContainer}>
      <Icon name="category" size={80} color="rgba(255, 255, 255, 0.5)" />
      <Text style={style.emptyTitle}>No genres found</Text>
      <Text style={style.emptySubtitle}>
        We couldn't find any genres at the moment.
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
      
      {loading ? (
        <View style={style.loadingContainer}>
          <ActivityLoader loaderColor={colors.PRIMARYWHITE} />
        </View>
      ) : (
        <FlatList
          key={isLargeDevice ? 4 : 2}
          numColumns={isLargeDevice ? 4 : 2}
          data={dynamicGenres}
          horizontal={false}
          renderItem={({ item, index }) => (
            <GenreCard 
              key={index} 
              item={item} 
              index={index} 
              navigation={navigation} 
            />
          )}
          ListEmptyComponent={renderEmptyComponent}
          keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
          showsVerticalScrollIndicator={false}
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

export default GenreScreen; 