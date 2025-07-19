import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

// Mock data for static UI
interface BalanceData {
  coinsQuantity: {
    totalCoins: number;
  };
}

interface CheckInItem {
  _id: string;
  day1: number;
  day2: number;
  day3: number;
  day4: number;
  day5: number;
  day6: number;
  day7: number;
  [key: string]: number | string;
}

interface SubscriptionItem {
  _id: string;
  planName: string;
  planDuration: string;
  price: number;
  description: string;
  descriptionArray: string[];
}

interface RechargeItem {
  _id: string;
  planName: string;
  price: number;
  coins: number;
}

interface BenefitItem {
  _id: string;
  title: string;
  description: string;
  coins: number;
  btntitle: string;
}

const mockBalanceData: BalanceData = {
  coinsQuantity: {
    totalCoins: 218
  }
};

const mockCheckInList: CheckInItem[] = [
  {
    _id: '1',
    day1: 20,
    day2: 30,
    day3: 40,
    day4: 50,
    day5: 60,
    day6: 35,
    day7: 50
  }
];

const mockVipSubscriptionData: SubscriptionItem[] = [
  {
    _id: '1',
    planName: 'weekly_plan',
    planDuration: '7',
    price: 299,
    description: 'Unlimited viewingAd Free1080p QualityUnlock All Series for 7 Days',
    descriptionArray: ['Unlimited viewing', 'Ad Free', '1080p Quality', 'Unlock All Series for 7 Days']
  }
];

const mockRechargeList: RechargeItem[] = [
  {
    _id: '1',
    planName: 'micro_pack',
    price: 49,
    coins: 100
  },
  {
    _id: '2',
    planName: 'mini_pack',
    price: 99,
    coins: 200
  },
  {
    _id: '3',
    planName: 'value_pack',
    price: 199,
    coins: 500
  },
  {
    _id: '4',
    planName: 'power_pack',
    price: 399,
    coins: 1200
  }
];

const mockBenefitData: BenefitItem[] = [
  {
    _id: '1',
    title: 'Watch Ads to earn coins',
    description: 'Get 10 coins each time you watch ads.',
    coins: 10,
    btntitle: 'Watch Ads'
  }
];

const mockUserProfileInfo = {
  checkInStreak: 5,
  checkInDate: new Date().toDateString()
};

const RewardsScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [refreshloading, setRefreshloading] = useState(false);
  const [isHide, setIsHide] = useState(false);
  const [isSelected, setIsSelected] = useState<SubscriptionItem | null>(null);

  const onRefresh = async () => {
    setRefreshloading(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshloading(false);
    }, 2000);
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldHide = offsetY > 1;
    setIsHide(shouldHide);
  };

  const marginBottom = Platform.OS === 'android' ? tabBarHeight - 50 : tabBarHeight + insets.bottom - 20;

  const getIconByDescription = (text: string) => {
    // Mock icon component - replace with actual SvgIcons
    return (
      <View style={{
        width: isLargeDevice ? width * 0.04 : width * 0.07,
        height: isLargeDevice ? width * 0.04 : width * 0.07,
        backgroundColor: '#7d2537',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: 'white', fontSize: 12 } as any}>✓</Text>
      </View>
    );
  };

  const currencyFormat = (amount: number) => {
    return `₹${amount}`;
  };

  const tips = [
    'Rocket Reels features both free and paid content for everyone.',
    'Paid content can be unlocked using coins or by subscribing to a membership. Membership-only content can only be accessed after subscribing to a membership.',
    'Both the coins and the reward coins will never expire.',
    'Coins will be used first when unlocking episodes. If the amount is insufficient, reward coins will automatically be used.',
    'During the subscription period, you will have unlimited access to all content in Rocket Reels.',
  ];

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={styles.container}
    >
      <View style={[styles.mainContainer, { marginBottom: isHide ? marginBottom : 0 }]}>
        <ScrollView
          onScroll={onScroll}
          refreshControl={
            <RefreshControl
              onRefresh={onRefresh}
              refreshing={refreshloading}
              tintColor="#ffffff"
              colors={["#ffffff"]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.headerContainer, { marginTop: insets.top }]}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>EARN COINS</Text>
              <Text style={styles.headerSubtitle}>Unlocked Episodes</Text>
            </View>

            {/* Balance Card */}
            <TouchableOpacity
              style={styles.balanceContent}
              onPress={() => navigation.navigate('MyWallet')}
            >
              <View style={styles.balanceLeft}>
                <Text style={styles.balanceText}>Balance</Text>
                <Text style={styles.arrowText}>→</Text>
              </View>
              <View style={styles.balanceRight}>
                <View style={styles.coinIconContainer}>
                  <Text style={styles.coinText}>🪙</Text>
                </View>
                <Text style={styles.balanceAmount}>
                  {mockBalanceData.coinsQuantity.totalCoins}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {/* Check-In */}
            <View style={styles.checkContainer}>
              <View style={styles.directionContainer}>
                <Text style={styles.heading}>
                  Check-In : {mockUserProfileInfo.checkInStreak} day
                </Text>
              </View>
              <FlatList
                data={mockCheckInList}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.directionContainer}>
                    {Object.keys(item).filter(key => key.startsWith('day')).map((day) => (
                      <View key={day} style={[
                        styles.rewardCard,
                        mockUserProfileInfo.checkInStreak >= parseInt(day.replace('day', '')) ? styles.focusedRewardCard : null
                      ]}>
                        <Text style={[styles.heading, styles.rewardCardText]}>
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </Text>
                        <Text style={styles.rewardIcon}>
                          {mockUserProfileInfo.checkInStreak >= parseInt(day.replace('day', '')) ? '✓' : '🪙'}
                        </Text>
                        <Text style={[styles.heading, styles.rewardCardText]}>
                          {item[day]}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                keyExtractor={(item) => item._id}
              />
              <TouchableOpacity
                style={[
                  styles.checkInButton,
                  { backgroundColor: '#7d2537' }
                ]}
              >
                <Text style={styles.checkInButtonText}>CHECK IN</Text>
              </TouchableOpacity>
            </View>

            {/* Subscription */}
            <Text style={styles.sectionTitle}>Subscription</Text>
            {mockVipSubscriptionData.reduce<SubscriptionItem[][]>((rows, item, index) => {
              const columns = isLargeDevice ? 2 : 1;
              if (index % columns === 0) {
                rows.push([item]);
              } else {
                rows[rows.length - 1].push(item);
              }
              return rows;
            }, []).map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.directionContainer, styles.subscriptionRow]}>
                {row.map((item: SubscriptionItem) => (
                  <TouchableOpacity
                    key={item.planName}
                    style={styles.subscriptionCard}
                    onPress={() => setIsSelected(item)}
                  >
                    <LinearGradient
                      colors={["#A07A64", "#5E4536"]}
                      style={styles.subscriptionHeader}
                    >
                      <View style={styles.subscriptionHeaderContent}>
                        <Image
                          style={styles.VIPimg}
                          source={{ uri: 'data:image/png;base64,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' }}
                        />
                        <View style={styles.subscriptionDuration}>
                          <Text style={styles.durationText}>
                            {item.planDuration}
                          </Text>
                          <Text style={styles.durationLabel}>
                            Days
                          </Text>
                        </View>
                      </View>
                      <View style={styles.subscriptionDetails}>
                        <Text style={styles.planName}>
                          {item.planName.split("_")[0]}
                        </Text>
                        <Text style={styles.planDescription}>
                          {item.description}
                        </Text>
                      </View>
                    </LinearGradient>
                    <View style={styles.subscriptionPrice}>
                      <Text style={styles.priceText}>
                        {currencyFormat(item.price)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Refill Coins */}
            <Text style={styles.sectionTitle}>Refill Coins</Text>
            {mockRechargeList.reduce<RechargeItem[][]>((rows, item, index) => {
              const columns = isLargeDevice ? 4 : 2;
              if (index % columns === 0) {
                rows.push([item]);
              } else {
                rows[rows.length - 1].push(item);
              }
              return rows;
            }, []).map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.directionContainer, styles.refillRow]}>
                {row.map((item: RechargeItem) => {
                  const getDynamicSize = (price: number) => {
                    const priceStr = price.toString();
                    const priceLength = priceStr.length;
                    let sizeMultiplier = 1;
                    if (priceLength <= 2) {
                      sizeMultiplier = 0.16;
                    } else if (priceLength === 3) {
                      sizeMultiplier = 0.18;
                    } else if (priceLength === 4) {
                      sizeMultiplier = 0.20;
                    } else {
                      sizeMultiplier = 0.22;
                    }
                    return width * sizeMultiplier;
                  };

                  const getDynamicFontSize = (price: number) => {
                    const priceStr = price.toString();
                    const priceLength = priceStr.length;
                    if (priceLength <= 2) {
                      return isLargeDevice ? 16 : 28;
                    } else if (priceLength === 3) {
                      return isLargeDevice ? 14 : 24;
                    } else if (priceLength === 4) {
                      return isLargeDevice ? 12 : 20;
                    } else {
                      return isLargeDevice ? 10 : 16;
                    }
                  };

                  const dynamicSize = getDynamicSize(item.price);
                  const dynamicFontSize = getDynamicFontSize(item.price);

                  return (
                    <TouchableOpacity
                      key={item.planName}
                      style={styles.refillCard}
                    >
                      <View style={styles.refillCardContent}>
                        <View style={styles.planContainer}>
                          <Text style={styles.planNameText}>
                            {item.planName.split('_')[0]} {item.planName.split('_')[1]}
                          </Text>
                        </View>
                        <LinearGradient
                          colors={['#ed9b72', '#7d2537']}
                          style={[
                            styles.priceCircle,
                            {
                              width: dynamicSize,
                              height: dynamicSize,
                              minWidth: isLargeDevice ? width * 0.08 : width * 0.15,
                              minHeight: isLargeDevice ? width * 0.08 : width * 0.15,
                              maxWidth: isLargeDevice ? width * 0.14 : width * 0.25,
                              maxHeight: isLargeDevice ? width * 0.14 : width * 0.25,
                            }
                          ]}
                        >
                          <Text style={styles.currencySymbol}>₹</Text>
                          <Text style={[styles.priceAmount, { fontSize: dynamicFontSize }]}>
                            {item.price}
                          </Text>
                        </LinearGradient>
                        <View style={styles.coinsContainer}>
                          <Text style={styles.coinsAmount}>
                            {item.coins}
                          </Text>
                          <Text style={styles.coinsLabel}>
                            Coins
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Today's Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.sectionTitle}>Today's Benefits</Text>
              {mockBenefitData.map((item) => (
                <View key={item._id} style={styles.benefitCard}>
                  <Text style={styles.benefitTitle}>
                    {item.title}
                  </Text>
                  <View style={styles.benefitContent}>
                    <View style={styles.benefitLeft}>
                      <Text style={styles.benefitDescription}>
                        {item.description}
                      </Text>
                      <View style={styles.coinsDisplay}>
                        <Text style={styles.coinIcon}>🪙</Text>
                        <Text style={styles.coinsText}>
                          {item.coins}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.watchAdsButton}
                    >
                      <Text style={styles.watchAdsButtonText}>
                        {item.btntitle}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <TouchableOpacity>
                <Text style={styles.termsLink}>
                  Terms of use (EULA)
                </Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>
                {' '}and{' '}
              </Text>
              <TouchableOpacity>
                <Text style={styles.termsLink}>
                  Privacy policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Subscription Modal */}
        {isSelected && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <LinearGradient
                  colors={["#A07A64", "#5E4536"]}
                  style={styles.modalHeaderGradient}
                >
                  <View style={styles.modalHeaderContent}>
                    <View>
                      <Text style={styles.modalPlanName}>
                        {isSelected.planName.split('_')[0]}
                      </Text>
                      <Text style={styles.modalDuration}>
                        {isSelected.planDuration} Days
                      </Text>
                    </View>
                    <View style={styles.modalPriceContainer}>
                      <Text style={styles.modalCurrency}>₹</Text>
                      <Text style={styles.modalPrice}>
                        {isSelected.price}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
                <View style={styles.modalBody}>
                  <View style={styles.featuresGrid}>
                    {isSelected.descriptionArray?.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        {getIconByDescription(feature)}
                        <Text style={styles.featureText}>
                          {feature}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsTitle}>Tips</Text>
                    {tips.map((tip, index) => (
                      <View key={index} style={styles.tipItem}>
                        <Text style={styles.tipNumber}>{index + 1}.</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.modalTerms}>
                    <Text style={styles.modalTermsText}>
                      By continuing, you agree to our{' '}
                    </Text>
                    <TouchableOpacity>
                      <Text style={styles.modalTermsLink}>
                        Terms of use (EULA)
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTermsText}>
                      {' '}and{' '}
                    </Text>
                    <TouchableOpacity>
                      <Text style={styles.modalTermsLink}>
                        Privacy policy
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.subscribeButton}
                    onPress={() => setIsSelected(null)}
                  >
                    <Text style={styles.subscribeButtonText}>
                      SUBSCRIBE NOW
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    padding: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  headerTextContainer: {
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  headerTitle: {
    fontSize: isLargeDevice ? 24 : 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.001 : width * 0.01,
  },
  headerSubtitle: {
    fontSize: isLargeDevice ? 18 : 24,
    color: '#ffffff',
    opacity: 0.8,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: isLargeDevice ? width * 0.015 : width * 0.03,
    padding: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: isLargeDevice ? 20 : 28,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  arrowText: {
    fontSize: 20,
    color: '#333333',
  },
  balanceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinText: {
    fontSize: 20,
  },
  balanceAmount: {
    fontSize: isLargeDevice ? 24 : 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: isLargeDevice ? width * 0.01 : width * 0.02,
    textShadowColor: '#000000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
  },
  checkContainer: {
    margin: isLargeDevice ? width * 0.01 : width * 0.02,
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
    borderRadius: width * 0.01,
  },
  directionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: isLargeDevice ? 16 : 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rewardCard: {
    width: isLargeDevice ? width * 0.1 : width * 0.16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: width * 0.01,
    borderRadius: width * 0.01,
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  focusedRewardCard: {
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    elevation: 4,
    paddingVertical: width * 0.03,
    width: isLargeDevice ? width * 0.12 : width * 0.18,
  },
  rewardCardText: {
    color: '#333333',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  rewardIcon: {
    fontSize: 20,
    color: '#7d2537',
  },
  checkInButton: {
    margin: width * 0.02,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  checkInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: isLargeDevice ? width * 0.005 : width * 0.01,
    marginTop: isLargeDevice ? width * 0.01 : width * 0.02,
    marginLeft: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  subscriptionRow: {
    justifyContent: 'flex-start',
    flex: 0,
  },
  subscriptionCard: {
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
    borderRadius: width * 0.01,
    width: isLargeDevice ? width * 0.5 : width,
  },
  subscriptionHeader: {
    borderTopRightRadius: width * 0.01,
    borderTopLeftRadius: width * 0.01,
    flex: 0,
  },
  subscriptionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  VIPimg: {
    borderRadius: 999,
    width: isLargeDevice ? width * 0.06 : width * 0.1,
    height: isLargeDevice ? width * 0.06 : width * 0.1,
    resizeMode: 'contain',
    tintColor: 'rgba(255, 255, 255, 0.1)',
  },
  subscriptionDuration: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  durationText: {
    fontSize: isLargeDevice ? 20 : 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  durationLabel: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subscriptionDetails: {
    flex: 1,
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  planName: {
    textTransform: 'capitalize',
    fontSize: isLargeDevice ? 24 : 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  planDescription: {
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
    color: '#ffffff',
    fontSize: isLargeDevice ? 14 : 20,
  },
  subscriptionPrice: {
    padding: isLargeDevice ? width * 0.01 : width * 0.03,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    borderBottomRightRadius: width * 0.01,
    borderBottomLeftRadius: width * 0.01,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceText: {
    fontSize: isLargeDevice ? 14 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  refillRow: {
    justifyContent: 'flex-start',
    flex: 0,
  },
  refillCard: {
    borderRadius: width * 0.01,
    margin: isLargeDevice ? width * 0.01 : width * 0.02,
    marginHorizontal: isLargeDevice ? width * 0.0115 : width * 0.02,
    height: isLargeDevice ? width * 0.2 : width * 0.3,
    width: isLargeDevice ? width * 0.227 : width * 0.458,
    justifyContent: 'center',
  },
  refillCardContent: {
    flex: 1,
    borderRadius: width * 0.01,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  planContainer: {
    position: 'absolute',
    right: -width * 0.01,
    top: -width * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5E4536',
    borderRadius: width * 0.01,
    padding: width * 0.01,
    zIndex: 1,
  },
  planNameText: {
    color: '#ffffff',
    textTransform: 'capitalize',
    fontSize: isLargeDevice ? 12 : 16,
  },
  priceCircle: {
    flexDirection: 'row',
    marginVertical: isLargeDevice ? width * 0.01 : width * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 999,
  },
  currencySymbol: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  priceAmount: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coinsContainer: {
    flexDirection: 'row',
    flex: 0,
    width: '100%',
    backgroundColor: '#5E4536',
    borderBottomLeftRadius: width * 0.01,
    borderBottomRightRadius: width * 0.01,
    justifyContent: 'center',
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    elevation: 4,
  },
  coinsAmount: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  coinsLabel: {
    color: '#ffffff',
    marginLeft: isLargeDevice ? width * 0.005 : width * 0.01,
    fontSize: isLargeDevice ? 12 : 16,
  },
  benefitsContainer: {
    margin: isLargeDevice ? width * 0.01 : width * 0.02,
    padding: 0,
  },
  benefitCard: {
    padding: isLargeDevice ? width * 0.015 : width * 0.03,
    marginTop: isLargeDevice ? width * 0.001 : width * 0.01,
    borderRadius: width * 0.01,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
  },
  benefitTitle: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  benefitContent: {
    flexDirection: 'row',
    marginTop: isLargeDevice ? width * 0.001 : width * 0.01,
  },
  benefitLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  benefitDescription: {
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.01 : 5,
    fontSize: isLargeDevice ? 12 : 16,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    fontSize: isLargeDevice ? 16 : 24,
  },
  coinsText: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: width * 0.01,
  },
  watchAdsButton: {
    backgroundColor: '#7d2537',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  watchAdsButtonText: {
    color: '#ffffff',
    fontSize: isLargeDevice ? 12 : 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontSize: isLargeDevice ? 12 : 16,
    color: 'rgba(255, 255, 255, 0.1)',
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: isLargeDevice ? 12 : 16,
    color: 'rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContainer: {
    margin: isLargeDevice ? width * 0.1 : width * 0.04,
    marginHorizontal: isLargeDevice ? width * 0.2 : width * 0.04,
    borderRadius: width * 0.01,
    justifyContent: 'center',
    backgroundColor: '#EBE2DA',
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flex: 0,
  },
  modalHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderTopLeftRadius: width * 0.01,
    borderTopRightRadius: width * 0.01,
    padding: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  modalPlanName: {
    textTransform: 'capitalize',
    fontSize: isLargeDevice ? 14 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalDuration: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  modalCurrency: {
    fontSize: isLargeDevice ? 14 : 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalPrice: {
    marginLeft: width * 0.01,
    fontSize: isLargeDevice ? 20 : 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalBody: {
    padding: isLargeDevice ? width * 0.015 : width * 0.03,
    paddingVertical: isLargeDevice ? width * 0.025 : width * 0.05,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flex: 0,
    flexWrap: 'wrap',
  },
  featureItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
    minWidth: '33%',
  },
  featureText: {
    marginTop: isLargeDevice ? width * 0.01 : width * 0.02,
    fontSize: isLargeDevice ? 12 : 16,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },
  tipsContainer: {
    marginVertical: isLargeDevice ? width * 0.015 : width * 0.03,
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: isLargeDevice ? 16 : 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  tipItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: width * 0.006,
    alignItems: 'flex-start',
    marginLeft: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  tipNumber: {
    fontSize: isLargeDevice ? 12 : 16,
    color: '#333333',
  },
  tipText: {
    marginLeft: isLargeDevice ? width * 0.001 : width * 0.01,
    fontSize: isLargeDevice ? 12 : 16,
    color: '#333333',
    flex: 1,
  },
  modalTerms: {
    flexDirection: 'row',
    marginVertical: isLargeDevice ? width * 0.01 : width * 0.02,
    justifyContent: 'center',
    flex: 0,
    flexWrap: 'wrap',
  },
  modalTermsText: {
    fontSize: isLargeDevice ? 12 : 16,
    color: '#333333',
  },
  modalTermsLink: {
    textDecorationLine: 'underline',
    fontSize: isLargeDevice ? 12 : 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  subscribeButton: {
    backgroundColor: '#7d2537',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RewardsScreen;