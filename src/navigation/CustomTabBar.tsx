import React, { useRef, useEffect, useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// Mock context and hooks to match first tab bar structure
const mockDeviceContext = {
  isLargeDevice: false,
  dimension: { width },
  appFonts: {
    APP_FONT_SIZE_16: 16,
    APP_FONT_SIZE_28: 12,
  }
};

const mockColors = {
  PRIMARYLIGHTBLACK: '#1A1A1A',
  PRIMARYBLACK: '#000000',
  PRIMARYWHITE: '#FFFFFF',
};

const mockInsets = {
  bottom: Platform.OS === 'ios' ? 20 : 0,
};

const APP_FONT_REGULAR = 'System';

// OpacityButton component to match first tab bar
const OpacityButton: React.FC<{
  children: React.ReactNode;
  style?: any;
  onPress: () => void;
}> = ({ children, style, onPress }) => (
  <TouchableOpacity style={style} onPress={onPress} activeOpacity={0.85}>
    {children}
  </TouchableOpacity>
);

// SvgIcons component to match first tab bar
const SvgIcons: React.FC<{
  name: string;
  size: number;
  color: string;
  strokeWidth?: number;
}> = ({ name, size, color, strokeWidth }) => {
  let iconName = '';
  switch (name) {
    case 'home':
      iconName = 'home-outline';
      break;
    case 'search':
      iconName = 'search-outline';
      break;
    case 'rewards':
      iconName = 'gift-outline';
      break;
    case 'profile':
      iconName = 'person-outline';
      break;
    case 'shorts':
      iconName = 'play-circle-outline';
      break;
    default:
      iconName = 'ellipse-outline';
  }
  return <Icon name={iconName} size={size} color={color} />;
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { isLargeDevice, dimension: { width }, appFonts } = mockDeviceContext;
  const colors = mockColors;
  const insets = mockInsets;
  const tabWidth = (width - (width * 0.08)) / 4;
  const tabAnimations = useRef(
    Array(4).fill(0).map(() => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0.8),
      gradientOpacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Animate all tabs
    tabAnimations.forEach((anim, index) => {
      const isFocused = state.index === index;
      Animated.parallel([
        Animated.timing(anim.scale, {
          toValue: isFocused ? 1.05 : 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(anim.opacity, {
          toValue: isFocused ? 1 : 0.8,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(anim.gradientOpacity, {
          toValue: isFocused ? 1 : 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [state.index, tabWidth]);

  return (
    <LinearGradient
      colors={[colors.PRIMARYLIGHTBLACK, colors.PRIMARYBLACK]}
      locations={[0, 0.5, 1]}
      style={{
        height: Platform.OS === 'ios' ? width * 0.14 + insets.bottom : isLargeDevice ? width * .08 : width * 0.14,
        paddingHorizontal: isLargeDevice ? width * .02 : width * 0.04,
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
        paddingTop: Platform.OS === 'ios' ? width * 0.02 : 0,
        borderTopWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tabAnim = tabAnimations[index];
        
        const onPress = () => {
          // Press animation
          Animated.sequence([
            Animated.timing(tabAnim.scale, {
              toValue: 0.95,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(tabAnim.scale, {
              toValue: isFocused ? 1.05 : 1,
              duration: 150,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
          ]).start();
          
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName = '';
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Discover') {
          iconName = 'search';
        } else if (route.name === 'Rewards') {
          iconName = 'rewards';
        } else if (route.name === 'Profile') {
          iconName = 'profile';
        }

        return (
          <OpacityButton
            key={route.key}
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: width * 0.05,
              minHeight: isLargeDevice ? width * .04 : width * 0.1,
              backgroundColor: 'transparent'
            }}
            onPress={onPress}
          >
            <Animated.View
              style={{
                transform: [{ scale: tabAnim.scale }],
                opacity: tabAnim.opacity,
              }}
            >
              <AnimatedLinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={['#ED9B72', '#7D2537']}
                style={{
                  opacity: tabAnim.gradientOpacity,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: width * 0.05,
                  flexDirection: 'row',
                  minHeight: isLargeDevice ? width * .04 : width * 0.1,
                  backgroundColor: 'transparent',
                  marginVertical: width * 0.015,
                  paddingVertical: width * 0.015,
                  paddingHorizontal: width * 0.03,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <Animated.View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: width * 0.05,
                  flexDirection: 'row',
                  minHeight: isLargeDevice ? width * .04 : width * 0.1,
                  backgroundColor: 'transparent',
                  marginVertical: width * 0.015,
                  paddingVertical: width * 0.015,
                  paddingHorizontal: width * 0.03,
                }}
              >
                <SvgIcons
                  name={iconName}
                  size={isLargeDevice ? width * .025 : width * 0.06}
                  color={colors.PRIMARYWHITE}
                  strokeWidth={1.5}
                />
                <Animated.Text
                  style={{
                    color: colors.PRIMARYWHITE,
                    fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_28,
                    fontFamily: APP_FONT_REGULAR,
                    marginLeft: isLargeDevice ? width * .01 : width * 0.02,
                    opacity: tabAnim.gradientOpacity,
                  }}
                >
                  {route.name}
                </Animated.Text>
              </Animated.View>
            </Animated.View>
          </OpacityButton>
        );
      })}
    </LinearGradient>
  );
};

export default CustomTabBar; 