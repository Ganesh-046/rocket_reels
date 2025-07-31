import { create } from 'zustand';
import { Trailer, TrailerListState, TrailerPlayerState, TrailerFilters } from '../types/trailer.types';

interface TrailerStore extends TrailerListState {
  // Player state
  playerState: TrailerPlayerState;
  
  // Filters
  filters: TrailerFilters;
  
  // Current trailer
  currentTrailer: Trailer | null;
  
  // Actions
  setTrailers: (trailers: Trailer[]) => void;
  addTrailer: (trailer: Trailer) => void;
  updateTrailer: (id: string, updates: Partial<Trailer>) => void;
  removeTrailer: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCurrentPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Player actions
  setPlayerState: (state: Partial<TrailerPlayerState>) => void;
  playTrailer: (trailer: Trailer) => void;
  pauseTrailer: () => void;
  seekTrailer: (time: number) => void;
  setQuality: (quality: string) => void;
  toggleControls: () => void;
  resetPlayer: () => void;
  
  // Filter actions
  setFilters: (filters: Partial<TrailerFilters>) => void;
  clearFilters: () => void;
  
  // Current trailer actions
  setCurrentTrailer: (trailer: Trailer | null) => void;
  
  // Like/Share actions
  toggleLike: (trailerId: string) => void;
  toggleSave: (trailerId: string) => void;
}

const initialPlayerState: TrailerPlayerState = {
  isPlaying: false,
  isPaused: false,
  currentTime: 0,
  duration: 0,
  progress: 0,
  quality: 'auto',
  showControls: false,
  isLoading: false,
  hasError: false,
  errorMessage: undefined,
};

const initialFilters: TrailerFilters = {
  genre: undefined,
  language: undefined,
  quality: undefined,
  duration: undefined,
  sortBy: 'newest',
};

export const useTrailerStore = create<TrailerStore>((set, get) => ({
  // Initial state
  trailers: [],
  isLoading: false,
  hasError: false,
  errorMessage: undefined,
  currentPage: 1,
  hasMore: true,
  refreshing: false,
  
  // Player state
  playerState: initialPlayerState,
  
  // Filters
  filters: initialFilters,
  
  // Current trailer
  currentTrailer: null,
  
  // List actions
  setTrailers: (trailers) => set({ trailers }),
  
  addTrailer: (trailer) => set((state) => ({
    trailers: [...state.trailers, trailer],
  })),
  
  updateTrailer: (id, updates) => set((state) => ({
    trailers: state.trailers.map((trailer) =>
      trailer._id === id ? { ...trailer, ...updates } : trailer
    ),
  })),
  
  removeTrailer: (id) => set((state) => ({
    trailers: state.trailers.filter((trailer) => trailer._id !== id),
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ 
    hasError: !!error, 
    errorMessage: error || undefined 
  }),
  
  setCurrentPage: (currentPage) => set({ currentPage }),
  
  setHasMore: (hasMore) => set({ hasMore }),
  
  setRefreshing: (refreshing) => set({ refreshing }),
  
  // Player actions
  setPlayerState: (state) => set((prevState) => ({
    playerState: { ...prevState.playerState, ...state },
  })),
  
  playTrailer: (trailer) => set((state) => ({
    currentTrailer: trailer,
    playerState: {
      ...state.playerState,
      isPlaying: true,
      isPaused: false,
      isLoading: true,
      hasError: false,
      errorMessage: undefined,
    },
  })),
  
  pauseTrailer: () => set((state) => ({
    playerState: {
      ...state.playerState,
      isPlaying: false,
      isPaused: true,
    },
  })),
  
  seekTrailer: (time) => set((state) => ({
    playerState: {
      ...state.playerState,
      currentTime: time,
      progress: state.playerState.duration > 0 ? (time / state.playerState.duration) * 100 : 0,
    },
  })),
  
  setQuality: (quality) => set((state) => ({
    playerState: {
      ...state.playerState,
      quality: quality as any,
    },
  })),
  
  toggleControls: () => set((state) => ({
    playerState: {
      ...state.playerState,
      showControls: !state.playerState.showControls,
    },
  })),
  
  resetPlayer: () => set({
    playerState: initialPlayerState,
    currentTrailer: null,
  }),
  
  // Filter actions
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),
  
  clearFilters: () => set({ filters: initialFilters }),
  
  // Current trailer actions
  setCurrentTrailer: (trailer) => set({ currentTrailer: trailer }),
  
  // Like/Share actions
  toggleLike: (trailerId) => set((state) => ({
    trailers: state.trailers.map((trailer) =>
      trailer._id === trailerId
        ? {
            ...trailer,
            isLiked: !trailer.isLiked,
            likeCount: trailer.isLiked
              ? (trailer.likeCount || 0) - 1
              : (trailer.likeCount || 0) + 1,
          }
        : trailer
    ),
  })),
  
  toggleSave: (trailerId) => set((state) => ({
    trailers: state.trailers.map((trailer) =>
      trailer._id === trailerId
        ? { ...trailer, isSaved: !trailer.isSaved }
        : trailer
    ),
  })),
}));

// Selectors for better performance
export const useTrailerList = () => useTrailerStore((state) => ({
  trailers: state.trailers,
  isLoading: state.isLoading,
  hasError: state.hasError,
  errorMessage: state.errorMessage,
  currentPage: state.currentPage,
  hasMore: state.hasMore,
  refreshing: state.refreshing,
}));

export const useTrailerPlayer = () => useTrailerStore((state) => ({
  playerState: state.playerState,
  currentTrailer: state.currentTrailer,
}));

export const useTrailerFilters = () => useTrailerStore((state) => ({
  filters: state.filters,
}));

export const useTrailerActions = () => useTrailerStore((state) => ({
  setTrailers: state.setTrailers,
  addTrailer: state.addTrailer,
  updateTrailer: state.updateTrailer,
  removeTrailer: state.removeTrailer,
  setLoading: state.setLoading,
  setError: state.setError,
  setCurrentPage: state.setCurrentPage,
  setHasMore: state.setHasMore,
  setRefreshing: state.setRefreshing,
  playTrailer: state.playTrailer,
  pauseTrailer: state.pauseTrailer,
  seekTrailer: state.seekTrailer,
  setQuality: state.setQuality,
  toggleControls: state.toggleControls,
  resetPlayer: state.resetPlayer,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  setCurrentTrailer: state.setCurrentTrailer,
  toggleLike: state.toggleLike,
  toggleSave: state.toggleSave,
})); 