import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Animated, 
  RefreshControl, 
  StyleSheet, 
  Platform, 
  Dimensions 
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';

// Hooks
import useTheme from '../../../hooks/useTheme';
import useThemedStyles from '../../../hooks/useThemedStyles';

// Components
import { SvgIcons } from '../../../components/common/SvgIcons';
import { PressableButton } from '../../../components/Button';
import MovieCard from '../../../components/Cards/MovieCard';
import RecentCard from '../../../components/Cards/RecentCard';
import MasonryCard from '../../../components/Cards/MasonryCard';
import ActivityLoader from '../../../components/common/ActivityLoader';
import EmptyMessage from '../../../components/common/EmptyMessage';
import BannerComponent from '../../../components/common/BannerComponent';
import ContentSection from '../../../components/Home/ContentSection';
import TopContentSection from '../../../components/Home/TopContentSection';
import GenreTab from '../../../components/Home/GenreTab';

// Utils
import { extractColorsFromImage } from '../../../utils/colorExtractor';
import { dimensions } from '../../../utils/dimensions';
import { 
  dummyContentData, 
  dummyGenreData, 
  dummyWatchlistData, 
  dummyUserInfo, 
  dummyUserProfileInfo 
} from '../../../utils/dummyData';

// Constants
const SCROLL_THRESHOLD = 10;
const DEBOUNCE_DELAY = 16;
const MASONRY_SLICE_SIZE = 26;
const TOP_CONTENT_SLICE_SIZE = 10;
const NEW_REELS_SLICE_SIZE = 4;

const { width, height } = Dimensions.get('window');

// Render Functions
const renderMovieCard = ({ item, index, navigation }: any) => (
  <MovieCard
    key={`movie-${item.id || item._id}-${index}`}
    item={item}
    index={index}
    navigation={navigation}
  />
);

const renderTopMovieCard = ({ item, index, navigation, style }: any) => (
  <View key={`top-${item.id || item._id}-${index}`} style={style.topMovieContainer}>
    <Text style={[style.heading, style.topMovieNumber]}>{index + 1}</Text>
    <MovieCard item={item} index={index} navigation={navigation} />
  </View>
);

const renderRecentCard = ({ item, index, navigation }: any) => (
  <RecentCard
    key={`recent-${item.id || item._id}-${index}`}
    item={item}
    index={index}
    navigation={navigation}
  />
);

