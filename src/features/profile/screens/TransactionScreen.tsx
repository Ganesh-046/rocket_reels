import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

const TransactionScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  
  // State
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successfulTransactions: 0,
    failedTransactions: 0
  });

  useEffect(() => {
    if (user?._id) {
      getTransactionHistory();
    }
  }, [user?._id]);

  // API Functions
  const getTransactionHistory = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching transaction history for:', user?._id);
      const response = await apiService.getRechargeHistory(user?._id || '');
      console.log('📊 Transaction history response:', response);
      
      if (response.status === 200 && response.data) {
        setTransactionHistory(response.data);
        calculateStats(response.data);
        console.log('✅ Transaction history set:', response.data);
      } else {
        console.warn('⚠️ Transaction history response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get transaction history error:', error);
      Alert.alert('Error', 'Failed to load transaction history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactions: any[]) => {
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const successfulTransactions = transactions.filter(tx => tx.status === 'completed').length;
    const failedTransactions = transactions.filter(tx => tx.status === 'failed').length;

    setStats({
      totalTransactions,
      totalAmount,
      successfulTransactions,
      failedTransactions
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
      case 'cancelled':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <Icon name="check-circle" size={16} color="#4CAF50" />;
      case 'pending':
        return <Icon name="schedule" size={16} color="#FF9800" />;
      case 'failed':
      case 'cancelled':
        return <Icon name="error" size={16} color="#F44336" />;
      default:
        return <Icon name="help" size={16} color="#9E9E9E" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'apple_pay':
        return <FontAwesome5 name="apple-pay" size={16} color="#000000" />;
      case 'google_pay':
        return <FontAwesome5 name="google-pay" size={16} color="#000000" />;
      case 'card':
        return <Icon name="credit-card" size={16} color="#000000" />;
      case 'upi':
        return <MaterialCommunityIcons name="bank" size={16} color="#000000" />;
      default:
        return <Icon name="payment" size={16} color="#000000" />;
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

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>Transaction History</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderStats = () => (
    <View style={style.statsContainer}>
      <View style={style.statCard}>
        <Text style={style.statNumber}>{stats.totalTransactions}</Text>
        <Text style={style.statLabel}>Total</Text>
      </View>
      <View style={style.statCard}>
        <Text style={style.statNumber}>₹{stats.totalAmount}</Text>
        <Text style={style.statLabel}>Amount</Text>
      </View>
      <View style={style.statCard}>
        <Text style={style.statNumber}>{stats.successfulTransactions}</Text>
        <Text style={style.statLabel}>Success</Text>
      </View>
      <View style={style.statCard}>
        <Text style={style.statNumber}>{stats.failedTransactions}</Text>
        <Text style={style.statLabel}>Failed</Text>
      </View>
    </View>
  );

  const renderTransactionCard = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      style={style.transactionCard}
      onPress={() => {
        // Navigate to transaction details if needed
        navigation.navigate('TransactionDetail', { transaction: item });
      }}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={style.cardGradient}
      >
        <View style={style.transactionHeader}>
          <View style={style.transactionInfo}>
            <Text style={style.transactionId}>#{item.transactionId || item._id}</Text>
            <Text style={style.transactionDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={style.statusContainer}>
            {getStatusIcon(item.status)}
            <Text style={[style.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>
        
        <View style={style.transactionDetails}>
          <View style={style.detailRow}>
            <View style={style.paymentMethodContainer}>
              {getPaymentMethodIcon(item.paymentMethod)}
              <Text style={style.paymentMethodText}>
                {item.paymentMethod || 'Unknown'}
              </Text>
            </View>
            <Text style={style.amountText}>₹{item.amount}</Text>
          </View>
          
          {item.description && (
            <Text style={style.descriptionText}>{item.description}</Text>
          )}
          
          {item.coins && (
            <View style={style.coinsContainer}>
              <FontAwesome5 name="coins" size={14} color="#FFD700" />
              <Text style={style.coinsText}>+{item.coins} coins</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={style.emptyContainer}>
      <Icon name="receipt" size={80} color="rgba(255, 255, 255, 0.5)" />
      <Text style={style.emptyTitle}>No transactions found</Text>
      <Text style={style.emptySubtitle}>
        Your transaction history will appear here once you make a purchase.
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
        <>
          {renderStats()}
          <FlatList
            data={transactionHistory}
            renderItem={renderTransactionCard}
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
  transactionCard: {
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
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.02,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionId: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: isLargeDevice ? 12 : 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  transactionDetails: {
    gap: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: isLargeDevice ? width * 0.015 : width * 0.02,
    paddingVertical: isLargeDevice ? width * 0.008 : width * 0.012,
    borderRadius: 16,
  },
  paymentMethodText: {
    fontSize: isLargeDevice ? 12 : 14,
    color: '#ffffff',
    marginLeft: 6,
    fontWeight: '500',
  },
  amountText: {
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  descriptionText: {
    fontSize: isLargeDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: isLargeDevice ? width * 0.015 : width * 0.02,
    paddingVertical: isLargeDevice ? width * 0.008 : width * 0.012,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  coinsText: {
    fontSize: isLargeDevice ? 12 : 14,
    color: '#FFD700',
    marginLeft: 4,
    fontWeight: '600',
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

export default TransactionScreen; 