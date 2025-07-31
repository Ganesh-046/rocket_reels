// ============================================================================
// TRAILER THEME HOOK - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import { useMemo } from 'react';

// ============================================================================
// 🎨 TRAILER THEME TYPES
// ============================================================================

export interface TrailerThemeColors {
  PRIMARYLIGHTBLACKONE: string;
  PRIMARYLIGHTBLACK: string;
  PRIMARYBG: string;
  PRIMARYBLACK: string;
  PRIMARYWHITE: string;
  PRIMARYBLUE?: string;
  PRIMARYGREEN?: string;
  PRIMARYRED?: string;
  PRIMARYYELLOW?: string;
  PRIMARYGRAY?: string;
}

export interface TrailerTheme {
  colors: TrailerThemeColors;
  isDark: boolean;
  isLight: boolean;
}

// ============================================================================
// 🎨 TRAILER THEME CONFIGURATIONS
// ============================================================================

const TRAILER_DARK_THEME: TrailerTheme = {
  colors: {
    PRIMARYLIGHTBLACKONE: '#1a1a1a',
    PRIMARYLIGHTBLACK: '#2d2d2d',
    PRIMARYBG: '#000000',
    PRIMARYBLACK: '#000000',
    PRIMARYWHITE: '#ffffff',
    PRIMARYBLUE: '#007AFF',
    PRIMARYGREEN: '#34C759',
    PRIMARYRED: '#FF3B30',
    PRIMARYYELLOW: '#FFCC00',
    PRIMARYGRAY: '#8E8E93',
  },
  isDark: true,
  isLight: false,
};

const TRAILER_LIGHT_THEME: TrailerTheme = {
  colors: {
    PRIMARYLIGHTBLACKONE: '#f5f5f5',
    PRIMARYLIGHTBLACK: '#e0e0e0',
    PRIMARYBG: '#ffffff',
    PRIMARYBLACK: '#000000',
    PRIMARYWHITE: '#ffffff',
    PRIMARYBLUE: '#007AFF',
    PRIMARYGREEN: '#34C759',
    PRIMARYRED: '#FF3B30',
    PRIMARYYELLOW: '#FFCC00',
    PRIMARYGRAY: '#8E8E93',
  },
  isDark: false,
  isLight: true,
};

// ============================================================================
// 🎨 TRAILER THEME DETECTION
// ============================================================================

const detectTrailerTheme = (): TrailerTheme => {
  // For now, default to dark theme for trailers
  // In a real implementation, you might detect system theme or user preference
  return TRAILER_DARK_THEME;
};

// ============================================================================
// 🎨 TRAILER THEME HOOK
// ============================================================================

export const useTrailerTheme = () => {
  const theme = useMemo(() => {
    return detectTrailerTheme();
  }, []);

  return {
    theme,
    colors: theme.colors,
    isDark: theme.isDark,
    isLight: theme.isLight,
  };
};

// ============================================================================
// 🎨 TRAILER THEMED STYLES HOOK
// ============================================================================

export const useTrailerThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: TrailerTheme) => T
) => {
  const { theme } = useTrailerTheme();
  
  return useMemo(() => {
    return styleFactory(theme);
  }, [theme, styleFactory]);
};

// ============================================================================
// 🎨 TRAILER THEME UTILITIES
// ============================================================================

export const getTrailerThemeColors = (): TrailerThemeColors => {
  return detectTrailerTheme().colors;
};

export const isTrailerDarkTheme = (): boolean => {
  return detectTrailerTheme().isDark;
};

export const isTrailerLightTheme = (): boolean => {
  return detectTrailerTheme().isLight;
}; 