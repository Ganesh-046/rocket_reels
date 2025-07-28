import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
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

const SubscriptionScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const user = useAuthUser();
  
  // State
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    getSubscriptionPlans();
  }, []);

  // API Functions
  const getSubscriptionPlans = async () => {
    try {
      setLoading(true);
      console.log('📋 Fetching subscription plans...');
      const response = await apiService.getSubscriptionPlans();
      console.log('📋 Subscription plans response:', response);
      
      if (response.status === 200 && response.data) {
        setSubscriptionPlans(response.data);
        console.log('✅ Subscription plans set:', response.data);
      } else {
        console.warn('⚠️ Subscription plans response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get subscription plans error:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const purchaseSubscription = async (planId: string, paymentMethod: string) => {
    try {
      setPurchasing(true);
      const purchaseData = {
        userId: user?._id || '',
        planId,
        paymentMethod,
        transactionId: `txn_${Date.now()}`,
        amount: selectedPlan?.price || 0,
        currency: 'INR'
      };
      
      console.log('💳 Purchasing subscription:', purchaseData);
      const response = await apiService.purchaseSubscription(purchaseData);
      console.log('💳 Purchase response:', response);
      
      if (response.status === 200) {
        Alert.alert('Success', 'Subscription purchased successfully!');
        setShowModal(false);
        setSelectedPlan(null);
      } else {
        Alert.alert('Error', response.message || 'Failed to purchase subscription.');
      }
      return response;
    } catch (error) {
      console.error('❌ Purchase subscription error:', error);
      Alert.alert('Error', 'Failed to purchase subscription. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handlePlanSelect = (plan: any) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handlePurchase = (paymentMethod: string) => {
    if (!selectedPlan) return;
    
    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase ${selectedPlan.name} for ₹${selectedPlan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: () => purchaseSubscription(selectedPlan._id, paymentMethod)
        }
      ]
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
      <Text style={style.headerTitle}>Subscription Plans</Text>
      <View style={style.headerSpacer} />
    </View>
  );

  const renderPlanCard = (plan: any, index: number) => (
    <TouchableOpacity
      key={plan._id}
      style={[style.planCard, plan.isPopular && style.popularPlan]}
      onPress={() => handlePlanSelect(plan)}
    >
      <LinearGradient
        colors={plan.isPopular ? ['#E9743A', '#CB2D4D'] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={style.planGradient}
      >
        {plan.isPopular && (
          <View style={style.popularBadge}>
            <Text style={style.popularText}>MOST POPULAR</Text>
          </View>
        )}
        
        <View style={style.planHeader}>
          <Text style={style.planName}>{plan.name}</Text>
          <Text style={style.planPrice}>₹{plan.price}</Text>
          <Text style={style.planDuration}>{plan.duration}</Text>
        </View>
        
        <View style={style.planFeatures}>
          {plan.features?.map((feature: string, featureIndex: number) => (
            <View key={featureIndex} style={style.featureItem}>
              <Icon name="check-circle" size={16} color="#4CAF50" />
              <Text style={style.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={style.selectButton}
          onPress={() => handlePlanSelect(plan)}
        >
          <Text style={style.selectButtonText}>Select Plan</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderPurchaseModal = () => (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={style.modalOverlay}>
        <View style={style.modalContent}>
          <View style={style.modalHeader}>
            <Text style={style.modalTitle}>Choose Payment Method</Text>
            <TouchableOpacity
              style={style.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Icon name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <View style={style.paymentMethods}>
            <TouchableOpacity
              style={style.paymentMethod}
              onPress={() => handlePurchase('apple_pay')}
              disabled={purchasing}
            >
              <FontAwesome5 name="apple-pay" size={24} color="#000000" />
              <Text style={style.paymentText}>Apple Pay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={style.paymentMethod}
              onPress={() => handlePurchase('google_pay')}
              disabled={purchasing}
            >
              <FontAwesome5 name="google-pay" size={24} color="#000000" />
              <Text style={style.paymentText}>Google Pay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={style.paymentMethod}
              onPress={() => handlePurchase('card')}
              disabled={purchasing}
            >
              <Icon name="credit-card" size={24} color="#000000" />
              <Text style={style.paymentText}>Credit/Debit Card</Text>
            </TouchableOpacity>
          </View>
          
          {purchasing && (
            <View style={style.loadingContainer}>
              <ActivityLoader loaderColor={colors.PRIMARYWHITE} />
              <Text style={style.loadingText}>Processing payment...</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
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
          <View style={style.plansContainer}>
            {subscriptionPlans.map((plan, index) => renderPlanCard(plan, index))}
          </View>
        </ScrollView>
      )}
      
      {renderPurchaseModal()}
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
  plansContainer: {
    gap: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  planCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  popularPlan: {
    borderWidth: 2,
    borderColor: '#E9743A',
  },
  planGradient: {
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: isLargeDevice ? width * 0.015 : width * 0.02,
    right: isLargeDevice ? width * 0.015 : width * 0.02,
    backgroundColor: '#E9743A',
    paddingHorizontal: isLargeDevice ? width * 0.015 : width * 0.02,
    paddingVertical: isLargeDevice ? width * 0.008 : width * 0.012,
    borderRadius: 12,
  },
  popularText: {
    fontSize: isLargeDevice ? 10 : 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  planName: {
    fontSize: isLargeDevice ? 20 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  planPrice: {
    fontSize: isLargeDevice ? 32 : 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01,
  },
  planDuration: {
    fontSize: isLargeDevice ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  planFeatures: {
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  featureText: {
    fontSize: isLargeDevice ? 14 : 16,
    color: '#ffffff',
    marginLeft: isLargeDevice ? width * 0.01 : width * 0.015,
    flex: 1,
  },
  selectButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.02,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: isLargeDevice ? width * 0.03 : width * 0.04,
    width: isLargeDevice ? width * 0.6 : width * 0.9,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  modalTitle: {
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  paymentMethods: {
    gap: isLargeDevice ? width * 0.015 : width * 0.02,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isLargeDevice ? width * 0.02 : width * 0.025,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentText: {
    fontSize: isLargeDevice ? 16 : 18,
    color: '#333333',
    marginLeft: isLargeDevice ? width * 0.015 : width * 0.02,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: isLargeDevice ? 14 : 16,
    color: '#666666',
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
  },
});

export default SubscriptionScreen; 