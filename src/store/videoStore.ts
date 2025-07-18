import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV for persistent storage
const storage = new MMKV();

interface VideoState {
  id: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  isReady: boolean;
  isBuffering: boolean;
  isCached: boolean;
  cachedPath: string | null;
  error: string | null;
}

interface VideoStore {
  // Current video state
  currentVideoId: string | null;
  videos: Map<string, VideoState>;
  
  // UI state
  isControllerVisible: boolean;
  isLoading: boolean;
  
  // Performance optimizations
  preloadedVideos: Set<string>;
  cacheSize: number;
  
  // Actions
  setCurrentVideo: (id: string) => void;
  updateVideoState: (id: string, updates: Partial<VideoState>) => void;
  setVideoPlaying: (id: string, isPlaying: boolean) => void;
  setVideoProgress: (id: string, progress: number) => void;
  setVideoCached: (id: string, cachedPath: string) => void;
  addPreloadedVideo: (id: string) => void;
  removePreloadedVideo: (id: string) => void;
  setControllerVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearCache: () => void;
  
  // Computed values
  getCurrentVideo: () => VideoState | null;
  getVideoState: (id: string) => VideoState | null;
  isVideoPreloaded: (id: string) => boolean;
}

// Create optimized store with subscribeWithSelector for performance
export const useVideoStore = create<VideoStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentVideoId: null,
    videos: new Map(),
    isControllerVisible: true,
    isLoading: false,
    preloadedVideos: new Set(),
    cacheSize: 0,
    
    // Actions
    setCurrentVideo: (id: string) => {
      set({ currentVideoId: id });
      
      // Auto-hide controller after 3 seconds
      setTimeout(() => {
        get().setControllerVisible(false);
      }, 3000);
    },
    
    updateVideoState: (id: string, updates: Partial<VideoState>) => {
      set((state) => {
        const newVideos = new Map(state.videos);
        const currentState = newVideos.get(id) || {
          id,
          isPlaying: false,
          progress: 0,
          duration: 0,
          isReady: false,
          isBuffering: false,
          isCached: false,
          cachedPath: null,
          error: null,
        };
        
        newVideos.set(id, { ...currentState, ...updates });
        return { videos: newVideos };
      });
    },
    
    setVideoPlaying: (id: string, isPlaying: boolean) => {
      get().updateVideoState(id, { isPlaying });
    },
    
    setVideoProgress: (id: string, progress: number) => {
      get().updateVideoState(id, { progress });
    },
    
    setVideoCached: (id: string, cachedPath: string) => {
      get().updateVideoState(id, { 
        isCached: true, 
        cachedPath,
        error: null 
      });
    },
    
    addPreloadedVideo: (id: string) => {
      set((state) => ({
        preloadedVideos: new Set([...state.preloadedVideos, id])
      }));
    },
    
    removePreloadedVideo: (id: string) => {
      set((state) => {
        const newSet = new Set(state.preloadedVideos);
        newSet.delete(id);
        return { preloadedVideos: newSet };
      });
    },
    
    setControllerVisible: (visible: boolean) => {
      set({ isControllerVisible: visible });
    },
    
    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },
    
    clearCache: () => {
      set({ 
        videos: new Map(),
        preloadedVideos: new Set(),
        cacheSize: 0 
      });
    },
    
    // Computed values
    getCurrentVideo: () => {
      const { currentVideoId, videos } = get();
      return currentVideoId ? videos.get(currentVideoId) || null : null;
    },
    
    getVideoState: (id: string) => {
      return get().videos.get(id) || null;
    },
    
    isVideoPreloaded: (id: string) => {
      return get().preloadedVideos.has(id);
    },
  }))
);

// Performance-optimized selectors
export const useCurrentVideo = () => useVideoStore((state) => state.getCurrentVideo());
export const useVideoState = (id: string) => useVideoStore((state) => state.getVideoState(id));
export const useIsVideoPlaying = (id: string) => useVideoStore((state) => state.getVideoState(id)?.isPlaying ?? false);
export const useIsVideoCached = (id: string) => useVideoStore((state) => state.getVideoState(id)?.isCached ?? false);
export const useIsVideoPreloaded = (id: string) => useVideoStore((state) => state.isVideoPreloaded(id));
export const useControllerVisible = () => useVideoStore((state) => state.isControllerVisible);
export const useIsLoading = () => useVideoStore((state) => state.isLoading);

// Persistent storage middleware
useVideoStore.subscribe(
  (state) => state.videos,
  (videos) => {
    // Save to MMKV for persistence
    const serialized = Array.from(videos.entries());
    storage.set('videoStates', JSON.stringify(serialized));
  }
);

// Load persisted state on app start
const loadPersistedState = () => {
  try {
    const saved = storage.getString('videoStates');
    if (saved) {
      const parsed = JSON.parse(saved) as [string, VideoState][];
      const videos = new Map(parsed);
      useVideoStore.setState({ videos });
    }
  } catch (error) {
    console.error('Failed to load persisted video state:', error);
  }
};

// Initialize on module load
loadPersistedState(); 