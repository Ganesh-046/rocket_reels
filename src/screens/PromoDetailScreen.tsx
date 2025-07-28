import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import useThemedStyles from '../hooks/useThemedStyles';
import ActivityLoader from '../components/common/ActivityLoader';
import VideoPromoComponent from '../components/common/VideoPromoComponent';
import AppHeader from '../components/common/AppHeader';
import moment from 'moment';

const NEXT_PUBLIC_ASSET_URL = "https://d1cuox40kar1pw.cloudfront.net";

interface PromoDetailScreenProps {
  route: {
    params: {
      item: any;
    };
  };
  navigation: any;
}

const PromoDetailScreen: React.FC<PromoDetailScreenProps> = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window');
  const isLargeDevice = width > 768;
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();

  // Immediate video URL construction - no delays
  const videoUrl = useMemo(() => {
    const item = route.params?.item;
    if (item?.trailerUrl?.media?.video_urls?.master) {
      return `${NEXT_PUBLIC_ASSET_URL}/${item.trailerUrl.media.video_urls.master}`;
    }
    return null;
  }, [route.params?.item]);

  // Preload video data immediately with HLS optimization
  useEffect(() => {
    if (videoUrl) {
      const isHLS = videoUrl.includes('.m3u8');

      if (isHLS) {
        fetch(videoUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Accept-Encoding': 'gzip, deflate',
            'User-Agent': 'RocketReel/1.0',
            'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
          }
        }).then((response) => {
          if (response.ok) {
            return response.text();
          }
        }).then((manifest) => {
          if (manifest) {
            const lines = manifest.split('\n');
            const segmentUrls = lines.filter(line => line.includes('.ts') || line.includes('.m4s'));
            if (segmentUrls.length > 0) {
              const firstSegment = segmentUrls[0];
              fetch(firstSegment, {
                method: 'HEAD',
                headers: {
                  'Cache-Control': 'no-cache',
                  'Accept-Encoding': 'gzip, deflate',
                  'User-Agent': 'RocketReel/1.0',
                }
              }).then(() => {
                console.log('First HLS segment preloaded');
              }).catch((error) => {
                console.warn('HLS segment preload failed:', error);
              });
            }
          }
        }).catch((error) => {
          console.warn('HLS manifest preload failed:', error);
        });
      } else {
        // For regular video, use HEAD request
        fetch(videoUrl, {
          method: 'HEAD',
          headers: {
            'Cache-Control': 'no-cache',
            'Accept-Encoding': 'gzip, deflate',
            'User-Agent': 'RocketReel/1.0',
          }
        }).then(() => {
          console.log('Video preloaded successfully');
        }).catch((error) => {
          console.warn('Video preload failed:', error);
        });
      }
    }
  }, [videoUrl]);

  // Ultra-optimized initial state - start playing immediately
  const [state, setState] = useState({
    playPause: true, // Start playing immediately
    currentIndex: 0,
    controller: true, // Hide controller initially
    duration: 0,
    progress: 0,
    loading: false, // No initial loading
    isReady: true, // Assume ready immediately
  });

  // Remove all delays - start video immediately
  useEffect(() => {
    setState(prev => ({ ...prev, isReady: true }));
  }, []);

  const viewHeight = height - 2 * (insets.top) - insets.bottom;

  // Immediate play state - no conditions
  const play = isFocused && state.playPause;

  // Ensure video plays immediately on load
  useEffect(() => {
    if (isFocused && route.params?.item) {
      setState(prev => ({
        ...prev,
        playPause: true,
        isReady: true
      }));
    }
  }, [isFocused, route.params?.item]);

  // Optimized event handlers
  const onEnd = useCallback(() => {
    setState(prev => ({ ...prev, playPause: false }));
  }, []);

  const onNavigateDetail = useCallback(() => {
    setState(prev => ({ ...prev, playPause: false }));
    navigation.navigate("EpisodePlayer", { 
      contentId: route.params.item._id || route.params.item.id,
      contentName: route.params.item.title || route.params.item.name,
      episodes: [],
      initialIndex: 0
    });
  }, [navigation, route.params.item]);

  const onBackPress = useCallback(() => {
    setState(prev => ({ ...prev, playPause: false }));
    navigation.goBack();
  }, [navigation]);

  // Memoized release date check
  const comingDate = useMemo(() => {
    return route.params?.item?.releasingDate ?
      route.params?.item?.releasingDate <= moment().format("YYYY-MM-DD") :
      true;
  }, [route.params?.item?.releasingDate]);

  // No loading display - start video immediately
  const showLoading = false;

  return (
    <View style={[style.container, { paddingTop: insets.top }]}>
      <AppHeader
        title={`${route.params?.item?.title || route.params?.item?.name || 'Promo'} ( Promo )`}
        isLeft
        isRight={comingDate}
        isRightIcons={comingDate}
        rightIconName={'info'}
        rightIconSize={isLargeDevice ? width * .025 : width * .05}
        onRightPress={onNavigateDetail}
        isLeftIcons
        leftIconName={'back'}
        onPress={onBackPress}
        titleStyle={{
          fontSize: isLargeDevice ? 20 : 16
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={style.container}>
          {showLoading && <ActivityLoader />}
          <VideoPromoComponent
            item={route.params.item}
            index={0}
            setState={setState}
            state={state}
            viewHeight={viewHeight}
            navigation={navigation}
            onEnd={onEnd}
            play={play}
            progress={0}
            episodeCurrIndex={0}
            videoUrl={videoUrl}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PromoDetailScreen;

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.PRIMARYBLACK,
  },
}); 