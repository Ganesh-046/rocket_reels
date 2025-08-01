import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import MMKVStorage from '../lib/mmkv';

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
  isVisible: boolean;
  isLiked: boolean;
  lastAccessed: number;
  repeat: boolean; // Add repeat functionality
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
  resetVideoProgress: (id: string) => void;
  setVideoCached: (id: string, cachedPath: string) => void;
  setVideoRepeat: (id: string, repeat: boolean) => void; // Add repeat action
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
          isVisible: false,
          isLiked: false,
          lastAccessed: Date.now(),
          repeat: false, // Default to no repeat
        };
        
        newVideos.set(id, { ...currentState, ...updates });
        return { videos: newVideos };
      });
    },
    
    setVideoPlaying: (id: string, isPlaying: boolean) => {
      // Update immediately without batching for faster response
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
          isVisible: false,
          isLiked: false,
          lastAccessed: Date.now(),
          repeat: false, // Default to no repeat
        };
        
        newVideos.set(id, { ...currentState, isPlaying, lastAccessed: Date.now() });
        return { videos: newVideos };
      });
    },
    
    setVideoProgress: (id: string, progress: number) => {
      // Validate progress value
      const validProgress = Math.max(0, Math.min(100, progress));
      get().updateVideoState(id, { progress: validProgress });
    },
    
    resetVideoProgress: (id: string) => {
      get().updateVideoState(id, { progress: 0 });
    },
    
    setVideoCached: (id: string, cachedPath: string) => {
      get().updateVideoState(id, { 
        isCached: true, 
        cachedPath,
        error: null 
      });
    },
    
    setVideoRepeat: (id: string, repeat: boolean) => {
      get().updateVideoState(id, { repeat });
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

// Progress selectors
export const useVideoProgress = (id: string) => useVideoStore((state) => state.getVideoState(id)?.progress ?? 0);
export const useVideoDuration = (id: string) => useVideoStore((state) => state.getVideoState(id)?.duration ?? 0);

// Repeat selector
export const useVideoRepeat = (id: string) => useVideoStore((state) => state.getVideoState(id)?.repeat ?? false);

// Persistent storage middleware
useVideoStore.subscribe(
  (state) => state.videos,
  (videos) => {
    // Save to MMKV for persistence
    const serialized = Array.from(videos.entries());
    MMKVStorage.set('videoStates', serialized);
  }
);

// Load persisted state on app start
const loadPersistedState = () => {
  try {
    const saved = MMKVStorage.get('videoStates');
    if (saved) {
      const parsed = saved as [string, VideoState][];
      const videos = new Map(parsed);
      useVideoStore.setState({ videos });
    }
  } catch (error) {
    console.warn('Failed to load persisted video states:', error);
  }
};

// Initialize on module load
loadPersistedState(); 