import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types/api';
import MMKVStorage from '../lib/mmkv';

// Auth State Interface
interface AuthState {
  // State
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setNewUser: (isNewUser: boolean) => void;
  login: (user: UserProfile, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  clearAuth: () => void;
}

// Create Auth Store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isNewUser: false,

      // Actions
      setUser: (user) => {
        console.log('AuthStore', 'setUser', { userId: user?._id });
        set({ user });
        if (user) {
          MMKVStorage.setUser(user);
        } else {
          MMKVStorage.removeUser();
        }
      },

      setToken: (token) => {
        console.log('AuthStore', 'setToken', { hasToken: !!token });
        set({ token });
        if (token) {
          MMKVStorage.setToken(token);
        } else {
          MMKVStorage.removeToken();
        }
      },

      setAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setNewUser: (isNewUser) => {
        set({ isNewUser });
      },

      login: (user, token) => {
        console.log('🔐 AuthStore - Login:', { 
          userId: user._id,
          userName: user.userName,
          userEmail: user.userEmail,
          timestamp: new Date().toISOString()
        });
        set({
          user,
          token,
          isAuthenticated: true,
          isNewUser: false,
        });
        
        // Store in MMKV
        MMKVStorage.setAuthData(user, token);
        console.log('💾 AuthStore - Data stored in MMKV');
      },

      logout: () => {
        const currentUser = get().user;
        console.log('🔐 AuthStore - Logout:', { 
          userId: currentUser?._id,
          userName: currentUser?.userName,
          timestamp: new Date().toISOString()
        });
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isNewUser: false,
        });
        
        // Clear all MMKV data
        MMKVStorage.clearAll();
        console.log('🗑️ AuthStore - All MMKV data cleared');
      },

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          MMKVStorage.setUser(updatedUser);
        }
      },

      clearAuth: () => {
        console.log('🔐 AuthStore - Clear Auth');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isNewUser: false,
        });
        
        // Clear all MMKV data
        MMKVStorage.clearAll();
        console.log('🗑️ AuthStore - All MMKV data cleared');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = MMKVStorage.get(name);
          return value ? Promise.resolve(JSON.stringify(value)) : Promise.resolve(null);
        },
        setItem: (name, value) => {
          MMKVStorage.set(name, JSON.parse(value));
          return Promise.resolve();
        },
        removeItem: (name) => {
          MMKVStorage.remove(name);
          return Promise.resolve();
        },
      })),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isNewUser: state.isNewUser,
      }),
    }
  )
);

// Auth Selectors
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsNewUser = () => useAuthStore((state) => state.isNewUser);

// Auth Actions
export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setToken: state.setToken,
  setAuthenticated: state.setAuthenticated,
  setLoading: state.setLoading,
  setNewUser: state.setNewUser,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
  clearAuth: state.clearAuth,
}));

// Auth State (all state)
export const useAuthState = () => useAuthStore();

// Initialize auth from MMKV on app start
export const initializeAuth = () => {
  console.log('🔍 Initializing auth from MMKV...');
  
  try {
    // Method 1: Try to get auth data from MMKV
    const authData = MMKVStorage.getAuthData();
    console.log('📦 Auth data from MMKV:', {
      hasAuthData: !!authData,
      hasUser: !!authData?.user,
      hasToken: !!authData?.token,
      userId: authData?.user?._id,
      userName: authData?.user?.userName,
    });
    
    // Method 2: Try to get individual user and token
    const user = MMKVStorage.getUser();
    const token = MMKVStorage.getToken();
    console.log('🔍 Individual data from MMKV:', {
      hasUser: !!user,
      hasToken: !!token,
      userId: user?._id,
      userName: user?.userName,
    });
    
    // Use authData if available, otherwise use individual data
    const finalUser = authData?.user || user;
    const finalToken = authData?.token || token;
    
    if (finalUser && finalToken) {
      console.log('✅ Restoring auth state from MMKV...');
      console.log('👤 User:', {
        id: finalUser._id,
        name: finalUser.userName,
        email: finalUser.userEmail,
      });
      console.log('🔑 Token length:', finalToken.length);
      
      // Restore auth state
      useAuthStore.getState().login(finalUser, finalToken);
      
      // Verify the state was restored
      const currentState = useAuthStore.getState();
      console.log('✅ Auth state restored successfully:', {
        isAuthenticated: currentState.isAuthenticated,
        hasUser: !!currentState.user,
        hasToken: !!currentState.token,
        userId: currentState.user?._id,
      });
    } else {
      console.log('❌ No valid auth data found in MMKV');
      console.log('📊 Available data:', {
        authData: !!authData,
        user: !!user,
        token: !!token,
      });
    }
  } catch (error) {
    console.error('❌ Error initializing auth:', error);
  }
}; 