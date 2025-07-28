import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types/api';
import MMKVStorage from '../lib/mmkv';
import TokenManager from '../utils/tokenManager';

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
        console.log('🔐 AuthStore - setToken:', { 
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
          timestamp: new Date().toISOString()
        });
        set({ token });
        if (token) {
          TokenManager.storeToken(token);
        } else {
          TokenManager.clearToken();
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
          tokenLength: token.length,
          tokenPreview: token.substring(0, 20) + '...',
          timestamp: new Date().toISOString()
        });
        set({
          user,
          token,
          isAuthenticated: true,
          isNewUser: false,
        });
        
        // Store in MMKV and setup token management
        MMKVStorage.setAuthData(user, token);
        TokenManager.storeToken(token);
        TokenManager.setupAutoRefresh();
        console.log('💾 AuthStore - Data stored in MMKV and token management setup');
      },

      logout: () => {
        const currentUser = get().user;
        const currentToken = get().token;
        console.log('🔐 AuthStore - Logout:', { 
          userId: currentUser?._id,
          tokenLength: currentToken?.length || 0,
          tokenPreview: currentToken ? currentToken.substring(0, 20) + '...' : 'none',
          timestamp: new Date().toISOString()
        });
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isNewUser: false,
        });
        
        // Clear from MMKV and stop token management
        MMKVStorage.removeAuthData();
        TokenManager.clearToken();
        TokenManager.stopAutoRefresh();
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
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isNewUser: false,
        });
        
        // Clear from MMKV and stop token management
        MMKVStorage.removeAuthData();
        TokenManager.clearToken();
        TokenManager.stopAutoRefresh();
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
  console.log('🔐 AuthStore - Initializing auth from MMKV...');
  const authData = MMKVStorage.getAuthData();
  if (authData && authData.user && authData.token) {
    console.log('🔐 AuthStore - Found stored auth data:', {
      userId: authData.user._id,
      userName: authData.user.userName,
      tokenLength: authData.token.length,
      tokenPreview: authData.token.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    });
    useAuthStore.getState().login(authData.user, authData.token);
  } else {
    console.log('🔐 AuthStore - No stored auth data found');
  }
}; 