import { useState, useRef, useCallback, useEffect } from 'react';
import { useTrailerStore } from '../store/trailerStore';
import { Trailer, TrailerPlayerState } from '../types/trailer.types';

export const useTrailerPlayer = () => {
  const {
    playerState,
    currentTrailer,
    setPlayerState,
    playTrailer,
    pauseTrailer,
    seekTrailer,
    setQuality,
    toggleControls,
    resetPlayer,
  } = useTrailerStore();

  const videoRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize player
  const initializePlayer = useCallback((trailer: Trailer) => {
    playTrailer(trailer);
    setIsInitialized(true);
  }, [playTrailer]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (playerState.isPlaying) {
      pauseTrailer();
    } else {
      setPlayerState({ isPlaying: true, isPaused: false });
    }
  }, [playerState.isPlaying, pauseTrailer, setPlayerState]);

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    seekTrailer(time);
    if (videoRef.current) {
      videoRef.current.seek(time);
    }
  }, [seekTrailer]);

  // Handle quality change
  const handleQualityChange = useCallback((quality: string) => {
    setQuality(quality);
  }, [setQuality]);

  // Handle video load
  const handleVideoLoad = useCallback((data: any) => {
    setPlayerState({
      duration: data.duration,
      isLoading: false,
      hasError: false,
    });
  }, [setPlayerState]);

  // Handle video progress
  const handleVideoProgress = useCallback((data: any) => {
    const progress = data.duration > 0 ? (data.currentTime / data.duration) * 100 : 0;
    setPlayerState({
      currentTime: data.currentTime,
      progress,
    });
  }, [setPlayerState]);

  // Handle video error
  const handleVideoError = useCallback((error: any) => {
    setPlayerState({
      hasError: true,
      errorMessage: error?.message || 'Video playback error',
      isLoading: false,
    });
  }, [setPlayerState]);

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    setPlayerState({
      isPlaying: false,
      currentTime: 0,
      progress: 0,
    });
  }, [setPlayerState]);

  // Auto-hide controls
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (playerState.showControls && !playerState.isPaused) {
      timer = setTimeout(() => {
        setPlayerState({ showControls: false });
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [playerState.showControls, playerState.isPaused, setPlayerState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetPlayer();
    };
  }, [resetPlayer]);

  return {
    playerState,
    currentTrailer,
    videoRef,
    isInitialized,
    initializePlayer,
    handlePlayPause,
    handleSeek,
    handleQualityChange,
    handleVideoLoad,
    handleVideoProgress,
    handleVideoError,
    handleVideoEnd,
    toggleControls,
    resetPlayer,
  };
}; 