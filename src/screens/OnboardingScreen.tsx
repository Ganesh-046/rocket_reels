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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Welcome to Rocket Reels',
    subtitle: 'Your ultimate entertainment destination',
    description: 'Discover thousands of movies, TV shows, and exclusive content tailored just for you.',
    image: require('../assets/images/onboarding-1.png'),
    icon: 'movie',
  },
  {
    id: 2,
    title: 'Watch Anywhere',
    subtitle: 'Stream on all your devices',
    description: 'Enjoy your favorite content on mobile, tablet, or TV. Download for offline viewing.',
    image: require('../assets/images/onboarding-2.png'),
    icon: 'devices',
  },
  {
    id: 3,
    title: 'Earn Rewards',
    subtitle: 'Get rewarded for watching',
    description: 'Watch ads, complete tasks, and earn coins to unlock premium content and features.',
    image: require('../assets/images/onboarding-3.png'),
    icon: 'card-giftcard',
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
    // Navigate to main app
    navigation.replace('MainStack');
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
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        </View>
        
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Icon name={item.icon} size={48} color="#ed9b72" />
          </View>
          
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