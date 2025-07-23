
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, Animated, RefreshControl, StyleSheet, Platform, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import useTheme from '../hooks/useTheme';
import useThemedStyles from '../hooks/useThemedStyles';
import { SvgIcons } from '../components/common/SvgIcons';
import { PressableButton } from '../components/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MasonryCard from '../components/Cards/MasonryCard';
import MovieCard from '../components/Cards/MovieCard';
import RecentCard from '../components/Cards/RecentCard';
import { extractColorsFromImage } from '../utils/colorExtractor';
import { processContentListImages, processBannerListImages } from '../utils/imageUtils';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import EmptyMessage from '../components/common/EmptyMessage';
import ActivityLoader from '../components/common/ActivityLoader';
import BannerComponent from '../components/common/BannerComponent';
import ContentSection from '../components/Home/ContentSection';
import TopContentSection from '../components/Home/TopContentSection';
import GenreTab from '../components/Home/GenreTab';
import PerformanceMonitor from '../components/common/PerformanceMonitor';
import Skeleton from '../components/Skeleton';


// Import optimized components and hooks
import {
 HomePageSkeleton,
 CategoryPageSkeleton,
 SectionSkeleton
} from '../components/common/SkeletonLoaders';
import {
 useHomeScreenOptimization,
 useOptimizedScroll,
 useOptimizedFlatList,
 useOptimizedRefresh,
 useOptimizedLoading,
} from '../hooks/useHomeScreenOptimization';


// Import API hooks and types
import {
 useContentList,
 useBannerData,
 useTopContent,
 useLatestContent,
 useCustomizedContent,
 useUpcomingContent,
 useGenres,
 useLanguages,
 queryKeys,
} from '../hooks/useApi';
import { useAuthState } from '../store/auth.store';
import { ContentListRequest, ContentItem, BannerItem, ContentType } from '../types/api';


// Font constants
const APP_FONT_BOLD = 'System-Bold';
const APP_FONT_REGULAR = 'System';


// Get dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const navBarHeight = 44;


// Device context
const deviceContext = {
 isLargeDevice: screenWidth > 768,
 columns: screenWidth > 768 ? 3 : 2,
 dimension: { width: screenWidth, height: screenHeight },
 appFonts: {
   APP_FONT_SIZE_3: 16,
   APP_FONT_SIZE_9: 24,
   APP_FONT_SIZE_20: 14,
   APP_FONT_SIZE_35: 12,
 }
};


// Asset URL constant
const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';


// Performance constants
const SCROLL_THRESHOLD = 10;
const DEBOUNCE_DELAY = 16;
const COLOR_EXTRACTION_DELAY = 0;
const DEFAULT_GRADIENT_COLORS = { light: '#2d2d2d', dark: '#1a1a1a' };
const MASONRY_SLICE_SIZE = 50;
const TOP_CONTENT_SLICE_SIZE = 20;
const NEW_REELS_SLICE_SIZE = 4;
const REFRESH_SCROLL_THRESHOLD = 50;


// Render Functions (moved outside component to prevent hooks violation)
const renderMovieCard = ({ item, index, navigation }: { item: ContentItem; index: number; navigation: any }) => (
 <MovieCard
   key={`movie-${item._id}-${index}`}
   item={item}
   index={index}
   navigation={navigation}
 />
);


const renderTopMovieCard = ({ item, index, navigation, style }: { item: ContentItem; index: number; navigation: any; style: any }) => (
 <View key={`top-${item._id}-${index}`} style={style.topMovieContainer}>
   <Text style={[style.heading, style.topMovieNumber]}>{index + 1}</Text>
   <MovieCard item={item} index={index} navigation={navigation} />
 </View>
);


const renderRecentCard = ({ item, index, navigation }: { item: any; index: number; navigation: any }) => (
 <RecentCard
   key={`recent-${item._id}-${index}`}
   item={item}
   index={index}
   navigation={navigation}
 />
);


