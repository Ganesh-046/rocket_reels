import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

// Mock wallet data
const mockWalletData = {
  balance: 1250,
  totalEarned: 2500,
  totalSpent: 1250,
  recentTransactions: [
    { id: '1', type: 'earned', amount: 50, description: 'Daily Check-in', date: 'Today' },
    { id: '2', type: 'spent', amount: 20, description: 'Episode Unlock', date: 'Yesterday' },
    { id: '3', type: 'earned', amount: 100, description: 'Referral Bonus', date: '2 days ago' },
  ]
};

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const MyWalletScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const renderTransactionItem = (item: any) => (
    <View key={item.id} style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Icon 
          name={item.type === 'earned' ? 'add-circle' : 'remove-circle'} 
          size={20} 
          color={item.type === 'earned' ? '#4CAF50' : '#F44336'} 
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount, 
        { color: item.type === 'earned' ? '#4CAF50' : '#F44336' }
      ]}>
        {item.type === 'earned' ? '+' : '-'}{item.amount}
      </Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <FontAwesome5 name="coins" size={32} color="#ffffff" />
            <Text style={styles.balanceTitle}>Current Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{mockWalletData.balance}</Text>
          <Text style={styles.balanceLabel}>coins</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.statAmount}>{mockWalletData.totalEarned}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="trending-down" size={24} color="#F44336" />
            <Text style={styles.statAmount}>{mockWalletData.totalSpent}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Refill')}
            >
              <LinearGradient
                colors={['#E9743A', '#CB2D4D']}
                style={styles.actionGradient}
              >
                <FontAwesome5 name="diamond-stone" size={24} color="#ffffff" />
                <Text style={styles.actionText}>Load Coins</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Transaction')}
            >
              <View style={styles.actionButtonSecondary}>
                <Icon name="receipt-long" size={24} color="#ffffff" />
                <Text style={styles.actionText}>History</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {mockWalletData.recentTransactions.map(renderTransactionItem)}
        </View>

        {/* How to Earn */}
        <View style={styles.earnContainer}>
          <Text style={styles.sectionTitle}>How to Earn Coins</Text>
          <View style={styles.earnMethods}>
            <View style={styles.earnMethod}>
              <Icon name="schedule" size={20} color="#E9743A" />
              <Text style={styles.earnText}>Daily Check-in</Text>
            </View>
            <View style={styles.earnMethod}>
              <Icon name="people" size={20} color="#E9743A" />
              <Text style={styles.earnText}>Refer Friends</Text>
            </View>
            <View style={styles.earnMethod}>
              <Icon name="play-circle" size={20} color="#E9743A" />
              <Text style={styles.earnText}>Watch Ads</Text>
            </View>
            <View style={styles.earnMethod}>
              <Icon name="card-giftcard" size={20} color="#E9743A" />
              <Text style={styles.earnText}>Special Offers</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceTitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginLeft: 8,
  },
  balanceAmount: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statAmount: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transactionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDate: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  earnContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  earnMethods: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  earnMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  earnText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 12,
  },
});

export default MyWalletScreen; 