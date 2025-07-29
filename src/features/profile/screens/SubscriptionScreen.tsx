import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  RefreshControl,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Hooks and context
import { useTheme } from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';
import { useAuthStore } from '../../../store/auth.store';
import { useSubscriptionPlans, type SubscriptionPlan, type PurchaseData } from '../../../hooks/useSubscriptionPlans';

// Components
import ActivityLoader from '../../../components/common/ActivityLoader';
import SubscriptionStatusDisplay from '../../../components/common/SubscriptionStatusDisplay';
import HeaderRestoreButton from '../../../components/common/HeaderRestoreButton';
import { ModalView } from '../../../components/common/ModalView';
import { SvgIcons } from '../../../components/common/SvgIcons';

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
  const user = useAuthStore((state) => state.user);
  
  // Subscription hook
  const {
    subscriptionPlans,
    currentSubscription,
    loading,
    isProcessing,
    purchaseSubscription,
    restorePurchases,
    refreshSubscription,
    hasActiveSubscription,
    isUserLoggedIn,
  } = useSubscriptionPlans();

  console.log('subscriptionPlans', subscriptionPlans);
  console.log('currentSubscription', currentSubscription);
  console.log('Price debug:', subscriptionPlans.map(plan => ({ name: plan.planName, price: plan.price, discountPrice: plan.discountPrice })));
  
  // State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDebug, setShowDebug] = useState(__DEV__);

  // Memoized values for better performance
  const hasSubscriptionData = useMemo(() => subscriptionPlans.length > 0, [subscriptionPlans]);

  // Memoized subscription rows to prevent recalculation
  const subscriptionRows = useMemo(() => {
    if (!hasSubscriptionData) return [];

    return subscriptionPlans.reduce((rows: SubscriptionPlan[][], item: SubscriptionPlan, index: number) => {
      const columns = isLargeDevice ? 2 : 1;
      if (index % columns === 0) {
        rows.push([item]);
      } else {
        rows[rows.length - 1].push(item);
      }
      return rows;
    }, []);
  }, [isLargeDevice, hasSubscriptionData, subscriptionPlans]);

  // Memoized callbacks to prevent unnecessary re-renders
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing subscription data...');
      await refreshSubscription();
      console.log('✅ Subscription data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing subscription data:', error);
      Alert.alert('Error', 'Failed to refresh subscription data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [refreshSubscription]);

  const handleBuySubscription = useCallback(async (purchaseData: PurchaseData) => {
    // Check if user already has an active subscription
    if (currentSubscription) {
      const subscriptionEndDate = currentSubscription.subscriptionEndDate
        ? new Date(parseInt(currentSubscription.subscriptionEndDate)).toLocaleDateString()
        : 'Unknown';

      Alert.alert(
        'Active Subscription',
        `You already have an active subscription that expires on ${subscriptionEndDate}. You can manage your subscription through your device settings.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      console.log('💳 Starting subscription purchase:', purchaseData);
      const success = await purchaseSubscription(purchaseData);
      console.log('💳 Purchase result:', success);
      
      if (success) {
        setSelectedPlan(null);
        setShowModal(false);
        console.log('✅ Purchase completed successfully');
      }
    } catch (error) {
      console.error('❌ Subscription purchase error:', error);
      Alert.alert('Error', 'Failed to purchase subscription. Please try again.');
    }
  }, [currentSubscription, purchaseSubscription]);

  const handleSubscriptionSelect = useCallback((item: SubscriptionPlan) => {
    // Check if user already has this subscription
    if (currentSubscription && currentSubscription.productId === item.planName) {
    Alert.alert(
        'Active Subscription',
        'You already have an active subscription to this plan. You can manage it through your device settings.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    setSelectedPlan(item);
  }, [currentSubscription]);

  const getIconByDescription = useCallback((text: string) => {
    switch (text.toLowerCase()) {
      case 'unlimited viewing': return <SvgIcons name={'unlimited'} color={colors.PRIMARYBLACK} size={isLargeDevice ? width * 0.04 : width * 0.07} viewBox="0 0 512 512" strokeWidth={1} />
      case '1080p quality': return <SvgIcons name={'hd'} color={colors.PRIMARYBLACK} size={isLargeDevice ? width * 0.04 : width * 0.07} viewBox="0 0 24 24" strokeWidth={1} />
      case 'daily points reward': return <SvgIcons name={'daily-reward'} size={isLargeDevice ? width * 0.04 : width * 0.07} viewBox="0 0 100 100" strokeWidth={1} />
      case 'daily point reward': return <SvgIcons name={'daily-reward'} size={isLargeDevice ? width * 0.04 : width * 0.07} viewBox="0 0 100 100" strokeWidth={1} />
      case 'ad-free': return <SvgIcons name={'ads-free'} size={isLargeDevice ? width * 0.04 : width * 0.07} viewBox="0 0 32 32" strokeWidth={1} />
      case 'members-only early access': return <SvgIcons name={'member-only'} size={isLargeDevice ? width * 0.04 : width * 0.07} viewBox="0 0 512 512" strokeWidth={1} />
      default: return <SvgIcons name={'ads-free'} size={isLargeDevice ? width * 0.04 : width * 0.07} viewBox="0 0 32 32" strokeWidth={1} />
    }
  }, [colors.PRIMARYBLACK, isLargeDevice, width]);

  // Memoized subscription item renderer
  const renderSubscriptionItem = useCallback((item: SubscriptionPlan, index: number, rowIndex: number) => {
    return (
      <TouchableOpacity
        onPress={() => handleSubscriptionSelect(item)}
        style={{
          padding: isLargeDevice ? width * 0.015 : width * 0.02,
          borderRadius: width * 0.01,
          width: isLargeDevice ? '48%' : '100%',
          marginBottom: isLargeDevice ? width * 0.02 : width * 0.03
        }}
        key={`${rowIndex}-${index}-${item.planName}`}
      >
        <LinearGradient
          colors={["#A07A64", "#5E4536"]}
          style={[style.planGradient, { opacity: isProcessing ? 0.7 : 1 }]}
        >
          <View style={[style.directionContainer, { alignItems: 'flex-start', padding: isLargeDevice ? width * 0.015 : width * 0.03 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Image 
                style={style.VIPimg} 
                source={{ uri: 'data:image/png;base64,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' }} 
              />
              <Text style={[style.VIPtext, { marginLeft: width * 0.01 }]}>VIP</Text>
            </View>
            <View style={[style.directionContainer, { alignItems: 'flex-end', justifyContent: 'flex-end' }]}>
              <Text style={[style.heading, { fontSize: isLargeDevice ? 12 : 14 }]}>
                {item?.planDuration || '7'} {' '}
              </Text>
              <Text style={style.heading}>
                Days
              </Text>
            </View>
          </View>
          <View style={style.detailContainer}>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[style.heading, { textTransform: 'capitalize', fontSize: isLargeDevice ? 14 : 16 }]}>
              {item?.planName?.split("_")[0]}
            </Text>
            <Text numberOfLines={2} ellipsizeMode="tail" style={[style.txt, { marginTop: isLargeDevice ? width * 0.01 : width * 0.015, color: colors.PRIMARYWHITE }]}>
              {item?.description}
            </Text>
          </View>
        </LinearGradient>

        <View style={[style.priceContainer, { backgroundColor: colors.PRIMARYWHITEFOUR }]}>
          <View style={style.priceContent}>
            <Text style={[style.heading, { textDecorationLine: 'line-through', fontSize: isLargeDevice ? 14 : 16, textAlign: 'center', color: '#fff' }]} >
              ₹{item?.price || '0'}
            </Text>
            {item?.discountPrice &&
              <Text style={[style.heading, { fontSize: isLargeDevice ? 12 : 14, textAlign: 'center', color: colors.PRIMARYBLACK }]} >
                ₹{item?.discountPrice}
              </Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [isLargeDevice, width, colors, style, currentSubscription, isProcessing, handleSubscriptionSelect]);

  const renderHeader = () => (
    <View style={style.header}>
      <TouchableOpacity
        style={style.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
      <Text style={style.headerTitle}>Subscription Plans</Text>
      <TouchableOpacity
        style={style.restoreButton}
        onPress={restorePurchases}
        disabled={isProcessing}
      >
        <Icon name="restore" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
      </TouchableOpacity>
    </View>
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
              onPress={() => {
                if (selectedPlan) {
                  const purchaseData: PurchaseData = {
                    userId: user?._id || '',
                    planId: selectedPlan._id,
                    paymentMethod: 'apple_pay',
                    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    amount: selectedPlan.discountPrice || selectedPlan.price,
                    currency: 'INR'
                  };
                  handleBuySubscription(purchaseData);
                }
              }}
              disabled={isProcessing}
            >
              <FontAwesome5 name="apple-pay" size={24} color="#000000" />
              <Text style={style.paymentText}>Apple Pay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={style.paymentMethod}
              onPress={() => {
                if (selectedPlan) {
                  const purchaseData: PurchaseData = {
                    userId: user?._id || '',
                    planId: selectedPlan._id,
                    paymentMethod: 'google_pay',
                    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    amount: selectedPlan.discountPrice || selectedPlan.price,
                    currency: 'INR'
                  };
                  handleBuySubscription(purchaseData);
                }
              }}
              disabled={isProcessing}
            >
              <FontAwesome5 name="google-pay" size={24} color="#000000" />
              <Text style={style.paymentText}>Google Pay</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={style.paymentMethod}
              onPress={() => {
                if (selectedPlan) {
                  const purchaseData: PurchaseData = {
                    userId: user?._id || '',
                    planId: selectedPlan._id,
                    paymentMethod: 'card',
                    transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    amount: selectedPlan.discountPrice || selectedPlan.price,
                    currency: 'INR'
                  };
                  handleBuySubscription(purchaseData);
                }
              }}
              disabled={isProcessing}
            >
              <Icon name="credit-card" size={24} color="#000000" />
              <Text style={style.paymentText}>Credit/Debit Card</Text>
            </TouchableOpacity>
          </View>
          
          {isProcessing && (
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
      style={[style.gradient, { paddingTop: insets.top }]}
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.PRIMARYWHITE]} />
          }
        >
          {isProcessing && (
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)', 
              justifyContent: 'center', alignItems: 'center', zIndex: 9999
            }}>
              <ActivityLoader loaderColor={colors.PRIMARYWHITE} />
              <Text style={{ color: colors.PRIMARYWHITE, marginTop: 16, fontSize: 18, fontWeight: 'bold' }}>Processing your request...</Text>
            </View>
          )}
          
          <View style={style.container}>
            {hasSubscriptionData ? (
          <View style={style.plansContainer}>
                {subscriptionRows.map((row: SubscriptionPlan[], rowIndex: number) => (
                  <View key={rowIndex} style={[style.directionContainer, { justifyContent: 'flex-start', flex: 0 }]}>
                    {row.map((item: SubscriptionPlan, index: number) => renderSubscriptionItem(item, index, rowIndex))}
                  </View>
                ))}
              </View>
            ) : (
              <View style={style.emptyContainer}>
                <Text style={style.emptyText}>No subscription plans available</Text>
                <TouchableOpacity
                  style={style.retryButton}
                  onPress={onRefresh}
                  disabled={refreshing}
                >
                  <Text style={style.retryButtonText}>
                    {refreshing ? 'Loading...' : 'Retry'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Debug Buttons for Development */}
            {/* {__DEV__ && (
              <View style={{ marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04, marginBottom: isLargeDevice ? width * 0.01 : width * 0.02 }}>
                <Text style={{ color: colors.PRIMARYWHITE, fontSize: isLargeDevice ? 14 : 16, fontWeight: 'bold', marginBottom: isLargeDevice ? width * 0.005 : width * 0.01 }}>
                  🧪 Subscription Debug Tests
                </Text>
                
                <TouchableOpacity 
                  onPress={restorePurchases}
                  style={{
                    backgroundColor: '#FF6B6B',
                    padding: isLargeDevice ? width * 0.008 : width * 0.015,
                    borderRadius: 6,
                    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01
                  }}
                >
                  <Text style={{ color: colors.PRIMARYWHITE, textAlign: 'center', fontSize: isLargeDevice ? 10 : 12, fontWeight: 'bold' }}>
                    🔄 Restore Purchases
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={refreshSubscription}
                  style={{
                    backgroundColor: '#4ECDC4',
                    padding: isLargeDevice ? width * 0.008 : width * 0.015,
                    borderRadius: 6,
                    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01
                  }}
                >
                  <Text style={{ color: colors.PRIMARYWHITE, textAlign: 'center', fontSize: isLargeDevice ? 10 : 12, fontWeight: 'bold' }}>
                    📋 Refresh Subscription
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => console.log('Current subscription:', currentSubscription)}
                  style={{
                    backgroundColor: '#45B7D1',
                    padding: isLargeDevice ? width * 0.008 : width * 0.015,
                    borderRadius: 6,
                    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01
                  }}
                >
                  <Text style={{ color: colors.PRIMARYWHITE, textAlign: 'center', fontSize: isLargeDevice ? 10 : 12, fontWeight: 'bold' }}>
                    🔍 Check Status
                  </Text>
                </TouchableOpacity>
              </View>
            )} */}
          </View>

          <View style={[style.directionContainer, { justifyContent: 'center', marginVertical: isLargeDevice ? width * 0.015 : width * 0.03 }]}>
            <TouchableOpacity onPress={() => navigation.navigate('WebView', { title: 'Terms of use (EULA)', url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' })}>
              <Text style={[style.heading, { textDecorationLine: 'underline', fontSize: isLargeDevice ? 12 : 14, color: colors.PRIMARYWHITEFOUR }]}>
                Terms of use (EULA)
              </Text>
            </TouchableOpacity>
            <Text style={[style.txt, { fontSize: isLargeDevice ? 12 : 14, color: colors.PRIMARYWHITEFOUR }]}>
              {''} and {''}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('WebView', { title: 'Privacy Policy', url: 'https://rocketreels.co.in/privacy-policy/' })}>
              <Text style={[style.heading, { textDecorationLine: 'underline', fontSize: isLargeDevice ? 12 : 14, color: colors.PRIMARYWHITEFOUR }]}>
                Privacy policy
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
      
      {renderPurchaseModal()}

      {selectedPlan && (
        <ModalView 
          bottomBox={{ marginBottom: 0 }} 
          heading={`${selectedPlan?.planName?.split('_')[0]} Subscription` || ''} 
          onRequestClose={() => setSelectedPlan(null)}
        >
          <View style={[style.modalContainer, { flex: 0 }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <LinearGradient 
                start={{ x: 0, y: 0 }} 
                end={{ x: 1, y: 1 }} 
                colors={["#A07A64", "#5E4536"]} 
                style={[style.directionContainer, { alignItems: 'flex-start', borderTopLeftRadius: width * 0.01, borderTopRightRadius: width * 0.01, padding: isLargeDevice ? width * 0.015 : width * 0.03 }]}
              >
                <View>
                  <Text style={[style.heading, { textTransform: 'capitalize', fontSize: isLargeDevice ? 12 : 14 }]}>
                    {selectedPlan.planName.split('_')[0]}
                  </Text>
                  <Text style={style.heading}>
                    {selectedPlan.planDuration}  Days
                  </Text>
                </View>
                <View style={[style.directionContainer, { justifyContent: 'flex-end', alignItems: 'flex-end' }]}>
                  <Text style={[style.heading, { fontSize: isLargeDevice ? 10 : 12 }]}>
                    ₹
                  </Text>
                  <Text style={[style.heading, { marginLeft: width * 0.01, fontSize: isLargeDevice ? 12 : 16 }]}>
                    {selectedPlan.discountPrice}
                  </Text>
                </View>
              </LinearGradient>
              <View style={{
                padding: isLargeDevice ? width * 0.015 : width * 0.03,
                paddingVertical: isLargeDevice ? width * 0.025 : width * 0.05,
              }}>
                {Array.isArray(selectedPlan.description) && selectedPlan.description.reduce((rows: string[][], item: string, index: number) => {
                  const columns = isLargeDevice ? 3 : 2;
                  if (index % columns === 0) {
                    rows.push([item]);
                  } else {
                    rows[rows.length - 1].push(item);
                  }
                  return rows;
                }, [])
                  .map((row: string[], rowIndex: number) => (
                    <View key={rowIndex} style={[style.directionContainer, { justifyContent: 'flex-start', flex: 0 }]}>
                      {row.map((item: string, index: number) => (
                        <View key={index} style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: isLargeDevice ? width * 0.01 : width * 0.02 }]}>
                          {getIconByDescription(item)}
                          <Text style={[style.txt, { marginTop: isLargeDevice ? width * 0.01 : width * 0.02, fontWeight: '500', color: colors.PRIMARYBLACK }]}>
                            {item}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ))}

                <View style={style.tipsContainer}>
                  <Text style={[style.heading, { marginBottom: isLargeDevice ? width * 0.01 : width * 0.02, color: colors.PRIMARYLIGHTBLACKONE }]}>Tips</Text>
                  {[
                    'Rocket Reels features both free and paid content for everyone.',
                    'Paid content can be unlocked using coins or by subscribing to a membership. Membership-only content can only be accessed after subscribing to a membership.',
                    'Both the coins and the reward coins will never expire.',
                    'Coins will be used first when unlocking episodes. If the amount is insufficient, reward coins will automatically be used.',
                    'During the subscription period, you will have unlimited access to all content in Rocket Reels.',
                  ].map((tip: string, index: number) => (
                    <View key={index} style={[style.directionContainer, { justifyContent: 'flex-start', marginVertical: width * 0.006, alignItems: 'flex-start', marginLeft: isLargeDevice ? width * 0.01 : width * 0.02 }]}>
                      <Text style={[style.txt, { fontSize: isLargeDevice ? 10 : 12, color: colors.PRIMARYBLACK }]}>
                        {index + 1}.
                      </Text>
                      <Text style={[style.txt, { marginLeft: isLargeDevice ? width * 0.001 : width * 0.01, fontSize: isLargeDevice ? 10 : 12, color: colors.PRIMARYBLACK }]}>
                        {tip}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={[style.directionContainer, { marginVertical: isLargeDevice ? width * 0.01 : width * 0.02, justifyContent: 'center', flex: 0, flexWrap: 'wrap' }]}>
                  <Text style={style.txt}>
                    By continuing, you agree to our {''}
                  </Text>
                  <TouchableOpacity onPress={() => { setSelectedPlan(null), navigation.navigate('WebView', { title: 'Terms of use (EULA)', url: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/' }) }}>
                    <Text style={[style.heading, { textDecorationLine: 'underline', fontSize: isLargeDevice ? 10 : 12, color: colors.PRIMARYBLACK }]}>
                      Terms of use (EULA)
                    </Text>
                  </TouchableOpacity>
                  <Text style={style.txt}>
                    {''} and {''}
                  </Text>
                  <TouchableOpacity onPress={() => { setSelectedPlan(null), navigation.navigate('WebView', { title: 'Privacy Policy', url: 'https://rocketreels.co.in/privacy-policy' }) }}>
                    <Text style={[style.heading, { textDecorationLine: 'underline', fontSize: isLargeDevice ? 10 : 12, color: colors.PRIMARYBLACK }]}>
                      Privacy policy
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    style.subscribeButton,
                    { opacity: currentSubscription ? 0.6 : 1 }
                  ]}
                  onPress={() => {
                    if (!currentSubscription && !isProcessing && selectedPlan) {
                      const purchaseData: PurchaseData = {
                        userId: user?._id || '',
                        planId: selectedPlan._id,
                        paymentMethod: 'card',
                        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        amount: selectedPlan.discountPrice || selectedPlan.price,
                        currency: 'INR'
                      };
                      handleBuySubscription(purchaseData);
                    }
                  }}
                  disabled={!!currentSubscription || isProcessing}
                >
                  <Text style={style.subscribeButtonText}>
                    {currentSubscription ? 'Already Subscribed' : 'SUBSCRIBE NOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </ModalView>
      )}
    </LinearGradient>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
    marginTop: isLargeDevice ? width * 0.015 : width * 0.03
  },
  gradient: {
    flex: 1,
    paddingHorizontal: isLargeDevice ? width * 0.005 : width * 0.01,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.03,
    // backgroundColor: 'rgba(0,0,0,0.1)',
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
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  headerSpacer: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
  },
  restoreButton: {
    width: isLargeDevice ? width * 0.08 : width * 0.12,
    height: isLargeDevice ? width * 0.08 : width * 0.12,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: isLargeDevice ? width * 0.02 : width * 0.0,
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0,
  },
  directionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  planGradient: {
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
    position: 'relative',
    borderTopLeftRadius: width * 0.01,
    borderTopRightRadius: width * 0.01,
    minHeight: isLargeDevice ? width * 0.15 : width * 0.25,
  },
  VIPimg: {
    borderRadius: 999,
    width: isLargeDevice ? width * 0.04 : width * 0.06,
    height: isLargeDevice ? width * 0.04 : width * 0.06,
    resizeMode: 'contain',
    tintColor: theme.colors.PRIMARYWHITEFOUR
  },
  VIPtext: {
    fontSize: isLargeDevice ? 10 : 12,
    fontWeight: 'bold',
    color: theme.colors.PRIMARYWHITEFOUR
  },
  detailContainer: {
    flex: 1,
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  heading: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: theme.colors.PRIMARYWHITE
  },
  txt: {
    fontSize: isLargeDevice ? 10 : 12,
    color: theme.colors.PRIMARYGRAY,
  },
  priceContainer: {
    padding: isLargeDevice ? width * 0.015 : width * 0.02,
    borderBottomLeftRadius: width * 0.01,
    borderBottomRightRadius: width * 0.01,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceContent: {
    flexDirection: 'row',
    gap: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  tipsContainer: {
    paddingHorizontal: isLargeDevice ? width * 0.015 : 20,
    marginBottom: isLargeDevice ? width * 0.015 : 30,
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
    fontSize: isLargeDevice ? 16 : 18,
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
    fontSize: isLargeDevice ? 14 : 16,
    color: '#333333',
    marginLeft: isLargeDevice ? width * 0.015 : width * 0.02,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: isLargeDevice ? 12 : 14,
    color: '#666666',
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
  },
  modalContainer: {
    margin: isLargeDevice ? width * 0.1 : width * 0.04,
    marginHorizontal: isLargeDevice ? width * 0.2 : width * 0.04,
    borderRadius: width * 0.01,
    justifyContent: 'center',
    backgroundColor: '#EBE2DA'
  },
  subscribeButton: {
    backgroundColor: '#E9743A',
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  subscribeButtonText: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appFonts,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isLargeDevice ? width * 0.1 : width * 0.05,
  },
  emptyText: {
    fontSize: isLargeDevice ? 16 : 18,
    color: theme.colors.PRIMARYWHITE,
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  retryButton: {
    backgroundColor: '#E9743A',
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.02,
    paddingHorizontal: isLargeDevice ? width * 0.05 : width * 0.1,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default SubscriptionScreen; 