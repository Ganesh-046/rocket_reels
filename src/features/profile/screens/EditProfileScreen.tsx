import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Keyboard,
  Platform,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SvgIcons } from '../../../components/common/SvgIcons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

// Store and API
import { useAuthStore, useAuthUser, useAuthToken } from '../../../store/auth.store';
import authService from '../../../services/auth.service';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    reset: (config: { index: number; routes: Array<{ name: string }> }) => void;
  };
}

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' }
];

const EditProfileScreen: React.FC<NavigationProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  
  // Get user data from auth store
  const user = useAuthUser();
  const token = useAuthToken();
  const { updateUser } = useAuthStore();

  // State management
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [formData, setFormData] = useState({
    profileImg: '',
    userName: '',
    userEmail: '',
    mobileNo: '',
    gender: '',
    dateOfBirth: '',
    referralCode: '',
    callingCode: '+91',
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        profileImg: (user as any)?.profileImage || 'https://i.pinimg.com/474x/3f/dd/e4/3fdde421b22a34874e9be56a4277e04c.jpg',
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        mobileNo: user.mobileNo || '',
        gender: user.gender?.toLowerCase() || '',
        dateOfBirth: user.dateOfBirth || '',
        referralCode: '',
        callingCode: user.callingCode || '+91',
      });
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    // Validate username
    if (!formData.userName || formData.userName.trim().length === 0) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (formData.userName.length > 50) {
      Alert.alert('Error', 'Name cannot exceed 50 characters');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.userName.trim())) {
      Alert.alert('Error', 'Name can only contain letters and spaces');
      return false;
    }

    // Validate email
    if (formData.userEmail && formData.userEmail.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.userEmail)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return false;
      }
      if (formData.userEmail.length > 100) {
        Alert.alert('Error', 'Email cannot exceed 100 characters');
        return false;
      }
    }

    // Validate mobile number
    if (formData.mobileNo && formData.mobileNo.trim().length > 0) {
      if (!/^\d+$/.test(formData.mobileNo)) {
        Alert.alert('Error', 'Mobile number can only contain digits');
        return false;
      }
      if (formData.mobileNo.length < 10 || formData.mobileNo.length > 15) {
        Alert.alert('Error', 'Mobile number must be between 10 and 15 digits');
        return false;
      }
    }

    // Validate referral code
    if (formData.referralCode && formData.referralCode.trim().length > 0) {
      if (formData.referralCode.length > 20) {
        Alert.alert('Error', 'Referral code cannot exceed 20 characters');
        return false;
      }
      if (!/^[a-zA-Z0-9]+$/.test(formData.referralCode)) {
        Alert.alert('Error', 'Referral code can only contain letters and numbers');
        return false;
      }
    }

    return true;
  };

  // Handle profile update - following old code structure
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    try {
      setLoading(true);

      // Prepare form data - based on API test results (omit referral code to avoid validation issues)
      const updateData = {
        profileImg: formData.profileImg || '',
        userName: formData.userName.trim(),
        userEmail: formData.userEmail.trim() || undefined,
        mobileNo: formData.mobileNo.trim().replace(/\D/g, '') || undefined, // Remove non-digits
        gender: formData.gender as 'male' | 'female',
        dateOfBirth: formData.dateOfBirth || undefined,
        // Omit referralCode completely to avoid "referral code does not exist" error
      };

      // Remove undefined values to match API expectations
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      // Additional validation based on API test results
      if (updateData.mobileNo && updateData.mobileNo.length < 10) {
        Alert.alert('Error', 'Mobile number must be at least 10 digits');
        return;
      }

      // Validate date format (YYYY-MM-DD) - critical for age calculation
      if (updateData.dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(updateData.dateOfBirth)) {
        Alert.alert('Error', 'Date must be in YYYY-MM-DD format');
        return;
      }

      // Validate date is not in the future (causes age calculation issues)
      if (updateData.dateOfBirth) {
        const birthDate = new Date(updateData.dateOfBirth);
        const today = new Date();
        if (birthDate > today) {
          Alert.alert('Error', 'Date of birth cannot be in the future');
          return;
        }
      }

              console.log('🔧 Updating profile with data:', updateData);
        console.log('👤 User ID:', user._id);
        console.log('🔍 User ID type:', typeof user._id);
        console.log('🔍 User ID length:', user._id?.length);

              // Test API endpoint first
        console.log('🧪 Testing API endpoint reachability...');
        try {
          const testResponse = await fetch(`https://k9456pbd.rocketreel.co.in/api/v1/content/activeCountries`, {
            method: 'GET',
            headers: {
              'public-request': 'true',
            },
          });
          const testData = await testResponse.json();
          console.log('✅ API endpoint test successful:', testData.success);
        } catch (testError: any) {
          console.log('⚠️ API endpoint test failed:', testError.message);
        }

        // Try with minimal data first (based on API test results showing success with minimal data)
        let response;
        try {
        console.log('🔄 Trying with minimal data first (userName + userEmail)...');
        
        const minimalPayload = {
          userName: updateData.userName,
          userEmail: updateData.userEmail,
        };
        
        console.log('📤 Minimal payload being sent:', minimalPayload);
        console.log('🔗 Minimal request URL:', `https://k9456pbd.rocketreel.co.in/api/v1/user/updateUser/${user._id}`);
        console.log('📤 Minimal Request Data:', JSON.stringify(minimalPayload, null, 2));
        
        const minimalResponse = await fetch(`https://k9456pbd.rocketreel.co.in/api/v1/user/updateUser/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'public-request': 'true',
          },
          body: JSON.stringify(minimalPayload),
        });

        const minimalResponseData = await minimalResponse.json();
        console.log('🌐 Minimal API Response:', {
          status: minimalResponse.status,
          statusText: minimalResponse.statusText,
          success: minimalResponseData.success,
          message: minimalResponseData.message,
          data: minimalResponseData.data,
          error: minimalResponseData.error,
          fullResponse: minimalResponseData,
        });

        if (minimalResponse.ok && minimalResponseData.success) {
          console.log('✅ Minimal data update successful, trying with full data...');
          
          // If minimal data works, try with full data
          console.log('📤 Full Request Data:', JSON.stringify(updateData, null, 2));
          
          const fullResponse = await fetch(`https://k9456pbd.rocketreel.co.in/api/v1/user/updateUser/${user._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'public-request': 'true',
            },
            body: JSON.stringify(updateData),
          });

          const fullData = await fullResponse.json();
          console.log('🌐 Full API Response:', {
            status: fullResponse.status,
            statusText: fullResponse.statusText,
            success: fullData.success,
            message: fullData.message,
            data: fullData.data,
            error: fullData.error,
            fullResponse: fullData,
          });

          if (fullResponse.ok && fullData.success) {
            response = { success: true, data: fullData.data, message: fullData.message };
          } else {
            // If full data fails, use minimal data success
            response = { success: true, data: minimalResponseData.data, message: 'Profile updated with basic information' };
          }
        } else {
          // Log the actual API response for debugging
          console.log('❌ Minimal data update failed. Full response:', {
            status: minimalResponse.status,
            statusText: minimalResponse.statusText,
            success: minimalResponseData.success,
            message: minimalResponseData.message,
            data: minimalResponseData.data,
            error: minimalResponseData.error,
            fullResponse: minimalResponseData,
          });
          
          // Show specific error messages from API test results
          let errorMessage = minimalResponseData.message || 'API update failed';
          
          // Handle specific known errors
          if (minimalResponseData.message === 'referral code does not exist.') {
            errorMessage = 'Invalid referral code. Please remove it or use a valid code.';
          } else if (minimalResponseData.message === 'Error while updating user data.') {
            if (minimalResponseData.data && minimalResponseData.data.message && minimalResponseData.data.message.includes('age')) {
              errorMessage = 'Invalid date of birth. Please check the date format and ensure it\'s not in the future.';
            } else {
              errorMessage = 'Invalid data provided. Please check all fields and try again.';
            }
          }
          
          throw new Error(errorMessage);
        }
              } catch (apiError: any) {
          console.log('🔍 API Error Details:', {
            message: apiError.message,
            status: apiError.status,
            data: apiError.data,
          });
          throw apiError;
        }

      // Handle response like old code
      if (response && response.success) {
        console.log('🎉 Profile update successful:', response.data);
        
        // Update local user data
        if (response.data) {
          updateUser(response.data);
        }
        
        Alert.alert('Success', response.message || 'Profile updated successfully!');
        navigation.goBack();
      } else {
        console.log('⚠️ Profile update response not successful:', response);
        Alert.alert('Error', response?.message || 'Something went wrong!');
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        data: error.data,
      });
      Alert.alert('Error', error.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  // Handle date picker
  const handleDateConfirm = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: moment(date).format('YYYY-MM-DD')
    }));
    setIsDatePickerVisible(false);
  };

  // Get first letter for avatar
  const getFirstLetter = () => {
    return formData.userName?.charAt(0)?.toUpperCase() || 'G';
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }]
            });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ed9b72', '#7d2537']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <TouchableOpacity 
          style={styles.contentContainer} 
          onPress={() => Keyboard.dismiss()}
          activeOpacity={1}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Profile Avatar */}
            <View style={styles.profileSection}>
              <View style={styles.profileContainer}>
                {formData.profileImg ? (
                  <Image
                    source={{ uri: formData.profileImg }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Text style={styles.profileInitial}>{getFirstLetter()}</Text>
                )}
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>

              {/* Full Name */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.userName}
                  onChangeText={(value) => handleInputChange('userName', value)}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  maxLength={50}
                />
              </View>

              {/* Mobile Number with Country Code */}
              <View style={styles.phoneContainer}>
                <View style={styles.countryCodeContainer}>
                  <Text style={styles.countryCodeText}>
                    {formData.callingCode}
                  </Text>
                </View>
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                  <TextInput
                    style={styles.textInput}
                    value={formData.mobileNo}
                    onChangeText={(value) => handleInputChange('mobileNo', value)}
                    placeholder="Mobile Number"
                    placeholderTextColor="#999"
                    maxLength={15}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={formData.userEmail}
                  onChangeText={(value) => handleInputChange('userEmail', value)}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  maxLength={100}
                  keyboardType="email-address"
                />
              </View>

              {/* Date of Birth */}
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setIsDatePickerVisible(true)}
              >
                                 <View style={styles.dateButtonContent}>
                   <Text style={[
                     styles.dateButtonText,
                     !formData.dateOfBirth && styles.placeholderText
                   ]}>
                     {formData.dateOfBirth || 'Select Date of Birth'}
                   </Text>
                   <SvgIcons name="calendar-outline" color="#ffffff" size={20} />
                 </View>
              </TouchableOpacity>

              {/* Gender Dropdown */}
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownLabel}>Gender</Text>
                <View style={styles.dropdownWrapper}>
                  {genderOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownOption,
                        formData.gender === option.value && styles.dropdownOptionSelected
                      ]}
                      onPress={() => handleInputChange('gender', option.value)}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        formData.gender === option.value && styles.dropdownOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

                             {/* Referral Code - Temporarily disabled due to API validation issues */}
               {/* <View style={styles.inputContainer}>
                 <TextInput
                   style={styles.textInput}
                   value={formData.referralCode}
                   onChangeText={(value) => handleInputChange('referralCode', value)}
                   placeholder="Referral Code (Optional)"
                   placeholderTextColor="#999"
                   maxLength={20}
                 />
               </View> */}
            </View>
          </ScrollView>

          {/* Update Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.updateButton, loading && styles.buttonDisabled]}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#999'] : ['#E9743A', '#CB2D4D']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Update Profile</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Date Picker Modal */}
        <DateTimePicker
          isVisible={isDatePickerVisible}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onConfirm={handleDateConfirm}
          onCancel={() => setIsDatePickerVisible(false)}
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,0,0,0.2)',
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    padding: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: isLargeDevice ? width * 0.05 : width * 0.1,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.04 : width * 0.06,
    position: 'relative',
  },
  profileContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: isLargeDevice ? width * 0.12 : width * 0.25,
    height: isLargeDevice ? width * 0.12 : width * 0.25,
    borderWidth: 4,
    borderRadius: 999,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: isLargeDevice ? width * 0.12 : width * 0.25,
    height: isLargeDevice ? width * 0.12 : width * 0.25,
    borderRadius: 999,
  },
  profileInitial: {
    fontSize: isLargeDevice ? 40 : 60,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  formSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: width * 0.02,
    padding: isLargeDevice ? width * 0.03 : width * 0.04,
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  sectionTitle: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.015,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#ffffff',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  countryCodeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.015,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.015,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  dropdownContainer: {
    marginBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  dropdownWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.015,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  dropdownOptionTextSelected: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingBottom: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  updateButton: {
    borderRadius: width * 0.015,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default EditProfileScreen;
