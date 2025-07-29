import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Linking, Alert, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/auth.store';
import { useSubscription } from '../../context/SubscriptionContext';
import { SvgIcons } from './SvgIcons';

interface SubscriptionStatusDisplayProps {
  subscriptionItem: any;
  isLargeDevice?: boolean;
  width?: number;
  appFonts?: any;
}

const SubscriptionStatusDisplay: React.FC<SubscriptionStatusDisplayProps> = ({ 
  subscriptionItem, 
  isLargeDevice = false, 
  width = 0, 
  appFonts = {} 
}) => {
  const { theme: { colors } } = useTheme();
  const user = useAuthStore((state) => state.user);
  const { currentSubscription } = useSubscription();

  // Check if user has an active subscription from backend
  const hasBackendSubscription = user?.isSubscriber && user?.planDetails;
  
  // Check if this specific subscription is active
  const isActiveSubscription = () => {
    // First check backend subscription
    if (hasBackendSubscription) {
      const backendMatch = user.planDetails.planName === subscriptionItem.planName;
      return backendMatch;
    }
    
    // Then check IAP subscription
    if (currentSubscription) {
      const iapMatch = currentSubscription.productId === subscriptionItem.planName;
      return iapMatch;
    }
    return false;
  };

  const isActive = useMemo(() => isActiveSubscription(), [user, currentSubscription, subscriptionItem.planName]);

  if (!isActive) {
    return null;
  }

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const getSubscriptionStatusText = () => {
    if (hasBackendSubscription) {
      const endDate = user.subscriptionEndDate ? new Date(parseInt(user.subscriptionEndDate)) : null;
      if (endDate) {
        const now = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return `Active - ${daysLeft} days left`;
      }
      return 'Active';
    }
    return 'Active';
  };

  return (
    <View style={[styles.container, { marginTop: isLargeDevice ? width * 0.01 : width * 0.02 }]}>
      <View style={[styles.statusContainer, { backgroundColor: colors.PRIMARYWHITEFOUR }]}>
        <SvgIcons 
          name="check-circle" 
          size={isLargeDevice ? width * 0.025 : width * 0.04} 
          color="#4CAF50" 
        />
        <Text style={[styles.statusText, { 
          fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28,
          color: colors.PRIMARYBLACK,
          marginLeft: isLargeDevice ? width * 0.01 : width * 0.015 
        }]}>
          {getSubscriptionStatusText()}
        </Text>
      </View>
      
      <View style={[styles.manageContainer, { marginTop: isLargeDevice ? width * 0.005 : width * 0.01 }]}>
        <Text style={[styles.manageText, { 
          fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_12 : appFonts.APP_FONT_SIZE_20,
          color: colors.PRIMARYLIGHTBLACKTWO 
        }]}>
          Manage subscription in device settings
        </Text>
        <Text 
          style={[styles.manageLink, { 
            fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_12 : appFonts.APP_FONT_SIZE_20,
            color: colors.PRIMARYBLACK,
            textDecorationLine: 'underline'
          }]}
          onPress={handleManageSubscription}
        >
          Manage
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
  },
  manageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manageText: {
    flex: 1,
  },
  manageLink: {
    fontWeight: '600',
  },
});

export default SubscriptionStatusDisplay; 