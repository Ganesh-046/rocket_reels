import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

// Dummy coin packages
const coinPackages = [
  {
    id: '1',
    coins: 100,
    price: 10,
    originalPrice: 15,
    discount: 33,
    popular: false,
  },
  {
    id: '2',
    coins: 250,
    price: 20,
    originalPrice: 30,
    discount: 33,
    popular: true,
  },
  {
    id: '3',
    coins: 500,
    price: 35,
    originalPrice: 50,
    discount: 30,
    popular: false,
  },
  {
    id: '4',
    coins: 1000,
    price: 60,
    originalPrice: 100,
    discount: 40,
    popular: false,
  },
  {
    id: '5',
    coins: 2500,
    price: 120,
    originalPrice: 200,
    discount: 40,
    popular: false,
  },
  {
    id: '6',
    coins: 5000,
    price: 200,
    originalPrice: 350,
    discount: 43,
    popular: false,
  },
];

const RefillScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = (packageId: string) => {
    const selected = coinPackages.find(pkg => pkg.id === packageId);
    if (!selected) return;

    Alert.alert(
      'Confirm Purchase',
      `Buy ${selected.coins} coins for ₹${selected.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            // Handle payment processing
            Alert.alert('Success', 'Coins added to your wallet!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderPackage = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.packageCard,
        selectedPackage === item.id && styles.selectedPackage,
        item.popular && styles.popularPackage,
      ]}
      onPress={() => setSelectedPackage(item.id)}
    >
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <View style={styles.packageHeader}>
        <Text style={styles.coinAmount}>{item.coins}</Text>
        <Text style={styles.coinLabel}>coins</Text>
      </View>

      <View style={styles.packagePricing}>
        <Text style={styles.currentPrice}>₹{item.price}</Text>
        <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}% OFF</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.purchaseButton,
          selectedPackage === item.id && styles.selectedPurchaseButton,
        ]}
        onPress={() => handlePurchase(item.id)}
      >
        <Text style={[
          styles.purchaseButtonText,
          selectedPackage === item.id && styles.selectedPurchaseButtonText,
        ]}>
          Buy Now
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buy Coins</Text>
          <TouchableOpacity
            style={styles.walletButton}
            onPress={() => navigation.navigate('MyWallet')}
          >
            <Icon name="account-balance-wallet" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="info" size={24} color="#ffffff" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoText}>
                Purchase coins to unlock premium content, rent movies, and access exclusive features.
              </Text>
            </View>
          </View>
        </View>

        {/* Coin Packages */}
        <View style={styles.packagesSection}>
          <Text style={styles.sectionTitle}>Choose a Package</Text>
          <FlatList
            data={coinPackages}
            renderItem={renderPackage}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.packageRow}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity style={styles.paymentMethod}>
              <Icon name="credit-card" size={24} color="#ffffff" />
              <Text style={styles.paymentMethodText}>Credit/Debit Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentMethod}>
              <Icon name="account-balance" size={24} color="#ffffff" />
              <Text style={styles.paymentMethodText}>Net Banking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentMethod}>
              <Icon name="account-balance-wallet" size={24} color="#ffffff" />
              <Text style={styles.paymentMethodText}>UPI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentMethod}>
              <Icon name="payment" size={24} color="#ffffff" />
              <Text style={styles.paymentMethodText}>Digital Wallets</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By purchasing coins, you agree to our Terms of Service and Privacy Policy.
            Coins are non-refundable and expire after 1 year.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  walletButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  packagesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  packageRow: {
    justifyContent: 'space-between',
  },
  packageCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
  },
  selectedPackage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#ed9b72',
  },
  popularPackage: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  packageHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  coinAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coinLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  packagePricing: {
    alignItems: 'center',
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  originalPrice: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  purchaseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  selectedPurchaseButton: {
    backgroundColor: '#ed9b72',
  },
  purchaseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  selectedPurchaseButtonText: {
    color: '#ffffff',
  },
  paymentSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentMethod: {
    width: (width - 60) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: '600',
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  termsText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default RefillScreen; 