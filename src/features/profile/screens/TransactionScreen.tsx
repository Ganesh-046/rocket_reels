import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

// Mock transaction data
const mockTransactionData = [
  {
    id: '1',
    type: 'credit',
    amount: 50,
    description: 'Daily Check-in Bonus',
    date: '2024-01-15',
    time: '09:30 AM',
    status: 'completed',
  },
  {
    id: '2',
    type: 'debit',
    amount: 20,
    description: 'Episode Unlock',
    date: '2024-01-14',
    time: '08:15 PM',
    status: 'completed',
  },
  {
    id: '3',
    type: 'credit',
    amount: 100,
    description: 'Referral Bonus',
    date: '2024-01-13',
    time: '02:45 PM',
    status: 'completed',
  },
  {
    id: '4',
    type: 'debit',
    amount: 30,
    description: 'Premium Content Access',
    date: '2024-01-12',
    time: '11:20 AM',
    status: 'completed',
  },
  {
    id: '5',
    type: 'credit',
    amount: 25,
    description: 'Ad Watch Reward',
    date: '2024-01-11',
    time: '07:30 PM',
    status: 'completed',
  },
  {
    id: '6',
    type: 'debit',
    amount: 15,
    description: 'Special Episode',
    date: '2024-01-10',
    time: '10:15 AM',
    status: 'completed',
  },
];

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const TransactionScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const renderTransactionItem = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Icon 
          name={item.type === 'credit' ? 'add-circle' : 'remove-circle'} 
          size={24} 
          color={item.type === 'credit' ? '#4CAF50' : '#F44336'} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date} • {item.time}</Text>
      </View>
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText, 
          { color: item.type === 'credit' ? '#4CAF50' : '#F44336' }
        ]}>
          {item.type === 'credit' ? '+' : '-'}{item.amount}
        </Text>
        <Text style={styles.amountLabel}>coins</Text>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="receipt-long" size={64} color="rgba(255, 255, 255, 0.6)" />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyMessage}>
        Your transaction history will appear here once you start using coins
      </Text>
    </View>
  );

  const getTotalBalance = () => {
    return mockTransactionData.reduce((total, transaction) => {
      if (transaction.type === 'credit') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={styles.container}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{getTotalBalance()} coins</Text>
      </View>

      {/* Transactions List */}
      <FlatList
        data={mockTransactionData}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyState}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  amountLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TransactionScreen; 