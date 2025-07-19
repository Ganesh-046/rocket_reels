import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authService from '../services/auth.service';
import {
  UserSignupRequest,
  UserLoginRequest,
  OTPVerificationRequest,
  UserProfile,
  UserProfileList,
  Country,
} from '../types/api';
import MMKVStorage from '../lib/mmkv';

// Query Keys
export const AUTH_QUERY_KEYS = {
  USER: 'user',
  PROFILE_LIST: 'profile_list',
  PROFILE: 'profile',
  COUNTRIES: 'countries',
} as const;

// Get User Info Hook
export const useUser = (userId?: string) => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.USER, userId],
    queryFn: () => authService.getUserInfo(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Profile List Hook
export const useProfileList = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.PROFILE_LIST],
    queryFn: () => authService.getProfileList(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Profile By ID Hook
export const useProfile = (profileId?: string) => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.PROFILE, profileId],
    queryFn: () => authService.getProfileById(profileId!),
    enabled: !!profileId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get Active Countries Hook
export const useCountries = () => {
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.COUNTRIES],
    queryFn: () => authService.getActiveCountries(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Signup Mutation Hook
export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserSignupRequest) => authService.signup(data),
    onSuccess: (response) => {
      if (response.status && response.data) {
        // Store user data in MMKV
        MMKVStorage.setUser(response.data);
        
        // Invalidate and refetch user queries
        queryClient.invalidateQueries({
          queryKey: [AUTH_QUERY_KEYS.USER],
        });
      }
    },
    onError: (error) => {
      console.error('Signup error:', error);
    },
  });
};

// Login Mutation Hook
export const useLogin = () => {
  return useMutation({
    mutationFn: (data: UserLoginRequest) => authService.login(data),
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
};

// Email Verification Mutation Hook
export const useEmailVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.verifyEmail(email),
    onError: (error) => {
      console.error('Email verification error:', error);
    },
  });
};

// OTP Verification Mutation Hook
export const useOTPVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OTPVerificationRequest) => authService.verifyOTP(data),
    onSuccess: (response) => {
      if (response.status && response.data) {
        // Store auth data in MMKV
        MMKVStorage.setToken(response.data.token);
        
        // If it's a new user, we'll need to get user info
        if (response.data.isNew) {
          // You might want to navigate to profile setup
          console.log('New user, redirect to profile setup');
        } else {
          // Get user info and store it
          queryClient.invalidateQueries({
            queryKey: [AUTH_QUERY_KEYS.USER],
          });
        }
      }
    },
    onError: (error) => {
      console.error('OTP verification error:', error);
    },
  });
};

// Reset Password Mutation Hook
export const useResetPassword = () => {
  return useMutation({
    mutationFn: (emailOrMobile: string) => authService.resetPassword(emailOrMobile),
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};

// Update User Mutation Hook
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserSignupRequest> }) =>
      authService.updateUser(id, data),
    onSuccess: (response, variables) => {
      if (response.status && response.data) {
        // Update user data in MMKV
        MMKVStorage.setUser(response.data);
        
        // Invalidate and refetch user queries
        queryClient.invalidateQueries({
          queryKey: [AUTH_QUERY_KEYS.USER, variables.id],
        });
      }
    },
    onError: (error) => {
      console.error('Update user error:', error);
    },
  });
};

// Confirm Password Mutation Hook
export const useConfirmPassword = () => {
  return useMutation({
    mutationFn: (password: string) => authService.confirmPassword(password),
    onError: (error) => {
      console.error('Confirm password error:', error);
    },
  });
};

// Update Profile Mutation Hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserProfile> }) =>
      authService.updateProfile(id, data),
    onSuccess: (response, variables) => {
      if (response.status && response.data) {
        // Update user data in MMKV
        MMKVStorage.setUser(response.data);
        
        // Invalidate and refetch user queries
        queryClient.invalidateQueries({
          queryKey: [AUTH_QUERY_KEYS.USER, variables.id],
        });
      }
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
};

// Delete Account Mutation Hook
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => authService.deleteAccount(id),
    onSuccess: () => {
      // Clear all auth data
      MMKVStorage.removeAuthData();
      MMKVStorage.removeToken();
      MMKVStorage.removeUser();
      
      // Clear all queries
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Delete account error:', error);
    },
  });
};

// Update FCM Token Mutation Hook
export const useUpdateFCMToken = () => {
  return useMutation({
    mutationFn: ({ id, fcmToken }: { id: string; fcmToken: string }) =>
      authService.updateFCMToken(id, fcmToken),
    onError: (error) => {
      console.error('Update FCM token error:', error);
    },
  });
};

// Update User Profile (with image) Mutation Hook
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      authService.updateUserProfile(id, formData),
    onSuccess: (response, variables) => {
      if (response.status && response.data) {
        // Update user data in MMKV
        MMKVStorage.setUser(response.data);
        
        // Invalidate and refetch user queries
        queryClient.invalidateQueries({
          queryKey: [AUTH_QUERY_KEYS.USER, variables.id],
        });
      }
    },
    onError: (error) => {
      console.error('Update user profile error:', error);
    },
  });
};

// Logout Hook
export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    // Clear all auth data
    MMKVStorage.removeAuthData();
    MMKVStorage.removeToken();
    MMKVStorage.removeUser();
    
    // Clear all queries
    queryClient.clear();
  };
}; 