import { create } from 'zustand';
import MMKVStorage from '../lib/mmkv';

export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | 'auto';

interface VideoQualityState {
  currentQuality: VideoQuality;
  availableQualities: VideoQuality[];
  setQuality: (quality: VideoQuality) => void;
  setAvailableQualities: (qualities: VideoQuality[]) => void;
  resetQuality: () => void;
}

// Load initial quality from MMKV
const loadInitialQuality = (): VideoQuality => {
  try {
    const saved = MMKVStorage.get('currentQuality');
    return saved as VideoQuality || '720p'; // Default to HD quality
  } catch (error) {
    console.warn('Failed to load initial video quality:', error);
    return '720p'; // Default to HD quality
  }
};

export const useVideoQualityStore = create<VideoQualityState>((set, get) => ({
  // Initial state
  currentQuality: loadInitialQuality(),
  availableQualities: ['360p', '480p', '720p', '1080p', 'auto'],

  // Set global quality for all videos
  setQuality: (quality: VideoQuality) => {
    console.log('🎬 VideoQualityStore - Setting global quality:', quality);
    
    // Save to MMKV
    try {
      MMKVStorage.set('currentQuality', quality);
    } catch (error) {
      console.error('Error saving video quality:', error);
    }
    
    set({ currentQuality: quality });
  },

  // Set available qualities
  setAvailableQualities: (qualities: VideoQuality[]) => {
    console.log('🎬 VideoQualityStore - Setting available qualities:', qualities);
    set({ availableQualities: qualities });
  },

  // Reset to default quality
  resetQuality: () => {
    console.log('🎬 VideoQualityStore - Resetting quality to HD (720p)');
    
    // Save to MMKV
    try {
      MMKVStorage.set('currentQuality', '720p');
    } catch (error) {
      console.error('Error resetting video quality:', error);
    }
    
    set({ currentQuality: '720p' });
  },
})); 