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
import SimpleInstagramVideoPlayer from '../../../components/VideoPlayer/SimpleInstagramVideoPlayer';
import VideoQualitySelector from '../../../components/common/VideoQualitySelector';
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


 // Video store
 const { setVideoPlaying, setCurrentVideo } = useVideoStore();


 // Calculate view height
 const viewHeight = screenHeight;


 // Performance monitoring
 const { metrics, isOptimal, startMonitoring, endMonitoring } = useAdvancedPerformance('episode-player');


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


 // Enhanced scroll handling with momentum detection
 const handleScroll = useCallback((event: any) => {
   if (!isMounted.current) return;


   const { contentOffset, velocity } = event.nativeEvent;
   const currentScrollY = contentOffset.y;
   const currentVelocity = velocity?.y || 0;


   // Much stricter scroll velocity detection
   const isScrollingFast = Math.abs(currentVelocity) > 150; // Higher threshold
   const isScrollingWithMomentum = Math.abs(currentVelocity) > 300; // Much higher threshold
  
   setIsScrollingFast(isScrollingFast || isScrollingWithMomentum);


   // Only update index when scrolling is completely stopped or very slow
   if (!isScrollingWithMomentum && Math.abs(currentVelocity) < 20) {
     const newIndex = Math.round(currentScrollY / viewHeight);
     if (newIndex !== currentIndex.current && newIndex >= 0 && newIndex < episodesData.length) {
       currentIndex.current = newIndex;
      
       const newEpisode = episodesData[newIndex];
       if (newEpisode) {
         setCurrentEpisode(newEpisode);
         setCurrentVideo(newEpisode._id);
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
 }, [episodesData, viewHeight, setCurrentVideo]);


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
       currentIndex.current = newActiveIndex;
      
       const newEpisode = episodesData[newActiveIndex];
       if (newEpisode) {
         setCurrentEpisode(newEpisode);
         setCurrentVideo(newEpisode._id);
       }


       // Update preloader with current context - less aggressive
       instagramStyleVideoPreloader.setCurrentIndex(newActiveIndex);
       instagramStyleVideoPreloader.setVisibleIndices(newVisibleIndices);
      
       // Moderate preloading for next episodes
       smartPreload(newActiveIndex + 1);
     }
   }
 }, [episodesData, setCurrentVideo, smartPreload, isScrollingFast]);


     // Simple render function without complex optimizations
   const renderEpisode = ({ item, index }: { item: Episode; index: number }) => {
 
     console.log('episode :', item);




     const isActive = currentIndex.current === index;
     const isLiked = localLikeStates.get(item._id) || false;


     return (
       <View key={item._id} style={{ width: '100%', height: viewHeight }}>
         {/* Simple Instagram Video Player */}
         <SimpleInstagramVideoPlayer
           episode={item}
           isPlaying={isActive && !isScrollingFast}
           isScrolling={isScrollingFast}
           style={{ width: '100%', height: '100%' }}
         />


         {/* Top Navigation Overlay */}
         <View style={styles.topOverlay}>
           <View style={styles.topLeft}>
             <TouchableOpacity
               style={styles.backButton}
               onPress={() => navigation.goBack()}
             >
               <Icon name="arrow-back" size={24} color="#ffffff" />
             </TouchableOpacity>
             <Text style={styles.episodeText}>
               Episode {item.episodeNo || index + 1}
             </Text>
             <TouchableOpacity style={styles.menuButton}>
               <Icon name="menu" size={20} color="#ffffff" />
             </TouchableOpacity>
           </View>
           <TouchableOpacity style={styles.infoButton}>
             <Icon name="information-circle" size={20} color="#ffffff" />
           </TouchableOpacity>
         </View>


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


         {/* Bottom Content Section */}
         <View style={styles.bottomContent}>
           <Text style={styles.contentTitle}>
             {contentInfo?.title || 'Unknown Title'}
           </Text>
           {/* <Text style={styles.episodeSubtitle}>
             Episode {item.episodeNo || index + 1}
           </Text> */}
           <Text style={styles.contentDescription} numberOfLines={3}>
             {contentInfo?.description || 'No description available'}
           </Text>
         </View>
       </View>
     );
   };


 const keyExtractor = useCallback((item: Episode) => item._id, []);


 // Optimized viewability config for better scroll control - more stable
 const viewabilityConfig = useMemo(() => ({
   itemVisiblePercentThreshold: 80, // Much higher threshold for more stable detection
   minimumViewTime: 500, // Much longer minimum time to prevent rapid switching
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


 // Cleanup on unmount
 useEffect(() => {
   return () => {
     isMounted.current = false;
     if (scrollTimeoutRef.current) {
       clearTimeout(scrollTimeoutRef.current);
     }
     if (preloadTimeoutRef.current) {
       clearTimeout(preloadTimeoutRef.current);
     }
     if (cacheCleanupTimeoutRef.current) {
       clearTimeout(cacheCleanupTimeoutRef.current);
     }
     if (apiTimeoutRef.current) {
       clearTimeout(apiTimeoutRef.current);
     }
    
     // Cleanup Instagram-style preloader
     instagramStyleVideoPreloader.cleanup();
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
       maxToRenderPerBatch={2}
       windowSize={3}
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
   backgroundColor: 'rgba(0, 0, 0, 0.3)',
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
 // Bottom Content Section
 bottomContent: {
   position: 'absolute',
   bottom: -10,
   left: 0,
   right: 0,
   backgroundColor: 'rgba(0, 0, 0, 0.1)',
   padding: 11,
   paddingBottom: 40,
   borderRadius: 8,
 },
 contentTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   color: '#ffffff',
   marginBottom: 4,
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

