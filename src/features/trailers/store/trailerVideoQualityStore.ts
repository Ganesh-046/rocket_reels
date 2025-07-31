// ============================================================================
// TRAILER VIDEO QUALITY STORE - COMPLETELY INDEPENDENT AND PORTABLE
// ============================================================================

import { create } from 'zustand';
import trailerStorage from '../lib/trailerStorage';

export type TrailerVideoQuality = '360p' | '480p' | '720p' | '1080p' | 'auto';

interface TrailerVideoQualityState {
  currentQuality: TrailerVideoQuality;
  availableQualities: TrailerVideoQuality[];
  setQuality: (quality: TrailerVideoQuality) => void;
  setAvailableQualities: (qualities: TrailerVideoQuality[]) => void;
  resetQuality: () => void;
  getQualityText: () => string;
  getBestQuality: (availableQualities: string[]) => TrailerVideoQuality;
}

// Load initial quality from trailer storage
const loadInitialTrailerQuality = async (): Promise<TrailerVideoQuality> => {
  try {
    const saved = await trailerStorage.getVideoQuality();
    return saved as TrailerVideoQuality || '720p'; // Default to HD quality
  } catch (error) {
    console.warn('Failed to load initial trailer video quality:', error);
    return '720p'; // Default to HD quality
  }
};

export const useTrailerVideoQualityStore = create<TrailerVideoQualityState>((set, get) => ({
  // Initial state
  currentQuality: '720p' as TrailerVideoQuality, // Default value, will be updated on init
  availableQualities: ['360p', '480p', '720p', '1080p', 'auto'],

  // Initialize quality from storage
  initializeQuality: async () => {
    try {
      const savedQuality = await loadInitialTrailerQuality();
      set({ currentQuality: savedQuality });
    } catch (error) {
      console.error('Error initializing trailer video quality:', error);
    }
  },

  // Set global quality for trailer videos
  setQuality: async (quality: TrailerVideoQuality) => {
    console.log('🎬 TrailerVideoQualityStore - Setting trailer quality:', quality);
    
    // Save to trailer storage
    try {
      await trailerStorage.setVideoQuality(quality);
    } catch (error) {
      console.error('Error saving trailer video quality:', error);
    }
    
    set({ currentQuality: quality });
  },

  // Set available qualities for trailers
  setAvailableQualities: (qualities: TrailerVideoQuality[]) => {
    console.log('🎬 TrailerVideoQualityStore - Setting available trailer qualities:', qualities);
    set({ availableQualities: qualities });
  },

  // Reset to default quality for trailers
  resetQuality: async () => {
    console.log('🎬 TrailerVideoQualityStore - Resetting trailer quality to HD (720p)');
    
    // Save to trailer storage
    try {
      await trailerStorage.setVideoQuality('720p');
    } catch (error) {
      console.error('Error resetting trailer video quality:', error);
    }
    
    set({ currentQuality: '720p' });
  },

  // Get quality text for display
  getQualityText: () => {
    const { currentQuality } = get();
    if (currentQuality === '1080p') return 'FHD';
    if (currentQuality === '720p') return 'HD';
    if (currentQuality === '480p') return 'SD';
    if (currentQuality === '360p') return 'LD';
    return 'HD'; // Default for auto
  },

  // Get best available quality from a list
  getBestQuality: (availableQualities: string[]) => {
    const { currentQuality } = get();
    
    // If auto is selected, find the best available quality
    if (currentQuality === 'auto') {
      if (availableQualities.includes('1080p')) return '1080p';
      if (availableQualities.includes('720p')) return '720p';
      if (availableQualities.includes('480p')) return '480p';
      if (availableQualities.includes('360p')) return '360p';
      return '720p'; // Default fallback
    }
    
    // If specific quality is selected, check if it's available
    if (availableQualities.includes(currentQuality)) {
      return currentQuality;
    }
    
    // Fallback to best available quality
    if (availableQualities.includes('1080p')) return '1080p';
    if (availableQualities.includes('720p')) return '720p';
    if (availableQualities.includes('480p')) return '480p';
    if (availableQualities.includes('360p')) return '360p';
    
    return '720p'; // Default fallback
  },
})); 