const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
 container: {
   flex: 1,
  //  paddingBottom: 20
 },
 sectionContainer: {
   flex: 1,
   marginBottom: isLargeDevice ? 5 : 10,
 },
 sectionHeader: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between',
   marginTop: isLargeDevice ? width * .01 : width * 0.04,
   marginHorizontal: width * 0.01,
 },
 seeMoreButton: {
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 8,
   borderRadius: 4,
 },
 headerContainer: {
   paddingTop: width * 0.03,
   flex: 0,
 },
 topMovieContainer: {
   marginLeft: isLargeDevice ? width * .035 : width * 0.06,
 },
 topMovieNumber: {
   fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_9 + 20 : appFonts.APP_FONT_SIZE_9 * 7,
   textShadowRadius: 0.8,
   fontWeight: 'bold',
   color: '#FFFFFF',
   textShadowColor: '#000000',
   textShadowOffset: { width: 5, height: 5 },
   elevation: 10,
   left: isLargeDevice ? -width * .015 : -20,
   position: 'absolute',
   zIndex: 1,
   top: isLargeDevice ? width * .12 : width * 0.15,
 },
 heading: {
   fontSize: appFonts.APP_FONT_SIZE_3,
   fontFamily: APP_FONT_BOLD,
   color: theme.colors.PRIMARYWHITE,
 },
 txt: {
   fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_20 : appFonts.APP_FONT_SIZE_35,
   fontFamily: APP_FONT_REGULAR,
   color: theme.colors.PRIMARYWHITE,
   marginRight: isLargeDevice ? width * .005 : width * 0.01
 },
 directionContainer: {
   flexDirection: "row",
   alignItems: "center",
   flex: 1,
 },
 searchInput: {
   alignItems: 'center',
   justifyContent: 'center',
   paddingHorizontal: isLargeDevice ? width * .015 : width * 0.03,
   paddingVertical: width * 0.02,
   marginHorizontal: isLargeDevice ? width * .01 : width * 0.02,
   borderRadius: 8,
 },
 tabBarCard: {
   marginRight: isLargeDevice ? width * .005 : width * 0.01,
   paddingVertical: isLargeDevice ? width * .0015 : width * 0.01,
   paddingHorizontal: isLargeDevice ? width * .01 : width * 0.02,
   justifyContent: 'center',
   alignItems: 'center',
   borderRadius: 999,
   borderWidth: 2,
   borderColor: theme.colors.TRANSPARENT,
   backgroundColor: theme.colors.TRANSPARENT,
 },
 masonryContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   paddingHorizontal: 10,
 },
 masonryColumn: {
   flex: 1,
   marginHorizontal: 5,
 },
 errorContainer: {
   padding: 16,
   margin: 16,
   backgroundColor: 'rgba(255, 0, 0, 0.1)',
   borderRadius: 8,
   borderWidth: 1,
   borderColor: 'rgba(255, 0, 0, 0.3)',
 },
 errorItem: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 8,
 },
 errorText: {
   color: theme.colors.PRIMARYWHITE,
   fontSize: appFonts.APP_FONT_SIZE_35,
   flex: 1,
 },
 retryButton: {
   backgroundColor: theme.colors.PRIMARYWHITE,
   paddingHorizontal: 12,
   paddingVertical: 6,
   borderRadius: 4,
   marginLeft: 8,
 },
 retryText: {
   color: theme.colors.PRIMARYBLACK,
   fontSize: appFonts.APP_FONT_SIZE_35,
   fontFamily: APP_FONT_BOLD,
 },
 loadingOverlay: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   paddingVertical: 16,
 },
 loadingText: {
   color: theme.colors.PRIMARYWHITE,
   fontSize: appFonts.APP_FONT_SIZE_35,
   marginLeft: 8,
   opacity: 0.7,
 },
});


