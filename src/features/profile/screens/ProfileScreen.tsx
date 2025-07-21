import React, { useState } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

// Auth Store
import { useAuthStore, useAuthUser } from '../../../store/auth.store';

// MMKV Storage
import MMKVStorage from '../../../lib/mmkv';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string) => void;
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

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldHide = offsetY > 1;
    setIsHide(shouldHide);
  };

  const marginBottom = Platform.OS === 'android' ? tabBarHeight - 50 : tabBarHeight + insets.bottom - 20;

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
                // Handle account deletion
                logout();
                navigation.replace('Auth');
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

  // Get user data
  const userName = user?.userName || 'Guest';
  const userEmail = user?.userEmail || 'No email';
  const referralCode = 'N/A'; // UserProfile doesn't have referralCode
  const firstLetter = userName?.charAt(0)?.toUpperCase() || 'G';

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
        >
          {/* Profile Header */}
          <View style={[styles.profileHeader, { marginTop: insets.top }]}>
            <View style={styles.profileInfo}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>{firstLetter}</Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.userName}>{userName}</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Icon name="edit" size={isLargeDevice ? width * 0.02 : width * 0.04} color="#ffffff" />
            </TouchableOpacity>
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
                  <Text style={styles.balanceAmount}>0</Text>
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
});

export default ProfileScreen;