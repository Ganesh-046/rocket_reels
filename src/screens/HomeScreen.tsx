import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, Animated, RefreshControl, StyleSheet, Platform, InteractionManager, Dimensions } from 'react-native';
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
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import EmptyMessage from '../components/common/EmptyMessage';
import ActivityLoader from '../components/common/ActivityLoader';
import BannerComponent from '../components/common/BannerComponent';
import ContentSection from '../components/Home/ContentSection';
import TopContentSection from '../components/Home/TopContentSection';
import GenreTab from '../components/Home/GenreTab';

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

// Font constants (since they're not exported from AppColors)
const APP_FONT_BOLD = 'System-Bold';
const APP_FONT_REGULAR = 'System';

// Get dimensions from React Native
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const navBarHeight = 44; // Default navigation bar height

// Device context mock (since DeviceContext doesn't exist)
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
const NEXT_PUBLIC_ASSET_URL = 'https://assets.rocketreels.com';

const SCROLL_THRESHOLD = 10;
const DEBOUNCE_DELAY = 16;
const COLOR_EXTRACTION_DELAY = 0;
const DEFAULT_GRADIENT_COLORS = { light: '#ed9b72', dark: '#7d2537' };
const MASONRY_SLICE_SIZE = 26;
const TOP_CONTENT_SLICE_SIZE = 10;
const NEW_REELS_SLICE_SIZE = 4;
const REFRESH_SCROLL_THRESHOLD = 50;

// API call priority queue
const API_PRIORITY = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
};

// --- Render Functions (moved outside HomeScreen for clarity and performance) ---

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

