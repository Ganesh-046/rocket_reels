import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

// MMKV storage for video quality settings
const videoQualityStorage = new MMKV();

export type VideoQuality = '360p' | '480p' | '720p' | '1080p' | 'auto';

interface VideoQualityState {
  // Global quality setting for all videos
  currentQuality: VideoQuality;
  
  // Available qualities for current video
  availableQualities: VideoQuality[];
  
  // Actions
  setQuality: (quality: VideoQuality) => void;
  setAvailableQualities: (qualities: VideoQuality[]) => void;
  resetQuality: () => void;
}

// Load initial quality from MMKV
const loadInitialQuality = (): VideoQuality => {
  try {
    const savedQuality = videoQualityStorage.getString('currentQuality');
    return (savedQuality as VideoQuality) || 'auto';
  } catch (error) {
    console.log('Error loading video quality:', error);
    return 'auto';
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
      videoQualityStorage.set('currentQuality', quality);
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
    console.log('🎬 VideoQualityStore - Resetting quality to auto');
    
    // Save to MMKV
    try {
      videoQualityStorage.set('currentQuality', 'auto');
    } catch (error) {
      console.error('Error resetting video quality:', error);
    }
    
    set({ currentQuality: 'auto' });
  },
})); 