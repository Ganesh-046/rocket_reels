import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MMKVStorage from '../lib/mmkv';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Rocket Reels',
    subtitle: 'Your ultimate entertainment destination',
    description: 'Discover thousands of movies, TV shows, and exclusive content tailored just for you.',
    icon: 'movie',
    iconSize: 120,
  },
  {
    id: 2,
    title: 'Watch Anywhere',
    subtitle: 'Stream on all your devices',
    description: 'Enjoy your favorite content on mobile, tablet, or TV. Download for offline viewing.',
    icon: 'devices',
    iconSize: 120,
  },
  {
    id: 3,
    title: 'Earn Rewards',
    subtitle: 'Get rewarded for watching',
    description: 'Watch ads, complete tasks, and earn coins to unlock premium content and features.',
    icon: 'card-giftcard',
    iconSize: 120,
  },
];

const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      // Complete onboarding
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    // Navigate to auth stack since user is not authenticated yet
    navigation.replace('Main');
  };

  const showDebugInfo = () => {
    const alreadyLaunched = MMKVStorage.get('alreadyLaunched');
    const currentState = {
      currentIndex,
      alreadyLaunched,
      totalSlides: onboardingData.length,
    };

    console.log('[ONBOARDING DEBUG] Current State:', currentState);
    
    Alert.alert(
      '🔍 Onboarding Debug',
      `Current Slide: ${currentIndex + 1}/${onboardingData.length}\nAlready Launched: ${alreadyLaunched}\nSlide Title: ${onboardingData[currentIndex].title}`,
      [
        { text: 'Reset Already Launched', onPress: () => {
          MMKVStorage.remove('alreadyLaunched');
          Alert.alert('Reset', 'Already launched has been reset. Restart the app to see onboarding again.');
        }},
        { text: 'Complete Onboarding', onPress: () => {
          handleGetStarted();
        }},
        { text: 'OK' }
      ]
    );
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / width);
    setCurrentIndex(index);
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderCard = (item: any, index: number) => {
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.imageContainer}>
          <Icon name={item.icon} size={item.iconSize} color="#ffffff" />
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleGetStarted}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Debug Button */}
      <TouchableOpacity
        style={styles.debugButton}
        onPress={showDebugInfo}
      >
        <Text style={styles.debugText}>🔍 Debug</Text>
      </TouchableOpacity>

      {/* Cards */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => renderCard(item, index))}
      </ScrollView>

      {/* Dots */}
      {renderDots()}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {currentIndex === 0 ? (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleNext}>
            <LinearGradient colors={['#ffffff', '#f0f0f0']} style={styles.buttonGradient}>
              <Text style={styles.getStartedText}>Get Started</Text>
              <Icon name="arrow-forward" size={24} color="#7d2537" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient colors={['#ed9b72', '#7d2537']} style={styles.buttonGradient}>
              <Text style={styles.nextText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <Icon 
                name={currentIndex === onboardingData.length - 1 ? 'check' : 'arrow-forward'} 
                size={24} 
                color="#ffffff" 
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  debugButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1000,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ff4757',
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: width * 0.6,
    height: height * 0.3,
  },
  contentContainer: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  getStartedButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7d2537',
    marginRight: 8,
  },
  nextText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
});

export default OnboardingScreen; 