import apiInterceptor from '../lib/api-interceptor';
import { ENDPOINTS, CACHE_TTL } from '../config/api';
import {
  ApiResponse,
  UserSignupRequest,
  UserLoginRequest,
  OTPVerificationRequest,
  OTPVerificationResponse,
  UserProfile,
  UserProfileList,
  Country,
} from '../types/api';

// Authentication Service
class AuthService {
  // User Signup
  async signup(data: UserSignupRequest): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.post<UserProfile>(ENDPOINTS.AUTH.SIGNUP, data, {
      isPublic: true,
    });
  }

  // User Login (Mobile verification)
  async login(data: UserLoginRequest): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(ENDPOINTS.AUTH.LOGIN, data, {
      isPublic: true,
    });
  }

  // Email Verification
  async verifyEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(ENDPOINTS.AUTH.VERIFY_EMAIL, { email }, {
      isPublic: true,
    });
  }

  // OTP Verification
  async verifyOTP(data: OTPVerificationRequest): Promise<ApiResponse<OTPVerificationResponse>> {
    return apiInterceptor.post<OTPVerificationResponse>(ENDPOINTS.AUTH.VERIFY_OTP, data, {
      isPublic: true,
    });
  }

  // Reset Password
  async resetPassword(emailOrMobile: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(ENDPOINTS.AUTH.RESET_PASSWORD, { emailOrMobile }, {
      isPublic: true,
    });
  }

  // Update User (Public)
  async updateUser(id: string, data: Partial<UserSignupRequest>): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.put<UserProfile>(`${ENDPOINTS.AUTH.UPDATE_USER}/${id}`, data, {
      isPublic: true,
    });
  }

  // Confirm Password
  async confirmPassword(password: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(ENDPOINTS.AUTH.CONFIRM_PASSWORD, { password });
  }

  // Update Profile
  async updateProfile(id: string, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.put<UserProfile>(`${ENDPOINTS.AUTH.UPDATE_PROFILE}/${id}`, data);
  }

  // Delete Account
  async deleteAccount(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.put<{ message: string }>(`${ENDPOINTS.AUTH.DELETE_ACCOUNT}/${id}`);
  }

  // Update FCM Token
  async updateFCMToken(id: string, fcmToken: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(`${ENDPOINTS.AUTH.UPDATE_FCM_TOKEN}/${id}`, { fcmToken });
  }

  // Get User Info
  async getUserInfo(id: string): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.get<UserProfile>(`${ENDPOINTS.AUTH.GET_USER_INFO}/${id}`, {
      cacheKey: `user_${id}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Get Profile List
  async getProfileList(): Promise<ApiResponse<UserProfileList[]>> {
    return apiInterceptor.get<UserProfileList[]>(ENDPOINTS.AUTH.GET_PROFILE_LIST, {
      cacheKey: 'profile_list',
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Get Profile By ID
  async getProfileById(id: string): Promise<ApiResponse<UserProfileList>> {
    return apiInterceptor.get<UserProfileList>(`${ENDPOINTS.AUTH.GET_PROFILE_BY_ID}/${id}`, {
      cacheKey: `profile_${id}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Update User Profile (with image)
  async updateUserProfile(id: string, formData: FormData): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.put<UserProfile>(`${ENDPOINTS.AUTH.UPDATE_USER_PROFILE}/${id}`, formData);
  }

  // Get Active Countries
  async getActiveCountries(): Promise<ApiResponse<Country[]>> {
    return apiInterceptor.get<Country[]>(ENDPOINTS.AUTH.GET_ACTIVE_COUNTRIES, {
      isPublic: true,
      cacheKey: 'active_countries',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 