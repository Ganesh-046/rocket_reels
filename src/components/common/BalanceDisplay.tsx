import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Dimensions } from 'react-native';
import { SvgIcons } from './SvgIcons';
import { BalanceResponse } from '../../types/api';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface BalanceDisplayProps {
  balanceData?: BalanceResponse;
  onPress: () => void;
  showNavigation?: boolean;
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balanceData,
  onPress,
  showNavigation = false,
}) => {
  const totalCoins = balanceData?.coinsQuantity?.totalCoins || 0;

  return (
    <TouchableOpacity
      style={styles.balanceContent}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.balanceLeft}>
        <Text style={styles.balanceText}>Balance</Text>
        {showNavigation && (
          <Text style={styles.arrowText}>→</Text>
        )}
      </View>
      <View style={styles.balanceRight}>
        <SvgIcons name="coin" size={isLargeDevice ? width * 0.04 : width * 0.06} />
        <Text style={styles.balanceAmount}>
          {totalCoins}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: isLargeDevice ? width * 0.025 : width * 0.04,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: isLargeDevice ? 18 : 24,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: isLargeDevice ? width * 0.01 : width * 0.02,
    fontFamily: 'System',
  },
  arrowText: {
    fontSize: 18,
    color: '#ffffff',
    fontFamily: 'System',
  },
  balanceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    fontSize: isLargeDevice ? 22 : 30,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: isLargeDevice ? width * 0.01 : width * 0.02,
    fontFamily: 'System',
  },
}); 