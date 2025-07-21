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
  KeyboardTypeOptions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

// Store and API
import { useAuthStore, useAuthUser, useAuthToken } from '../../../store/auth.store';
import ApiService from '../../../services/api.service';

const { width } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface NavigationProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
    reset: (config: { index: number; routes: Array<{ name: string }> }) => void;
  };
}

interface CustomTextInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  maxLength: number;
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  style?: any;
}

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}

interface CustomDropdownProps {
  data: Array<{ label: string; value: string }>;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  style?: any;
}

// Custom Text Input Component
const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  maxLength, 
  keyboardType = 'default',
  editable = true,
  style = {}
}) => (
  <View style={[styles.inputContainer, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={[styles.textInputWrapper, !editable && styles.disabledInput]}>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        maxLength={maxLength}
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  </View>
);

// Custom Button Component
const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  style = {}
}) => (
  <TouchableOpacity
    style={[
      styles.button,
      disabled && styles.buttonDisabled,
      style
    ]}
    onPress={onPress}
    disabled={disabled || loading}
  >
    <LinearGradient
      colors={disabled ? ['#ccc', '#999'] : ['#E9743A', '#CB2D4D']}
      style={styles.buttonGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </LinearGradient>
  </TouchableOpacity>
);

// Custom Dropdown Component
const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  data, 
  value, 
  onValueChange, 
  placeholder,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = data.find(option => option.value === value);

  return (
    <View style={[styles.dropdownContainer, style]}>
      <Text style={styles.inputLabel}>Gender</Text>
      <TouchableOpacity
        style={styles.dropdownWrapper}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={[
          styles.dropdownText,
          !selectedOption && styles.placeholderText
        ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={20} color="#333" />
      </TouchableOpacity>
      
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {data.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownOption}
              onPress={() => {
                onValueChange(option.value);
                setIsOpen(false);
              }}
            >
              <Text style={styles.dropdownOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

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
    userName: '',
    userEmail: '',
    mobileNo: '',
    gender: '',
    dateOfBirth: '',
    referralCode: '',
    callingCode: '+91',
    profileImg: ''
  });

  // Gender options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' }
  ];

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        userName: user.userName || '',
        userEmail: user.userEmail || '',
        mobileNo: user.mobileNo || '',
        gender: user.gender?.toLowerCase() || '',
        dateOfBirth: user.dateOfBirth || '',
        referralCode: '', // Not in UserProfile type, so default to empty
        callingCode: user.callingCode || '+91',
        profileImg: '' // Not in UserProfile type, so default to empty
      });
    }
  }, [user]);

  // Set token in ApiService when component mounts
  useEffect(() => {
    if (token) {
      ApiService.setToken(token);
    }
  }, [token]);

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

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Authentication token not found. Please login again.');
      return;
    }

    try {
      setLoading(true);

      // Set token in ApiService before making the call
      ApiService.setToken(token);

      const updateData = {
        userName: formData.userName.trim(),
        userEmail: formData.userEmail.trim(),
        mobileNo: formData.mobileNo.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        profileImg: formData.profileImg
      };

      // Add referral code if present (as optional field)
      if (formData.referralCode) {
        (updateData as any).referralCode = formData.referralCode.trim();
      }

      console.log('Updating profile with data:', updateData);
      console.log('User ID:', user._id);
      console.log('Token:', token);

      // Try the public endpoint first (as per old code)
      let response;
      try {
        response = await ApiService.updateUserProfilePublic(user._id, updateData);
        console.log('Public endpoint response:', response);
      } catch (publicError: any) {
        console.log('Public endpoint failed, trying private endpoint:', publicError);
        
        // If public endpoint fails, try the private endpoint
        try {
          response = await ApiService.updateUserProfile(user._id, updateData);
          console.log('Private endpoint response:', response);
        } catch (privateError: any) {
          console.log('Private endpoint also failed:', privateError);
          throw privateError; // Throw the last error
        }
      }

      console.log('Final API Response:', response);

      if (response.status === 200) {
        // Update local user data
        updateUser(updateData);
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      // More detailed error handling
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        Alert.alert('Error', `Failed to update profile: ${error.response.data?.message || error.message}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
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
    return formData.userName?.charAt(0)?.toUpperCase() || 'U';
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
            // Handle logout through auth store
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            {formData.profileImg ? (
              <Image
                source={{ uri: formData.profileImg }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getFirstLetter()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera-alt" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <CustomTextInput
              label="Full Name *"
              value={formData.userName}
              onChangeText={(value) => handleInputChange('userName', value)}
              placeholder="Enter your full name"
              maxLength={50}
            />

            {/* Mobile Number */}
            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.countryCodeText}>
                  {formData.callingCode}
                </Text>
              </View>
              <CustomTextInput
                value={formData.mobileNo}
                onChangeText={(value) => handleInputChange('mobileNo', value)}
                placeholder="Mobile Number"
                maxLength={15}
                keyboardType="numeric"
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>

            {/* Email */}
            <CustomTextInput
              label="Email"
              value={formData.userEmail}
              onChangeText={(value) => handleInputChange('userEmail', value)}
              placeholder="Enter your email"
              maxLength={100}
              keyboardType="email-address"
            />

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setIsDatePickerVisible(true)}
              >
                <Text style={[
                  styles.dateButtonText,
                  !formData.dateOfBirth && styles.placeholderText
                ]}>
                  {formData.dateOfBirth || 'Select Date of Birth'}
                </Text>
                <Icon name="event" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Gender */}
            <CustomDropdown
              data={genderOptions}
              value={formData.gender}
              onValueChange={(value) => handleInputChange('gender', value)}
              placeholder="Select Gender"
            />

            {/* Referral Code */}
            <CustomTextInput
              label="Referral Code"
              value={formData.referralCode}
              onChangeText={(value) => handleInputChange('referralCode', value)}
              placeholder="Enter referral code"
              maxLength={20}
            />

            {/* Update Button */}
            <CustomButton
              title="Update Profile"
              onPress={handleUpdateProfile}
              loading={loading}
              disabled={loading}
              style={styles.updateButton}
            />
          </View>
        </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E9743A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  textInputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  disabledInput: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryCodeContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownWrapper: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptions: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  dropdownOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
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
  updateButton: {
    marginTop: 30,
  },
});

export default EditProfileScreen;
