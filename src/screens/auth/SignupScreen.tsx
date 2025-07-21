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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSignup, useUpdateUser, useCountries } from '../../hooks/useAuth';
import { useAuthActions } from '../../store/auth.store';
import { Country, UserSignupRequest } from '../../types/api';

const SignupScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuthActions();

  // Get params from route
  const { userId, token } = route.params || {};

  // States
  const [formData, setFormData] = useState<Partial<UserSignupRequest>>({
    userName: '',
    userEmail: '',
    gender: '',
    dateOfBirth: '',
    mobileNo: '',
    referralCode: '',
    countryName: '',
    callingCode: '',
  });
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Hooks
  const signupMutation = useSignup();
  const updateUserMutation = useUpdateUser();
  const { data: countriesData } = useCountries();

  // Effects
  useEffect(() => {
    if (countriesData?.status && countriesData.data?.length > 0) {
      // Set default country (India)
      const defaultCountry = countriesData.data.find(country => country.code === 'IN');
      setSelectedCountry(defaultCountry || countriesData.data[0]);
      
      if (defaultCountry) {
        setFormData(prev => ({
          ...prev,
          countryName: defaultCountry.name,
          callingCode: defaultCountry.callingCode,
        }));
      }
    }
  }, [countriesData]);

  // Handlers
  const handleInputChange = (field: keyof UserSignupRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignup = async () => {
    // Validation
    if (!formData.userName?.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.userEmail?.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!formData.gender?.trim()) {
      Alert.alert('Error', 'Please select your gender');
      return;
    }

    if (!formData.dateOfBirth?.trim()) {
      Alert.alert('Error', 'Please enter your date of birth');
      return;
    }

    if (!formData.mobileNo?.trim()) {
      Alert.alert('Error', 'Please enter your mobile number');
      return;
    }

    if (!selectedCountry) {
      Alert.alert('Error', 'Please select your country');
      return;
    }

    try {
      const signupData: UserSignupRequest = {
        userName: formData.userName.trim(),
        userEmail: formData.userEmail.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        mobileNo: formData.mobileNo.trim(),
        referralCode: formData.referralCode?.trim() || '',
        countryName: selectedCountry.name,
        callingCode: selectedCountry.callingCode,
      };

      const response = await signupMutation.mutateAsync(signupData);

      if (response.status && response.data) {
        // If we have userId and token from OTP verification, update the user
        if (userId && token) {
          try {
            const updateResponse = await updateUserMutation.mutateAsync({
              id: userId,
              data: signupData,
            });

            if (updateResponse.status && updateResponse.data) {
              // Login with the updated user data
              login(updateResponse.data, token);
              // Navigate to main app
              navigation.replace('Main');
            } else {
              Alert.alert('Error', 'Failed to complete signup. Please try again.');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to complete signup. Please try again.');
          }
        } else {
          // Direct signup without OTP verification
          login(response.data, response.data.token);
          // Navigate to main app
          navigation.replace('Main');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const formatMobileNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    // Limit to 10 digits
    return cleaned.slice(0, 10);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return (
      formData.userName?.trim() &&
      formData.userEmail?.trim() &&
      validateEmail(formData.userEmail) &&
      formData.gender?.trim() &&
      formData.dateOfBirth?.trim() &&
      formData.mobileNo?.trim() &&
      selectedCountry
    );
  };

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo/Brand */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandTitle}>Join Rocket Reels</Text>
            <Text style={styles.brandSubtitle}>
              Complete your profile to get started
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={formData.userName}
                onChangeText={(text) => handleInputChange('userName', text)}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={formData.userEmail}
                onChangeText={(text) => handleInputChange('userEmail', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Gender */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderButton,
                      formData.gender === gender && styles.genderButtonActive
                    ]}
                    onPress={() => handleInputChange('gender', gender)}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      formData.gender === gender && styles.genderButtonTextActive
                    ]}>
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={formData.dateOfBirth}
                onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                keyboardType="numeric"
              />
            </View>

            {/* Mobile Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              
              {/* Country Picker */}
              <TouchableOpacity
                style={styles.countryPicker}
                onPress={() => setShowCountryPicker(!showCountryPicker)}
              >
                <Text style={styles.countryCode}>
                  {selectedCountry ? `+${selectedCountry.callingCode}` : '+91'}
                </Text>
                <Icon name="keyboard-arrow-down" size={20} color="#ffffff" />
              </TouchableOpacity>

              <TextInput
                style={styles.mobileInput}
                placeholder="Enter mobile number"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={formData.mobileNo}
                onChangeText={(text) => handleInputChange('mobileNo', formatMobileNumber(text))}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Referral Code (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Referral Code (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter referral code"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={formData.referralCode}
                onChangeText={(text) => handleInputChange('referralCode', text.toUpperCase())}
                autoCapitalize="characters"
              />
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                !isFormValid() && styles.disabledButton
              ]}
              onPress={handleSignup}
              disabled={!isFormValid() || signupMutation.isPending || updateUserMutation.isPending}
            >
              {(signupMutation.isPending || updateUserMutation.isPending) ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#ffffff',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#7d2537',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  countryCode: {
    fontSize: 16,
    color: '#ffffff',
    marginRight: 8,
  },
  mobileInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
  },
  signupButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7d2537',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen; 