import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SubscriptionPlan } from '../../types/api';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface SubscriptionCardProps {
  item: SubscriptionPlan;
  onPress: () => void;
  isProcessing?: boolean;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  item,
  onPress,
  isProcessing = false,
}) => {
  const currencyFormat = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity
      style={[
        styles.subscriptionCard,
        { opacity: isProcessing ? 0.6 : 1 }
      ]}
      onPress={onPress}
      disabled={isProcessing}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={["#A07A64", "#5E4536"]}
        style={styles.subscriptionHeader}
      >
        <View style={styles.subscriptionHeaderContent}>
          <View style={styles.subscriptionDetails}>
            <Text style={styles.planName}>
              {item.planName?.split('_')[0] || 'Plan'}
            </Text>
            <Text style={styles.planDescription}>
              {item.description}
            </Text>
          </View>
          <View style={styles.subscriptionDuration}>
            <Text style={styles.durationText}>
              {item.planDuration}
            </Text>
            <Text style={styles.durationLabel}>
              Days
            </Text>
          </View>
        </View>
      </LinearGradient>
      <View style={styles.subscriptionPrice}>
        <Text style={styles.priceText}>
          {currencyFormat(item.price)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  subscriptionCard: {
    padding: isLargeDevice ? width * 0.015 : width * 0.025,
    borderRadius: 20,
    width: isLargeDevice ? width * 0.5 : width,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  subscriptionHeader: {
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    flex: 0,
  },
  subscriptionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
  },
  subscriptionDetails: {
    flex: 1,
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  planName: {
    textTransform: 'capitalize',
    fontSize: isLargeDevice ? 20 : 26,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'System',
  },
  planDescription: {
    marginTop: isLargeDevice ? width * 0.01 : width * 0.015,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: isLargeDevice ? 13 : 15,
    fontFamily: 'System',
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
  subscriptionPrice: {
    padding: isLargeDevice ? width * 0.015 : width * 0.025,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  priceText: {
    fontSize: isLargeDevice ? 14 : 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'System',
  },
}); 