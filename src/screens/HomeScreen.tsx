
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  Dimensions,
  Animated,
  InteractionManager,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import useThemedStyles from '../hooks/useThemedStyles';
import { useBannerData, useContentList, useTopContent, useLatestContent, useCustomizedContent, useUpcomingContent, useGenres, useLanguages } from '../hooks/useApi';
import { extractColorsFromImage } from '../utils/colorExtractor';
import BannerComponent from '../components/common/BannerComponent';
import ContentSection from '../components/Home/ContentSection';
import TopContentSection from '../components/Home/TopContentSection';
import GenreTab from '../components/Home/GenreTab';
import ActivityLoader from '../components/common/ActivityLoader';
import { ContentItem, BannerItem, ContentType } from '../types/api';
import { useIsFocused } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHomeScreenOptimization, useOptimizedScroll, useOptimizedLoading, useOptimizedRefresh } from '../hooks/useHomeScreenOptimization';
import { useAuthState } from '../store/auth.store';
import { PressableButton } from '../components/Button';
import { SvgIcons } from '../components/common/SvgIcons';
import EmptyMessage from '../components/common/EmptyMessage';
import MasonryCard from '../components/Cards/MasonryCard';
import MovieCard from '../components/Cards/MovieCard';
import RecentCard from '../components/Cards/RecentCard';
import MMKVStorage from '../lib/mmkv';
import { useBalance } from '../hooks/useBalance';

// Font constants
const APP_FONT_BOLD = 'System-Bold';
const APP_FONT_REGULAR = 'System';

// Asset URL constant
const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';

// Performance constants
const SCROLL_THRESHOLD = 10;
const DEBOUNCE_DELAY = 16;
const DEFAULT_GRADIENT_COLORS = { light: '#ed9b72', dark: '#7d2537' };
const MASONRY_SLICE_SIZE = 26;
const TOP_CONTENT_SLICE_SIZE = 10;

// API call priority queue
const API_PRIORITY = {
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3
};

// Optimized render functions with React.memo
const renderMovieCard = React.memo(({ item, index, navigation }: { item: ContentItem; index: number; navigation: any }) => {
  if (!item) return null;
  return (
    <MovieCard
      key={`movie-${item._id}-${index}`}
      item={item}
      index={index}
      navigation={navigation}
    />
  );
});

const renderTopMovieCard = React.memo(({ item, index, navigation, style }: { item: ContentItem; index: number; navigation: any; style: any }) => {
  if (!item) return null;
  return (
    <View key={`top-container-${item._id}-${index}`} style={style.topMovieContainer}>
      <Text style={style.topMovieNumber}>{index + 1}</Text>
      <MovieCard
        key={`top-movie-${item._id}-${index}`}
        item={item}
        index={index}
        navigation={navigation}
      />
    </View>
  );
});

const renderRecentCard = React.memo(({ item, index, navigation }: { item: any; index: number; navigation: any }) => {
  if (!item) return null;
  return (
    <RecentCard
      key={`recent-${item._id}-${index}`}
      item={item}
      index={index}
      navigation={navigation}
    />
  );
});

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    flex: 1,
    marginBottom: isLargeDevice ? 5 : -10,
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
    fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_9 + 20 : appFonts.APP_FONT_SIZE_9 * 7,
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
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: isLargeDevice ? width * .015 : width * 0.03,
    paddingVertical: isLargeDevice ? width * .005 : width * 0.01,
    borderRadius: 8,
    backgroundColor: theme.colors.PRIMARYLIGHTBLACKONE,
    marginTop: isLargeDevice ? width * .005 : width * 0.01,
    marginHorizontal: isLargeDevice ? width * .01 : width * 0.02,
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceText: {
    color: theme.colors.PRIMARYWHITE,
    fontSize: appFonts.APP_FONT_SIZE_35,
    fontFamily: APP_FONT_BOLD,
    marginRight: isLargeDevice ? width * .005 : width * 0.01,
  },
  balanceRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceAmount: {
    color: theme.colors.PRIMARYBG,
    fontSize: appFonts.APP_FONT_SIZE_35,
    fontFamily: APP_FONT_BOLD,
    marginLeft: isLargeDevice ? width * .005 : width * 0.01,
  },
});