const HomeScreen = ({ navigation }: { navigation: any }) => {
 // Device context
 const { isLargeDevice, columns, dimension: { width }, appFonts } = deviceContext;


 // Performance optimizations
 const {
   preloadImage,
   preloadImages,
   processContentData,
   clearCache,
   handleError,
   clearErrors,
   PERFORMANCE_CONFIG,
 } = useHomeScreenOptimization();


 // Auth state
 const { user, isAuthenticated } = useAuthState();


 // Theme and styling
 const { theme: { colors } } = useTheme();
 const style = useThemedStyles(styles);


 // Navigation hooks
 const isFocused = useIsFocused();
 const insets = useSafeAreaInsets();
 const tabBarHeight = useBottomTabBarHeight();


 // Enhanced state management
 const [isSelected, setIsSelected] = useState('all');
 const [isHide, setIsHide] = useState(false);
 const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
 const [loadingStates, setLoadingStates] = useState({
   initial: true,
   banners: false,
   content: false,
   colors: false,
   refreshing: false
 });
 const [errors, setErrors] = useState<Record<string, any>>({});
 const [baseGradientColors, setBaseGradientColors] = useState(DEFAULT_GRADIENT_COLORS);
 const [retryCount, setRetryCount] = useState(0);


 // Enhanced refs
 const scrollY = useRef(new Animated.Value(0)).current;
 const mountedRef = useRef(true);
 const loadingRef = useRef(false);
 const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 const colorExtractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 const bannerScrollRef = useRef(false);
 const scrollDirectionRef = useRef('vertical');
 const refreshDisabledRef = useRef(false);


 // Track if banner is being scrolled
 const [isBannerScrolling, setIsBannerScrolling] = useState(false);


 // API Query Parameters
 const contentListParams: ContentListRequest = useMemo(() => ({
   page: 1,
   limit: 100,
   type: isSelected === 'all' ? undefined : (isSelected.toLowerCase() as ContentType),
   adult: true,
 }), [isSelected]);


 const topContentParams = useMemo(() => ({
   page: 1,
   limit: 50,
 }), []);


 const latestContentParams = useMemo(() => ({
   page: 1,
   limit: 100,
 }), []);


 const customizedContentParams = useMemo(() => ({
   page: 1,
   limit: 100,
 }), []);


 const upcomingContentParams = useMemo(() => ({
   page: 1,
   limit: 100,
 }), []);


 // API Queries
 const {
   data: contentListData,
   isLoading: contentListLoading,
   error: contentListError,
   refetch: refetchContentList,
 } = useContentList(contentListParams);


 const {
   data: bannerData,
   isLoading: bannerLoading,
   error: bannerError,
   refetch: refetchBanner,
 } = useBannerData();


 // Continue Watching - Use content list data for authenticated users
 const continueWatchingData = useMemo(() => {
   if (!user || !contentListData?.data?.result) return [];
  
   // Take first 5 items from content list and add progress data
   return contentListData.data.result.slice(0, 5).map((item, index) => ({
     ...item,
     progress: Math.floor(Math.random() * 80) + 10, // Simulate progress between 10-90%
     episode: `Episode ${index + 1}`,
     watchProgress: Math.floor(Math.random() * 80) + 10,
   }));
 }, [user, contentListData?.data?.result]);


 const {
   data: topContentData,
   isLoading: topContentLoading,
   error: topContentError,
   refetch: refetchTopContent,
 } = useTopContent(topContentParams);


 const {
   data: latestContentData,
   isLoading: latestContentLoading,
   error: latestContentError,
   refetch: refetchLatestContent,
 } = useLatestContent(latestContentParams);


 const {
   data: customizedContentData,
   isLoading: customizedContentLoading,
   error: customizedContentError,
   refetch: refetchCustomizedContent,
 } = useCustomizedContent(customizedContentParams);


 const {
   data: upcomingContentData,
   isLoading: upcomingContentLoading,
   error: upcomingContentError,
   refetch: refetchUpcomingContent,
 } = useUpcomingContent(upcomingContentParams);


 const {
   data: genresData,
   isLoading: genresLoading,
   error: genresError,
 } = useGenres();


 const {
   data: languagesData,
   isLoading: languagesLoading,
   error: languagesError,
 } = useLanguages();


 // Optimized loading states
 const { isLoading, isInitialLoading } = useOptimizedLoading({
   contentList: contentListLoading,
   banner: bannerLoading,
   topContent: topContentLoading,
   latestContent: latestContentLoading,
   customizedContent: customizedContentLoading,
   upcomingContent: upcomingContentLoading,
   genres: genresLoading,
 });


 const hasApiErrors = contentListError || bannerError || topContentError || latestContentError || customizedContentError || upcomingContentError || genresError;


 // Enhanced error handling with retry functionality
 const handleApiError = useCallback((error: any, context: string, retryFn: () => void) => {
   if (mountedRef.current) {
     const errorObj = handleError(error, context, retryFn);
     if (errorObj) {
       setErrors(prev => ({
         ...prev,
         [context]: errorObj
       }));
     }
   }
 }, [handleError]);


 // Handle API errors
 useEffect(() => {
   if (contentListError) {
     handleApiError(contentListError, 'Content List', refetchContentList);
   }
   if (bannerError) {
     handleApiError(bannerError, 'Banner Data', refetchBanner);
   }
   if (topContentError) {
     handleApiError(topContentError, 'Top Content', refetchTopContent);
   }
   if (latestContentError) {
     handleApiError(latestContentError, 'Latest Content', refetchLatestContent);
   }
   if (customizedContentError) {
     handleApiError(customizedContentError, 'Customized Content', refetchCustomizedContent);
   }
   if (upcomingContentError) {
     handleApiError(upcomingContentError, 'Upcoming Content', refetchUpcomingContent);
   }
   if (genresError) {
     handleApiError(genresError, 'Genres', () => {});
   }
 }, [contentListError, bannerError, topContentError, latestContentError, customizedContentError, upcomingContentError, genresError, handleApiError, refetchContentList, refetchBanner, refetchTopContent, refetchLatestContent, refetchCustomizedContent, refetchUpcomingContent]);


 // Show skeleton loader for initial loading
 const showInitialLoading = isInitialLoading && !contentListData && !bannerData && !topContentData;


 // Show skeleton loader for category pages
 const showCategoryLoading = isSelected !== 'all' && isLoading;


 // Show empty state when no data is available
 const hasNoData = !isLoading && !contentListData?.data?.result?.length && !bannerData?.data?.length && !topContentData?.data?.top?.length;


 // Cleanup effect
 useEffect(() => {
   return () => {
     mountedRef.current = false;
     [scrollTimeoutRef, colorExtractionTimeoutRef].forEach(ref => {
       if (ref.current) clearTimeout(ref.current);
     });
     clearCache();
     clearErrors();
   };
 }, [clearCache, clearErrors]);


 // Handle banner scroll events
 const handleBannerScroll = useCallback((isScrolling: boolean) => {
   bannerScrollRef.current = isScrolling;
   refreshDisabledRef.current = isScrolling;


   if (isScrolling) {
     setTimeout(() => {
       refreshDisabledRef.current = false;
     }, 2000);
   }
 }, []);


 // Add a more robust mechanism to disable refresh during banner interactions
 const isRefreshEnabled = useMemo(() => {
   return !bannerScrollRef.current &&
     scrollDirectionRef.current !== 'horizontal' &&
     !refreshDisabledRef.current &&
     isSelected === 'all';
 }, [isSelected]);


 // Enhanced safe state setter with error handling
 const safeSetState = useCallback((setter: () => void, errorHandler?: (error: any) => void) => {
   if (mountedRef.current) {
     try {
       setter();
     } catch (error) {
       console.warn('State update error:', error);
       if (errorHandler) errorHandler(error);
     }
   }
 }, []);


 // Utility to validate image URLs
 const isValidImageUrl = (url: string) => {
   if (!url || typeof url !== 'string') return false;
   return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(url);
 };


 // Utility function to process image URLs
 const processImageUrls = (item: any) => {
   return processContentListImages([item])[0];
 };


 // Memoized banner data with stable references and processed image URLs
 const banner_Data = useMemo(() => {
   try {
     if (!bannerData?.data) {
       return [];
     }


     const processedBanners = processBannerListImages(bannerData.data).map((item: BannerItem, index: number) => ({
       ...item,
       id: item._id || `banner-${index}`,
       stableIndex: index
     }));
    
     return processedBanners;
   } catch (error) {
     console.error('Banner processing error:', error);
     handleError(error, 'BANNER_DATA');
     return [];
   }
 }, [bannerData?.data, handleError]);


 // Optimized color extraction with immediate response
 const colorCache = useRef(new Map<string, { light: string; dark: string }>());


 const extractColors = useCallback(async (imageUri: string) => {
   if (!imageUri || !isValidImageUrl(imageUri) || !mountedRef.current) {
     setBaseGradientColors({ light: '#2d2d2d', dark: '#1a1a1a' });
     return;
   }


   // Check cache first
   if (colorCache.current.has(imageUri)) {
     const cachedColors = colorCache.current.get(imageUri);
     if (mountedRef.current && cachedColors) {
       setBaseGradientColors(cachedColors);
     }
     return;
   }


   safeSetState(() => setLoadingStates(prev => ({ ...prev, colors: true })));


   try {
     const colors = await extractColorsFromImage(imageUri);
     if (colors?.light && colors?.dark && mountedRef.current) {
       const darkColors = {
         dark: colors?.dark || '#1a1a1a',
         light: colors?.light || '#2d2d2d'
       };
      
       const ensureDarkColor = (color: string) => {
         const hex = color.replace('#', '');
         const r = parseInt(hex.substr(0, 2), 16);
         const g = parseInt(hex.substr(2, 2), 16);
         const b = parseInt(hex.substr(4, 2), 16);
         const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        
         if (brightness > 100) {
           const darkenFactor = 0.3;
           const newR = Math.floor(r * darkenFactor);
           const newG = Math.floor(g * darkenFactor);
           const newB = Math.floor(b * darkenFactor);
           return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
         }
         return color;
       };
      
       darkColors.dark = ensureDarkColor(darkColors.dark);
       darkColors.light = ensureDarkColor(darkColors.light);
      
       const finalColors = {
         dark: darkColors.dark || '#1a1a1a',
         light: darkColors.light || '#2d2d2d'
       };
      
       colorCache.current.set(imageUri, finalColors);
       setBaseGradientColors(finalColors);
     } else {
       setBaseGradientColors({ light: '#2d2d2d', dark: '#1a1a1a' });
     }
   } catch (error) {
     handleError(error, 'COLOR_EXTRACTION');
     if (mountedRef.current) {
       setBaseGradientColors({ light: '#2d2d2d', dark: '#1a1a1a' });
     }
   } finally {
     safeSetState(() => setLoadingStates(prev => ({ ...prev, colors: false })));
   }
 }, [safeSetState, handleError]);


 // Handle immediate banner index changes for instant color updates
 const handleBannerIndexChange = useCallback((newIndex: number) => {
   if (banner_Data?.[newIndex]?.image && isSelected === 'all') {
     const currentBanner = banner_Data[newIndex];


     if (currentBanner.image && colorCache.current.has(currentBanner.image)) {
       const cachedColors = colorCache.current.get(currentBanner.image);
       if (cachedColors) {
         setBaseGradientColors({
           light: cachedColors.light || '#2d2d2d',
           dark: cachedColors.dark || '#1a1a1a'
         });
       }
     }


     if (currentBanner.image) {
       extractColors(currentBanner.image);
     }


     // Preload colors for adjacent banners
     const nextIndex = (newIndex + 1) % banner_Data.length;
     const prevIndex = (newIndex - 1 + banner_Data.length) % banner_Data.length;


     [nextIndex, prevIndex].forEach(index => {
       const adjacentBanner = banner_Data[index];
       if (adjacentBanner?.image && !colorCache.current.has(adjacentBanner.image)) {
         if (adjacentBanner.image) {
           extractColors(adjacentBanner.image);
         }
       }
     });
   }
 }, [banner_Data, isSelected, extractColors]);


 // Immediate color extraction effect
 useEffect(() => {
   const currentBanner = banner_Data[currentBannerIndex];
   if (currentBanner?.image && isSelected === 'all') {
     extractColors(currentBanner.image);


     if (colorCache.current.has(currentBanner.image)) {
       const cachedColors = colorCache.current.get(currentBanner.image);
       if (cachedColors) {
         setBaseGradientColors({
           light: cachedColors.light || '#2d2d2d',
           dark: cachedColors.dark || '#1a1a1a'
         });
       }
     }
   }
 }, [banner_Data, currentBannerIndex, extractColors, isSelected]);


 // Preload colors for all banners on mount
 useEffect(() => {
   if (banner_Data.length > 0 && isSelected === 'all') {
     banner_Data.forEach((banner) => {
       if (banner?.image && !colorCache.current.has(banner.image)) {
         extractColors(banner.image);
       }
     });
   }
 }, [banner_Data, isSelected, extractColors]);


 // Enhanced focus effect with debouncing
 const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);


 useEffect(() => {
   if (isFocused) {
     if (focusTimeoutRef.current) {
       clearTimeout(focusTimeoutRef.current);
     }


     focusTimeoutRef.current = setTimeout(() => {
       if (mountedRef.current) {
         refetchContentList();
         refetchLatestContent();
         if (isSelected === 'all') {
           refetchBanner();
           refetchTopContent();
           refetchCustomizedContent();
           refetchUpcomingContent();
         }
       }
     }, 100);
   }


   return () => {
     if (focusTimeoutRef.current) {
       clearTimeout(focusTimeoutRef.current);
     }
   };
 }, [isFocused, isSelected, refetchContentList, refetchBanner, refetchTopContent, refetchLatestContent, refetchCustomizedContent, refetchUpcomingContent]);


 // Optimized scroll handler
 const handleScrollDebounced = useOptimizedScroll((offsetY: number) => {
   if (!mountedRef.current || bannerScrollRef.current || scrollDirectionRef.current === 'horizontal' || refreshDisabledRef.current) return;


   const shouldHide = offsetY > SCROLL_THRESHOLD;
   if (shouldHide !== isHide) {
     requestAnimationFrame(() => {
       if (mountedRef.current) {
         setIsHide(shouldHide);
       }
     });
   }
 });


 // Add scroll event filter to prevent horizontal scroll interference
 const scrollEventFilter = useCallback((event: any) => {
   if (!event?.nativeEvent?.contentOffset) return;


   const { contentOffset } = event.nativeEvent;
   const { x, y } = contentOffset;


   if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 5) {
     bannerScrollRef.current = true;
     scrollDirectionRef.current = 'horizontal';
     refreshDisabledRef.current = true;


     setTimeout(() => {
       bannerScrollRef.current = false;
       scrollDirectionRef.current = 'vertical';
       refreshDisabledRef.current = false;
     }, 2000);
     return null;
   }


   if (Math.abs(y) > Math.abs(x)) {
     bannerScrollRef.current = false;
     scrollDirectionRef.current = 'vertical';
     return event;
   }


   return null;
 }, []);


 // Optimized scroll event
 const onScroll = useMemo(() => {
   return Animated.event(
     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
     {
       useNativeDriver: true,
       listener: (event: any) => {
         if (!mountedRef.current || !event?.nativeEvent?.contentOffset) return;


         const filteredEvent = scrollEventFilter(event);
         if (!filteredEvent) return;


         const offsetY = (event.nativeEvent as any).contentOffset.y || 0;
         handleScrollDebounced(offsetY);
       }
     }
   );
 }, [scrollY, handleScrollDebounced, scrollEventFilter]);


 // Optimized refresh handler
 const onRefresh = useOptimizedRefresh([
   refetchContentList,
   refetchTopContent,
   refetchBanner,
   refetchLatestContent,
   refetchCustomizedContent,
   refetchUpcomingContent,
 ], () => {
   colorCache.current.clear();
   setErrors({});
   setRetryCount(0);
 });


 // Enhanced navigation helper
 const navigateToMovieList = (title: string, data: ContentItem[]) => {
   navigation.navigate('MovieList', { title, data });
 };


 // Optimized masonry layout with stable references
 const masonryData = useMemo(() => {
   try {
     if (!contentListData?.data) return { leftColumn: [], rightColumn: [] };


     let mixContents: ContentItem[] = [];


     if (isSelected === 'all') {
       mixContents = contentListData.data.result || [];
     } else if (isSelected === 'top 10') {
       mixContents = topContentData?.data?.top || [];
     } else if (isSelected === 'new release') {
       mixContents = latestContentData?.data?.contentList || [];
     } else if (isSelected === 'upcoming') {
       mixContents = upcomingContentData?.data?.filteredContentList || [];
     } else if (isSelected === 'customized') {
       mixContents = customizedContentData?.data?.findTargetAudience || [];
     } else {
       mixContents = contentListData.data.result || [];
     }


     if (!mixContents.length) {
       return { leftColumn: [], rightColumn: [] };
     }


     const processedData = processContentData(mixContents, isSelected).map((item: any, index: number) => ({
       ...item,
       height: width * 0.6,
     }));


     const result = {
       leftColumn: processedData.filter((_: any, index: number) => index % 2 === 0),
       rightColumn: processedData.filter((_: any, index: number) => index % 2 === 1)
     };


     return result;
   } catch (error) {
     console.error('Error in masonryData:', error);
     handleError(error, 'MASONRY_DATA');
     return { leftColumn: [], rightColumn: [] };
   }
 }, [contentListData?.data, topContentData?.data, latestContentData?.data, upcomingContentData?.data, isSelected, handleError, width, processContentData]);


 // Optimized masonry layout component with stable keys
 const MasonryLayout = useMemo(() => {
   if (!masonryData.leftColumn.length && !masonryData.rightColumn.length) return null;


   return (
     <View style={style.masonryContainer}>
       <View style={style.masonryColumn}>
         {masonryData.leftColumn.map((item: any, index: number) => (
           <MasonryCard
             key={`left-${item.id}-${item.stableIndex}`}
             item={item}
             style={{ marginBottom: 10 }}
             userProfileInfo={user}
             navigation={navigation}
             setIsLoginPopUp={() => {}}
             disabled={isSelected === 'upcoming'}
           />
         ))}
       </View>
       <View style={style.masonryColumn}>
         {masonryData.rightColumn.map((item: any, index: number) => (
           <MasonryCard
             key={`right-${item.id}-${item.stableIndex}`}
             item={item}
             style={{ marginBottom: 10 }}
             userProfileInfo={user}
             navigation={navigation}
             setIsLoginPopUp={() => {}}
             disabled={isSelected === 'upcoming'}
           />
         ))}
       </View>
     </View>
   );
 }, [masonryData, user, navigation, isSelected, style]);


 const gradientColorsArray = useMemo(() => {
   const defaultColors = ['#1a1a1a', '#2d2d2d', '#000000'];
  
   const topColor = baseGradientColors?.dark || '#1a1a1a';
   const middleColor = baseGradientColors?.light || '#2d2d2d';
  
   const isValidHexColor = (color: string) => {
     return color && typeof color === 'string' && /^#[0-9A-F]{6}$/i.test(color);
   };
  
   const safeTopColor = isValidHexColor(topColor) ? topColor : '#1a1a1a';
   const safeMiddleColor = isValidHexColor(middleColor) ? middleColor : '#2d2d2d';
  
   const adjustedMiddleColor = safeMiddleColor === safeTopColor ? '#2d2d2d' : safeMiddleColor;
  
   const dynamicColors = [
     safeTopColor,
     adjustedMiddleColor,
     '#000000'
   ];


   return (isHide || isSelected !== 'all') ? defaultColors : dynamicColors;
 }, [isHide, isSelected, baseGradientColors?.dark, baseGradientColors?.light, colors.PRIMARYBLACK]);


 // Optimized FlatList configuration
 const optimizedFlatListConfig = useOptimizedFlatList(genresData?.data?.length || 0);


 // Render content based on loading states
 if (showInitialLoading) {
   return <HomePageSkeleton />;
 }


 if (showCategoryLoading) {
   return <CategoryPageSkeleton />;
 }


 return (
   <>
     <PerformanceMonitor enabled={__DEV__} showMetrics={__DEV__} />
     <LinearGradient
       style={style.container}
       colors={gradientColorsArray.filter(color => color && typeof color === 'string')}
     >
     <View style={[style.container, {
       marginTop: insets.top,
       marginBottom: isHide ? tabBarHeight : 0
     }]}>
       <Animated.ScrollView
         scrollEventThrottle={16}
         onScroll={onScroll}
         scrollEnabled={!isBannerScrolling}
         refreshControl={
           <RefreshControl
             refreshing={loadingStates.refreshing}
             onRefresh={onRefresh}
             colors={['#CB2D4D']}
             tintColor={colors.PRIMARYWHITE}
             progressBackgroundColor={colors.PRIMARYBLACK}
             enabled={isRefreshEnabled}
             progressViewOffset={0}
           />
         }
         showsVerticalScrollIndicator={false}
         nestedScrollEnabled={true}
         removeClippedSubviews={Platform.OS === 'android'}
         keyboardShouldPersistTaps="handled"
         contentInsetAdjustmentBehavior="automatic"
         directionalLockEnabled={true}
         alwaysBounceVertical={false}
         alwaysBounceHorizontal={false}
         bounces={isRefreshEnabled}
         scrollIndicatorInsets={{ right: 1 }}
         contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
         contentOffset={{ x: 0, y: 0 }}
         onScrollBeginDrag={(event) => {
           const { x, y } = event.nativeEvent.contentOffset;
           if (Math.abs(x) > Math.abs(y)) {
             bannerScrollRef.current = true;
             scrollDirectionRef.current = 'horizontal';
             refreshDisabledRef.current = true;
           }
         }}
         onScrollEndDrag={() => {
           setTimeout(() => {
             bannerScrollRef.current = false;
             scrollDirectionRef.current = 'vertical';
             refreshDisabledRef.current = false;
           }, 1000);
         }}
         onMomentumScrollBegin={(event) => {
           const { x, y } = event.nativeEvent.contentOffset;
           if (Math.abs(x) > Math.abs(y)) {
             bannerScrollRef.current = true;
             scrollDirectionRef.current = 'horizontal';
             refreshDisabledRef.current = true;
           }
         }}
         onMomentumScrollEnd={() => {
           setTimeout(() => {
             bannerScrollRef.current = false;
             scrollDirectionRef.current = 'vertical';
             refreshDisabledRef.current = false;
           }, 1000);
         }}
       >
         {/* Header with genre tabs and search */}
         <View style={[style.directionContainer, style.headerContainer]}>
           <FlatList
             data={[
               { name: 'All', slug: 'all', _id: 'all' },
               ...(genresData?.data || [])
             ]}
             horizontal
             showsHorizontalScrollIndicator={false}
             renderItem={({ item, index }) => (
               <GenreTab
                 item={item}
                 index={index}
                 isSelected={isSelected}
                 setIsSelected={setIsSelected}
                 setCurrentBannerIndex={setCurrentBannerIndex}
                 style={style}
                 colors={colors}
                 appFonts={appFonts}
                 isLargeDevice={isLargeDevice}
                 loadingStates={loadingStates}
                 navigation={navigation}
               />
             )}
             {...optimizedFlatListConfig}
             initialNumToRender={3}
             maxToRenderPerBatch={2}
             windowSize={5}
             getItemLayout={(data, index) => ({
               length: 80,
               offset: 80 * index,
               index,
             })}
           />
           <PressableButton
             onPress={() => navigation?.navigate('Search')}
             style={style.searchInput}
             disabled={isLoading}
           >
             <SvgIcons
               name={'search'}
               size={isLargeDevice ? width * .03 : width * 0.05}
               color={isLoading ? colors.PRIMARYWHITEFOUR : colors.PRIMARYWHITE}
             />
           </PressableButton>
         </View>


         {/* Content based on selection */}
         {isSelected === 'all' ? (
           <View style={style.container}>
             {/* Banner Carousel */}
             {banner_Data.length > 0 ? (
               <View style={{
                 overflow: 'hidden',
                 pointerEvents: 'box-none'
               }}>
                 <BannerComponent
                   banner_Data={banner_Data}
                   baseGradientColors={baseGradientColors}
                   currentBannerIndex={currentBannerIndex}
                   setCurrentBannerIndex={setCurrentBannerIndex}
                   navigation={navigation}
                   onBannerScroll={handleBannerScroll}
                   onBannerIndexChange={handleBannerIndexChange}
                   onTouchStart={() => setIsBannerScrolling(true)}
                   onTouchEnd={() => setIsBannerScrolling(false)}
                 />
               </View>
             ) : (
               bannerLoading && (
                 <View style={{ padding: 20 }}>
                   <Skeleton variant="banner" />
                 </View>
               )
             )}


           


             {/* Top 10 Shows */}
             <TopContentSection
               title="Top 10 Shows"
               data={topContentData?.data?.top?.slice(0, 10) || []}
               onSeeAll={undefined}
               renderItem={props => renderTopMovieCard({ ...props, navigation, style })}
               loadingStates={loadingStates}
               style={style}
               isLargeDevice={isLargeDevice}
               appFonts={appFonts}
               colors={colors}
             />






              {/* Continue Watching - Only show for authenticated users */}
              {user && continueWatchingData.length > 0 && (
               <TopContentSection
                 title="Continue Watching"
                 data={continueWatchingData}
                 onSeeAll={() => navigateToMovieList('Continue Watching', continueWatchingData)}
                 renderItem={props => (renderRecentCard({ ...props, navigation }) as React.ReactElement) || <View key="fallback" />}
                 loadingStates={loadingStates}
                 style={style}
                 isLargeDevice={isLargeDevice}
                 appFonts={appFonts}
                 colors={colors}
               />
             )}


             {/* New Shows */}
             <ContentSection
               title="New Shows"
               data={(latestContentData?.data?.contentList || []).slice(0, 4)}
               onSeeAll={() => navigateToMovieList('New Shows', latestContentData?.data?.contentList || [])}
               renderItem={props => (renderMovieCard({ ...props, navigation }) as React.ReactElement) || <View key="fallback" />}
               loadingStates={loadingStates}
               style={style}
               isLargeDevice={isLargeDevice}
               appFonts={appFonts}
               columns={columns}
               colors={colors}
             />

             {/* All Shows */}
             <ContentSection
               title="All Shows"
               data={(() => {
                 const data = contentListData?.data?.result || [];
                 return data;
               })()}
               onSeeAll={() => navigateToMovieList('All Shows', contentListData?.data?.result || [])}
               renderItem={props => (renderMovieCard({ ...props, navigation }) as React.ReactElement) || <View key="fallback" />}
               loadingStates={loadingStates}
               style={style}
               isLargeDevice={isLargeDevice}
               appFonts={appFonts}
               columns={columns}
               colors={colors}
             />


             {/* Error states */}
             {hasApiErrors && (
               <View style={style.errorContainer}>
                 {Object.entries(errors).map(([key, error]) => (
                   <View key={key} style={style.errorItem}>
                     <Text style={style.errorText}>
                       {error.message}
                     </Text>
                     {error.retry && (
                       <PressableButton
                         onPress={error.retry}
                         style={style.retryButton}
                       >
                         <Text style={style.retryText}>Retry</Text>
                       </PressableButton>
                     )}
                   </View>
                 ))}
               </View>
             )}
           </View>
         ) : (
           <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
             {isLoading ? (
               <SectionSkeleton title={false} horizontal={false} numItems={12} />
             ) : (
               MasonryLayout ? (
                 <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
                   {MasonryLayout}
                 </View>
               ) : (
                 <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
                   <EmptyMessage
                     title={`No ${isSelected === 'all' ? 'content' : isSelected} available.`}
                     mainContainer={{ height: screenHeight * 0.6 }}
                     onRetry={() => refetchContentList()}
                   />
                 </View>
               )
             )}
           </View>
         )}
       </Animated.ScrollView>
     </View>
   </LinearGradient>
   </>
 );
};


export default HomeScreen;














