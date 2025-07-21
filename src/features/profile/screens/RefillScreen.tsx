import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

// Mock recharge plans
const mockRechargePlans = [
  { id: '1', coins: 100, price: 0.99, popular: false },
  { id: '2', coins: 250, price: 1.99, popular: true },
  { id: '3', coins: 500, price: 3.99, popular: false },
  { id: '4', coins: 1000, price: 6.99, popular: false },
  { id: '5', coins: 2500, price: 14.99, popular: false },
  { id: '6', coins: 5000, price: 24.99, popular: false },
];

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const RefillScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handlePurchase = (plan: any) => {
    Alert.alert(
      'Purchase Confirmation',
      `Are you sure you want to purchase ${plan.coins} coins for $${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => {
            Alert.alert('Success', 'Purchase completed successfully!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderPlanCard = (plan: any) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        selectedPlan === plan.id && styles.selectedPlan,
        plan.popular && styles.popularPlan,
      ]}
      onPress={() => setSelectedPlan(plan.id)}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      <View style={styles.planContent}>
        <FontAwesome5 name="coins" size={24} color="#E9743A" />
        <Text style={styles.coinAmount}>{plan.coins}</Text>
        <Text style={styles.coinLabel}>coins</Text>
        <Text style={styles.priceText}>${plan.price}</Text>
      </View>
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Load Coins</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Icon name="info" size={24} color="#E9743A" />
          <Text style={styles.infoTitle}>Why Load Coins?</Text>
          <Text style={styles.infoText}>
            Unlock premium content, skip ads, and enjoy exclusive features with coins
          </Text>
        </View>

        {/* Plans Grid */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <View style={styles.plansGrid}>
            {mockRechargePlans.map(renderPlanCard)}
          </View>
        </View>

        {/* Purchase Button */}
        {selectedPlan && (
          <View style={styles.purchaseContainer}>
            <TouchableOpacity
              style={styles.purchaseButton}
              onPress={() => {
                const plan = mockRechargePlans.find(p => p.id === selectedPlan);
                if (plan) handlePurchase(plan);
              }}
            >
              <LinearGradient
                colors={['#E9743A', '#CB2D4D']}
                style={styles.purchaseGradient}
              >
                <FontAwesome5 name="diamond-stone" size={20} color="#ffffff" />
                <Text style={styles.purchaseText}>Purchase Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Unlock Premium Content</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Skip Advertisements</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Exclusive Features</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Instant Access</Text>
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
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: isLargeDevice ? '48%' : '48%',
    alignItems: 'center',
    position: 'relative',
  },
  selectedPlan: {
    backgroundColor: 'rgba(233, 116, 58, 0.3)',
    borderWidth: 2,
    borderColor: '#E9743A',
  },
  popularPlan: {
    backgroundColor: 'rgba(233, 116, 58, 0.2)',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#E9743A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  coinAmount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  coinLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 8,
  },
  priceText: {
    color: '#E9743A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  purchaseContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  purchaseButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  purchaseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  benefitsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  benefitText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 12,
  },
});

export default RefillScreen; 