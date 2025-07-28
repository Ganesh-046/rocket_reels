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

// Dummy subscription plans
const subscriptionPlans = [
  {
    id: '1',
    name: 'Basic',
    price: 99,
    duration: 'month',
    originalPrice: 199,
    discount: 50,
    features: [
      'Ad-free experience',
      'HD quality streaming',
      'Watch on 1 device',
      'Download 5 titles',
    ],
    popular: false,
  },
  {
    id: '2',
    name: 'Premium',
    price: 199,
    duration: 'month',
    originalPrice: 399,
    discount: 50,
    features: [
      'Ad-free experience',
      '4K Ultra HD streaming',
      'Watch on 4 devices',
      'Download unlimited',
      'Exclusive content',
      'Early access to releases',
    ],
    popular: true,
  },
  {
    id: '3',
    name: 'Family',
    price: 299,
    duration: 'month',
    originalPrice: 599,
    discount: 50,
    features: [
      'Ad-free experience',
      '4K Ultra HD streaming',
      'Watch on 6 devices',
      'Download unlimited',
      'Exclusive content',
      'Early access to releases',
      'Parental controls',
      'Kids profile',
    ],
    popular: false,
  },
];

const SubscriptionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = (planId: string) => {
    const selected = subscriptionPlans.find(plan => plan.id === planId);
    if (!selected) return;

    Alert.alert(
      'Confirm Subscription',
      `Subscribe to ${selected.name} plan for ₹${selected.price}/${selected.duration}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: () => {
            // Handle subscription
            Alert.alert('Success', 'Subscription activated successfully!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const renderPlan = ({ item }: { item: any }) => (
    <View style={[
      styles.planCard,
      selectedPlan === item.id && styles.selectedPlan,
      item.popular && styles.popularPlan,
    ]}>
      {item.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{item.name}</Text>
        <View style={styles.planPricing}>
          <Text style={styles.planPrice}>₹{item.price}</Text>
          <Text style={styles.planDuration}>/{item.duration}</Text>
        </View>
        <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{item.discount}% OFF</Text>
        </View>
      </View>

      <View style={styles.featuresList}>
        {item.features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureItem}>
            <Icon name="check-circle" size={16} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          selectedPlan === item.id && styles.selectedSubscribeButton,
        ]}
        onPress={() => handleSubscribe(item.id)}
      >
        <Text style={[
          styles.subscribeButtonText,
          selectedPlan === item.id && styles.selectedSubscribeButtonText,
        ]}>
          Choose Plan
        </Text>
      </TouchableOpacity>
    </View>
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
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => Alert.alert('Manage', 'Manage subscription')}
          >
            <Icon name="settings" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Current Plan Info */}
        <View style={styles.currentPlanSection}>
          <View style={styles.currentPlanCard}>
            <Icon name="star" size={24} color="#FFD700" />
            <View style={styles.currentPlanInfo}>
              <Text style={styles.currentPlanTitle}>Current Plan: Free</Text>
              <Text style={styles.currentPlanSubtitle}>
                Upgrade to unlock premium features
              </Text>
            </View>
          </View>
        </View>

        {/* Billing Cycle Toggle */}
        <View style={styles.billingSection}>
          <Text style={styles.sectionTitle}>Billing Cycle</Text>
          <View style={styles.billingToggle}>
            <TouchableOpacity
              style={[
                styles.billingOption,
                billingCycle === 'monthly' && styles.activeBillingOption,
              ]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text style={[
                styles.billingOptionText,
                billingCycle === 'monthly' && styles.activeBillingOptionText,
              ]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.billingOption,
                billingCycle === 'yearly' && styles.activeBillingOption,
              ]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text style={[
                styles.billingOptionText,
                billingCycle === 'yearly' && styles.activeBillingOptionText,
              ]}>
                Yearly (Save 20%)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Available Plans</Text>
          <FlatList
            data={subscriptionPlans}
            renderItem={renderPlan}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Features Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Plan Comparison</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Ad-free experience</Text>
              <Text style={styles.comparisonValue}>✓</Text>
              <Text style={styles.comparisonValue}>✓</Text>
              <Text style={styles.comparisonValue}>✓</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>4K Ultra HD</Text>
              <Text style={styles.comparisonValue}>✗</Text>
              <Text style={styles.comparisonValue}>✓</Text>
              <Text style={styles.comparisonValue}>✓</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Multiple devices</Text>
              <Text style={styles.comparisonValue}>1</Text>
              <Text style={styles.comparisonValue}>4</Text>
              <Text style={styles.comparisonValue}>6</Text>
            </View>
            <View style={styles.comparisonRow}>
              <Text style={styles.comparisonFeature}>Downloads</Text>
              <Text style={styles.comparisonValue}>5</Text>
              <Text style={styles.comparisonValue}>Unlimited</Text>
              <Text style={styles.comparisonValue}>Unlimited</Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period.
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
  manageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentPlanSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  currentPlanCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  currentPlanInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  currentPlanSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  billingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  billingOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeBillingOption: {
    backgroundColor: '#ffffff',
  },
  billingOptionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  activeBillingOptionText: {
    color: '#7d2537',
  },
  plansSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  selectedPlan: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: '#ed9b72',
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  planDuration: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  selectedSubscribeButton: {
    backgroundColor: '#ed9b72',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  selectedSubscribeButtonText: {
    color: '#ffffff',
  },
  comparisonSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  comparisonTable: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  comparisonFeature: {
    flex: 2,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  comparisonValue: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
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

export default SubscriptionScreen; 