// Optimized HomeScreen component
const HomeScreen = React.memo(({ navigation }: { navigation: any }) => {
  // Device context
  const { width, height } = Dimensions.get('window');
  const isLargeDevice = width > 768;
  const columns = isLargeDevice ? 3 : 2;
  const appFonts = {
    APP_FONT_SIZE_3: 16,
    APP_FONT_SIZE_9: 24,
    APP_FONT_SIZE_18: 14,
    APP_FONT_SIZE_20: 14,
    APP_FONT_SIZE_35: 12,
  };

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

  // Debug: Check authentication state and token
  useEffect(() => {
    console.log('🔐 HomeScreen Auth Debug:', {
      isAuthenticated,
      userId: user?._id,
      userName: user?.userName,
      userEmail: user?.userEmail,
      hasUser: !!user,
    });

    // Check token in MMKV storage
    const token = MMKVStorage.getToken();
    console.log('🔑 Token Debug:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token',
    });

    // Check auth data in MMKV
    const authData = MMKVStorage.getAuthData();
    console.log('💾 MMKV Auth Data:', {
      hasAuthData: !!authData,
      hasUser: !!authData?.user,
      hasToken: !!authData?.token,
    });

    // Add global debug function
    (global as any).checkAuth = () => {
      const token = MMKVStorage.getToken();
      const user = MMKVStorage.getUser();
      const authData = MMKVStorage.getAuthData();
      
      console.log('🔍 GLOBAL AUTH CHECK:', {
        isAuthenticated,
        hasUser: !!user,
        hasToken: !!token,
        hasAuthData: !!authData,
        tokenPreview: token ? `${token.substring(0, 30)}...` : 'No token',
        userId: user?._id,
      });
      
      return { isAuthenticated, hasUser: !!user, hasToken: !!token };
    };

    // Add global function to restore auth
    (global as any).restoreAuth = () => {
      console.log('🔄 Manually restoring auth...');
      const { initializeAuth } = require('../store/auth.store');
      initializeAuth();
      console.log('✅ Auth restoration completed');
    };

  }, [isAuthenticated, user]);

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
    initial: false,
    banners: false,
    content: false,
    colors: false,
    refreshing: false
  });
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [baseGradientColors, setBaseGradientColors] = useState(DEFAULT_GRADIENT_COLORS);
  const [retryCount, setRetryCount] = useState(0);

  // Balance hook
  const { totalCoins, loading: balanceLoading, error: balanceError, refreshBalance } = useBalance();

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

  // API Query Parameters - Updated to handle genre selection properly
  const contentListParams = useMemo(() => {
    const params: any = {
      page: 1,
      limit: 100,
      adult: true,
    };

    // Only add type parameter for specific genres, not for 'all'
    if (isSelected !== 'all' && isSelected !== 'upcoming') {
      params.type = isSelected.toLowerCase();
    }

    return params;
  }, [isSelected]);

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
      handleApiError(genresError, 'Genres', () => { });
    }
  }, [contentListError, bannerError, topContentError, latestContentError, customizedContentError, upcomingContentError, genresError, handleApiError, refetchContentList, refetchBanner, refetchTopContent, refetchLatestContent, refetchCustomizedContent, refetchUpcomingContent]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      [scrollTimeoutRef, colorExtractionTimeoutRef, gradientUpdateTimeoutRef].forEach(ref => {
        if (ref.current) {
          clearTimeout(ref.current);
          ref.current = null;
        }
      });
      if (interactionRef.current) {
        interactionRef.current.cancel();
        interactionRef.current = null;
      }
      // Cancel all pending API calls
      apiCallsRef.current.forEach((controller) => {
        if (controller && typeof controller.abort === 'function') {
          controller.abort();
        }
      });
      apiCallsRef.current.clear();

      clearCache();
      clearErrors();

      // Reset refs
      loadingRef.current = false;
      bannerScrollRef.current = false;
      scrollDirectionRef.current = 'vertical';
      refreshDisabledRef.current = false;
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

  // Memoized banner data with stable references
  const banner_Data = useMemo(() => {
    try {
      if (!bannerData?.data) {
        return [];
      }

      const processedBanners = bannerData.data.map((item: any, index: number) => {
        let imageUri = '';

        // Try different possible image field names
        if (item?.image && item?.image !== '') {
          imageUri = `${NEXT_PUBLIC_ASSET_URL}/${item?.image}`;
        } else if (item?.imageUri && item?.imageUri !== '') {
          imageUri = item.imageUri;
        } else if (item?.contentDetails?.posterImage) {
          imageUri = `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails?.posterImage}`;
        } else if (item?.contentDetails?.backdropImage) {
          imageUri = `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails?.backdropImage}`;
        } else if (item?.contentDetails?.thumb) {
          imageUri = `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails?.thumb}`;
        }

        // Validate image URL
        if (!isValidImageUrl(imageUri)) {
          imageUri = '';
        }

        return {
          ...item,
          imageUri,
          id: item._id || item.id || `banner-${index}`,
          stableIndex: index
        };
      });

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
      setBaseGradientColors({ light: '#ed9b72', dark: '#7d2537' });
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
        colorCache.current.set(imageUri, colors);
        setBaseGradientColors(colors);
      } else {
        setBaseGradientColors({ light: '#ed9b72', dark: '#7d2537' });
      }
    } catch (error) {
      handleError(error, 'COLOR_EXTRACTION');
      if (mountedRef.current) {
        setBaseGradientColors({ light: '#ed9b72', dark: '#7d2537' });
      }
    } finally {
      safeSetState(() => setLoadingStates(prev => ({ ...prev, colors: false })));
    }
  }, [safeSetState, handleError]);

  // Handle immediate banner index changes for instant color updates
  const handleBannerIndexChange = useCallback((newIndex: number) => {
    if (banner_Data?.[newIndex]?.imageUri && isSelected === 'all') {
      const currentBanner = banner_Data[newIndex];

      if (currentBanner.imageUri && colorCache.current.has(currentBanner.imageUri)) {
        const cachedColors = colorCache.current.get(currentBanner.imageUri);
        if (cachedColors) {
          setBaseGradientColors(cachedColors);
        }
      }

      if (currentBanner.imageUri) {
        extractColors(currentBanner.imageUri);
      }

      // Preload colors for adjacent banners
      const nextIndex = (newIndex + 1) % banner_Data.length;
      const prevIndex = (newIndex - 1 + banner_Data.length) % banner_Data.length;

      [nextIndex, prevIndex].forEach(index => {
        const adjacentBanner = banner_Data[index];
        if (adjacentBanner?.imageUri && !colorCache.current.has(adjacentBanner.imageUri)) {
          if (adjacentBanner.imageUri) {
            extractColors(adjacentBanner.imageUri);
          }
        }
      });
    }
  }, [banner_Data, isSelected, extractColors]);

  // Immediate color extraction effect
  useEffect(() => {
    const currentBanner = banner_Data[currentBannerIndex];
    if (currentBanner?.imageUri && isSelected === 'all') {
      extractColors(currentBanner.imageUri);

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
          extractColors(banner.imageUri);
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

  // Handle genre selection changes - trigger API calls when genre changes
  useEffect(() => {
    if (mountedRef.current) {
      // Set loading state for genre change
      setLoadingStates(prev => ({ ...prev, content: true }));

      // Refetch content list when genre changes
      refetchContentList().finally(() => {
        if (mountedRef.current) {
          setLoadingStates(prev => ({ ...prev, content: false }));
        }
      });

      // Reset banner index when genre changes
      setCurrentBannerIndex(0);

      // Clear any existing errors
      setErrors({});
    }
  }, [isSelected, refetchContentList]);

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
    refreshBalance,
  ], () => {
    colorCache.current.clear();
    setErrors({});
    setRetryCount(0);
  });

  // Enhanced navigation helper
  const navigateToMovieList = (title: string, data: ContentItem[]) => {
    navigation.navigate('MovieList', { title, data });
  };

  // Create filtered data arrays to exclude exclusive content from regular sections
  const filteredContentData = useMemo(() => {
    if (!contentListData?.data?.result) return {};

    return {
      topContentData: topContentData?.data?.top?.filter((item: any) =>
        !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
      ) || [],
      latestContentData: latestContentData?.data?.contentList?.filter((item: any) =>
        !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
      ) || [],
      allContentData: contentListData.data.result.filter((item: any) =>
        !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
      ) || [],
      upcomingContentData: upcomingContentData?.data?.filteredContentList?.filter((item: any) =>
        !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
      ) || [],
      bannerData: bannerData?.data || []
    };
  }, [contentListData?.data?.result, topContentData?.data?.top, latestContentData?.data?.contentList, upcomingContentData?.data?.filteredContentList, bannerData?.data]);

  // Optimized masonry layout with stable references - Fixed genre filtering
  const masonryData = useMemo(() => {
    try {
      if (!contentListData?.data?.result) return { leftColumn: [], rightColumn: [] };

      // Filter content based on selected genre and exclusivity
      let mixContents: any[] = [];

      if (isSelected === 'all') {
        // For 'all' category, show all content except exclusive
        mixContents = contentListData.data.result.filter((item: any) =>
          !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
        ).slice(6, MASONRY_SLICE_SIZE) || [];
      } else if (isSelected === 'top 10') {
        // For 'top 10' category, use top content data
        mixContents = topContentData?.data?.top?.filter((item: any) =>
          !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
        ).slice(0, TOP_CONTENT_SLICE_SIZE) || [];
      } else if (isSelected === 'new release') {
        // For 'new release' category, use latest content data
        mixContents = latestContentData?.data?.contentList?.filter((item: any) =>
          !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
        ).slice(0, TOP_CONTENT_SLICE_SIZE) || [];
      } else if (isSelected === 'upcoming') {
        // For 'upcoming' category, use upcoming content data
        mixContents = upcomingContentData?.data?.filteredContentList?.filter((item: any) =>
          !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
        ) || [];
      } else if (isSelected === '1752133784893-exclusive' || isSelected === 'exclusive') {
        // For exclusive category, show only exclusive content
        mixContents = contentListData.data.result.filter((item: any) =>
          item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
        ) || [];
      } else {
        // For specific genres, filter by genre slug
        mixContents = contentListData.data.result.filter((item: any) =>
          item.genres?.some((genre: any) => genre.slug === isSelected) &&
          !item.genres?.some((genre: any) => genre.slug === '1752133784893-exclusive' || genre.slug === 'exclusive')
        ) || [];
      }

      if (!mixContents.length) return { leftColumn: [], rightColumn: [] };

      const allContent = languagesData?.data ? [{ languageData: languagesData.data }, ...mixContents] : mixContents;
      const processedData = allContent.map((item: any, index: number) => ({
        ...item,
        height: width * 0.6,
        id: item.id || item._id || `item-${index}`,
        stableIndex: index
      }));

      return {
        leftColumn: processedData.filter((_: any, index: number) => index % 2 === 0),
        rightColumn: processedData.filter((_: any, index: number) => index % 2 === 1)
      };
    } catch (error) {
      console.error('Error in masonryData:', error);
      handleError(error, 'MASONRY_DATA');
      return { leftColumn: [], rightColumn: [] };
    }
  }, [contentListData?.data?.result, topContentData?.data?.top, latestContentData?.data?.contentList, upcomingContentData?.data?.filteredContentList, isSelected, handleError, width, languagesData?.data]);

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
              setIsLoginPopUp={() => { }}
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
              setIsLoginPopUp={() => { }}
              disabled={isSelected === 'upcoming'}
            />
          ))}
        </View>
      </View>
    );
  }, [masonryData, user, navigation, isSelected, style]);

  // Dynamic gradient colors for background
  const gradientColorsArray = useMemo(() => {
    const defaultColors = ['#CB2D4D', '#ed9b72', colors.PRIMARYBLACK];

    // For dark images, create better contrast by using the most visible colors
    // Start with the darkest color, transition to the lightest, then to black
    const dynamicColors = [
      baseGradientColors.dark,
      baseGradientColors.light,
      colors.PRIMARYBLACK
    ];

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

  // Show skeleton loader for initial loading
  const showInitialLoading = isInitialLoading && !contentListData && !bannerData && !topContentData;

  // Show skeleton loader for category pages
  const showCategoryLoading = isSelected !== 'all' && (contentListLoading || isLoading);

  // Show empty state when no data is available
  const hasNoData = !isLoading && !contentListData?.data?.result?.length && !bannerData?.data?.length && !topContentData?.data?.top?.length;

  // Debug component to show auth status
  const DebugAuthStatus = () => {
    const token = MMKVStorage.getToken();
    const authData = MMKVStorage.getAuthData();
    
    return (
      <View style={{
        position: 'absolute',
        top: 100,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        borderRadius: 8,
        zIndex: 1000,
      }}>
        <Text style={{ color: 'white', fontSize: 10 }}>
          🔐 Auth: {isAuthenticated ? '✅' : '❌'}
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          👤 User: {user?._id ? '✅' : '❌'}
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          🔑 Token: {token ? '✅' : '❌'}
        </Text>
        <Text style={{ color: 'white', fontSize: 10 }}>
          💾 MMKV: {authData ? '✅' : '❌'}
        </Text>
      </View>
    );
  };

  // Render content based on loading states
  if (isInitialLoading) {
    return <ActivityLoader />;
  }

  return (
    <LinearGradient style={style.container} colors={gradientColorsArray}>
      <View style={[style.container, {
        marginTop: insets.top,
        marginBottom: isHide ? tabBarHeight : 0
      }]}>
        <DebugAuthStatus />
        <Animated.ScrollView
          scrollEventThrottle={16}
          onScroll={onScroll}
          scrollEnabled={!isBannerScrolling}
          refreshControl={
            isRefreshEnabled ? (
              <RefreshControl
                refreshing={loadingStates.refreshing}
                onRefresh={onRefresh}
                colors={['#CB2D4D']}
                tintColor={colors.PRIMARYWHITE}
                progressBackgroundColor={colors.PRIMARYBLACK}
                enabled={isRefreshEnabled}
                progressViewOffset={0}
              />
            ) : undefined
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
                keyExtractor={(item, index) => (item as any).id || (item as any)._id?.toString() || `${(item as any).slug}-${index}`}
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
              disabled={loadingStates.content}
            >
              <SvgIcons
                name={'search'}
                size={isLargeDevice ? width * .03 : width * 0.05}
                color={loadingStates.content ? colors.PRIMARYWHITEFOUR : colors.PRIMARYWHITE}
                viewBox="0 0 24 24"
                strokeWidth={2}
              />
            </PressableButton>
            
            {/* Balance Display */}
            {user && (
              <PressableButton
                onPress={() => navigation?.navigate('MyWallet')}
                style={[style.directionContainer, style.balanceContainer]}
                disabled={balanceLoading}
              >
                <View style={style.balanceLeft}>
                  <Text style={style.balanceText}>Balance</Text>
                  <SvgIcons
                    name={'arrow-right'}
                    color={colors.PRIMARYLIGHTBLACKONE}
                    size={isLargeDevice ? width * .02 : width * 0.04}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  />
                </View>
                <View style={style.balanceRight}>
                  <SvgIcons
                    name={'coin'}
                    color={colors.PRIMARYBG}
                    size={isLargeDevice ? width * .03 : width * 0.06}
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  />
                  <Text style={style.balanceAmount}>
                    {balanceLoading ? '...' : totalCoins}
                  </Text>
                </View>
              </PressableButton>
            )}
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
              ) : null}

              {/* Continue Watching */}
              {user && continueWatchingData.length > 0 && (
                <TopContentSection
                  title="Continue Shows"
                  data={continueWatchingData.slice(0, 10)}
                  onSeeAll={undefined}
                  renderItem={({ item, index }) => {
                    if (!item) return <View style={{ display: 'none' }} />;
                    return (
                      <RecentCard
                        key={`recent-${item._id}-${index}`}
                        item={item}
                        index={index}
                        navigation={navigation}
                      />
                    );
                  }}
                  loadingStates={loadingStates}
                  style={style}
                  isLargeDevice={isLargeDevice}
                  appFonts={appFonts}
                  colors={colors}
                />
              )}

              {/* Top 10 Shows */}
              <TopContentSection
                title="Top 10 Shows"
                data={filteredContentData?.topContentData?.slice(0, 10) || []}
                onSeeAll={undefined}
                renderItem={({ item, index }) => {
                  if (!item) return <View style={{ display: 'none' }} />;
                  return (
                    <View key={`top-container-${item._id}-${index}`} style={style.topMovieContainer}>
                      <Text style={style.topMovieNumber}>{index + 1}</Text>
                      <MovieCard
                        key={`top-movie-${item._id}-${index}`}
                        item={item}
                        index={index}
                        navigation={navigation}
                      />
                    </View>
                  );
                }}
                loadingStates={loadingStates}
                style={style}
                isLargeDevice={isLargeDevice}
                appFonts={appFonts}
                colors={colors}
              />

              <View style={{ height: 20 }} />

              {/* New Shows */}
              <ContentSection
                title="New Shows"
                data={filteredContentData?.latestContentData?.slice(0, isLargeDevice ? 3 : 4) || []}
                onSeeAll={() => navigateToMovieList('New Shows', filteredContentData.latestContentData || [])}
                renderItem={({ item, index }) => {
                  if (!item) return <View style={{ display: 'none' }} />;
                  return (
                    <MovieCard
                      key={`movie-${item._id}-${index}`}
                      item={item}
                      index={index}
                      navigation={navigation}
                    />
                  );
                }}
                loadingStates={loadingStates}
                style={style}
                isLargeDevice={isLargeDevice}
                appFonts={appFonts}
                columns={columns}
                colors={colors}
              />

              {/* All Shows */}

              <View style={{ height: 20 }} />

              <ContentSection
                title="All Shows"
                data={filteredContentData?.allContentData || []}
                onSeeAll={() => navigateToMovieList('All Shows', filteredContentData.allContentData || [])}
                renderItem={({ item, index }) => {
                  if (!item) return <View style={{ display: 'none' }} />;
                  return (
                    <MovieCard
                      key={`movie-${item._id}-${index}`}
                      item={item}
                      index={index}
                      navigation={navigation}
                    />
                  );
                }}
                loadingStates={loadingStates}
                style={style}
                isLargeDevice={isLargeDevice}
                appFonts={appFonts}
                columns={columns}
                colors={colors}
              />

              {/* Error states */}
              {Object.keys(errors).length > 0 && (
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
              {showCategoryLoading ? (
                <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight, justifyContent: 'center', alignItems: 'center', height: height * 0.6 }}>
                  <ActivityLoader />
                  <Text style={{ color: colors.PRIMARYWHITE, marginTop: 16, fontSize: appFonts.APP_FONT_SIZE_35 }}>
                    Loading {isSelected === 'all' ? 'All' : isSelected} content...
                  </Text>
                </View>
              ) : MasonryLayout ? (
                <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
                  {MasonryLayout}
                </View>
              ) : (
                <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
                  <EmptyMessage
                    title={`No ${isSelected === 'all' ? 'All' : isSelected} content available.`}
                    mainContainer={{ height: height * 0.6 }}
                    onRetry={() => refetchContentList()}
                  />
                </View>
              )}
            </View>
          )}
        </Animated.ScrollView>
      </View>
    </LinearGradient>
  );
});

export default HomeScreen;














