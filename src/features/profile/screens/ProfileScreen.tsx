import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
  Share,
  Clipboard,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { PressableButton } from '../../../components/Button';
import { SvgIcons } from '../../../components/common/SvgIcons';

// Auth Store
import { useAuthStore, useAuthUser } from '../../../store/auth.store';

// MMKV Storage
import MMKVStorage from '../../../lib/mmkv';

// API Service
import apiService from '../../../services/api.service';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    replace: (screen: string) => void;
  };
}

// Menu data structure
interface MenuItem {
  id: number;
  name: string;
  desc: string;
  iconName: string;
  action?: () => void;
}

interface MenuSection {
  id: number;
  title: string;
  data: MenuItem[];
}

const ProfileScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [isHide, setIsHide] = useState(false);
  const [familySafeToggle, setFamilySafeToggle] = useState(false);
  
  // Get user data from auth store
  const user = useAuthUser();
  const { logout } = useAuthStore();

  // State for API data
  const [userProfile, setUserProfile] = useState<any>(null);
  const [balanceData, setBalanceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for invitation modal
  const [isInvitationModalVisible, setIsInvitationModalVisible] = useState(false);
  const [isCopySuccess, setIsCopySuccess] = useState(false);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldHide = offsetY > 1;
    setIsHide(shouldHide);
  };

  const marginBottom = Platform.OS === 'android' ? tabBarHeight - 50 : tabBarHeight + insets.bottom - 20;

  // MMKV Storage Functions
  const saveProfileToMMKV = (profileData: any) => {
    try {
      MMKVStorage.set('userProfile', profileData);
      console.log('💾 Profile data saved to MMKV');
    } catch (error) {
      console.error('❌ Failed to save profile to MMKV:', error);
    }
  };

  const getUserIdFromMMKV = () => {
    try {
      const authData = MMKVStorage.get('auth-data');
      if (authData && authData.user && authData.user._id) {
        console.log('🆔 User ID loaded from MMKV:', authData.user._id);
        return authData.user._id;
      }
    } catch (error) {
      console.error('❌ Failed to get user ID from MMKV:', error);
    }
    return null;
  };

  const loadProfileFromMMKV = () => {
    try {
      const cachedProfile = MMKVStorage.get('userProfile');
      if (cachedProfile) {
        console.log('📱 Profile data loaded from MMKV');
        return cachedProfile;
      }
    } catch (error) {
      console.error('❌ Failed to load profile from MMKV:', error);
    }
    return null;
  };

  const saveBalanceToMMKV = (balanceData: any) => {
    try {
      MMKVStorage.set('userBalance', balanceData);
      console.log('💾 Balance data saved to MMKV');
    } catch (error) {
      console.error('❌ Failed to save balance to MMKV:', error);
    }
  };

  const clearCachedData = () => {
    try {
      MMKVStorage.remove('userProfile');
      MMKVStorage.remove('userBalance');
      console.log('🗑️ Cached profile data cleared');
    } catch (error) {
      console.error('❌ Failed to clear cached data:', error);
    }
  };

  const checkAuthStatus = () => {
    try {
      const authData = MMKVStorage.get('auth-data');
      const token = MMKVStorage.getToken();
      const user = MMKVStorage.getUser();
      
      console.log('🔍 Auth Status Check:', {
        hasAuthData: !!authData,
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0,
        userId: user?._id || 'none',
        userName: user?.userName || 'none',
      });
      
      return { authData, token, user };
    } catch (error) {
      console.error('❌ Failed to check auth status:', error);
      return { authData: null, token: null, user: null };
    }
  };

  const loadBalanceFromMMKV = () => {
    try {
      const cachedBalance = MMKVStorage.get('userBalance');
      if (cachedBalance) {
        console.log('💰 Balance data loaded from MMKV');
        return cachedBalance;
      }
    } catch (error) {
      console.error('❌ Failed to load balance from MMKV:', error);
    }
    return null;
  };

  // API Functions
  const getUserProfile = async (userId: string, forceRefresh = false) => {
    try {
      // Load from cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedProfile = loadProfileFromMMKV();
        if (cachedProfile) {
          setUserProfile(cachedProfile);
          console.log('📱 Using cached profile data');
        }
      }

      setLoading(true);
      console.log('🔍 Fetching user profile for:', userId);
      const response = await apiService.getUserProfile(userId);
      console.log('📱 User profile response:', response);
      
      if (response.status === 200 && response.data) {
        setUserProfile(response.data);
        saveProfileToMMKV(response.data);
        console.log('✅ User profile set and cached:', response.data);
      } else {
        console.warn('⚠️ User profile response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get user profile error:', error);
      // Don't show error alert - use store data instead
      console.log('🔄 Falling back to store data for profile');
    } finally {
      setLoading(false);
    }
  };

  const getUserBalance = async (userId: string, forceRefresh = false) => {
    try {
      // Load from cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedBalance = loadBalanceFromMMKV();
        if (cachedBalance) {
          setBalanceData(cachedBalance);
          console.log('💰 Using cached balance data');
        }
      }

      console.log('💰 Fetching balance for:', userId);
      const response = await apiService.getBalance(userId);
      console.log('💳 Balance response:', response);
      
      if (response.status === 200 && response.data) {
        setBalanceData(response.data);
        saveBalanceToMMKV(response.data);
        console.log('✅ Balance set and cached:', response.data);
      } else {
        console.warn('⚠️ Balance response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Get balance error:', error);
      // Don't show error alert - balance is optional
      console.log('🔄 Balance fetch failed, continuing without balance data');
    }
  };

  const deleteAccount = async (userId: string) => {
    try {
      const response = await apiService.deleteAccount(userId);
      if (response.status === 200) {
        logout();
        navigation.replace('Auth');
      }
      return response;
    } catch (error) {
      console.error('Delete account error:', error);
    }
  };

  // Invitation Modal Functions
  const onShareWhatsApp = async () => {
    try {
      const currentReferralCode = userProfile?.referralCode || 'N/A';
      const message = `Join Rocket Reels and earn coins! Use my referral code: ${currentReferralCode}\n\nDownload the app: https://rocketreels.com/download`;
      
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      
      // Check if WhatsApp is installed
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback to regular share
        await Share.share({
          message,
          title: 'Join Rocket Reels',
        });
      }
    } catch (error) {
      console.error('Share WhatsApp error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const onShareLink = async () => {
    try {
      const currentReferralCode = userProfile?.referralCode || 'N/A';
      const message = `Join Rocket Reels and earn coins! Use my referral code: ${currentReferralCode}\n\nDownload the app: https://rocketreels.com/download`;
      
      await Share.share({
        message,
        title: 'Join Rocket Reels',
      });
    } catch (error) {
      console.error('Share link error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  };

  const onCopyReferralCode = async () => {
    try {
      const currentReferralCode = userProfile?.referralCode || 'N/A';
      await Clipboard.setString(currentReferralCode);
      setIsCopySuccess(true);
      
      // Reset copy success after 2 seconds
      setTimeout(() => {
        setIsCopySuccess(false);
      }, 2000);
      
      Alert.alert('Success', 'Referral code copied to clipboard!');
    } catch (error) {
      console.error('Copy referral code error:', error);
      Alert.alert('Error', 'Failed to copy referral code. Please try again.');
    }
  };

  // Refresh function for pull-to-refresh
  const handleRefresh = async () => {
    const userId = user?._id || getUserIdFromMMKV();
    if (!userId) {
      console.log('❌ No user ID available for refresh');
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    console.log('🔄 Refreshing profile data for user:', userId);
    
    try {
      await Promise.all([
        getUserProfile(userId, true), // Force refresh
        getUserBalance(userId, true)  // Force refresh
      ]);
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Load cached data immediately on mount (regardless of auth state)
  useEffect(() => {
    console.log('🚀 Component mounted - loading cached data');
    
    // Check auth status first
    const authStatus = checkAuthStatus();
    
    const cachedProfile = loadProfileFromMMKV();
    const cachedBalance = loadBalanceFromMMKV();
    
    if (cachedProfile) {
      setUserProfile(cachedProfile);
      console.log('📱 Cached profile loaded on mount');
    }
    if (cachedBalance) {
      setBalanceData(cachedBalance);
      console.log('💰 Cached balance loaded on mount');
    }
  }, []); // Empty dependency array - runs only on mount

  // Fetch fresh data when user is available
  useEffect(() => {
    if (user?._id) {
      console.log('👤 User available - fetching fresh data for:', user._id);
      getUserProfile(user._id);
      getUserBalance(user._id);
    }
  }, [user?._id]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const userId = user?._id || getUserIdFromMMKV();
      if (userId) {
        console.log('🎯 Screen focused - refreshing profile data for user:', userId);
        getUserProfile(userId, true);
        getUserBalance(userId, true);
      } else {
        console.log('🎯 Screen focused - no user ID available');
      }
    }, [user?._id])
  );

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            clearCachedData(); // Clear cached profile data
            logout();
            navigation.replace('Auth');
          },
        },
      ]
    );
  };

  // Handle menu item actions
  const handleMenuItemPress = (item: MenuItem) => {
    switch (item.name) {
      case 'Invitation':
        setIsInvitationModalVisible(true);
        break;
      case 'Log out':
        handleLogout();
        break;
      case 'Watch Family Safe Content':
        setFamilySafeToggle(!familySafeToggle);
        break;
      case 'Edit Profile':
        navigation.navigate('EditProfile');
        break;
      case 'My List':
        navigation.navigate('MyList');
        break;
      case 'My History':
        navigation.navigate('History');
        break;
      case 'Transaction History':
        navigation.navigate('Transaction');
        break;
      case 'My Wallet':
        navigation.navigate('MyWallet');
        break;
      case 'Refill':
        navigation.navigate('Refill');
        break;
      case 'Subscription':
        navigation.navigate('Subscription');
        break;
      case 'Tailored Content for Every Age':
        navigation.navigate('TargetAudience');
        break;
      case 'Privacy Policy':
      case 'Refund Policy':
      case 'Terms & Conditions':
      case 'Contact Us':
        // Navigate to web view for policy pages
        navigation.navigate('WebView', { 
          title: item.name,
          url: `https://rocketreels.com/${item.name.toLowerCase().replace(/\s+/g, '-')}`
        });
        break;
      case 'Delete Account':
        Alert.alert(
          'Delete Account',
          'This action cannot be undone. Are you sure?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                if (user?._id) {
                  deleteAccount(user._id);
                }
              },
            },
          ]
        );
        break;
      default:
        // Handle other menu items
        break;
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconSize = isLargeDevice ? width * 0.02 : width * 0.04;
    
    const iconMap: { [key: string]: React.ReactNode } = {
      invite: <MaterialCommunityIcons name="email-outline" size={iconSize} color="#ffffff" />,
      bookmark: <Icon name="bookmark-border" size={iconSize} color="#ffffff" />,
      play: <Icon name="play-arrow" size={iconSize} color="#ffffff" />,
      history: <Icon name="history" size={iconSize} color="#ffffff" />,
      transaction: <MaterialCommunityIcons name="swap-horizontal" size={iconSize} color="#ffffff" />,
      account_delete: <MaterialCommunityIcons name="account-remove" size={iconSize} color="#ffffff" />,
      '18+': <MaterialCommunityIcons name="account-alert" size={iconSize} color="#ffffff" />,
      privacy: <Icon name="security" size={iconSize} color="#ffffff" />,
      refund: <FontAwesome name="money" size={iconSize} color="#ffffff" />,
      service: <Icon name="description" size={iconSize} color="#ffffff" />,
      contact: <Icon name="contact-support" size={iconSize} color="#ffffff" />,
      logout: <Icon name="logout" size={iconSize} color="#ffffff" />,
      unlimited: <MaterialCommunityIcons name="infinity" size={iconSize} color="#ffffff" />,
      hd: <Icon name="hd" size={iconSize} color="#ffffff" />,
      'new-ads': <MaterialCommunityIcons name="block-helper" size={iconSize} color="#ffffff" />,
      community: <MaterialCommunityIcons name="account-group" size={iconSize} color="#ffffff" />,
      coin: <FontAwesome5 name="coins" size={iconSize} color="#ffffff" />,
      refill: <MaterialCommunityIcons name="diamond-stone" size={iconSize} color="#ffffff" />,
      edit: <Icon name="edit" size={iconSize} color="#ffffff" />,
      share: <Icon name="share" size={iconSize} color="#ffffff" />,
      whatsapp: <FontAwesome name="whatsapp" size={iconSize} color="#ffffff" />,
      copy: <Icon name="content-copy" size={iconSize} color="#ffffff" />,
      'right-check': <Icon name="check-circle" size={iconSize} color="#ffffff" />
    };

    return (
      <View style={styles.iconContainer}>
        {iconMap[iconName] || <Icon name="help" size={iconSize} color="#ffffff" />}
      </View>
    );
  };

  // Get user data from API or fallback to store
  const userName = userProfile?.userName || user?.userName || 'Guest';
  const userEmail = userProfile?.userEmail || user?.userEmail || 'No email';
  const referralCode = userProfile?.referralCode || 'N/A';
  const firstLetter = userName?.charAt(0)?.toUpperCase() || 'G';
  
  // Check if user is logged in
  const isUserLoggedIn = !!user;
  
  // Debug logging for user data
  console.log('👤 Profile Screen - User Data:', {
    userFromStore: user,
    userFromAPI: userProfile,
    finalUserName: userName,
    finalUserEmail: userEmail,
    timestamp: new Date().toISOString(),
  });
  
  // Handle balance data structure - check for coinsQuantity structure
  const balance = balanceData?.coinsQuantity?.totalCoins || 
                 balanceData?.balance || 
                 balanceData?.totalCoins || 
                 0;

  // Menu data with real user data
  const menuData: MenuSection[] = [
    {
      id: 53532,
      title: 'REFERRAL',
      data: [
        {
          id: 35325,
          name: 'Invitation',
          desc: `Referral Code: ${referralCode}`,
          iconName: 'invite'
        }
      ]
    },
    {
      id: 53532,
      title: 'CATEGORY',
      data: [
        {
          id: 35325,
          name: 'Rocket Reels',
          desc: 'Our original Rocket Reels',
          iconName: 'bookmark'
        },
        {
          id: 85745,
          name: 'Explore',
          desc: 'Choose from your favourite genres',
          iconName: 'play'
        },
        {
          id: 85745,
          name: 'Tailored Content for Every Age',
          desc: 'Discover content that fits your age and mood.',
          iconName: 'bookmark'
        },
      ]
    },
    {
      id: 53532,
      title: 'MY UPDATES',
      data: [
        {
          id: 85685,
          name: 'My List',
          desc: 'See added MyList here',
          iconName: 'bookmark'
        },
        {
          id: 85685,
          name: 'My History',
          desc: 'Know your viewing activity',
          iconName: 'history'
        },
        {
          id: 85685,
          name: 'Transaction History',
          desc: 'Know your payment transactions',
          iconName: 'transaction'
        },
      ]
    },
    {
      id: 854643,
      title: 'SETTINGS',
      data: [
        {
          id: 745634,
          name: 'Delete Account',
          desc: 'Delete your account here',
          iconName: 'account_delete'
        },
        {
          id: 855754,
          name: 'Watch Family Safe Content',
          desc: 'Want to enable family safe content',
          iconName: '18+'
        },
      ]
    },
    {
      id: 7456345,
      title: 'POLICY & SUPPORT',
      data: [
        {
          id: 865756,
          name: 'Privacy Policy',
          desc: 'Our terms of use & agreements',
          iconName: 'privacy'
        },
        {
          id: 865756,
          name: 'Refund Policy',
          desc: 'Our refund and cancellation policy',
          iconName: 'refund'
        },
        {
          id: 865756,
          name: 'Terms & Conditions',
          desc: 'Our terms and conditions',
          iconName: 'service'
        },
        {
          id: 865756,
          name: 'Contact Us',
          desc: 'Contact us for support and assistance',
          iconName: 'contact'
        }
      ]
    },
    {
      id: 7456345,
      title: 'OTHERS',
      data: [
        {
          id: 865756,
          name: 'Log out',
          desc: 'Sign off from the system',
          iconName: 'logout'
        }
      ]
    },
  ];

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={styles.container}
    >
      <View style={[styles.mainContainer, { marginBottom: isHide ? marginBottom : 0 }]}>
        <ScrollView
          onScroll={onScroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#E9743A', '#CB2D4D']}
              tintColor="#E9743A"
            />
          }
        >
          {/* Profile Header */}
          <View style={[styles.profileHeader, { marginTop: insets.top }]}>
            <View style={styles.profileInfo}>
              <View style={styles.profileImage}>
                {(user as any)?.profilePicture ? (
                  <Image 
                    source={{ uri: (user as any).profilePicture }} 
                    style={styles.profileImageStyle}
                  />
                ) : (
                  <Text style={styles.profileInitial}>{firstLetter}</Text>
                )}
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
              </View>
            </View>
            {isUserLoggedIn ? (
              <PressableButton style={{ padding: isLargeDevice ? width * .02 : width * .04 }} onPress={() => navigation.navigate('EditProfile')}>
                <SvgIcons name={'edit'} size={isLargeDevice ? width * .025 : width * .05} color="#ffffff" />
              </PressableButton>
            ) : (
              <PressableButton style={styles.btnContainer} onPress={() => navigation.navigate('Auth')}>
                <LinearGradient 
                  colors={['#E9743A', '#CB2D4D']}
                  style={{ 
                    padding: isLargeDevice ? width * .01 : width * .02, 
                    paddingHorizontal: isLargeDevice ? width * .025 : width * .05, 
                    justifyContent: 'center', 
                    borderRadius: isLargeDevice ? width * .015 : width * .03, 
                    alignItems: 'center' 
                  }}
                >
                  <Text style={styles.heading}>
                    Login
                  </Text>
                </LinearGradient>
              </PressableButton>
            )}
          </View>

          <View style={styles.contentContainer}>
            {/* VIP Member Section */}
            <View style={styles.vipCard}>
              <LinearGradient
                colors={["#A07A64", "#5E4536"]}
                style={styles.vipGradient}
              >
                <View style={styles.vipHeader}>
                  <View style={styles.vipTextContainer}>
                    <Text style={styles.vipTitle}>Become a VIP Member</Text>
                    <Text style={styles.vipSubtitle}>Enjoy all benefits</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.goButton}
                    onPress={() => navigation.navigate('Subscription')}
                  >
                    <LinearGradient
                      colors={['#E9743A', '#CB2D4D']}
                      style={styles.goButtonGradient}
                    >
                      <Text style={styles.goButtonText}>GO</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={styles.vipBenefits}>
                  {[
                    { icon: 'unlimited', text: 'Unlimited Viewing' },
                    { icon: 'hd', text: 'HD videos' },
                    { icon: 'new-ads', text: 'Ad free videos' },
                    { icon: 'community', text: 'VIP Community' }
                  ].reduce<{ icon: string; text: string }[][]>((rows, item, index) => {
                    if (index % 2 === 0) {
                      rows.push([item]);
                    } else {
                      rows[rows.length - 1].push(item);
                    }
                    return rows;
                  }, []).map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.benefitsRow}>
                      {row.map((item, index) => (
                        <View key={index} style={styles.benefitItem}>
                          <View style={styles.benefitIconContainer}>
                            {item.icon === 'unlimited' ? (
                              <MaterialCommunityIcons name="infinity" size={isLargeDevice ? width * 0.02 : width * 0.04} color="#ffffff" />
                            ) : item.icon === 'hd' ? (
                              <Icon name="hd" size={isLargeDevice ? width * 0.02 : width * 0.04} color="#ffffff" />
                            ) : item.icon === 'new-ads' ? (
                              <MaterialCommunityIcons name="block-helper" size={isLargeDevice ? width * 0.02 : width * 0.04} color="#ffffff" />
                            ) : (
                              <MaterialCommunityIcons name="account-group" size={isLargeDevice ? width * 0.02 : width * 0.04} color="#ffffff" />
                            )}
                          </View>
                          <Text style={styles.benefitText}>{item.text}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>

            {/* Wallet Section */}
            <TouchableOpacity
              style={styles.walletCard}
              onPress={() => navigation.navigate('MyWallet')}
            >
              <View style={styles.walletLeft}>
                <View style={styles.walletBalance}>
                  <FontAwesome5 name="coins" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" style={styles.coinIcon} />
                  <Text style={styles.balanceAmount}>{balance}</Text>
                </View>
                <Text style={styles.walletLabel}>My Wallet</Text>
              </View>
              <TouchableOpacity
                style={styles.loadNowButton}
                onPress={() => navigation.navigate('Refill')}
              >
                <LinearGradient
                  colors={['#E9743A', '#CB2D4D']}
                  style={styles.loadNowGradient}
                >
                  <MaterialCommunityIcons name="diamond-stone" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" style={styles.loadNowIcon} />
                  <Text style={styles.loadNowText}>Load Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Menu Sections */}
            {menuData.map((section, sectionIndex) => (
              <View key={sectionIndex} style={styles.menuSection}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.data.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={styles.menuItem}
                    onPress={() => handleMenuItemPress(item)}
                  >
                    <View style={styles.menuItemLeft}>
                      {getIconComponent(item.iconName)}
                      <View style={styles.menuItemText}>
                        <Text style={styles.menuItemTitle}>{item.name}</Text>
                        <Text style={styles.menuItemDesc}>{item.desc}</Text>
                      </View>
                    </View>
                    {item.name === 'Watch Family Safe Content' && (
                      <View style={[styles.toggle, familySafeToggle && styles.toggleActive]}>
                        <View style={[styles.toggleThumb, familySafeToggle && styles.toggleThumbActive]} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Invitation Modal */}
      {isInvitationModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#A07A64", "#5E4536"]}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Refer friends</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsInvitationModalVisible(false)}
                >
                  <Icon name="close" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.modalContent}>
                <Text style={styles.modalDescription}>
                  Earn upto{' '}
                  <Text style={styles.coinAmount}>5</Text>
                  {' '}coins per invite.
                </Text>

                {/* WhatsApp Button */}
                <TouchableOpacity
                  style={[styles.shareButton, styles.whatsappButton]}
                  onPress={onShareWhatsApp}
                >
                  <FontAwesome name="whatsapp" size={20} color="#ffffff" />
                  <Text style={styles.shareButtonText}>WHATSAPP</Text>
                </TouchableOpacity>

                {/* Share Link Button */}
                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={onShareLink}
                >
                  <Icon name="share" size={20} color="#ffffff" />
                  <Text style={styles.shareButtonText}>SHARE LINK</Text>
                </TouchableOpacity>

                {/* Referral Code */}
                {userProfile?.referralCode && (
                  <TouchableOpacity
                    style={styles.referralCodeContainer}
                    onPress={onCopyReferralCode}
                  >
                    <Text style={styles.referralCodeText}>
                      {userProfile.referralCode}
                    </Text>
                    <Icon 
                      name={isCopySuccess ? "check-circle" : "content-copy"} 
                      size={20} 
                      color="#ffffff" 
                    />
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 40,
    paddingTop : 20
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isLargeDevice ? width * 0.04 : width * 0.06,
    paddingVertical: isLargeDevice ? width * 0.03 : width * 0.05,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    marginTop: isLargeDevice ? width * 0.02 : width * 0.04,
    borderRadius: 16,
    // elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: isLargeDevice ? width * 0.1 : width * 0.18,
    height: isLargeDevice ? width * 0.1 : width * 0.18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  profileInitial: {
    fontSize: isLargeDevice ? 24 : 32,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  profileImageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  btnContainer: {
    // Button container style
  },
  heading: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  profileDetails: {
    marginLeft: isLargeDevice ? width * 0.02 : width * 0.04,
    flex: 1,
  },
  userName: {
    fontSize: isLargeDevice ? 18 : 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01,
    textTransform: 'capitalize',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  userEmail: {
    fontSize: isLargeDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  editButton: {
    padding: isLargeDevice ? width * 0.015 : width * 0.03,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  contentContainer: {
    flex: 1,
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  vipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: isLargeDevice ? width * 0.02 : width * 0.04,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  vipGradient: {
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
  },
  vipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.03,
  },
  vipTextContainer: {
    flex: 1,
    marginRight: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  vipTitle: {
    fontSize: isLargeDevice ? 16 : 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.005 : width * 0.01,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  vipSubtitle: {
    fontSize: isLargeDevice ? 12 : 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  goButton: {
    borderRadius: 24,
    overflow: 'hidden',
    // elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  goButtonGradient: {
    paddingHorizontal: isLargeDevice ? width * 0.05 : width * 0.1,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.025,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    fontSize: isLargeDevice ? 12 : 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    letterSpacing: 0.5,
  },
  vipBenefits: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
  },
  benefitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  benefitIconContainer: {
    backgroundColor: 'rgba(94, 69, 54, 0.8)',
    width: isLargeDevice ? width * 0.045 : width * 0.09,
    height: isLargeDevice ? width * 0.045 : width * 0.09,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isLargeDevice ? width * 0.015 : width * 0.025,
  },

  benefitText: {
    fontSize: isLargeDevice ? 11 : 13,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  walletCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: isLargeDevice ? width * 0.02 : width * 0.04,
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
    borderRadius: 20,
    // elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  walletLeft: {
    flex: 1,
  },
  walletBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.001 : width * 0.01,
  },
  coinIcon: {
    fontSize: isLargeDevice ? 24 : 32,
    marginRight: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  balanceAmount: {
    fontSize: isLargeDevice ? 24 : 28,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  walletLabel: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loadNowButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loadNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  loadNowIcon: {
    fontSize: isLargeDevice ? 20 : 24,
    marginRight: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  loadNowText: {
    fontSize: isLargeDevice ? 12 : 14,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    letterSpacing: 0.3,
  },
  menuSection: {
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
    // backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    marginHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    // elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.015 : width * 0.025,
    marginLeft: isLargeDevice ? width * 0.02 : width * 0.04,
    marginTop: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingTop: isLargeDevice ? width * 0.02 : width * 0.04,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginBottom: 0,
    padding: isLargeDevice ? width * 0.02 : width * 0.035,
    paddingVertical: isLargeDevice ? width * 0.015 : width * 0.025,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: isLargeDevice ? width * 0.055 : width * 0.11,
    height: isLargeDevice ? width * 0.055 : width * 0.11,
    borderRadius: 999,
    backgroundColor: 'rgba(94, 69, 54, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isLargeDevice ? width * 0.02 : width * 0.035,
  },

  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: isLargeDevice ? 13 : 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.003 : width * 0.005,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  menuItemDesc: {
    fontSize: isLargeDevice ? 11 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  toggle: {
    width: isLargeDevice ? width * 0.09 : width * 0.14,
    height: isLargeDevice ? width * 0.045 : width * 0.07,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: '#E9743A',
  },
  toggleThumb: {
    width: isLargeDevice ? width * 0.04 : width * 0.06,
    height: isLargeDevice ? width * 0.04 : width * 0.06,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: isLargeDevice ? width * 0.5 : width * 0.9,
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalGradient: {
    padding: isLargeDevice ? width * 0.03 : width * 0.04,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  modalTitle: {
    fontSize: isLargeDevice ? 24 : 28,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  closeButton: {
    width: isLargeDevice ? width * 0.06 : width * 0.1,
    height: isLargeDevice ? width * 0.06 : width * 0.1,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    gap: isLargeDevice ? width * 0.02 : width * 0.03,
  },
  modalDescription: {
    fontSize: isLargeDevice ? 16 : 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.03,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  coinAmount: {
    fontSize: isLargeDevice ? 24 : 26,
    fontWeight: 'bold',
    color: '#FFD700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: isLargeDevice ? width * 0.02 : width * 0.03,
    borderRadius: 12,
    gap: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  shareButtonText: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: isLargeDevice ? width * 0.02 : width * 0.03,
    borderRadius: 12,
    marginTop: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  referralCodeText: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});

export default ProfileScreen;