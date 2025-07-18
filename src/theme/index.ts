export const theme = {
  colors: {
    // Primary colors
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#1d4ed8',
    
    // Secondary colors
    secondary: '#6b7280',
    secondaryLight: '#9ca3af',
    secondaryDark: '#374151',
    
    // Background colors
    background: '#000000',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#2a2a2a',
    
    // Text colors
    textPrimary: '#ffffff',
    textSecondary: '#a0a0a0',
    textTertiary: '#666666',
    
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Border colors
    border: '#333333',
    borderLight: '#404040',
    
    // Tab bar colors
    tabBarGradientStart: '#ED9B72',
    tabBarGradientEnd: '#7D2537',
    tabBarBackground: '#1A1A1A',
    tabBarBackgroundSecondary: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    h3: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 12,
      fontWeight: 'normal',
    },
  },
  // Device-specific dimensions
  device: {
    isLargeDevice: false,
    width: 0, // Will be set dynamically
  },
};

export type AppTheme = typeof theme;