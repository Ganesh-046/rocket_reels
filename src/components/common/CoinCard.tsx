import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SvgIcons } from './SvgIcons';
import { RechargePlan } from '../../types/api';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface CoinCardProps {
  item: RechargePlan;
  onPress: () => void;
  isProcessing?: boolean;
}

export const CoinCard: React.FC<CoinCardProps> = ({
  item,
  onPress,
  isProcessing = false,
}) => {
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
      style={[
        styles.refillCard,
        { opacity: isProcessing ? 0.6 : 1 }
      ]}
      onPress={onPress}
      disabled={isProcessing}
      activeOpacity={0.8}
    >
      <View style={styles.refillCardContent}>
        <View style={styles.planContainer}>
          <Text style={styles.planNameText}>
            {item.planName?.split('_')[0]} {item.planName?.split('_')[1]}
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
          <SvgIcons name="coin" size={isLargeDevice ? width * 0.03 : width * 0.05} color="#ffffff" />
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
};

const styles = StyleSheet.create({
  refillCard: {
    borderRadius: 20,
    margin: isLargeDevice ? width * 0.015 : width * 0.025,
    marginHorizontal: isLargeDevice ? width * 0.0115 : width * 0.02,
    height: isLargeDevice ? width * 0.2 : width * 0.3,
    width: isLargeDevice ? width * 0.227 : width * 0.458,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  refillCardContent: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  planContainer: {
    position: 'absolute',
    right: -width * 0.01,
    top: -width * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 69, 54, 0.9)',
    borderRadius: 12,
    padding: width * 0.01,
    zIndex: 1,
  },
  planNameText: {
    color: '#ffffff',
    textTransform: 'capitalize',
    fontSize: isLargeDevice ? 12 : 16,
    fontFamily: 'System',
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
    backgroundColor: 'rgba(94, 69, 54, 0.9)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: isLargeDevice ? width * 0.015 : width * 0.025,
  },
  coinsAmount: {
    fontSize: isLargeDevice ? 16 : 20,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: width * 0.005,
    fontFamily: 'System',
  },
  coinsLabel: {
    color: '#ffffff',
    marginLeft: isLargeDevice ? width * 0.005 : width * 0.01,
    fontSize: isLargeDevice ? 12 : 14,
    fontFamily: 'System',
  },
}); 