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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

// Mock subscription plans
const mockSubscriptionPlans = [
  {
    id: '1',
    name: 'Basic',
    price: 4.99,
    period: 'month',
    features: ['HD Quality', 'No Ads', 'Basic Support'],
    popular: false,
  },
  {
    id: '2',
    name: 'Premium',
    price: 9.99,
    period: 'month',
    features: ['4K Quality', 'No Ads', 'Priority Support', 'Exclusive Content'],
    popular: true,
  },
  {
    id: '3',
    name: 'Family',
    price: 14.99,
    period: 'month',
    features: ['4K Quality', 'No Ads', 'Priority Support', 'Exclusive Content', 'Up to 6 Profiles'],
    popular: false,
  },
];

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
}

const SubscriptionScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = (plan: any) => {
    Alert.alert(
      'Subscription Confirmation',
      `Are you sure you want to subscribe to ${plan.name} for $${plan.price}/${plan.period}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            Alert.alert('Success', 'Subscription activated successfully!');
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
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceSymbol}>$</Text>
          <Text style={styles.priceAmount}>{plan.price}</Text>
          <Text style={styles.pricePeriod}>/{plan.period}</Text>
        </View>
      </View>
      <View style={styles.featuresList}>
        {plan.features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureItem}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
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
        <Text style={styles.headerTitle}>VIP Membership</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <MaterialCommunityIcons name="crown" size={48} color="#FFD700" />
          <Text style={styles.heroTitle}>Unlock Premium Experience</Text>
          <Text style={styles.heroSubtitle}>
            Enjoy unlimited access to premium content with no interruptions
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          {mockSubscriptionPlans.map(renderPlanCard)}
        </View>

        {/* Subscribe Button */}
        {selectedPlan && (
          <View style={styles.subscribeContainer}>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => {
                const plan = mockSubscriptionPlans.find(p => p.id === selectedPlan);
                if (plan) handleSubscribe(plan);
              }}
            >
              <LinearGradient
                colors={['#E9743A', '#CB2D4D']}
                style={styles.subscribeGradient}
              >
                <MaterialCommunityIcons name="crown" size={20} color="#ffffff" />
                <Text style={styles.subscribeText}>Subscribe Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>VIP Benefits</Text>
          <View style={styles.benefitsGrid}>
            <View style={styles.benefitCard}>
              <MaterialCommunityIcons name="infinity" size={32} color="#E9743A" />
              <Text style={styles.benefitTitle}>Unlimited Viewing</Text>
              <Text style={styles.benefitDesc}>Watch as much as you want</Text>
            </View>
            <View style={styles.benefitCard}>
              <Icon name="hd" size={32} color="#E9743A" />
              <Text style={styles.benefitTitle}>HD Quality</Text>
              <Text style={styles.benefitDesc}>Crystal clear video quality</Text>
            </View>
            <View style={styles.benefitCard}>
              <MaterialCommunityIcons name="block-helper" size={32} color="#E9743A" />
              <Text style={styles.benefitTitle}>Ad Free</Text>
              <Text style={styles.benefitDesc}>No interruptions</Text>
            </View>
            <View style={styles.benefitCard}>
              <MaterialCommunityIcons name="account-group" size={32} color="#E9743A" />
              <Text style={styles.benefitTitle}>VIP Community</Text>
              <Text style={styles.benefitDesc}>Exclusive member benefits</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            Subscription will auto-renew unless cancelled.
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
  heroSection: {
    alignItems: 'center',
    padding: 40,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    top: -12,
    left: 20,
    backgroundColor: '#E9743A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    color: '#E9743A',
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceAmount: {
    color: '#E9743A',
    fontSize: 32,
    fontWeight: 'bold',
  },
  pricePeriod: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginLeft: 4,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 8,
  },
  subscribeContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subscribeButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  subscribeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  subscribeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: isLargeDevice ? '48%' : '48%',
    alignItems: 'center',
  },
  benefitTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  termsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SubscriptionScreen; 