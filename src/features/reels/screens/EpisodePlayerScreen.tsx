import React, { useState, useRef, useCallback, useEffect, useMemo, useContext } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  AppState,
  AppStateStatus,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useVideoStore } from '../../../store/videoStore';
import { instagramVideoCache } from '../../../utils/instagramOptimizedVideoCache';
import { advancedVideoOptimizer } from '../../../utils/advancedVideoOptimizer';
import { hardwareAcceleratedScroll } from '../../../utils/hardwareAcceleratedScroll';
import { performanceMonitor } from '../../../utils/performanceMonitor';
import { useVideoTransition } from '../../../hooks/useVideoTransition';
import { useAdvancedPerformance } from '../../../hooks/useAdvancedPerformance';
import { instagramStyleVideoPreloader } from '../../../utils/instagramStyleVideoPreloader';
import { useVideoPerformanceOptimization } from '../../../hooks/useVideoPerformanceOptimization';
import SimpleInstagramVideoPlayer from '../../../components/VideoPlayer/SimpleInstagramVideoPlayer';
import VideoQualitySelector from '../../../components/common/VideoQualitySelector';
import PlayerIcon from '../../../components/common/PlayerIcon';
import EpisodesModal from '../../../components/common/EpisodesModal';
import SubscriptionModal from '../../../components/common/SubscriptionModal';
import { useEpisodes } from '../../../hooks/useEpisodes';
import ActivityLoader from '../../../components/common/ActivityLoader';
import EmptyMessage from '../../../components/common/EmptyMessage';
import { VideoQuality } from '../../../store/videoQualityStore';
// Add like functionality imports
import { useLikeDislikeContent, useLikedContent } from '../../../hooks/useUserInteractions';
import { useAuthUser } from '../../../store/auth.store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Episode {
  _id: string;
  episodeNo: number;
  language: string;
  status: 'locked' | 'unlocked';
  contentId: string;
  video_urls: {
    '1080p': string;
    '720p': string;
    '480p': string;
    '360p': string;
    master: string;
  };
  thumbnail: string;
  like: number;
  isDeleted: boolean;
  isLiked: boolean | null;
}

interface EpisodePlayerScreenProps {
  navigation: any;
  route: {
    params: {
      contentId: string;
      contentName: string;
      episodes: Episode[];
      initialIndex?: number;
    };
  };
}

