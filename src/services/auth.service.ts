import apiInterceptor from '../lib/api-interceptor';
import { ENDPOINTS, CACHE_TTL, API_CONFIG } from '../config/api';
import {
  ApiResponse,
  SignupRequest,
  LoginRequest,
  OTPVerificationRequest,
  UserProfile,
  ActiveCountry,
} from '../types/api';

// Authentication Service - Updated to match old code structure
class AuthService {
  // Send OTP (Mobile verification) - matches old code
  async login(data: LoginRequest): Promise<ApiResponse<string>> {
    return apiInterceptor.post<string>('/user/login', {
      mobileNo: data.mobileNo,
      callingCode: data.callingCode,
    }, {
      isPublic: true,
      timeout: API_CONFIG.AUTH_TIMEOUT, // Use longer timeout for auth
    });
  }

  // OTP Verification - matches old code
  async verifyOTP(data: OTPVerificationRequest & { 
    deviceToken: string; 
    deviceType: string; 
    firebaseToken: string; 
    token?: string; 
  }): Promise<ApiResponse<{ isNew: boolean; userId: string; token: string; user?: UserProfile }>> {
    return apiInterceptor.post<{ isNew: boolean; userId: string; token: string; user?: UserProfile }>('/user/verifyOtp', {
      mobileNo: data.mobileNo,
      otp: data.otp,
      deviceToken: data.deviceToken,
      deviceType: data.deviceType,
      firebaseToken: data.firebaseToken,
    }, {
      isPublic: true,
      timeout: API_CONFIG.AUTH_TIMEOUT, // Use longer timeout for auth
    });
  }

  // Update User (Complete registration) - matches old code
  async updateUser(id: string, data: Partial<SignupRequest>): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.put<UserProfile>(`/user/updateUser/${id}`, {
      userName: data.userName,
      userEmail: data.userEmail,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      mobileNo: data.mobileNo,
      referralCode: data.referralCode,
      countryName: data.countryName,
      callingCode: data.callingCode,
    }, {
      isPublic: true,
      timeout: API_CONFIG.AUTH_TIMEOUT, // Use longer timeout for auth
    });
  }

  // Get User Info - matches old code
  async getUserInfo(id: string): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.get<UserProfile>(`/user/byId/${id}`, {
      cacheKey: `user_${id}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  // Get Active Countries - matches old code
  async getActiveCountries(): Promise<ApiResponse<ActiveCountry[]>> {
    return apiInterceptor.get<ActiveCountry[]>('/content/activeCountries', {
      isPublic: true,
      cacheKey: 'active_countries',
      cacheTTL: CACHE_TTL.STATIC_CONTENT,
    });
  }

  // Legacy methods (keeping for compatibility)
  async signup(data: SignupRequest): Promise<ApiResponse<UserProfile>> {
    // For signup, we need to create a user first, then update
    // This is a simplified version - you might need to adjust based on your API
    return this.updateUser('temp-id', data);
  }

  async verifyEmail(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(ENDPOINTS.AUTH.VERIFY_EMAIL, { email }, {
      isPublic: true,
    });
  }

  async resetPassword(emailOrMobile: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(ENDPOINTS.AUTH.RESET_PASSWORD, { emailOrMobile }, {
      isPublic: true,
    });
  }

  async confirmPassword(password: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(ENDPOINTS.AUTH.CONFIRM_PASSWORD, { password });
  }

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.put<UserProfile>(`${ENDPOINTS.AUTH.UPDATE_PROFILE}/${id}`, data);
  }

  async deleteAccount(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.put<{ message: string }>(`${ENDPOINTS.AUTH.DELETE_ACCOUNT}/${id}`);
  }

  async updateFCMToken(id: string, fcmToken: string): Promise<ApiResponse<{ message: string }>> {
    return apiInterceptor.post<{ message: string }>(`${ENDPOINTS.AUTH.UPDATE_FCM_TOKEN}/${id}`, { fcmToken });
  }

  async getProfileList(): Promise<ApiResponse<UserProfile[]>> {
    return apiInterceptor.get<UserProfile[]>(ENDPOINTS.AUTH.GET_PROFILE_LIST, {
      cacheKey: 'profile_list',
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async getProfileById(id: string): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.get<UserProfile>(`${ENDPOINTS.AUTH.GET_PROFILE_BY_ID}/${id}`, {
      cacheKey: `profile_${id}`,
      cacheTTL: CACHE_TTL.USER_DATA,
    });
  }

  async updateUserProfile(id: string, formData: FormData): Promise<ApiResponse<UserProfile>> {
    return apiInterceptor.put<UserProfile>(`${ENDPOINTS.AUTH.UPDATE_USER_PROFILE}/${id}`, formData);
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 