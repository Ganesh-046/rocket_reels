import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUpdateUser } from '../hooks/useAuth';
import { useAuthState } from '../store/auth.store';
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';

const { width } = Dimensions.get('window');

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthState();
  const updateUserMutation = useUpdateUser();

  const [formData, setFormData] = useState({
    userName: user?.userName || '',
    userEmail: user?.userEmail || '',
    mobileNo: user?.mobileNo || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth || '',
    countryName: user?.countryName || 'India',
    callingCode: user?.callingCode || '+91',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.userName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.userEmail.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      const response = await updateUserMutation.mutateAsync({
        id: user._id,
        data: {
          userName: formData.userName.trim(),
          userEmail: formData.userEmail.trim(),
          mobileNo: formData.mobileNo.trim(),
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          countryName: formData.countryName,
          callingCode: formData.callingCode,
        },
      });

      if (response.status) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const renderInputField = (
    label: string,
    field: string,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    autoCapitalize: 'none' | 'sentences' | 'words' | 'characters' = 'sentences'
  ) => (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={formData[field as keyof typeof formData]}
        onChangeText={(text) => handleInputChange(field, text)}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );

  const renderPickerField = (
    label: string,
    value: string,
    placeholder: string,
    onPress: () => void
  ) => (
    <View style={styles.inputField}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={onPress}>
        <Text style={value ? styles.pickerText : styles.pickerPlaceholder}>
          {value || placeholder}
        </Text>
        <Icon name="keyboard-arrow-down" size={20} color="rgba(255, 255, 255, 0.6)" />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#ed9b72', '#7d2537']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={updateUserMutation.isPending}
          >
            <Text style={styles.saveButtonText}>
              {updateUserMutation.isPending ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.profileImageSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Icon name="person" size={48} color="#ffffff" />
            </View>
            <TouchableOpacity style={styles.editImageButton}>
              <Icon name="camera-alt" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {renderInputField('Full Name', 'userName', 'Enter your full name', 'default', 'words')}
          {renderInputField('Email Address', 'userEmail', 'Enter your email', 'email-address', 'none')}
          {renderInputField('Mobile Number', 'mobileNo', 'Enter mobile number', 'phone-pad')}

          {renderPickerField(
            'Gender',
            formData.gender,
            'Select Gender',
            () => setShowGenderPicker(true)
          )}

          {renderPickerField(
            'Date of Birth',
            formData.dateOfBirth,
            'Select Date of Birth',
            () => setShowDatePicker(true)
          )}

          {renderInputField('Country', 'countryName', 'Enter country name')}
          {renderInputField('Calling Code', 'callingCode', 'Enter calling code')}
        </View>

        {/* Additional Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Icon name="lock" size={20} color="#ffffff" />
            <Text style={styles.settingText}>Change Password</Text>
            <Icon name="chevron-right" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="notifications" size={20} color="#ffffff" />
            <Text style={styles.settingText}>Notification Settings</Text>
            <Icon name="chevron-right" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Icon name="security" size={20} color="#ffffff" />
            <Text style={styles.settingText}>Privacy Settings</Text>
            <Icon name="chevron-right" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
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
          handleInputChange('dateOfBirth', moment(date).format('YYYY-MM-DD'));
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Gender Picker Modal */}
      {showGenderPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  handleInputChange('gender', option.value);
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option.label}</Text>
                {formData.gender === option.value && (
                  <Icon name="check" size={20} color="#ed9b72" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowGenderPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  profileImageSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ed9b72',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputField: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#ffffff',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
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
  modalContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalOptionText: {
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

export default EditProfileScreen; 