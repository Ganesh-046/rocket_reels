import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useUser, useDeleteAccount } from '../hooks/useAuth';
import { useAuthActions } from '../store/auth.store';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { logout } = useAuthActions();
  
  // Get user data
  const { data: userData, isLoading, error } = useUser();
  const deleteAccountMutation = useDeleteAccount();

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
            logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (userData?.data?._id) {
                await deleteAccountMutation.mutateAsync(userData.data._id);
                logout();
                navigation.replace('Login');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#ed9b72', '#7d2537']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#ed9b72', '#7d2537']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#ed9b72', '#7d2537']} style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <Icon name="person" size={48} color="#ffffff" />
          </View>

          <Text style={styles.userName}>{userData?.data?.userName || 'User Name'}</Text>
          <Text style={styles.userEmail}>{userData?.data?.userEmail || 'user@example.com'}</Text>
          <Text style={styles.userPhone}>{userData?.data?.mobileNo || '+91 9876543210'}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EditProfile')}>
            <Icon name="edit" size={24} color="#ffffff" />
            <Text style={styles.menuText}>Edit Profile</Text>
            <Icon name="chevron-right" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('MyList')}>
            <Icon name="favorite" size={24} color="#ffffff" />
            <Text style={styles.menuText}>My Watchlist</Text>
            <Icon name="chevron-right" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('History')}>
            <Icon name="history" size={24} color="#ffffff" />
            <Text style={styles.menuText}>Watch History</Text>
            <Icon name="chevron-right" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Rewards')}>
            <Icon name="card-giftcard" size={24} color="#ffffff" />
            <Text style={styles.menuText}>Rewards & Coins</Text>
            <Icon name="chevron-right" size={24} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
            <Icon name="settings" size={24} color="#ffffff" />
            <Text style={styles.menuText}>Settings</Text>
            <Icon name="chevron-right" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
            <LinearGradient colors={['#ffffff', '#f0f0f0']} style={styles.loginButtonGradient}>
              <Icon name="login" size={20} color="#7d2537" />
              <Text style={styles.loginButtonText}>Go to Login Page</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient colors={['#ff6b6b', '#ee5a52']} style={styles.logoutButtonGradient}>
              <Icon name="logout" size={20} color="#ffffff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending}
          >
            <LinearGradient colors={['#ff4757', '#ff3742']} style={styles.deleteButtonGradient}>
              {deleteAccountMutation.isPending ? (
                <Text style={styles.deleteButtonText}>Deleting...</Text>
              ) : (
                <>
                  <Icon name="delete-forever" size={20} color="#ffffff" />
                  <Text style={styles.deleteButtonText}>Delete Account</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
  },
  actionContainer: {
    gap: 16,
    marginBottom: 32,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7d2537',
    marginLeft: 8,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  deleteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default ProfileScreen; 