const HomeScreen = ({ navigation }: { navigation: any }) => {
  // Use device context directly instead of useContext
  const { isLargeDevice, columns, dimension: { width }, appFonts } = deviceContext;

  // Performance optimizations
  const FLATLIST_OPTIMIZATION = {
    initialNumToRender: 3,
    maxToRenderPerBatch: 3,
    windowSize: 8,
    removeClippedSubviews: Platform.OS === 'android',
    getItemLayout: (data: any, index: number) => ({
      length: width * 0.4,
      offset: width * 0.4 * index,
      index,
    }),
  };

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
  const apiCallsRef = useRef(new Map());
  const interactionRef = useRef<any>(null);
  const colorExtractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gradientUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bannerScrollRef = useRef(false);
  const scrollDirectionRef = useRef('vertical');
  const refreshDisabledRef = useRef(false);

  // Track if banner is being scrolled
  const [isBannerScrolling, setIsBannerScrolling] = useState(false);

  // API Query Parameters
  const contentListParams: ContentListRequest = useMemo(() => ({
    page: 1,
    limit: 50,
    type: isSelected === 'all' ? undefined : (isSelected.toLowerCase() as ContentType),
    adult: true, // You can make this dynamic based on user preferences
  }), [isSelected]);

  const topContentParams = useMemo(() => ({
    page: 1,
    limit: 20,
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

  // API Queries with proper loading states
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

  // Note: useWatchHistory expects contentId, not userId
  // For user's watch history, we should use a different approach
  // For now, we'll use a placeholder or remove this functionality
  const watchHistoryData = null;
  const watchHistoryLoading = false;
  const watchHistoryError = null;

  // Enhanced loading states
  const isDataLoading = contentListLoading || bannerLoading || topContentLoading || latestContentLoading || genresLoading;
  const hasApiErrors = contentListError || bannerError || topContentError || latestContentError || genresError;

  // Enhanced error handling with retry functionality
  const handleApiError = useCallback((error: any, context: string, retryFn: () => void) => {
    console.error(`❌ API Error in ${context}:`, error);
    if (mountedRef.current) {
      setErrors(prev => ({
        ...prev,
        [context]: {
          message: error?.message || `Failed to load ${context.toLowerCase()}`,
          retry: retryFn,
          timestamp: Date.now()
        }
      }));
    }
  }, []);

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
    if (genresError) {
      handleApiError(genresError, 'Genres', () => {}); // Genres don't have refetch
    }
  }, [contentListError, bannerError, topContentError, latestContentError, genresError, handleApiError, refetchContentList, refetchBanner, refetchTopContent, refetchLatestContent]);

  // Show loading state for initial load
  const isInitialLoading = isDataLoading && !contentListData && !bannerData && !topContentData;

  // Show empty state when no data is available
  const hasNoData = !isDataLoading && !contentListData?.data?.result?.length && !bannerData?.data?.length && !topContentData?.data?.top?.length;

  // Log API responses for debugging
  useEffect(() => {
    if (contentListData) {
      console.log('📺 Content List Data:', contentListData);
    }
    if (bannerData) {
      console.log('🎬 Banner Data:', bannerData);
    }
    if (topContentData) {
      console.log('🏆 Top Content Data:', topContentData);
    }
    if (latestContentData) {
      console.log('🆕 Latest Content Data:', latestContentData);
    }
    if (genresData) {
      console.log('🎭 Genres Data:', genresData);
    }
  }, [contentListData, bannerData, topContentData, latestContentData, genresData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      [scrollTimeoutRef, colorExtractionTimeoutRef, gradientUpdateTimeoutRef].forEach(ref => {
        if (ref.current) clearTimeout(ref.current);
      });
      if (interactionRef.current) {
        interactionRef.current.cancel();
      }
      // Cancel all pending API calls
      apiCallsRef.current.forEach((controller) => {
        if (controller && typeof controller.abort === 'function') {
          controller.abort();
        }
      });
    };
  }, []);

  // Handle banner scroll events
  const handleBannerScroll = useCallback((isScrolling: boolean) => {
    bannerScrollRef.current = isScrolling;
    refreshDisabledRef.current = isScrolling;

    // Disable refresh for longer duration when banner is scrolling
    if (isScrolling) {
      setTimeout(() => {
        refreshDisabledRef.current = false;
      }, 2000);
    }
  }, []);

  // Handle immediate banner index changes for instant color updates
  const handleBannerIndexChange = useCallback((newIndex: number) => {
    if (bannerData?.data?.[newIndex]?.imageUri && isSelected === 'all') {
      const currentBanner = bannerData.data[newIndex];

      // Immediate color update for cached colors
      if (colorCache.current.has(currentBanner.imageUri)) {
        const cachedColors = colorCache.current.get(currentBanner.imageUri);
        if (cachedColors) {
          setBaseGradientColors(cachedColors);
        }
      }

      // Trigger color extraction for new images
      extractColors(currentBanner.imageUri);

      // Preload colors for adjacent banners
      const nextIndex = (newIndex + 1) % bannerData.data.length;
      const prevIndex = (newIndex - 1 + bannerData.data.length) % bannerData.data.length;

      [nextIndex, prevIndex].forEach(index => {
        const adjacentBanner = bannerData.data[index];
        if (adjacentBanner?.imageUri && !colorCache.current.has(adjacentBanner.imageUri)) {
          // Preload colors for adjacent banners
          extractColors(adjacentBanner.imageUri);
        }
      });
    }
  }, [bannerData?.data, isSelected]);

  // Add a more robust mechanism to disable refresh during banner interactions
  const isRefreshEnabled = useMemo(() => {
    return !bannerScrollRef.current &&
      scrollDirectionRef.current !== 'horizontal' &&
      !refreshDisabledRef.current &&
      isSelected === 'all'; // Only enable refresh for 'all' category
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

  // Enhanced error handling
  const handleError = useCallback((error: any, context: string, retry?: () => void) => {
    console.log(`Error in ${context}:`, error);
    if (mountedRef.current) {
      setErrors(prev => ({
        ...prev,
        [context]: {
          message: error.message || 'An error occurred',
          retry,
          timestamp: Date.now()
        }
      }));
    }
  }, []);

  // Utility to validate image URLs (basic check)
  const isValidImageUrl = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    // Basic check: must start with http(s) and end with an image extension
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(url);
  };

  // Memoized banner data with stable references
  const banner_Data = useMemo(() => {
    try {
      if (!bannerData?.data) return [];

      return bannerData.data.map((item: BannerItem, index: number) => {
        let imageUri = '';
        if (item?.imageUri && item?.imageUri !== '') {
          imageUri = item.imageUri;
        } else if (item.contentDetails?.posterImage) {
          imageUri = `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails?.posterImage}`;
        }
        // Validate image URL
        if (!isValidImageUrl(imageUri)) {
          imageUri = '';
        }
        return {
          ...item,
          imageUri,
          id: item._id || `banner-${index}`,
          stableIndex: index
        };
      });
    } catch (error) {
      handleError(error, 'BANNER_DATA');
      return [];
    }
  }, [bannerData?.data, handleError]);

  // Optimized color extraction with immediate response
  const colorCache = useRef(new Map<string, { light: string; dark: string }>());

  const extractColors = useCallback(async (imageUri: string) => {
    if (!imageUri || !isValidImageUrl(imageUri) || !mountedRef.current) {
      // Set to black if URL is invalid
      setBaseGradientColors({ light: '#000000', dark: '#000000' });
      return;
    }

    // Check cache first - immediate response for cached colors
    if (colorCache.current.has(imageUri)) {
      const cachedColors = colorCache.current.get(imageUri);
      if (mountedRef.current && cachedColors) {
        // Immediate update for cached colors
        setBaseGradientColors(cachedColors);
      }
      return;
    }

    // Immediate color extraction without any delay
    safeSetState(() => setLoadingStates(prev => ({ ...prev, colors: true })));

    try {
      const colors = await extractColorsFromImage(imageUri);
      if (colors?.light && colors?.dark && mountedRef.current) {
        colorCache.current.set(imageUri, colors);
        // Immediate update without any delays
        setBaseGradientColors(colors);
      } else {
        // If extraction fails, fallback to black
        setBaseGradientColors({ light: '#000000', dark: '#000000' });
      }
    } catch (error) {
      handleError(error, 'COLOR_EXTRACTION');
      if (mountedRef.current) {
        setBaseGradientColors({ light: '#000000', dark: '#000000' });
      }
    } finally {
      safeSetState(() => setLoadingStates(prev => ({ ...prev, colors: false })));
    }
  }, [safeSetState, handleError]);

  // Immediate color extraction effect - no delays
  useEffect(() => {
    const currentBanner = banner_Data[currentBannerIndex];
    if (currentBanner?.imageUri && isSelected === 'all') {
      // Immediate color update for better UX
      extractColors(currentBanner.imageUri);

      // Also trigger immediate update for cached colors
      if (colorCache.current.has(currentBanner.imageUri)) {
        const cachedColors = colorCache.current.get(currentBanner.imageUri);
        if (cachedColors) {
          setBaseGradientColors(cachedColors);
        }
      }
    }
  }, [banner_Data, currentBannerIndex, extractColors, isSelected]);

  // Preload colors for all banners on mount
  useEffect(() => {
    if (banner_Data.length > 0 && isSelected === 'all') {
      banner_Data.forEach((banner) => {
        if (banner?.imageUri && !colorCache.current.has(banner.imageUri)) {
          // Preload colors for all banners
          extractColors(banner.imageUri);
        }
      });
    }
  }, [banner_Data, isSelected, extractColors]);

  // Enhanced focus effect with debouncing
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isFocused) {
      // Debounce focus events
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }

      focusTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          // Trigger refetch of all data when screen is focused
          refetchContentList();
          if (isSelected === 'all') {
            refetchBanner();
            refetchTopContent();
            refetchLatestContent();
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

  // Enhanced scroll handler with better scroll direction detection
  const handleScrollDebounced = useCallback((offsetY: number, scrollDirection = 'vertical') => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current || scrollDirection !== 'vertical' || bannerScrollRef.current || scrollDirectionRef.current === 'horizontal' || refreshDisabledRef.current) return;

      const shouldHide = offsetY > SCROLL_THRESHOLD;
      if (shouldHide !== isHide) {
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
          if (mountedRef.current) {
            setIsHide(shouldHide);
          }
        });
      }
    }, DEBOUNCE_DELAY);
  }, [isHide]);

  // Add scroll event filter to prevent horizontal scroll interference
  const scrollEventFilter = useCallback((event: any) => {
    if (!event?.nativeEvent?.contentOffset) return;

    const { contentOffset } = event.nativeEvent;
    const { x, y } = contentOffset;

    // Check if this is a horizontal scroll (likely from banner)
    if (Math.abs(x) > Math.abs(y) && Math.abs(x) > 5) {
      bannerScrollRef.current = true;
      scrollDirectionRef.current = 'horizontal';
      refreshDisabledRef.current = true;

      // Clear banner scroll flag after a longer delay
      setTimeout(() => {
        bannerScrollRef.current = false;
        scrollDirectionRef.current = 'vertical';
        refreshDisabledRef.current = false;
      }, 2000);
      return null; // Filter out horizontal scroll events
    }

    // Only process vertical scroll events
    if (Math.abs(y) > Math.abs(x)) {
      bannerScrollRef.current = false;
      scrollDirectionRef.current = 'vertical';
      return event;
    }

    // Filter out horizontal scroll events
    return null;
  }, []);

  // Option 1: Use Animated.event (Recommended for performance)
  const onScroll = useMemo(() => {
    return Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: true,
        listener: (event: any) => {
          if (!mountedRef.current || !event?.nativeEvent?.contentOffset) return;

          // Filter horizontal scroll events
          const filteredEvent = scrollEventFilter(event);
          if (!filteredEvent) return;

          const offsetY = (event.nativeEvent as any).contentOffset.y || 0;
          handleScrollDebounced(offsetY, 'vertical');
        }
      }
    );
  }, [scrollY, handleScrollDebounced, scrollEventFilter]);

  // Enhanced refresh handler
  const onRefresh = async () => {
    // Prevent refresh when banner is being scrolled or refresh is disabled
    if (bannerScrollRef.current || scrollDirectionRef.current === 'horizontal' || refreshDisabledRef.current || isSelected !== 'all') {
      console.log('Refresh blocked - Banner scrolling or refresh disabled');
      return;
    }

    if (!mountedRef.current || loadingRef.current || loadingStates.refreshing) return;

    loadingRef.current = true;
    safeSetState(() => setLoadingStates(prev => ({ ...prev, refreshing: true })));

    try {
      // Clear caches
      colorCache.current.clear();
      setErrors({});
      setRetryCount(0);

      // Refetch all data
      await Promise.allSettled([
        refetchContentList(),
        refetchTopContent(),
        refetchBanner(),
        refetchLatestContent(),
      ]);

    } catch (error) {
      handleError(error, 'REFRESH');
    } finally {
      if (mountedRef.current) {
        loadingRef.current = false;
        safeSetState(() => setLoadingStates(prev => ({ ...prev, refreshing: false })));
      }
    }
  };

  // Enhanced navigation helper
  const navigateToMovieList = (title: string, data: ContentItem[]) => {
    navigation.navigate('MovieList', { title, data });
  };

  // Optimized masonry layout with stable references
  const masonryData = useMemo(() => {
    try {
      if (!contentListData?.data) return { leftColumn: [], rightColumn: [] };

      let mixContents: ContentItem[] = [];

      // Use existing data if available, don't filter aggressively
      if (isSelected === 'all') {
        mixContents = contentListData.data.result?.slice(6, MASONRY_SLICE_SIZE) || [];
      } else if (isSelected === 'top 10') {
        mixContents = topContentData?.data?.top?.slice(0, TOP_CONTENT_SLICE_SIZE) || [];
      } else if (isSelected === 'new release') {
        mixContents = latestContentData?.data?.contentList?.slice(0, TOP_CONTENT_SLICE_SIZE) || [];
      } else if (isSelected === 'upcoming') {
        mixContents = upcomingContentData?.data?.filteredContentList || [];
      } else {
        mixContents = contentListData.data.result?.slice(6, TOP_CONTENT_SLICE_SIZE) || [];
      }

      if (!mixContents.length) return { leftColumn: [], rightColumn: [] };

      const allContent = languagesData?.data ? [{ languageData: languagesData.data }, ...mixContents] : mixContents;
      const processedData = allContent.map((item, index) => ({
        ...item,
        height: width * 0.6,
        id: (item as any)._id || `item-${index}`,
        stableIndex: index
      }));

      return {
        leftColumn: processedData.filter((_, index) => index % 2 === 0),
        rightColumn: processedData.filter((_, index) => index % 2 === 1)
      };
    } catch (error) {
      handleError(error, 'MASONRY_DATA');
      return { leftColumn: [], rightColumn: [] };
    }
  }, [contentListData?.data, topContentData?.data, latestContentData?.data, upcomingContentData?.data, isSelected, languagesData?.data, handleError, width]);

  // Optimized masonry layout component with stable keys
  const MasonryLayout = useMemo(() => {
    if (!masonryData.leftColumn.length && !masonryData.rightColumn.length) return null;

    return (
      <View style={style.masonryContainer}>
        <View style={style.masonryColumn}>
          {masonryData.leftColumn.map((item, index) => (
            <MasonryCard
              key={`left-${item.id}-${item.stableIndex}`}
              item={item}
              style={{ marginBottom: 10 }}
              userProfileInfo={user}
              navigation={navigation}
              setIsLoginPopUp={() => {}} // You can implement this if needed
              disabled={isSelected === 'upcoming'}
            />
          ))}
        </View>
        <View style={style.masonryColumn}>
          {masonryData.rightColumn.map((item, index) => (
            <MasonryCard
              key={`right-${item.id}-${item.stableIndex}`}
              item={item}
              style={{ marginBottom: 10 }}
              userProfileInfo={user}
              navigation={navigation}
              setIsLoginPopUp={() => {}} // You can implement this if needed
              disabled={isSelected === 'upcoming'}
            />
          ))}
        </View>
      </View>
    );
  }, [masonryData, user, navigation, isSelected, style]);

  const gradientColorsArray = useMemo(() => {
    const defaultColors = ['#CB2D4D', '#ed9b72', colors.PRIMARYBLACK];
    const dynamicColors = [baseGradientColors.dark, baseGradientColors.light, colors.PRIMARYBLACK];

    return (isHide || isSelected !== 'all') ? defaultColors : dynamicColors;
  }, [isHide, isSelected, baseGradientColors.dark, baseGradientColors.light, colors.PRIMARYBLACK]);

  // Add immediate gradient update effect
  useEffect(() => {
    if (isSelected === 'all' && !isHide) {
      // Force gradient update when banner colors change
      const dynamicColors = [baseGradientColors.dark, baseGradientColors.light, colors.PRIMARYBLACK];
      // This will trigger a re-render with new colors immediately
    }
  }, [baseGradientColors.dark, baseGradientColors.light, isSelected, isHide, colors.PRIMARYBLACK]);

  // Loading states
  const isLoading = contentListLoading || bannerLoading || topContentLoading || latestContentLoading;
  const hasErrors = contentListError || bannerError || topContentError || latestContentError;

  return (
    <LinearGradient style={style.container} colors={gradientColorsArray}>
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
            {genresData?.data && genresData.data.length > 0 ? (
              <FlatList
                data={genresData.data}
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
                keyExtractor={(item, index) => item.slug?.toString() || `${item.name}-${index}`}
                {...FLATLIST_OPTIMIZATION}
                initialNumToRender={3}
                maxToRenderPerBatch={2}
                windowSize={5}
                getItemLayout={(data, index) => ({
                  length: 80,
                  offset: 80 * index,
                  index,
                })}
              />
            ) : (
              <View style={{ padding: 16, alignItems: 'center' }}>
                <Text style={{ color: colors.PRIMARYWHITE, opacity: 0.7 }}>No genres available</Text>
              </View>
            )}
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
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityLoader />
                  </View>
                )
              )}

              {/* Continue Watching */}
              {/* Note: watchHistoryData is currently null - this section is disabled
              {isAuthenticated && user && watchHistoryData?.data && (
                <TopContentSection
                  title="Continue Shows"
                  data={watchHistoryData.data}
                  onSeeAll={null}
                  renderItem={props => renderRecentCard({ ...props, navigation })}
                  loadingStates={loadingStates}
                  style={style}
                  isLargeDevice={isLargeDevice}
                  appFonts={appFonts}
                  colors={colors}
                />
              )}
              */}

              {/* Top 10 Shows */}
              <TopContentSection
                title="Top 10 Shows"
                data={topContentData?.data?.top?.slice(0, 10) || []}
                onSeeAll={() => {}}
                renderItem={props => renderTopMovieCard({ ...props, navigation, style })}
                loadingStates={loadingStates}
                style={style}
                isLargeDevice={isLargeDevice}
                appFonts={appFonts}
                colors={colors}
              />

              {/* New Shows */}
              <ContentSection
                title="New Shows"
                data={latestContentData?.data?.contentList?.slice(0, isLargeDevice ? 3 : 4) || []}
                onSeeAll={() => navigateToMovieList('New Shows', latestContentData?.data?.contentList || [])}
                renderItem={props => renderMovieCard({ ...props, navigation })}
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
                data={contentListData?.data?.result || []}
                onSeeAll={() => navigateToMovieList('All Shows', contentListData?.data?.result || [])}
                renderItem={props => renderMovieCard({ ...props, navigation })}
                loadingStates={loadingStates}
                style={style}
                isLargeDevice={isLargeDevice}
                appFonts={appFonts}
                columns={columns}
                colors={colors}
              />

              {/* Error states */}
              {hasErrors && (
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
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityLoader />
                  <Text style={[style.loadingText, { marginTop: 10 }]}>
                    Loading {isSelected} content...
                  </Text>
                </View>
              ) : (
                MasonryLayout ? (
                  <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
                    {MasonryLayout}
                  </View>
                ) : (
                  <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
                    <EmptyMessage
                      title={`No ${isSelected.split('-')[1] || isSelected} content.`}
                      mainContainer={{ height: screenHeight * 0.6 }}
                      onRetry={() => refetchContentList()}
                    />
                  </View>
                )
              )}
            </View>
          )}

          {/* Network status indicator */}
          {isLoading && (
            <View style={style.loadingOverlay}>
              <ActivityLoader />
              <Text style={style.loadingText}>Loading content...</Text>
            </View>
          )}
        </Animated.ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    flex: 1,
    marginBottom: isLargeDevice ? 5 : 10,
  },
  sectionHeader: {
    justifyContent: 'space-between',
    marginTop: isLargeDevice ? width * .01 : width * 0.04,
    marginHorizontal: width * 0.01,
    marginBottom: isLargeDevice ? 5 : 10,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  headerContainer: {
    paddingTop: width * 0.03,
    flex: 0,
    marginBottom: isLargeDevice ? 5 : 10,
  },
  topMovieContainer: {
    marginLeft: isLargeDevice ? width * .035 : width * 0.06,
  },
  topMovieNumber: {
    fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_9 + 10 : appFonts.APP_FONT_SIZE_9 * 2.5,
    textShadowRadius: 0.8,
    color: '#FFFFFF',
    textShadowColor: '#000000',
    textShadowOffset: { width: 5, height: 5 },
    elevation: 10,
    left: isLargeDevice ? -width * .015 : -20,
    position: 'absolute',
    zIndex: 1,
    top: isLargeDevice ? width * .12 : width * 0.14,
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

export default HomeScreen; 