const ReelsFeedScreen = ({ navigation }: any) => {
  // Theme and styling
  const { theme } = useTheme();
  const { colors } = theme;
  const style = useThemedStyles(styles);

  // Navigation hooks
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  // Device info
  const isLargeDevice = width > 768;
  const columns = isLargeDevice ? 3 : 2;
  const appFonts = {
    APP_FONT_SIZE_3: 16,
    APP_FONT_SIZE_9: 12,
    APP_FONT_SIZE_20: 14,
    APP_FONT_SIZE_35: 12,
  };

  // State management
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
  const [baseGradientColors, setBaseGradientColors] = useState({ light: '#ed9b72', dark: '#7d2537' });
  const [isBannerScrolling, setIsBannerScrolling] = useState(false);

  // Refs
  const scrollY = useRef(new Animated.Value(0)).current;
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const colorCache = useRef(new Map());

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Color extraction
  const extractColors = useCallback(async (imageUri: string) => {
    if (!imageUri || !mountedRef.current) {
      setBaseGradientColors({ light: '#000000', dark: '#000000' });
      return;
    }

    if (colorCache.current.has(imageUri)) {
      const cachedColors = colorCache.current.get(imageUri);
      if (mountedRef.current) {
        setBaseGradientColors(cachedColors);
      }
      return;
    }

    setLoadingStates(prev => ({ ...prev, colors: true }));

    try {
      const colors = await extractColorsFromImage(imageUri);
      if (colors?.light && colors?.dark && mountedRef.current) {
        colorCache.current.set(imageUri, colors);
        setBaseGradientColors(colors);
      } else {
        setBaseGradientColors({ light: '#000000', dark: '#000000' });
      }
    } catch (error) {
      console.warn('Color extraction error:', error);
      if (mountedRef.current) {
        setBaseGradientColors({ light: '#000000', dark: '#000000' });
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, colors: false }));
    }
  }, []);

  // Banner data
  const banner_Data = useMemo(() => {
    return dummyContentData.bannerData.map((item, index) => ({
      ...item,
      imageUri: item.imageUri,
      id: item.id || `banner-${index}`,
      stableIndex: index
    }));
  }, []);

  // Color extraction effect
  useEffect(() => {
    const currentBanner = banner_Data[currentBannerIndex];
    if (currentBanner?.imageUri && isSelected === 'all') {
      extractColors(currentBanner.imageUri);
    }
  }, [banner_Data, currentBannerIndex, extractColors, isSelected]);

  // Scroll handler
  const handleScrollDebounced = useCallback((offsetY: number) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      const shouldHide = offsetY > SCROLL_THRESHOLD;
      if (shouldHide !== isHide) {
        setIsHide(shouldHide);
      }
    }, DEBOUNCE_DELAY);
  }, [isHide]);

  // Scroll event
  const onScroll = useMemo(() => {
    return Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      {
        useNativeDriver: true,
        listener: (event: any) => {
          if (!mountedRef.current || !event?.nativeEvent?.contentOffset) return;
          const offsetY = event.nativeEvent.contentOffset.y || 0;
          handleScrollDebounced(offsetY);
        }
      }
    );
  }, [scrollY, handleScrollDebounced]);

  // Refresh handler
  const onRefresh = async () => {
    if (!mountedRef.current || loadingRef.current || loadingStates.refreshing) return;

    loadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, refreshing: true }));

    try {
      // Simulate refresh delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      colorCache.current.clear();
    } catch (error) {
      console.warn('Refresh error:', error);
    } finally {
      if (mountedRef.current) {
        loadingRef.current = false;
        setLoadingStates(prev => ({ ...prev, refreshing: false }));
      }
    }
  };

  // Navigation helper
  const navigateToMovieList = (title: string, data: any[]) => {
    // Navigate to movie list screen
    console.log('Navigate to movie list:', title);
  };

  // Masonry data
  const masonryData = useMemo(() => {
    let mixContents: any[] = [];

    if (isSelected === 'all') {
      mixContents = dummyContentData.allContentData?.slice(6, MASONRY_SLICE_SIZE) || [];
    } else if (isSelected === 'top 10') {
      mixContents = dummyContentData.topContentData?.slice(0, TOP_CONTENT_SLICE_SIZE) || [];
    } else if (isSelected === 'new release') {
      mixContents = dummyContentData.latestContentData?.slice(0, TOP_CONTENT_SLICE_SIZE) || [];
    } else if (isSelected === 'upcoming') {
      mixContents = dummyContentData.upcomingContentData || [];
    } else {
      mixContents = dummyContentData.allContentData?.slice(6, TOP_CONTENT_SLICE_SIZE) || [];
    }

    if (!mixContents.length) return { leftColumn: [], rightColumn: [] };

    const processedData = mixContents.map((item, index) => ({
      ...item,
      height: width * 0.6,
      id: item.id || `item-${index}`,
      stableIndex: index
    }));

    return {
      leftColumn: processedData.filter((_, index) => index % 2 === 0),
      rightColumn: processedData.filter((_, index) => index % 2 === 1)
    };
  }, [isSelected]);

  // Masonry layout component
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
              userProfileInfo={dummyUserProfileInfo}
              navigation={navigation}
              setIsLoginPopUp={() => {}}
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
              userProfileInfo={dummyUserProfileInfo}
              navigation={navigation}
              setIsLoginPopUp={() => {}}
              disabled={isSelected === 'upcoming'}
            />
          ))}
        </View>
      </View>
    );
  }, [masonryData, navigation, isSelected, style]);

  // Gradient colors
  const gradientColorsArray = useMemo(() => {
    const defaultColors = ['#CB2D4D', '#ed9b72', colors.background];
    const dynamicColors = [baseGradientColors.dark, baseGradientColors.light, colors.background];

    return (isHide || isSelected !== 'all') ? defaultColors : dynamicColors;
  }, [isHide, isSelected, baseGradientColors.dark, baseGradientColors.light, colors.background]);

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
              tintColor={colors.textPrimary}
              progressBackgroundColor={colors.background}
            />
          }
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          removeClippedSubviews={Platform.OS === 'android'}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with genre tabs and search */}
          <View style={[style.directionContainer, style.headerContainer]}>
            {dummyGenreData?.length > 0 ? (
              <FlatList
                data={dummyGenreData}
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
                keyExtractor={(item, index) => item.id || `${item.slug}-${index}`}
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
                <Text style={{ color: colors.textPrimary, opacity: 0.7 }}>No genres available</Text>
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
                color={loadingStates.content ? colors.textSecondary : colors.textPrimary}
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
                    onBannerScroll={(isScrolling) => setIsBannerScrolling(isScrolling)}
                    onBannerIndexChange={(index) => setCurrentBannerIndex(index)}
                    onTouchStart={() => setIsBannerScrolling(true)}
                    onTouchEnd={() => setIsBannerScrolling(false)}
                  />
                </View>
              ) : (
                loadingStates.content && (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <ActivityLoader />
                  </View>
                )
              )}

                             {/* Continue Watching */}
               {dummyUserInfo && dummyWatchlistData?.videoData?.length > 0 && (
                 <TopContentSection
                   title="Continue Shows"
                   data={dummyWatchlistData.videoData.slice(0, 10)}
                   onSeeAll={undefined}
                   renderItem={props => renderRecentCard({ ...props, navigation })}
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
                 data={dummyContentData?.topContentData?.slice(0, 10)}
                 onSeeAll={undefined}
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
                data={dummyContentData?.latestContentData?.slice(0, isLargeDevice ? 3 : 4)}
                onSeeAll={() => navigateToMovieList('New Shows', dummyContentData.latestContentData)}
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
                data={dummyContentData?.allContentData}
                onSeeAll={() => navigateToMovieList('All Shows', dummyContentData.allContentData)}
                renderItem={props => renderMovieCard({ ...props, navigation })}
                loadingStates={loadingStates}
                style={style}
                isLargeDevice={isLargeDevice}
                appFonts={appFonts}
                columns={columns}
                colors={colors}
              />
            </View>
          ) : (
            <View style={{ marginTop: width * 0.04, marginBottom: tabBarHeight }}>
              {loadingStates.content ? (
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
                      mainContainer={{ height: height * 0.6 }}
                      onRetry={() => {}}
                    />
                  </View>
                )
              )}
            </View>
          )}

          {/* Network status indicator */}
          {loadingStates.content && (
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
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  txt: {
    fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_20 : appFonts.APP_FONT_SIZE_35,
    fontWeight: 'normal',
    color: theme.colors.textPrimary,
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
    borderColor: 'transparent',
    backgroundColor: 'transparent',
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
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    color: theme.colors.textPrimary,
    fontSize: appFonts.APP_FONT_SIZE_35,
    marginLeft: 8,
    opacity: 0.7,
  },
});

export default ReelsFeedScreen;