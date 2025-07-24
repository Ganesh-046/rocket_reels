import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, Dimensions, TouchableOpacity, Text, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Hooks and context
import { useAuthUser } from '../../../store/auth.store';
import { useTheme } from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';

// Components
import ActivityLoader from '../../../components/common/ActivityLoader';

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

const RewardCoinHistoryScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  
  // State
  const [loading, setLoading] = useState(false);
  const [rewardCoinHistoryData, setRewardCoinHistoryData] = useState<any[]>([]);

  useEffect(() => {
    if (user?._id) {
      getRewardCoinHistory();
    }
  }, [user?._id]);

  // API Functions
  const getRewardCoinHistory = async () => {
    try {
      setLoading(true);
      console.log('🎁 Fetching reward history for:', user?._id);
      const response = await apiService.getRewardHistory(user?._id || '');
      console.log('🎁 Reward history response:', response);
      
      if (response.status === 200 && response.data) {
        setRewardCoinHistoryData(response.data);
        console.log('✅ Reward history set:', response.data);
      } else {
        console.warn('⚠️ Reward history response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get reward coin history error:', error);
      Alert.alert('Error', 'Failed to load reward history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRewardIcon = (iconName: string) => {
    const iconSize = isLargeDevice ? width * 0.04 : width * 0.06;
    switch (iconName) {
      case 'calendar-check':
        return <Icon name="event-available" size={iconSize} color="#4CAF50" />;
      case 'play-circle':
        return <Icon name="play-circle-outline" size={iconSize} color="#2196F3" />;
      case 'account-plus':
        return <Icon name="person-add" size={iconSize} color="#FF9800" />;
      case 'crown':
        return <FontAwesome5 name="crown" size={iconSize} color="#FFD700" />;
      case 'check-circle':
        return <Icon name="check-circle" size={iconSize} color="#4CAF50" />;
      case 'trophy':
        return <FontAwesome5 name="trophy" size={iconSize} color="#FF6B6B" />;
      case 'star':
        return <Icon name="star" size={iconSize} color="#FFD700" />;
      default:
        return <Icon name="monetization-on" size={iconSize} color="#4CAF50" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRewardCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        style={style.rewardCard}
        onPress={() => {
          // Navigate to reward details if needed
          navigation.navigate('RewardDetail', { reward: item });
        }}
      >
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={style.cardGradient}
        >
          <View style={style.cardHeader}>
            <View style={style.iconContainer}>
              {getRewardIcon(item.icon || item.type)}
            </View>
            <View style={style.rewardInfo}>
              <Text style={style.rewardDescription} numberOfLines={2}>
                {item.description || item.benefitTitle}
              </Text>
              <Text style={style.rewardDate}>{formatDate(item.date || item.createdAt)}</Text>
            </View>
            <View style={style.amountContainer}>
              <FontAwesome5 name="coins" size={16} color="#FFD700" />
              <Text style={style.amountText}>+{item.amount || item.coins}</Text>
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
      <Text style={style.headerTitle}>Reward Coin History</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={style.emptyContainer}>
      <FontAwesome5 name="coins" size={80} color="rgba(255, 255, 255, 0.5)" />
      <Text style={style.emptyTitle}>No reward history found</Text>
      <Text style={style.emptySubtitle}>
        Your reward coin history will appear here once you start earning rewards.
      </Text>
    </View>
  );

  const renderStats = () => {
    const totalRewards = rewardCoinHistoryData.reduce((sum, item) => sum + (item.amount || item.coins || 0), 0);
    const todayRewards = rewardCoinHistoryData.filter(item => {
      const today = new Date().toDateString();
      const itemDate = new Date(item.date || item.createdAt).toDateString();
      return today === itemDate;
    }).reduce((sum, item) => sum + (item.amount || item.coins || 0), 0);
    const thisWeekRewards = rewardCoinHistoryData.filter(item => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(item.date || item.createdAt) >= oneWeekAgo;
    }).reduce((sum, item) => sum + (item.amount || item.coins || 0), 0);

    return (
      <View style={style.statsContainer}>
        <View style={style.statCard}>
          <Text style={style.statNumber}>
            {totalRewards}
          </Text>
          <Text style={style.statLabel}>Total Earned</Text>
        </View>
        <View style={style.statCard}>
          <Text style={style.statNumber}>
            {todayRewards}
          </Text>
          <Text style={style.statLabel}>Today</Text>
        </View>
        <View style={style.statCard}>
          <Text style={style.statNumber}>
            {thisWeekRewards}
          </Text>
          <Text style={style.statLabel}>This Week</Text>
        </View>
      </View>
    );
  };

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
        <>
          {renderStats()}
          <FlatList
            data={rewardCoinHistoryData}
            renderItem={renderRewardCard}
            ListEmptyComponent={renderEmptyComponent}
            keyExtractor={(item, index) => item._id?.toString() || index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={style.listContainer}
          />
        </>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    marginHorizontal: isLargeDevice ? width * 0.005 : width * 0.01,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  rewardCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.02,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardGradient: {
    padding: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
    height: isLargeDevice ? width * 0.08 : width * 0.12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isLargeDevice ? width * 0.015 : width * 0.02,
  },
  rewardInfo: {
    flex: 1,
    marginRight: isLargeDevice ? width * 0.015 : width * 0.02,
  },
  rewardDescription: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: isLargeDevice ? 18 : 20,
  },
  rewardDate: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: isLargeDevice ? width * 0.015 : width * 0.02,
    paddingVertical: isLargeDevice ? width * 0.008 : width * 0.012,
    borderRadius: 16,
  },
  amountText: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#FFD700',
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

export default RewardCoinHistoryScreen; 