const EpisodePlayerScreen: React.FC<EpisodePlayerScreenProps> = ({ navigation, route }) => {
  const { contentId, contentName, episodes: initialEpisodes, initialIndex = 0 } = route.params;

  console.log('🎬 EpisodePlayerScreen - Navigation Params:', {
    contentId,
    contentName,
    initialEpisodesCount: initialEpisodes?.length || 0,
    initialIndex
  });

  // Use episodes hook for API integration
  const {
    episodes: episodesData,
    contentInfo,
    contentLoading,
    contentError,
    refetchContent,
    isEpisodeUnlocked,
    unlockEpisodeWithCoins,
    unlockEpisodeWithAds,
    videoAuthCookies, // 🔑 CRITICAL: Get cookies for video authentication
  } = useEpisodes(contentId);

  console.log('📡 EpisodePlayerScreen - API Data Status:', {
    contentId,
    episodesCount: episodesData?.length || 0,
    contentLoading,
    contentError: contentError?.message,
    contentInfo: contentInfo ? {
      id: contentInfo.id,
      title: contentInfo.title,
      genre: contentInfo.genre,
      language: contentInfo.language
    } : null
  });

  console.log('episodesData :', episodesData);
  console.log('contentInfo :', contentInfo);

  if (episodesData && episodesData.length > 0) {
    console.log('🎥 EpisodePlayerScreen - Episodes Data Sample:', {
      firstEpisode: {
        id: episodesData[0]._id,
        episodeNo: episodesData[0].episodeNo,
        videoUrl: episodesData[0].video_urls?.master ? 'Present' : 'Missing',
        videoUrlValue: episodesData[0].video_urls?.master || 'Not found',
        thumbnail: episodesData[0].thumbnail ? 'Present' : 'Missing',
        status: episodesData[0].status
      },
      totalEpisodes: episodesData.length
    });
  }

  // State
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set([initialIndex]));
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isScrollingFast, setIsScrollingFast] = useState(false);
  const [likedEpisodes, setLikedEpisodes] = useState<Set<string>>(new Set());
  const [isAppActive, setIsAppActive] = useState(true);

  // Progress bar state - PER EPISODE tracking
  const [episodeProgressMap, setEpisodeProgressMap] = useState<Map<string, {
    progress: number;
    duration: number;
    actualDuration: number;
    isSeeking: boolean;
    seekPosition: number;
    showProgressBar: boolean;
    isPaused: boolean;
    externalPauseTrigger: number;
    externalSeekTime: number | null;
    lastSeekTime: number | null;
    durationChangeCount: number;
  }>>(new Map());

  // Current episode progress state (for easy access)
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);

  // Helper functions to manage per-episode progress
  const getEpisodeProgress = useCallback((episodeId: string) => {
    return episodeProgressMap.get(episodeId) || {
      progress: 0,
      duration: 0,
      actualDuration: 0,
      isSeeking: false,
      seekPosition: 0,
      showProgressBar: false,
      isPaused: false,
      externalPauseTrigger: 0,
      externalSeekTime: null,
      lastSeekTime: null,
      durationChangeCount: 0
    };
  }, [episodeProgressMap]);

  const updateEpisodeProgress = useCallback((episodeId: string, updates: Partial<{
    progress: number;
    duration: number;
    actualDuration: number;
    isSeeking: boolean;
    seekPosition: number;
    showProgressBar: boolean;
    isPaused: boolean;
    externalPauseTrigger: number;
    externalSeekTime: number | null;
    lastSeekTime: number | null;
    durationChangeCount: number;
  }>) => {
    setEpisodeProgressMap(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(episodeId) || {
        progress: 0,
        duration: 0,
        actualDuration: 0,
        isSeeking: false,
        seekPosition: 0,
        showProgressBar: false,
        isPaused: false,
        externalPauseTrigger: 0,
        externalSeekTime: null,
        lastSeekTime: null,
        durationChangeCount: 0
      };
      newMap.set(episodeId, { ...current, ...updates });
      return newMap;
    });
  }, []);

  // Like functionality state and refs
  const [localLikeStates, setLocalLikeStates] = useState<Map<string, boolean>>(new Map());
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastServerLikeState = useRef<Map<string, boolean>>(new Map());

  // Get current user and like functionality
  const user = useAuthUser();
  const likeDislikeMutation = useLikeDislikeContent();
  const { data: likedContent } = useLikedContent(user?._id);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cacheCleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndex = useRef(initialIndex);
  const isMounted = useRef(true);
  const progressBarTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const episodeTimeoutsRef = useRef(new Map<string, NodeJS.Timeout>()).current;

  // Animated values for progress bar elements
  const animatedValues = useRef(new Map<string, {
    topOverlayOpacity: Animated.Value;
    topOverlayTranslateY: Animated.Value;
    bottomContentOpacity: Animated.Value;
    bottomContentTranslateY: Animated.Value;
    progressBarOpacity: Animated.Value;
    progressBarTranslateY: Animated.Value;
    pauseButtonOpacity: Animated.Value;
    titleTranslateY: Animated.Value;
  }>()).current;

  // Video store
  const { setVideoPlaying, setCurrentVideo } = useVideoStore();

  // Calculate view height
  const viewHeight = screenHeight;

  // Performance monitoring with optimization
  const { metrics, isOptimal, startMonitoring, endMonitoring } = useAdvancedPerformance('episode-player');

  // Performance optimization flags
  const [isPerformanceOptimized, setIsPerformanceOptimized] = useState(false);

  // Player modal state
  const [isPlayerModalVisible, setIsPlayerModalVisible] = useState(false);

  // Subscription modal state
  const [isSubscriptionModalVisible, setIsSubscriptionModalVisible] = useState(false);

  // Video performance optimization hook
  const {
    throttledUpdate,
    optimizeMemory,
    updateScrollVelocity,
    isScrollingTooFast,
    addToCache,
    removeFromCache,
  } = useVideoPerformanceOptimization({
    enableThrottling: true,
    throttleInterval: 500,
    enableMemoryOptimization: true,
    maxCachedEpisodes: 5,
    enableScrollOptimization: true,
  });



  const handleSeekStart = useCallback((episodeId: string) => {
    const currentProgress = getEpisodeProgress(episodeId);
    updateEpisodeProgress(episodeId, {
      isSeeking: true,
      seekPosition: currentProgress.progress
    });
  }, [getEpisodeProgress, updateEpisodeProgress]);

  const handleSeekUpdate = useCallback((episodeId: string, newPosition: number) => {
    const currentProgress = getEpisodeProgress(episodeId);
    const clampedPosition = Math.max(0, Math.min(newPosition, currentProgress.duration));
    updateEpisodeProgress(episodeId, { seekPosition: clampedPosition });
  }, [getEpisodeProgress, updateEpisodeProgress]);

  const handleSeekEnd = useCallback((episodeId: string) => {
    const currentProgress = getEpisodeProgress(episodeId);
    updateEpisodeProgress(episodeId, {
      isSeeking: false,
      progress: currentProgress.seekPosition,
      externalSeekTime: currentProgress.seekPosition,
      lastSeekTime: currentProgress.seekPosition
    });
  }, [getEpisodeProgress, updateEpisodeProgress]);

  const handleProgressBarPress = useCallback((event: any, episodeId: string) => {
    const { locationX } = event.nativeEvent;
    const progressBarWidth = screenWidth - 32; // Account for padding
    const currentProgress = getEpisodeProgress(episodeId);
    const effectiveDuration = currentProgress.actualDuration || currentProgress.duration;
    const newProgress = (locationX / progressBarWidth) * effectiveDuration;

    console.log('🎯 Progress Bar Press:', {
      episodeId,
      locationX,
      progressBarWidth,
      videoDuration: currentProgress.duration,
      actualVideoDuration: currentProgress.actualDuration,
      effectiveDuration,
      newProgress
    });

    // Set seeking state and position for this episode
    updateEpisodeProgress(episodeId, {
      isSeeking: true,
      seekPosition: newProgress,
      progress: newProgress,
      externalSeekTime: newProgress,
      lastSeekTime: newProgress
    });

    console.log('🎯 Seeking to:', newProgress, 'seconds for episode:', episodeId);

    // Reset seeking state after a short delay
    setTimeout(() => {
      updateEpisodeProgress(episodeId, { isSeeking: false });
    }, 100);
  }, [getEpisodeProgress, updateEpisodeProgress]);

   // Get or create animated values for an episode
 const getAnimatedValues = useCallback((episodeId: string) => {
   if (!animatedValues.has(episodeId)) {
     animatedValues.set(episodeId, {
       topOverlayOpacity: new Animated.Value(0),
       topOverlayTranslateY: new Animated.Value(-100),
       bottomContentOpacity: new Animated.Value(0),
       bottomContentTranslateY: new Animated.Value(100),
       progressBarOpacity: new Animated.Value(0),
       progressBarTranslateY: new Animated.Value(100),
       pauseButtonOpacity: new Animated.Value(0),
       titleTranslateY: new Animated.Value(0),
     });
   }
   return animatedValues.get(episodeId)!;
 }, [animatedValues]);

 // Animate elements based on showProgressBar state
 const animateElements = useCallback((episodeId: string, show: boolean) => {
   const animValues = getAnimatedValues(episodeId);
   
   if (show) {
     // Animate elements in with classy sliding effects
     Animated.parallel([
       // Header slides down from top
       Animated.timing(animValues.topOverlayOpacity, {
         toValue: 1,
         duration: 400,
         useNativeDriver: true,
       }),
       Animated.timing(animValues.topOverlayTranslateY, {
         toValue: 0,
         duration: 400,
         useNativeDriver: true,
       }),
       // Bottom content slides up from bottom
       Animated.timing(animValues.bottomContentOpacity, {
         toValue: 1,
         duration: 400,
         useNativeDriver: true,
       }),
       Animated.timing(animValues.bottomContentTranslateY, {
         toValue: 0,
         duration: 400,
         useNativeDriver: true,
       }),
       // Progress bar slides up from bottom
       Animated.timing(animValues.progressBarOpacity, {
         toValue: 1,
         duration: 400,
         useNativeDriver: true,
       }),
       Animated.timing(animValues.progressBarTranslateY, {
         toValue: 0,
         duration: 400,
         useNativeDriver: true,
       }),
       // Pause button fades in
       Animated.timing(animValues.pauseButtonOpacity, {
         toValue: 1,
         duration: 300,
         useNativeDriver: true,
       }),
       // Title moves to normal position
       Animated.timing(animValues.titleTranslateY, {
         toValue: 0,
         duration: 400,
         useNativeDriver: true,
       }),
     ]).start();
   } else {
     // Animate elements out with classy sliding effects
     Animated.parallel([
       // Header slides up to top
       Animated.timing(animValues.topOverlayOpacity, {
         toValue: 0,
         duration: 400,
         useNativeDriver: true,
       }),
       Animated.timing(animValues.topOverlayTranslateY, {
         toValue: -100,
         duration: 400,
         useNativeDriver: true,
       }),
       // Bottom content slides down to bottom
       Animated.timing(animValues.bottomContentOpacity, {
         toValue: 0,
         duration: 400,
         useNativeDriver: true,
       }),
       Animated.timing(animValues.bottomContentTranslateY, {
         toValue: 100,
         duration: 400,
         useNativeDriver: true,
       }),
       // Progress bar slides down to bottom
       Animated.timing(animValues.progressBarOpacity, {
         toValue: 0,
         duration: 400,
         useNativeDriver: true,
       }),
       Animated.timing(animValues.progressBarTranslateY, {
         toValue: 100,
         duration: 400,
         useNativeDriver: true,
       }),
       // Pause button fades out
       Animated.timing(animValues.pauseButtonOpacity, {
         toValue: 0,
         duration: 300,
         useNativeDriver: true,
       }),
       // Title moves to bottom position
       Animated.timing(animValues.titleTranslateY, {
         toValue: 20,
         duration: 400,
         useNativeDriver: true,
       }),
     ]).start();
   }
 }, [getAnimatedValues]);

 const toggleProgressBar = useCallback((episodeId: string) => {
   const currentProgress = getEpisodeProgress(episodeId);
   const newShowProgressBar = !currentProgress.showProgressBar;
   updateEpisodeProgress(episodeId, { showProgressBar: newShowProgressBar });
   
   // Clear this episode's existing timeout since we're toggling manually
   if (episodeTimeoutsRef.has(episodeId)) {
     clearTimeout(episodeTimeoutsRef.get(episodeId)!);
     episodeTimeoutsRef.delete(episodeId);
   }
   
   if (newShowProgressBar) {
     // Animate elements in
     animateElements(episodeId, true);
     
     // Only set timeout if video is not paused
     if (!currentProgress.isPaused) {
       // Set a 2-second timeout to hide it (only if video is not paused)
       const timeout = setTimeout(() => {
         const updatedProgress = getEpisodeProgress(episodeId);
         // Double-check that video is still not paused before hiding
         if (!updatedProgress.isPaused) {
           updateEpisodeProgress(episodeId, { showProgressBar: false });
         }
         episodeTimeoutsRef.delete(episodeId);
       }, 2000);
       
       episodeTimeoutsRef.set(episodeId, timeout);
     }
   } else {
     // Animate elements out
     animateElements(episodeId, false);
   }
 }, [getEpisodeProgress, updateEpisodeProgress, animateElements, episodeTimeoutsRef]);

  // Handle video player tap to show controls
  const handleVideoTap = useCallback((episodeId: string) => {
    // Check if the current episode is locked
    const currentEpisode = episodesData.find((ep: Episode) => ep._id === episodeId);
    if (currentEpisode) {
      const isLocked = currentEpisode.status === 'locked' &&
        !(
          (user as any)?.isSubscriber ||
          (user as any)?.yearlySubscriber ||
          (user as any)?.weeklySubscriber
        );

      if (isLocked) {
        // Show subscription modal when tapping on locked content
        setIsSubscriptionModalVisible(true);
        
        // Pause the current video when subscription modal opens
        updateEpisodeProgress(episodeId, {
          externalPauseTrigger: getEpisodeProgress(episodeId).externalPauseTrigger + 1
        });
        console.log('🎬 EpisodePlayerScreen - Paused video due to subscription modal opening (tap)');
        return;
      }
    }

    toggleProgressBar(episodeId);
    // This will also trigger the SimpleInstagramVideoPlayer's internal tap handler
  }, [toggleProgressBar, episodesData, user]);

  // Handle pause state change from video player
  const handlePauseStateChange = useCallback((isPaused: boolean, episodeId: string) => {
    updateEpisodeProgress(episodeId, { isPaused });
  }, [updateEpisodeProgress]);

  // Handle progress update from video player
  const handleProgressUpdate = useCallback((currentTime: number, duration: number, episodeId: string) => {
    const currentProgress = getEpisodeProgress(episodeId);

    console.log('📊 Progress Update:', {
      episodeId,
      currentTime,
      duration,
      isSeeking: currentProgress.isSeeking,
      lastSeekTime: currentProgress.lastSeekTime,
      currentVideoProgress: currentProgress.progress,
      currentVideoDuration: currentProgress.duration,
      actualVideoDuration: currentProgress.actualDuration
    });

    // For dynamic duration changes, always accept the latest duration
    // This handles the scenario where duration increases during playback
    if (duration > 0) {
      const updates: any = {};

      // Always update actual duration if it's different (even if smaller)
      if (duration !== currentProgress.actualDuration) {
        updates.actualDuration = duration;
        updates.durationChangeCount = currentProgress.durationChangeCount + 1;
        console.log('📊 Actual Duration Changed:', duration, 'Previous:', currentProgress.actualDuration, 'Change Count:', currentProgress.durationChangeCount + 1);
      }

      // Always update video duration if it's different
      if (duration !== currentProgress.duration) {
        updates.duration = duration;
        console.log('📊 Duration Updated:', duration, 'Previous:', currentProgress.duration);
      }

      // Only update progress if we're not seeking (optimized)
      if (!currentProgress.isSeeking && duration > 0) {
        // Update progress with throttling for better performance
        const progressDiff = Math.abs(currentTime - currentProgress.progress);
        if (progressDiff > 2) { // Increased threshold for better performance
          updates.progress = currentTime;
        }
      }

      if (Object.keys(updates).length > 0) {
        updateEpisodeProgress(episodeId, updates);
      }
    }
  }, [getEpisodeProgress, updateEpisodeProgress]);

   // Handle pause button press
 const handlePauseButtonPress = useCallback((episodeId: string) => {
   const currentProgress = getEpisodeProgress(episodeId);
   
   // Update pause state
   updateEpisodeProgress(episodeId, {
     externalPauseTrigger: currentProgress.externalPauseTrigger + 1
   });
   
   // Ensure progress bar is visible when user pauses
   if (!currentProgress.showProgressBar) {
     updateEpisodeProgress(episodeId, { showProgressBar: true });
     animateElements(episodeId, true);
   }
   
   // Clear this episode's timeout since user paused
   if (episodeTimeoutsRef.has(episodeId)) {
     clearTimeout(episodeTimeoutsRef.get(episodeId)!);
     episodeTimeoutsRef.delete(episodeId);
   }
   
   console.log('Pause button pressed for episode:', episodeId, 'current state:', currentProgress.isPaused);
 }, [getEpisodeProgress, updateEpisodeProgress, animateElements, episodeTimeoutsRef]);

  // Event handlers - defined first to avoid hoisting issues
  const handleLike = useCallback(async (episodeId: string) => {
    console.log('🎯 EpisodePlayerScreen - handleLike called for episode:', episodeId);

    // Check if user is authenticated
    if (!user?._id) {
      console.log('⚠️ EpisodePlayerScreen - User not authenticated, showing alert');
      Alert.alert(
        'Login Required',
        'Please log in to like episodes.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Auth')
          },
        ]
      );
      return;
    }

    // Get current like state
    const currentLikeState = localLikeStates.get(episodeId) || false;
    const newLikeState = !currentLikeState;

    console.log('❤️ EpisodePlayerScreen - Toggling like:', {
      episodeId,
      userId: user._id,
      currentState: currentLikeState,
      newState: newLikeState
    });

    // Optimistically update UI immediately
    setLocalLikeStates(prev => {
      const newMap = new Map(prev);
      newMap.set(episodeId, newLikeState);
      return newMap;
    });

    // Update last server state reference
    lastServerLikeState.current.set(episodeId, newLikeState);

    // Clear existing timeout
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current);
    }

    // Delayed API call (300ms delay for faster sync)
    apiTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('📡 EpisodePlayerScreen - Calling like API...');

        const response = await likeDislikeMutation.mutateAsync({
          userId: user._id,
          episodeId: episodeId
        });

        console.log('✅ EpisodePlayerScreen - Like API response:', {
          episodeId,
          success: response.status,
          message: response.message,
          data: response.data
        });

      } catch (error) {
        console.error('❌ EpisodePlayerScreen - Like API error:', {
          episodeId,
          userId: user._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Revert optimistic update on error
        setLocalLikeStates(prev => {
          const newMap = new Map(prev);
          newMap.set(episodeId, !newLikeState);
          return newMap;
        });

        lastServerLikeState.current.set(episodeId, !newLikeState);

        Alert.alert('Error', 'Failed to update like status. Please try again.');
      }
    }, 300);
  }, [user?._id, likeDislikeMutation, navigation]);

  // Handle player modal press
  const handlePlayerModalPress = useCallback(() => {
    setIsPlayerModalVisible(true);
    
    // Pause the current video when player modal opens
    if (currentEpisode) {
      updateEpisodeProgress(currentEpisode._id, {
        externalPauseTrigger: getEpisodeProgress(currentEpisode._id).externalPauseTrigger + 1
      });
      console.log('🎬 EpisodePlayerScreen - Paused video due to player modal opening');
    }
  }, [currentEpisode, updateEpisodeProgress, getEpisodeProgress]);

  // Handle episode selection from modal
  const handleEpisodePress = useCallback((episode: Episode, index: number) => {
    // Check if episode is locked
    const isLocked = episode.status === 'locked' &&
      !(
        (user as any)?.isSubscriber ||
        (user as any)?.yearlySubscriber ||
        (user as any)?.weeklySubscriber
      );

    if (isLocked) {
      // Show subscription modal instead of playing
      setIsSubscriptionModalVisible(true);
      setIsPlayerModalVisible(false);
      
      // Pause the current video when subscription modal opens
      if (currentEpisode) {
        updateEpisodeProgress(currentEpisode._id, {
          externalPauseTrigger: getEpisodeProgress(currentEpisode._id).externalPauseTrigger + 1
        });
        console.log('🎬 EpisodePlayerScreen - Paused video due to subscription modal opening (episode selection)');
      }
      return;
    }

    // Navigate to the selected episode
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
      });
    }

    // Close the modal
    setIsPlayerModalVisible(false);
  }, [user]);

  // Handle subscription modal actions
  const handleSubscribe = useCallback(() => {
    setIsSubscriptionModalVisible(false);
    // Navigate to subscription screen or handle subscription
    console.log('Navigate to subscription screen');
  }, []);

  const handleSignIn = useCallback(() => {
    setIsSubscriptionModalVisible(false);
    // Navigate to sign in screen
    console.log('Navigate to sign in screen');
  }, []);

  const handleMaybeLater = useCallback(() => {
    setIsSubscriptionModalVisible(false);
    // Play the locked episode anyway
    console.log('Playing locked episode despite subscription requirement');

    // Set the current episode to the locked one so it can play
    if (currentEpisode && currentEpisode.status === 'locked') {
      setCurrentVideo(currentEpisode._id);
    }
  }, [currentEpisode]);

  const handleShare = useCallback(async (episode: Episode) => {
    try {
      // Implement share functionality
    } catch (error) {
    }
  }, []);

  const handleComment = useCallback((episodeId: string) => {
    // Implement comment functionality
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Implement refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const loadMoreEpisodes = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Implement load more logic
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  // Instagram-style aggressive preloading - less aggressive
  const smartPreload = useCallback(async (startIndex: number) => {
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    preloadTimeoutRef.current = setTimeout(async () => {
      try {
        // Add videos to Instagram-style preloader - reduced count
        const preloadItems = episodesData
          .slice(startIndex, startIndex + 2) // Reduced from 5 to 2
          .map((item: Episode, index: number) => {
            const baseUrl = 'https://k9456pbd.rocketreel.co.in/';
            const relativeUrl = item.video_urls?.master || '';
            const fullVideoUrl = relativeUrl.startsWith('http') ? relativeUrl : `${baseUrl}${relativeUrl}`;

            return {
              id: item._id,
              url: fullVideoUrl,
              priority: index === 0 ? 'high' as const : 'medium' as const,
            };
          });

        // Add to preload queue with priorities
        for (const item of preloadItems) {
          instagramStyleVideoPreloader.addToPreloadQueue(item.id, item.url, item.priority);
        }

      } catch (error) {
      }
    }, 200); // Increased delay for stability
  }, [episodesData]);

  // Enhanced scroll handling with momentum detection and performance optimization
  const handleScroll = useCallback((event: any) => {
    if (!isMounted.current) return;

    const { contentOffset, velocity } = event.nativeEvent;
    const currentScrollY = contentOffset.y;
    const currentVelocity = velocity?.y || 0;

    // Update scroll velocity for performance optimization
    updateScrollVelocity(Date.now());

    // Much stricter scroll velocity detection with performance optimization
    const isScrollingFast = Math.abs(currentVelocity) > 150; // Higher threshold
    const isScrollingWithMomentum = Math.abs(currentVelocity) > 300; // Much higher threshold
    const isPerformanceOptimized = isScrollingTooFast();

    setIsScrollingFast(isScrollingFast || isScrollingWithMomentum || isPerformanceOptimized);

    // Only update index when scrolling is completely stopped or very slow
    if (!isScrollingWithMomentum && Math.abs(currentVelocity) < 20) {
      const newIndex = Math.round(currentScrollY / viewHeight);
      if (newIndex !== currentIndex.current && newIndex >= 0 && newIndex < episodesData.length) {
        currentIndex.current = newIndex;

        const newEpisode = episodesData[newIndex];
        if (newEpisode) {
          // Check if the new episode is locked
          const isLocked = newEpisode.status === 'locked' &&
            !(
              (user as any)?.isSubscriber ||
              (user as any)?.yearlySubscriber ||
              (user as any)?.weeklySubscriber
            );

          if (isLocked) {
            // Don't set the locked episode as current, but don't show modal automatically
            // Modal will be shown only when user taps the screen
            return;
          }

          setCurrentEpisode(newEpisode);
          setCurrentVideo(newEpisode._id);
          addToCache(newEpisode._id); // Add to performance cache
        }
      }
    }

    // Much longer debounced scroll end detection
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrollingFast(false);
    }, 500); // Much longer delay for stability
  }, [episodesData, viewHeight, setCurrentVideo, updateScrollVelocity, isScrollingTooFast, addToCache, user]);

  // Handle scroll momentum end
  const handleMomentumScrollEnd = useCallback((event: any) => {
    if (!isMounted.current) return;

    const { contentOffset } = event.nativeEvent;
    const currentScrollY = contentOffset.y;

    // Snap to the nearest episode
    const newIndex = Math.round(currentScrollY / viewHeight);
    if (newIndex >= 0 && newIndex < episodesData.length) {
      currentIndex.current = newIndex;

      const newEpisode = episodesData[newIndex];
      if (newEpisode) {
        setCurrentEpisode(newEpisode);
        setCurrentVideo(newEpisode._id);
      }

      // Update preloader after momentum ends - less aggressive
      instagramStyleVideoPreloader.setCurrentIndex(newIndex);
      smartPreload(newIndex + 1);
    }

    setIsScrollingFast(false);
  }, [episodesData, viewHeight, setCurrentVideo, smartPreload]);

  // Simplified viewability handling - less aggressive
  const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (!isMounted.current || viewableItems.length === 0) return;

    const newVisibleIndices = new Set<number>(viewableItems.map((item: any) => item.index));
    setVisibleIndices(newVisibleIndices);

    // Only update active index if not scrolling fast
    if (!isScrollingFast) {
      const newActiveIndex = viewableItems[0]?.index;
      if (newActiveIndex !== undefined && newActiveIndex !== currentIndex.current) {
        const previousIndex = currentIndex.current;
        currentIndex.current = newActiveIndex;

        const newEpisode = episodesData[newActiveIndex];
        if (newEpisode) {
          setCurrentEpisode(newEpisode);
          setCurrentVideo(newEpisode._id);

          // Reset progress for the new episode (start from beginning)
          updateEpisodeProgress(newEpisode._id, {
            progress: 0,
            duration: 0,
            actualDuration: 0,
            isSeeking: false,
            seekPosition: 0,
            externalSeekTime: null,
            lastSeekTime: null,
            durationChangeCount: 0,
            showProgressBar: false,
            isPaused: false,
            externalPauseTrigger: 0
          });

          console.log('🔄 EpisodePlayerScreen - Scrolled to new episode, reset progress:', {
            from: previousIndex,
            to: newActiveIndex,
            episodeId: newEpisode._id
          });
        }

        // Update preloader with current context - less aggressive
        instagramStyleVideoPreloader.setCurrentIndex(newActiveIndex);
        instagramStyleVideoPreloader.setVisibleIndices(newVisibleIndices);

        // Moderate preloading for next episodes
        smartPreload(newActiveIndex + 1);
      }
    }
  }, [episodesData, setCurrentVideo, smartPreload, isScrollingFast, updateEpisodeProgress]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Simple render function without complex optimizations
  const renderEpisode = ({ item, index }: { item: Episode; index: number }) => {
    console.log('episode :', item);

    const isActive = currentIndex.current === index;
    const isLiked = localLikeStates.get(item._id) || false;

    // Get per-episode progress state
    const episodeProgress = getEpisodeProgress(item._id);
    const currentProgress = episodeProgress.isSeeking ? episodeProgress.seekPosition : episodeProgress.progress;
    const effectiveDuration = episodeProgress.actualDuration || episodeProgress.duration;

    // Calculate progress percentage with dynamic duration handling
    let progressPercentage = 0;
    if (effectiveDuration > 0) {
      // Ensure progress doesn't exceed 100% even if duration changes
      const calculatedProgress = (currentProgress / effectiveDuration) * 100;
      progressPercentage = Math.min(Math.max(calculatedProgress, 0), 100);
    }

    // Performance-optimized logging (commented out for production)
    // console.log('🎬 Episode Render:', {
    //   episodeId: item._id,
    //   currentProgress,
    //   progressPercentage,
    // });

    return (
      <View key={item._id} style={{ width: '100%', height: viewHeight }}>
        {/* Simple Instagram Video Player */}
        <SimpleInstagramVideoPlayer
          episode={item}
          isPlaying={isActive && !isScrollingFast}
          isScrolling={isScrollingFast}
          style={{ width: '100%', height: '100%' }}
          onPauseStateChange={(isPaused: boolean) => handlePauseStateChange(isPaused, item._id)}
          externalPauseTrigger={episodeProgress.externalPauseTrigger}
          externalSeekTime={episodeProgress.externalSeekTime}
          onProgress={(currentTime: number, duration: number) => handleProgressUpdate(currentTime, duration, item._id)}
        />

        {/* Top Navigation Overlay */}
        <Animated.View 
          style={[
            styles.topOverlay,
            { 
              opacity: getAnimatedValues(item._id).topOverlayOpacity,
              transform: [{ translateY: getAnimatedValues(item._id).topOverlayTranslateY }]
            }
          ]}
          pointerEvents={episodeProgress.showProgressBar ? 'auto' : 'none'}
        >
          <View style={styles.topLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.episodeText}>
              Episode {item.episodeNo || index + 1} / {episodesData?.length || 0}
            </Text>
            <TouchableOpacity
              style={styles.playerButton}
              onPress={handlePlayerModalPress}
            >
              <PlayerIcon size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Icon name="information-circle" size={20} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Right Side Action Buttons */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => handleLike(item._id)}
          >
            <View style={[styles.actionIconContainer, isLiked && styles.likedIconContainer]}>
              <Icon
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#ff1493" : "#ffffff"}
              />
            </View>
            <Text style={styles.actionLabel}>{isLiked ? 'Liked' : 'Like'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIconContainer}>
              <Icon name="bookmark-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.actionLabel}>Save</Text>
          </TouchableOpacity>

          <VideoQualitySelector
            videoUrls={item.video_urls}
            onQualityChange={(quality: VideoQuality) => {
              console.log('🎬 EpisodePlayerScreen - Global quality changed to:', quality);
              // The video player will automatically use the new quality from the store
            }}
          />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => {
              console.log('🎬 EpisodePlayerScreen - Share button pressed');
              // Add share functionality here
            }}
          >
            <View style={styles.actionIconContainer}>
              <Icon name="share-outline" size={24} color="#ffffff" />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* YouTube-style Progress Bar */}


        {/* Enhanced Pause Button - Always visible when progress bar is shown */}
        <Animated.View 
          style={[
            styles.centerPauseButton,
            { opacity: getAnimatedValues(item._id).pauseButtonOpacity }
          ]}
          pointerEvents={episodeProgress.showProgressBar ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => handlePauseButtonPress(item._id)}
          >
            <Icon name={episodeProgress.isPaused ? "play" : "pause"} size={40} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Content Section */}
        <View style={[styles.bottomContent, { paddingBottom:  episodeProgress.showProgressBar ? 40 : 0,}]}>
          <Animated.Text 
            style={[
              styles.contentTitle,
              { transform: [{ translateY: getAnimatedValues(item._id).titleTranslateY }] }
            ]}
          >
            {contentInfo?.title || 'Unknown Title'}
          </Animated.Text>
          <Animated.View 
            style={[
              { 
                opacity: getAnimatedValues(item._id).bottomContentOpacity,
                transform: [{ translateY: getAnimatedValues(item._id).bottomContentTranslateY }]
              }
            ]}
            pointerEvents={episodeProgress.showProgressBar ? 'auto' : 'none'}
          >
            <Text style={styles.contentDescription} numberOfLines={3}>
              {contentInfo?.description || 'No description available'}
            </Text>
          </Animated.View>
        </View>



        <Animated.View 
          style={[
            styles.progressBarContainer,
            { 
              opacity: getAnimatedValues(item._id).progressBarOpacity,
              transform: [{ translateY: getAnimatedValues(item._id).progressBarTranslateY }]
            }
          ]}
          pointerEvents={episodeProgress.showProgressBar ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.progressBar}
            onPress={(event) => handleProgressBarPress(event, item._id)}
            activeOpacity={1}
          >
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` }
                ]}
              />
              <View
                style={[
                  styles.progressBarThumb,
                  { left: `${progressPercentage}%` }
                ]}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.timeDisplay}>
            <Text style={styles.timeText}>{formatTime(currentProgress)}</Text>
            <Text style={styles.timeText}>{formatTime(effectiveDuration)}</Text>
          </View>
          {/* Debug info - remove in production */}
          {/* <View style={styles.debugInfo}>
           <Text style={styles.debugText}>
             Progress: {currentProgress.toFixed(1)}s / {effectiveDuration.toFixed(1)}s ({progressPercentage.toFixed(1)}%)
           </Text>
           <Text style={styles.debugText}>
             API: {episodeProgress.actualDuration.toFixed(1)}s | UI: {episodeProgress.duration.toFixed(1)}s | Changes: {episodeProgress.durationChangeCount}
           </Text>
         </View> */}
        </Animated.View>




        {/* Tap to show progress bar */}
        <TouchableOpacity
          style={styles.tapArea}
          onPress={() => handleVideoTap(item._id)}
          activeOpacity={1}
        />

        {/* Episodes Modal */}
        <EpisodesModal
          visible={isPlayerModalVisible}
          onClose={() => setIsPlayerModalVisible(false)}
          episodes={episodesData || []}
          currentEpisodeId={item._id}
          onEpisodePress={handleEpisodePress}
          userProfileInfo={user}
          episodeUnlockedLists={[]} // You can add unlocked episodes list here when available
        />

        {/* Subscription Modal */}
        <SubscriptionModal
          visible={isSubscriptionModalVisible}
          onClose={() => setIsSubscriptionModalVisible(false)}
          onSubscribe={handleSubscribe}
          onSignIn={handleSignIn}
          onMaybeLater={handleMaybeLater}
          isUserLoggedIn={!!user}
        />
      </View>
    );
  };

  const keyExtractor = useCallback((item: Episode) => item._id, []);

  // Optimized viewability config for better scroll control - more stable
  const viewabilityConfig = useMemo(() => ({
    itemVisiblePercentThreshold: 70, // Reduced for better performance
    minimumViewTime: 300, // Reduced for faster switching
  }), []);

  // Optimized item layout for better performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: viewHeight,
    offset: viewHeight * index,
    index,
  }), [viewHeight]);

  // Performance monitoring
  useEffect(() => {
    startMonitoring();

    // Monitor preloader performance
    if (__DEV__) {
      const interval = setInterval(() => {
        const preloaderStats = instagramStyleVideoPreloader.getStats();
      }, 10000);

      return () => {
        clearInterval(interval);
        endMonitoring();
      };
    }

    return () => {
      endMonitoring();
    };
  }, [startMonitoring, endMonitoring]);

  // App state management
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setIsAppActive(nextAppState === 'active');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Initial setup and preloading
  useEffect(() => {
    console.log('🔄 EpisodePlayerScreen - Initial Setup Effect:', {
      episodesDataLength: episodesData?.length || 0,
      initialIndex,
      hasEpisodesData: !!episodesData
    });

    if (episodesData && episodesData.length > 0) {
      console.log('✅ EpisodePlayerScreen - Setting up episodes:', {
        totalEpisodes: episodesData.length,
        initialIndex,
        initialEpisodeId: episodesData[initialIndex]?._id
      });

      // Ensure initial episode is properly set up
      currentIndex.current = initialIndex;
      setVisibleIndices(new Set([initialIndex]));

      const initialEpisode = episodesData[initialIndex];
      if (initialEpisode) {
        console.log('🎬 EpisodePlayerScreen - Setting initial episode:', {
          episodeId: initialEpisode._id,
          title: initialEpisode.title,
          episodeNo: initialEpisode.episodeNo
        });
        setCurrentEpisode(initialEpisode);
        setCurrentVideo(initialEpisode._id);
      }

      smartPreload(initialIndex);
    } else {
      console.log('⚠️ EpisodePlayerScreen - No episodes data available');
    }
  }, [episodesData, initialIndex, smartPreload, setCurrentVideo]);

  // Reset progress state when episode changes
  useEffect(() => {
    if (currentEpisode) {
      // Reset progress state for new episode using per-episode system
      updateEpisodeProgress(currentEpisode._id, {
        progress: 0,
        duration: 0,
        actualDuration: 0,
        isSeeking: false,
        seekPosition: 0,
        externalSeekTime: null,
        lastSeekTime: null,
        durationChangeCount: 0
      });
      setCurrentEpisodeId(currentEpisode._id);
      console.log('🔄 EpisodePlayerScreen - Reset progress state for new episode:', currentEpisode._id);
    }
  }, [currentEpisode?._id, updateEpisodeProgress]);

  // Watch for showProgressBar changes and trigger animations
  useEffect(() => {
    if (episodesData) {
      episodesData.forEach((episode: Episode) => {
        const episodeProgress = getEpisodeProgress(episode._id);
        if (episodeProgress.showProgressBar !== undefined) {
          // Trigger animation based on current state
          animateElements(episode._id, episodeProgress.showProgressBar);
        }
      });
    }
  }, [episodesData, getEpisodeProgress, animateElements]);

  // Watch for pause state changes to handle auto-hide
  useEffect(() => {
    if (episodesData) {
      episodesData.forEach((episode: Episode) => {
        const episodeProgress = getEpisodeProgress(episode._id);
        
        // Clear existing timeout when pause state changes
        if (progressBarTimeoutRef.current) {
          clearTimeout(progressBarTimeoutRef.current);
          progressBarTimeoutRef.current = null;
        }
        
        // If video is playing and progress bar is visible, set auto-hide timeout
        if (episodeProgress.showProgressBar && !episodeProgress.isPaused) {
          // Set new timeout for auto-hide
          progressBarTimeoutRef.current = setTimeout(() => {
            const updatedProgress = getEpisodeProgress(episode._id);
            if (updatedProgress.showProgressBar && !updatedProgress.isPaused) {
              updateEpisodeProgress(episode._id, { showProgressBar: false });
            }
            progressBarTimeoutRef.current = null;
          }, 2000);
        }
      });
    }
  }, [episodesData, getEpisodeProgress, updateEpisodeProgress]);

  // Pause video when modals are open
  useEffect(() => {
    if (currentEpisode) {
      if (isPlayerModalVisible || isSubscriptionModalVisible) {
        // Pause video when any modal is open
        updateEpisodeProgress(currentEpisode._id, {
          externalPauseTrigger: getEpisodeProgress(currentEpisode._id).externalPauseTrigger + 1
        });
        console.log('🎬 EpisodePlayerScreen - Paused video due to modal being open:', {
          playerModal: isPlayerModalVisible,
          subscriptionModal: isSubscriptionModalVisible
        });
      }
    }
  }, [isPlayerModalVisible, isSubscriptionModalVisible, currentEpisode, updateEpisodeProgress, getEpisodeProgress]);

  // Focus management - simplified
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Only pause active video when screen loses focus
        if (currentEpisode) {
          setVideoPlaying(currentEpisode._id, false);
        }
      };
    }, [currentEpisode, setVideoPlaying])
  );

  // Cache cleanup
  useEffect(() => {
    const cleanupCache = async () => {
      try {
        await instagramVideoCache.clearCache();
      } catch (error) {
      }
    };

    cacheCleanupTimeoutRef.current = setTimeout(cleanupCache, 30000); // Cleanup every 30 seconds

    return () => {
      if (cacheCleanupTimeoutRef.current) {
        clearTimeout(cacheCleanupTimeoutRef.current);
      }
    };
  }, []);

  // Initialize like states from server data
  useEffect(() => {
    if (likedContent?.data && episodesData) {
      const likedEpisodeIds = new Set(likedContent.data);
      const newLocalStates = new Map<string, boolean>();

      episodesData.forEach((episode: Episode) => {
        const isLiked = likedEpisodeIds.has(episode._id);
        newLocalStates.set(episode._id, isLiked);
        lastServerLikeState.current.set(episode._id, isLiked);
      });

      setLocalLikeStates(newLocalStates);
    }
  }, [likedContent?.data, episodesData]);

  // Cleanup on unmount with performance optimization
  useEffect(() => {
    return () => {
      isMounted.current = false;

      // Clear all timeouts
      [scrollTimeoutRef, preloadTimeoutRef, cacheCleanupTimeoutRef, apiTimeoutRef, progressBarTimeoutRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = null;
        }
      });

      // Cleanup Instagram-style preloader
      instagramStyleVideoPreloader.cleanup();

      // Clear episode progress map to free memory
      setEpisodeProgressMap(new Map());
    };
  }, []);

  // Loading state
  if (contentLoading) {
    console.log('⏳ EpisodePlayerScreen - Showing loading state');
    return (
      <View style={styles.container}>
        <ActivityLoader />
      </View>
    );
  }

  // Debug: Log current state
  console.log('🔍 EpisodePlayerScreen - Current State:', {
    contentLoading,
    contentError: contentError?.message,
    episodesDataLength: episodesData?.length || 0,
    currentEpisode: currentEpisode?._id,
    isScrollingFast,
    viewHeight,
    hasUser: !!user,
    userId: user?._id,
    likedContentData: likedContent?.data,
    localLikeStatesSize: localLikeStates.size,
  });

  // Error state
  if (contentError) {
    console.log('❌ EpisodePlayerScreen - Showing error state:', {
      error: contentError.message,
      contentId
    });
    return (
      <View style={styles.container}>
        <EmptyMessage
          title="Error loading episodes"
          subtitle={contentError.message || "Please try again"}
          onRetry={refetchContent}
        />
      </View>
    );
  }

  // Empty state
  if (!episodesData || episodesData.length === 0) {
    console.log('📭 EpisodePlayerScreen - Showing empty state:', {
      contentId,
      hasEpisodesData: !!episodesData,
      episodesLength: episodesData?.length || 0
    });
    return (
      <View style={styles.container}>
        <EmptyMessage
          title="No episodes available"
          subtitle="This content doesn't have any episodes yet"
          onRetry={refetchContent}
        />
      </View>
    );
  }

  // Fallback: Show basic content if FlatList fails
  if (!episodesData || episodesData.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Loading episodes...</Text>
          <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 20 }} />
        </View>
      </View>
    );
  }

  console.log('🎬 EpisodePlayerScreen - Rendering FlatList with episodes:', {
    episodesCount: episodesData.length,
    currentIndex: currentIndex.current,
    isScrollingFast
  });

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={episodesData}
        renderItem={renderEpisode}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={viewHeight}
        snapToAlignment="start"
        decelerationRate={0.8}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={1}
        windowSize={2}
        initialNumToRender={1}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetchContent}
            tintColor="#ffffff"
            colors={["#ffffff"]}
          />
        }
        onEndReached={loadMoreEpisodes}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : null
        }
        style={styles.flatList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  flatList: {
    flex: 1,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
  },
  // Top Navigation Overlay
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    //  backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  episodeText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  playerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Right Side Actions
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    alignItems: 'center',
    zIndex: 10,
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  likedIconContainer: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  // Progress Bar Styles
  progressBarContainer: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    zIndex: 15,
  },
  progressBar: {
    height: 40,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF0000',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  progressBarThumb: {
    width: 12,
    height: 12,
    backgroundColor: '#FF0000',
    borderRadius: 6,
    position: 'absolute',
    top: -4,
    marginLeft: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  debugInfo: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#ffff00',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  tapArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  centerPauseButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }],
    zIndex: 20,
  },
  pauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Bottom Content Section
  bottomContent: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    // backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 11,
    borderRadius: 8,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  episodeSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
    lineHeight: 20,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  fallbackText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },

});

export default EpisodePlayerScreen;

