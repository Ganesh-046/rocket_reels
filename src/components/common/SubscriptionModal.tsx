import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
  onSignIn: () => void;
  onMaybeLater: () => void;
  isUserLoggedIn?: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  onSubscribe,
  onSignIn,
  onMaybeLater,
  isUserLoggedIn = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#1a1a1a', '#2a2a2a', '#1a1a1a']}
            style={styles.gradientContainer}
          >
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}
              // Prevent scrolling down by constraining content height
              onScroll={(event) => {
                const { contentOffset } = event.nativeEvent;
                // The content is sized to fit the container, so scrolling down is naturally prevented
              }}
              scrollEventThrottle={16}
            >
              {/* Lock Icon */}
              <View style={styles.lockIconContainer}>
                <View style={styles.lockIconBackground}>
                  <Icon name="lock-closed" size={isLargeDevice ? 60 : 50} color="#ffffff" />
                </View>
              </View>

              {/* Title */}
              <Text style={styles.title}>Premium Content</Text>
              
              {/* Subtitle */}
              <Text style={styles.subtitle}>
                This episode is locked. Subscribe to unlock all premium content and enjoy unlimited streaming.
              </Text>

              {/* Features List */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Icon name="checkmark-circle" size={20} color="#4ade80" />
                  <Text style={styles.featureText}>Unlock all episodes</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="checkmark-circle" size={20} color="#4ade80" />
                  <Text style={styles.featureText}>Ad-free experience</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="checkmark-circle" size={20} color="#4ade80" />
                  <Text style={styles.featureText}>HD quality streaming</Text>
                </View>
                <View style={styles.featureItem}>
                  <Icon name="checkmark-circle" size={20} color="#4ade80" />
                  <Text style={styles.featureText}>Download for offline</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                {!isUserLoggedIn ? (
                  <TouchableOpacity style={styles.signInButton} onPress={onSignIn}>
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.subscribeButton} onPress={onSubscribe}>
                    <LinearGradient
                      colors={['#ED9B72', '#7D2537']}
                      style={styles.subscribeGradient}
                    >
                      <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity style={styles.cancelButton} onPress={onMaybeLater}>
                  <Text style={styles.cancelButtonText}>Maybe Later</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
    maxHeight: height * 0.8, // Limit height to prevent overflow
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientContainer: {
    flex: 1,
    padding: 30,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%', // Ensure content fills the container
  },
  lockIconContainer: {
    marginBottom: 20,
  },
  lockIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: isLargeDevice ? 24 : 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: isLargeDevice ? 16 : 14,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: isLargeDevice ? 16 : 14,
    color: '#ffffff',
    marginLeft: 12,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  subscribeButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: isLargeDevice ? 18 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  signInButton: {
    width: '100%',
    backgroundColor: '#ED9B72',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: isLargeDevice ? 18 : 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    fontSize: isLargeDevice ? 16 : 14,
    color: '#ffffff',
  },
});

export default SubscriptionModal; 