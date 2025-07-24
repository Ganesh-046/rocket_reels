import React, { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Dimensions, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Hooks and context
import { useTheme } from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';

// Components
import ActivityLoader from '../../../components/common/ActivityLoader';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

// Mock target audience data - replace with actual API data
const mockTargetData = [
  {
    _id: '1',
    title: 'Kids Content',
    description: 'Safe and educational content for children',
    ageRange: '3-12',
    thumbnail: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=Kids',
    contentCount: 25,
    isActive: true
  },
  {
    _id: '2',
    title: 'Teen Content',
    description: 'Entertaining content for teenagers',
    ageRange: '13-17',
    thumbnail: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=Teens',
    contentCount: 18,
    isActive: true
  },
  {
    _id: '3',
    title: 'Young Adult',
    description: 'Content for young adults',
    ageRange: '18-25',
    thumbnail: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=Young+Adult',
    contentCount: 32,
    isActive: true
  },
  {
    _id: '4',
    title: 'Adult Content',
    description: 'Mature content for adults',
    ageRange: '18+',
    thumbnail: 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=Adult',
    contentCount: 45,
    isActive: false
  },
  {
    _id: '5',
    title: 'Family Content',
    description: 'Content suitable for the whole family',
    ageRange: 'All Ages',
    thumbnail: 'https://via.placeholder.com/150/FFEAA7/000000?text=Family',
    contentCount: 15,
    isActive: true
  },
  {
    _id: '6',
    title: 'Senior Content',
    description: 'Content tailored for seniors',
    ageRange: '50+',
    thumbnail: 'https://via.placeholder.com/150/DDA0DD/FFFFFF?text=Senior',
    contentCount: 12,
    isActive: true
  }
];

const TargetAudienceScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  
  // State
  const [loading, setLoading] = useState(false);
  const [targetData, setTargetData] = useState(mockTargetData);
  const [isAdult, setIsAdult] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const renderTargetCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        style={[
          style.targetCard,
          { 
            width: isLargeDevice ? width * 0.22 : width * 0.28,
            marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
            marginRight: index % (isLargeDevice ? 4 : 3) === (isLargeDevice ? 3 : 2) ? 0 : isLargeDevice ? width * 0.01 : width * 0.02
          }
        ]}
        onPress={() => {
          // Navigate to content list for this target audience
          navigation.navigate('ContentList', { 
            targetAudience: item.title,
            ageRange: item.ageRange,
            contentCount: item.contentCount
          });
        }}
        disabled={!item.isActive}
      >
        <LinearGradient
          colors={item.isActive ? ['#A07A64', '#5E4536'] : ['#666666', '#444444']}
          style={style.cardGradient}
        >
          <View style={style.cardHeader}>
            <Text style={style.ageRange}>{item.ageRange}</Text>
            {!item.isActive && (
              <View style={style.lockIcon}>
                <Icon name="lock" size={16} color="#ffffff" />
              </View>
            )}
          </View>
          
          <View style={style.cardContent}>
            <Text style={style.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={style.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={style.contentCount}>
              <Icon name="play-circle-outline" size={16} color="#ffffff" />
              <Text style={style.countText}>{item.contentCount} videos</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>Tailored Content for Every Age</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={style.emptyContainer}>
      <Icon name="category" size={80} color="rgba(255, 255, 255, 0.5)" />
      <Text style={style.emptyTitle}>No content found</Text>
      <Text style={style.emptySubtitle}>
        We're working on adding more tailored content for your age group.
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
          key={isLargeDevice ? 4 : 3}
          numColumns={isLargeDevice ? 4 : 3}
          showsVerticalScrollIndicator={false}
          data={targetData}
          keyExtractor={(item, index) => item._id.toString() || index.toString()}
          renderItem={renderTargetCard}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={style.listContainer}
          columnWrapperStyle={isLargeDevice ? undefined : style.rowContainer}
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
  rowContainer: {
    justifyContent: 'space-between',
  },
  targetCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    minHeight: isLargeDevice ? width * 0.25 : width * 0.35,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  ageRange: {
    fontSize: isLargeDevice ? 12 : 14,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lockIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01,
    lineHeight: isLargeDevice ? 18 : 20,
  },
  cardDescription: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
    lineHeight: isLargeDevice ? 14 : 16,
  },
  contentCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: isLargeDevice ? 10 : 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 4,
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

export default TargetAudienceScreen; 