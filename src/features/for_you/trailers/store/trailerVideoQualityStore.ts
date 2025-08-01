// ============================================================================
// 🎬 TRAILER VIDEO QUALITY STORE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================
// 
// This file contains the Zustand store for managing trailer video quality settings.
// All functionality is designed to be self-contained and portable.
// 
// Usage:
// import { useTrailerVideoQualityStore } from './store/trailerVideoQualityStore';
// const { currentQuality, setQuality } = useTrailerVideoQualityStore();
// ============================================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import trailerStorage from '../lib/trailerStorage';
import { TrailerVideoQuality } from '../types';

// ============================================================================
// 🎯 STORE INTERFACE
// ============================================================================

/**
 * Trailer video quality store state
 */
interface TrailerVideoQualityState {
  // Current quality setting
  currentQuality: TrailerVideoQuality;
  
  // Quality preferences
  preferredQuality: TrailerVideoQuality;
  autoQualityEnabled: boolean;
  
  // Quality options
  availableQualities: TrailerVideoQuality[];
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setQuality: (quality: TrailerVideoQuality) => Promise<void>;
  setPreferredQuality: (quality: TrailerVideoQuality) => Promise<void>;
  toggleAutoQuality: () => Promise<void>;
  setAvailableQualities: (qualities: TrailerVideoQuality[]) => void;
  resetToDefaults: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

// ============================================================================
// 🎯 DEFAULT VALUES
// ============================================================================

/**
 * Default quality settings
 */
const DEFAULT_QUALITY: TrailerVideoQuality = 'auto';
const DEFAULT_PREFERRED_QUALITY: TrailerVideoQuality = '720p';
const DEFAULT_AUTO_QUALITY_ENABLED = true;
const DEFAULT_AVAILABLE_QUALITIES: TrailerVideoQuality[] = ['auto', '1080p', '720p', '480p', '360p'];

// ============================================================================
// 🎬 TRAILER VIDEO QUALITY STORE
// ============================================================================

/**
 * Zustand store for trailer video quality management
 */
export const useTrailerVideoQualityStore = create<TrailerVideoQualityState>()(
  subscribeWithSelector((set, get) => ({
    // ============================================================================
    // 🎯 INITIAL STATE
    // ============================================================================
    
    currentQuality: DEFAULT_QUALITY,
    preferredQuality: DEFAULT_PREFERRED_QUALITY,
    autoQualityEnabled: DEFAULT_AUTO_QUALITY_ENABLED,
    availableQualities: DEFAULT_AVAILABLE_QUALITIES,
    isLoading: false,
    error: null,

    // ============================================================================
    // 🎯 QUALITY MANAGEMENT ACTIONS
    // ============================================================================

    /**
     * Set current video quality
     * @param quality - New quality setting
     */
    setQuality: async (quality: TrailerVideoQuality) => {
      try {
        set({ isLoading: true, error: null });
        
        console.log('🎬 TrailerVideoQualityStore: Setting quality to:', quality);
        
        // Validate quality
        if (!get().availableQualities.includes(quality)) {
          throw new Error(`Invalid quality: ${quality}`);
        }
        
        // Update state
        set({ currentQuality: quality });
        
        // Save to storage
        await trailerStorage.setVideoQuality(quality);
        
        console.log('🎬 TrailerVideoQualityStore: Quality set successfully:', quality);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to set quality';
        console.error('🎬 TrailerVideoQualityStore: Error setting quality:', error);
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Set preferred quality (for auto mode)
     * @param quality - Preferred quality setting
     */
    setPreferredQuality: async (quality: TrailerVideoQuality) => {
      try {
        set({ isLoading: true, error: null });
        
        console.log('🎬 TrailerVideoQualityStore: Setting preferred quality to:', quality);
        
        // Validate quality
        if (!get().availableQualities.includes(quality)) {
          throw new Error(`Invalid quality: ${quality}`);
        }
        
        // Update state
        set({ preferredQuality: quality });
        
        // Save to storage
        await trailerStorage.set('trailer_preferred_quality', quality);
        
        console.log('🎬 TrailerVideoQualityStore: Preferred quality set successfully:', quality);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to set preferred quality';
        console.error('🎬 TrailerVideoQualityStore: Error setting preferred quality:', error);
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Toggle auto quality mode
     */
    toggleAutoQuality: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const currentAutoEnabled = get().autoQualityEnabled;
        const newAutoEnabled = !currentAutoEnabled;
        
        console.log('🎬 TrailerVideoQualityStore: Toggling auto quality to:', newAutoEnabled);
        
        // Update state
        set({ autoQualityEnabled: newAutoEnabled });
        
        // Save to storage
        await trailerStorage.set('trailer_auto_quality_enabled', newAutoEnabled);
        
        // If enabling auto quality, set current quality to auto
        if (newAutoEnabled) {
          await get().setQuality('auto');
        }
        
        console.log('🎬 TrailerVideoQualityStore: Auto quality toggled successfully:', newAutoEnabled);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to toggle auto quality';
        console.error('🎬 TrailerVideoQualityStore: Error toggling auto quality:', error);
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Set available quality options
     * @param qualities - Available quality options
     */
    setAvailableQualities: (qualities: TrailerVideoQuality[]) => {
      console.log('🎬 TrailerVideoQualityStore: Setting available qualities:', qualities);
      set({ availableQualities: qualities });
    },

    /**
     * Reset to default settings
     */
    resetToDefaults: async () => {
      try {
        set({ isLoading: true, error: null });
        
        console.log('🎬 TrailerVideoQualityStore: Resetting to defaults');
        
        // Reset state to defaults
        set({
          currentQuality: DEFAULT_QUALITY,
          preferredQuality: DEFAULT_PREFERRED_QUALITY,
          autoQualityEnabled: DEFAULT_AUTO_QUALITY_ENABLED,
          availableQualities: DEFAULT_AVAILABLE_QUALITIES,
        });
        
        // Clear storage and save defaults
        await trailerStorage.remove('trailer_video_quality');
        await trailerStorage.remove('trailer_preferred_quality');
        await trailerStorage.remove('trailer_auto_quality_enabled');
        
        await trailerStorage.setVideoQuality(DEFAULT_QUALITY);
        await trailerStorage.set('trailer_preferred_quality', DEFAULT_PREFERRED_QUALITY);
        await trailerStorage.set('trailer_auto_quality_enabled', DEFAULT_AUTO_QUALITY_ENABLED);
        
        console.log('🎬 TrailerVideoQualityStore: Reset to defaults successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to reset to defaults';
        console.error('🎬 TrailerVideoQualityStore: Error resetting to defaults:', error);
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    // ============================================================================
    // 🎯 STORAGE MANAGEMENT
    // ============================================================================

    /**
     * Load settings from storage
     */
    loadFromStorage: async () => {
      try {
        set({ isLoading: true, error: null });
        
        console.log('🎬 TrailerVideoQualityStore: Loading from storage');
        
        // Load quality settings from storage
        const storedQuality = await trailerStorage.getVideoQuality();
        const storedPreferredQuality = await trailerStorage.get('trailer_preferred_quality');
        const storedAutoEnabled = await trailerStorage.get('trailer_auto_quality_enabled');
        
        // Update state with stored values or defaults
        set({
          currentQuality: (storedQuality as TrailerVideoQuality) || DEFAULT_QUALITY,
          preferredQuality: (storedPreferredQuality as TrailerVideoQuality) || DEFAULT_PREFERRED_QUALITY,
          autoQualityEnabled: (storedAutoEnabled as boolean) ?? DEFAULT_AUTO_QUALITY_ENABLED,
        });
        
        console.log('🎬 TrailerVideoQualityStore: Loaded from storage:', {
          currentQuality: storedQuality || DEFAULT_QUALITY,
          preferredQuality: storedPreferredQuality || DEFAULT_PREFERRED_QUALITY,
          autoQualityEnabled: storedAutoEnabled ?? DEFAULT_AUTO_QUALITY_ENABLED,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load from storage';
        console.error('🎬 TrailerVideoQualityStore: Error loading from storage:', error);
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Save current settings to storage
     */
    saveToStorage: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const state = get();
        
        console.log('🎬 TrailerVideoQualityStore: Saving to storage');
        
        // Save all settings to storage
        await trailerStorage.setVideoQuality(state.currentQuality);
        await trailerStorage.set('trailer_preferred_quality', state.preferredQuality);
        await trailerStorage.set('trailer_auto_quality_enabled', state.autoQualityEnabled);
        
        console.log('🎬 TrailerVideoQualityStore: Saved to storage successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save to storage';
        console.error('🎬 TrailerVideoQualityStore: Error saving to storage:', error);
        set({ error: errorMessage });
      } finally {
        set({ isLoading: false });
      }
    },
  }))
);

// ============================================================================
// 🎯 UTILITY FUNCTIONS
// ============================================================================

/**
 * Get quality display text
 * @param quality - Quality setting
 * @returns Display text for quality
 */
export const getQualityText = (quality: TrailerVideoQuality): string => {
  switch (quality) {
    case 'auto':
      return 'Auto';
    case '1080p':
      return 'FHD';
    case '720p':
      return 'HD';
    case '480p':
      return 'SD';
    case '360p':
      return 'LD';
    default:
      return 'Auto';
  }
};

/**
 * Get best available quality from video URLs
 * @param videoUrls - Video URLs object
 * @returns Best available quality
 */
export const getBestQuality = (videoUrls: any): TrailerVideoQuality => {
  if (videoUrls?.['1080p']) return '1080p';
  if (videoUrls?.['720p']) return '720p';
  if (videoUrls?.['480p']) return '480p';
  if (videoUrls?.['360p']) return '360p';
  return 'auto';
};

/**
 * Check if quality is HD
 * @param quality - Quality setting
 * @returns True if HD quality
 */
export const isHDQuality = (quality: TrailerVideoQuality): boolean => {
  return quality === '1080p' || quality === '720p';
};

/**
 * Check if quality is SD
 * @param quality - Quality setting
 * @returns True if SD quality
 */
export const isSDQuality = (quality: TrailerVideoQuality): boolean => {
  return quality === '480p' || quality === '360p';
};

// ============================================================================
// 🎬 TRAILER VIDEO QUALITY STORE EXPORTS
// ============================================================================

// Export store and utility functions
export type { TrailerVideoQualityState };
export type { TrailerVideoQuality }; 