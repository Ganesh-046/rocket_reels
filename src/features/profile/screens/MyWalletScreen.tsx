import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Hooks and context
import { useTheme } from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';
import { useAuthUser } from '../../../store/auth.store';

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

const MyWalletScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  
  // State
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      getUserBalance();
    }
  }, [user?._id]);

  // API Functions
  const getUserBalance = async () => {
    try {
      setLoading(true);
      console.log('💰 Fetching wallet balance for:', user?._id);
      const response = await apiService.getBalance(user?._id || '');
      console.log('💳 Wallet balance response:', response);
      
      if (response.status === 200 && response.data) {
        setBalanceData(response.data);
        console.log('✅ Wallet balance set:', response.data);
      } else {
        console.warn('⚠️ Wallet balance response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get balance error:', error);
      Alert.alert('Error', 'Failed to load wallet balance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>My Wallet</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderBalanceCard = () => (
    <View style={style.balanceCard}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={style.balanceGradient}
      >
        <View style={style.balanceHeader}>
          <View style={style.balanceInfo}>
            <FontAwesome5 name="coins" size={isLargeDevice ? width * 0.04 : width * 0.06} color="#FFD700" />
            <Text style={style.balanceLabel}>Current Balance</Text>
          </View>
          <TouchableOpacity
            style={style.refreshButton}
            onPress={getUserBalance}
          >
            <Icon name="refresh" size={isLargeDevice ? width * 0.025 : width * 0.035} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <Text style={style.balanceAmount}>
          {balanceData?.coinsQuantity?.totalCoins || 
           balanceData?.balance || 
           balanceData?.totalCoins || 
           0}
        </Text>
        
        <Text style={style.balanceCurrency}>Coins</Text>
      </LinearGradient>
    </View>
  );

  const renderQuickActions = () => (
    <View style={style.quickActionsContainer}>
      <Text style={style.sectionTitle}>Quick Actions</Text>
      
      <View style={style.actionsGrid}>
        <TouchableOpacity
          style={style.actionCard}
          onPress={() => navigation.navigate('Refill')}
        >
          <LinearGradient
            colors={['#E9743A', '#CB2D4D']}
            style={style.actionGradient}
          >
            <FontAwesome5 name="diamond-stone" size={isLargeDevice ? width * 0.04 : width * 0.06} color="#ffffff" />
            <Text style={style.actionTitle}>Recharge</Text>
            <Text style={style.actionSubtitle}>Add more coins</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={style.actionCard}
          onPress={() => navigation.navigate('Transaction')}
        >
          <LinearGradient
            colors={['#4CAF50', '#45A049']}
            style={style.actionGradient}
          >
            <Icon name="receipt" size={isLargeDevice ? width * 0.04 : width * 0.06} color="#ffffff" />
            <Text style={style.actionTitle}>History</Text>
            <Text style={style.actionSubtitle}>View transactions</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={style.actionCard}
          onPress={() => navigation.navigate('RewardHistory')}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={style.actionGradient}
          >
            <FontAwesome5 name="gift" size={isLargeDevice ? width * 0.04 : width * 0.06} color="#ffffff" />
            <Text style={style.actionTitle}>Rewards</Text>
            <Text style={style.actionSubtitle}>Earn coins</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={style.actionCard}
          onPress={() => navigation.navigate('Subscription')}
        >
          <LinearGradient
            colors={['#9C27B0', '#7B1FA2']}
            style={style.actionGradient}
          >
            <Icon name="star" size={isLargeDevice ? width * 0.04 : width * 0.06} color="#ffffff" />
            <Text style={style.actionTitle}>VIP</Text>
            <Text style={style.actionSubtitle}>Premium plans</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={style.statsContainer}>
      <Text style={style.sectionTitle}>Statistics</Text>
      
      <View style={style.statsGrid}>
        <View style={style.statCard}>
          <Text style={style.statNumber}>
            {balanceData?.totalEarned || 0}
          </Text>
          <Text style={style.statLabel}>Total Earned</Text>
        </View>
        
        <View style={style.statCard}>
          <Text style={style.statNumber}>
            {balanceData?.totalSpent || 0}
          </Text>
          <Text style={style.statLabel}>Total Spent</Text>
        </View>
        
        <View style={style.statCard}>
          <Text style={style.statNumber}>
            {balanceData?.rechargeCount || 0}
          </Text>
          <Text style={style.statLabel}>Recharges</Text>
        </View>
        
        <View style={style.statCard}>
          <Text style={style.statNumber}>
            {balanceData?.rewardCount || 0}
          </Text>
          <Text style={style.statLabel}>Rewards</Text>
        </View>
      </View>
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={style.scrollContainer}
        >
          {renderBalanceCard()}
          {renderQuickActions()}
          {renderStats()}
        </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  balanceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: isLargeDevice ? width * 0.03 : width * 0.04,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceGradient: {
    padding: isLargeDevice ? width * 0.03 : width * 0.04,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  balanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: isLargeDevice ? 16 : 18,
    color: '#ffffff',
    marginLeft: isLargeDevice ? width * 0.015 : width * 0.02,
    fontWeight: '500',
  },
  refreshButton: {
    width: isLargeDevice ? width * 0.06 : width * 0.08,
    height: isLargeDevice ? width * 0.06 : width * 0.08,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: isLargeDevice ? 48 : 56,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01,
  },
  balanceCurrency: {
    fontSize: isLargeDevice ? 18 : 20,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  quickActionsContainer: {
    marginBottom: isLargeDevice ? width * 0.03 : width * 0.04,
  },
  sectionTitle: {
    fontSize: isLargeDevice ? 20 : 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: isLargeDevice ? width * 0.21 : width * 0.42,
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.02,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionGradient: {
    padding: isLargeDevice ? width * 0.02 : width * 0.025,
    alignItems: 'center',
    minHeight: isLargeDevice ? width * 0.12 : width * 0.15,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.008,
  },
  actionSubtitle: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: isLargeDevice ? width * 0.21 : width * 0.42,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.02,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: isLargeDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.008,
  },
  statLabel: {
    fontSize: isLargeDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default MyWalletScreen; 