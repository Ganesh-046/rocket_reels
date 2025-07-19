import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLogin, useOTPVerification, useUpdateUser, useCountries } from '../../hooks/useAuth';
import { useAuthActions } from '../../store/auth.store';
import { Country, UserSignupRequest } from '../../types/api';
import { getUniqueId } from 'react-native-device-info';
import { getMessaging } from '@react-native-firebase/messaging';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

const { width, height } = Dimensions.get('window');

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
];

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login, setNewUser } = useAuthActions();

  // States
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isType, setIsType] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    mobileNumber: '',
    otp: '',
    name: '',
    email: '',
    gender: '',
    dob: '',
    referralCode: '',
    countryCode: { name: 'India', code: '+91' },
    deviceToken: '',
    deviceType: Platform.OS,
    firebaseToken: '',
  });

  // Hooks
  const loginMutation = useLogin();
  const otpMutation = useOTPVerification();
  const updateUserMutation = useUpdateUser();
  const { data: countriesData } = useCountries();

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Effects
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Get device info
    getDeviceInfo();
  }, []);

  useEffect(() => {
    // Timer for OTP
    const interval = setInterval(() => {
      setTimeRemaining(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Functions
  const getDeviceInfo = async () => {
    try {
      const deviceToken = await getUniqueId();
      const fcmToken = await getMessaging().getToken();
      
      setFormData(prev => ({
        ...prev,
        deviceToken,
        firebaseToken: fcmToken,
      }));
    } catch (error) {
      console.error('Error getting device info:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendOTP = async () => {
    if (!formData.mobileNumber.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!formData.countryCode) {
      Alert.alert('Error', 'Please select your country');
      return;
    }

    try {
      setLoading(true);
      const response = await loginMutation.mutateAsync({
        mobileNo: formData.mobileNumber.trim(),
        callingCode: formData.countryCode.code,
      });

      if (response.status) {
        setStep(2);
        setTimeRemaining(60);
        
        // Auto-fill OTP for test numbers
        if (['7991585758', '9321803068', '8291042128'].includes(formData.mobileNumber)) {
          handleInputChange('otp', JSON.stringify(response.data));
        }
        
        Alert.alert('Success', 'OTP sent to your mobile number');
      } else {
        Alert.alert('Error', response.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp.trim() || formData.otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await otpMutation.mutateAsync({
        mobileNo: formData.mobileNumber.trim(),
        otp: formData.otp.trim(),
        deviceType: formData.deviceType,
        deviceToken: formData.deviceToken,
        firebaseToken: formData.firebaseToken,
      });

      if (response.status && response.data) {
        if (response.data.isNew) {
          setUserId(response.data.userId);
          setToken(response.data.token);
          setStep(3);
        } else {
          // Existing user - login directly
          login(response.data, response.data.token);
          navigation.replace('Main');
        }
      } else {
        Alert.alert('Error', response.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    // Validation
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.email?.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!formData.gender?.trim()) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    if (!formData.dob?.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }

    if (!userId || !token) {
      Alert.alert('Error', 'Invalid session. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const signupData: UserSignupRequest = {
        userName: formData.name.trim(),
        userEmail: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dob,
        mobileNo: formData.mobileNumber.trim(),
        referralCode: formData.referralCode?.trim() || '',
        countryName: formData.countryCode.name,
        callingCode: formData.countryCode.code,
      };

      const response = await updateUserMutation.mutateAsync({
        id: userId,
        data: signupData,
      });

      if (response.status && response.data) {
        login(response.data, token);
        navigation.replace('Main');
      } else {
        Alert.alert('Error', response.message || 'Failed to complete registration');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await loginMutation.mutateAsync({
        mobileNo: formData.mobileNumber.trim(),
        callingCode: formData.countryCode.code,
      });

      if (response.status) {
        setTimeRemaining(60);
        Alert.alert('Success', 'OTP resent successfully');
      } else {
        Alert.alert('Error', response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatMobileNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 10);
  };

  const formatOTP = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.slice(0, 6);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const renderStep1 = () => (
    <Animated.View
      style={[
        styles.screenContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeTitle}>Welcome Back!</Text>
        <Text style={styles.welcomeSubtitle}>
          Sign in to continue your journey
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.phoneInputWrapper}>
          <TouchableOpacity
            style={styles.countryCodeButton}
            onPress={() => setShowCountryPicker(true)}
          >
            <Text style={styles.countryCodeText}>
              {formData.countryCode.code}
            </Text>
            <Icon name="keyboard-arrow-down" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>

          <View style={styles.phoneInputContainer}>
            <TextInput
              style={styles.phoneInput}
              placeholder="Mobile Number"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={formData.mobileNumber}
              onChangeText={(text) => handleInputChange('mobileNumber', formatMobileNumber(text))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, !formData.mobileNumber.trim() && styles.disabledButton]}
        onPress={handleSendOTP}
        disabled={!formData.mobileNumber.trim() || loading}
      >
        <LinearGradient colors={['#ed9b72', '#7d2537']} style={styles.gradientButton}>
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Buttons */}
      <View style={styles.socialButtonsContainer}>
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.socialButton}>
            <Icon name="apple" size={24} color="#000000" />
            <Text style={[styles.primaryButtonText, { marginLeft: 12, color: '#000000' }]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.socialButton}>
          <Icon name="g-translate" size={24} color="#4285F4" />
          <Text style={[styles.primaryButtonText, { marginLeft: 12 }]}>
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      style={[
        styles.screenContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeTitle}>Verify Your Number</Text>
        <Text style={styles.welcomeSubtitle}>
          We've sent a OTP to your mobile number
        </Text>
      </View>

      {/* OTP Input */}
      <View style={styles.otpContainer}>
        <TextInput
          style={styles.otpInput}
          placeholder="Enter 6-digit OTP"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={formData.otp}
          onChangeText={(text) => handleInputChange('otp', formatOTP(text))}
          keyboardType="number-pad"
          maxLength={6}
          textAlign="center"
          autoFocus
        />
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>
          Code expires in{' '}
          <Text style={styles.timerHighlight}>{displayTime()}</Text>
        </Text>

        {timeRemaining === 0 && (
          <TouchableOpacity style={styles.resendButton} onPress={handleResendOTP}>
            <Text style={styles.resendButtonText}>Resend Code</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <LinearGradient colors={['#ed9b72', '#7d2537']} style={styles.gradientButton}>
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Verify OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      style={[
        styles.screenContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.welcomeTextContainer}>
        <Text style={styles.welcomeTitle}>Almost There!</Text>
        <Text style={styles.welcomeSubtitle}>
          Complete your profile to get started
        </Text>
      </View>

      <ScrollView
        style={styles.formScrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formFieldContainer}>
          <Text style={styles.fieldLabel}>Full Name</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter your full name"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            autoCapitalize="words"
          />
        </View>

        {(!isType || isEmpty) && (
          <View style={styles.formFieldContainer}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Enter your email"
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        <View style={styles.rowContainer}>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={formData.dob ? styles.datePickerText : styles.datePickerPlaceholder}>
                {formData.dob || 'Select Date'}
              </Text>
              <Text style={styles.datePickerIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <TouchableOpacity
              style={styles.genderButton}
              onPress={() => {
                // Simple gender selection - you can enhance this
                const currentIndex = genderOptions.findIndex(option => option.value === formData.gender);
                const nextIndex = (currentIndex + 1) % genderOptions.length;
                handleInputChange('gender', genderOptions[nextIndex].value);
              }}
            >
              <Text style={styles.genderButtonText}>
                {formData.gender ? genderOptions.find(option => option.value === formData.gender)?.label : 'Select Gender'}
              </Text>
              <Icon name="keyboard-arrow-down" size={20} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formFieldContainer}>
          <Text style={styles.fieldLabel}>Referral Code (Optional)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="Enter referral code"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={formData.referralCode}
            onChangeText={(text) => handleInputChange('referralCode', text.toUpperCase())}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCompleteRegistration}
          disabled={loading}
        >
          <LinearGradient colors={['#ed9b72', '#7d2537']} style={styles.gradientButton}>
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Complete Registration</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => step > 1 ? setStep(step - 1 as any) : navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              style={styles.logo}
              source={require('../../assets/images/logo.png')}
              resizeMode="contain"
            />
          </View>

          <View style={styles.glassCard}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </View>
        </ScrollView>

        {/* Date Picker */}
        <DateTimePicker
          isVisible={showDatePicker}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onConfirm={(date) => {
            setShowDatePicker(false);
            handleInputChange('dob', moment(date).format('YYYY-MM-DD'));
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* Country Picker - You'll need to implement this */}
        {/* For now, using a simple alert */}
        {showCountryPicker && (
          <View style={styles.modalOverlay}>
            <View style={styles.countryPickerModal}>
              <Text style={styles.modalTitle}>Select Country</Text>
              {countriesData?.data?.slice(0, 10).map((country: Country) => (
                <TouchableOpacity
                  key={country._id}
                  style={styles.countryOption}
                  onPress={() => {
                    setShowCountryPicker(false);
                    handleInputChange('countryCode', {
                      name: country.name,
                      code: country.callingCode,
                    });
                  }}
                >
                  <Text style={styles.countryOptionText}>
                    {country.name} ({country.callingCode})
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCountryPicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 50,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    minHeight: height,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
  },
  glassCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  screenContainer: {
    padding: 24,
  },
  welcomeTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  phoneInputContainer: {
    flex: 1,
  },
  phoneInput: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  otpContainer: {
    marginBottom: 24,
  },
  otpInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 8,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  gradientButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    gap: 16,
  },
  socialButton: {
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  timerHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resendButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
  formScrollView: {
    flex: 1,
  },
  formFieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginVertical: 12,
  },
  halfWidth: {
    flex: 1,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  datePickerPlaceholder: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  datePickerIcon: {
    fontSize: 18,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryPickerModal: {
    backgroundColor: '#2c2c2c',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    maxHeight: height * 0.6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  countryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryOptionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ed9b72',
  },
});

export default LoginScreen; 