import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

// Lazy initialization of MMKV storage for video quality settings
let storageInstance: MMKV | null = null;

const getStorage = (): MMKV => {
  if (!storageInstance) {
    try {
      storageInstance = new MMKV();
    } catch (error) {
      console.warn('MMKV initialization failed in videoQualityStore:', error);
      throw new Error('MMKV not available - React Native may not be ready');
    }
  }
  return storageInstance;
};

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
    const storage = getStorage();
    const saved = storage.getString('currentQuality');
    return saved as VideoQuality || 'auto';
  } catch (error) {
    console.warn('Failed to load initial video quality:', error);
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
      const storage = getStorage();
      storage.set('currentQuality', quality);
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
      const storage = getStorage();
      storage.set('currentQuality', 'auto');
    } catch (error) {
      console.error('Error resetting video quality:', error);
    }
    
    set({ currentQuality: 'auto' });
  },
})); 