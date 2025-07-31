import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import useThemedStyles from '../../hooks/useThemedStyles';
import { SvgIcons } from './SvgIcons.tsx';
import { PressableButton } from '../Button';
import ActivityLoader from './ActivityLoader';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import SimpleInstagramVideoPlayer from '../VideoPlayer/SimpleInstagramVideoPlayer';
import LinearGradient from 'react-native-linear-gradient';

// Asset URL constant
const NEXT_PUBLIC_ASSET_URL = "https://d1cuox40kar1pw.cloudfront.net";

interface VideoPromoComponentProps {
  item: any;
  index: number;
  state: any;
  setState: (state: any) => void;
  navigation: any;
  play: boolean;
  viewHeight: number;
  onEnd: () => void;
  progress: number;
  episodeCurrIndex: number;
  videoUrl: string | null;
}

const VideoPromoComponent: React.FC<VideoPromoComponentProps> = ({ 
  item, 
  index, 
  state, 
  setState, 
  navigation, 
  play, 
  viewHeight, 
  onEnd, 
  progress, 
  episodeCurrIndex, 
  videoUrl 
}) => {
  const { width, height } = Dimensions.get('window');
  const isLargeDevice = width > 768;
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);

  // Animation values for fancy button effects
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  // Convert item to episode format for SimpleInstagramVideoPlayer
  const episodeData = useMemo(() => {
    if (!item) return null;

    // Try to construct video_urls from different possible structures
    let video_urls = null;
    
    if (item?.trailerUrl?.media?.video_urls) {
      video_urls = item.trailerUrl.media.video_urls;
    } else if (item?.trailerUrl?.media?.video_url) {
      video_urls = {
        master: item.trailerUrl.media.video_url,
        '720p': item.trailerUrl.media.video_url,
        '480p': item.trailerUrl.media.video_url,
        '360p': item.trailerUrl.media.video_url
      };
    } else if (item?.trailerUrl?.video_url) {
      video_urls = {
        master: item.trailerUrl.video_url,
        '720p': item.trailerUrl.video_url,
        '480p': item.trailerUrl.video_url,
        '360p': item.trailerUrl.video_url
      };
    } else if (item?.trailerUrl) {
      video_urls = {
        master: item.trailerUrl,
        '720p': item.trailerUrl,
        '480p': item.trailerUrl,
        '360p': item.trailerUrl
      };
    } else if (item?.videoUrl) {
      video_urls = {
        master: item.videoUrl,
        '720p': item.videoUrl,
        '480p': item.videoUrl,
        '360p': item.videoUrl
      };
    } else if (item?.video_url) {
      video_urls = {
        master: item.video_url,
        '720p': item.video_url,
        '480p': item.video_url,
        '360p': item.video_url
      };
    }

    if (!video_urls) return null;

    return {
      _id: item._id || item.id || `promo-${index}`,
      episodeNo: 1,
      language: 'en',
      status: 'unlocked',
      contentId: item._id || item.id,
      video_urls: video_urls,
      thumbnail: item?.trailerUrl?.media?.thumbnail || item?.backdropImage || item?.image,
      like: 0,
      isDeleted: false,
      isLiked: false
    };
  }, [item, index]);

  const posterImage = useMemo(() => {
    if (item?.trailerUrl?.media?.thumbnail) {
      return `${NEXT_PUBLIC_ASSET_URL}/${item.trailerUrl.media.thumbnail}`;
    } else if (item?.backdropImage) {
      return `${NEXT_PUBLIC_ASSET_URL}/${item.backdropImage}`;
    } else if (item?.image) {
      return `${NEXT_PUBLIC_ASSET_URL}/${item.image}`;
    }
    return undefined;
  }, [item?.trailerUrl?.media?.thumbnail, item?.backdropImage, item?.image]);

  const handleReplay = useCallback(() => {
    setVideoLoaded(false);
    setShowThumbnail(true);
    setVideoEnded(false);
    setState((prev: any) => ({ ...prev, playPause: true, progress: 0 }));
  }, [setState]);

  const onPressEpisode = useCallback(() => {
    // Add press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Add glow effect
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    setState((prev: any) => ({ ...prev, playPause: false }));
    navigation.navigate("EpisodePlayer", { 
      contentId: item._id || item.id,
      contentName: item.title || item.name,
      episodes: [],
      initialIndex: 0
    });
  }, [navigation, item, setState, scaleAnim, glowAnim]);

  const comingDate = useMemo(() => {
    return item?.releasingDate ? item?.releasingDate <= moment().format("YYYY-MM-DD") : true;
  }, [item?.releasingDate]);

  const showPlayPauseButton = state.controller && videoLoaded && !videoEnded;
  const showReplayButton = videoEnded;

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    setVideoEnded(true);
    setState((prev: any) => ({ ...prev, playPause: false }));
    if (onEnd) {
      onEnd();
    }
  }, [onEnd, setState]);

  // Handle video load
  const handleVideoLoad = useCallback(() => {
    setVideoLoaded(true);
    setShowThumbnail(false);
  }, []);

  if (!episodeData) {
    // Fallback when no video data is available
    return (
      <View style={[style.container, { flex: 0, height: viewHeight, width: width }]}>
        {showThumbnail && posterImage && (
          <FastImage 
            source={{ 
              uri: posterImage, 
              priority: 'high', 
              cache: 'immutable' 
            }}
            style={[style.videoContainer, { height: viewHeight, width: width }]}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        
        <View style={style.fallbackOverlay}>
          {/* <Text style={style.fallbackTitle}>
            {item?.title || item?.name || 'Content Title'}
          </Text>
          <Text style={style.fallbackDescription}>
            {item?.description || 'No description available'}
          </Text> */}
          
          {/* Fancy Watch Now Button */}
          <View style={style.bottomButtonContainer}>
            {/* Glow effect */}
            <Animated.View 
              style={[
                style.glowEffect,
                {
                  opacity: glowAnim,
                  transform: [{ scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2]
                  })}]
                }
              ]}
            />
            
            {/* Main button with animations */}
            <Animated.View
              style={[
                style.fancyButtonContainer,
                {
                  transform: [
                    { scale: Animated.multiply(scaleAnim, pulseAnim) }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={!comingDate 
                  ? ['#666666', '#888888'] 
                  : ['#ED9B72', '#7D2537']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={style.gradientContainer}
              >
                <TouchableOpacity
                  onPress={onPressEpisode}
                  disabled={!comingDate}
                  style={style.fancyButton}
                  activeOpacity={0.9}
                >
                  <View style={style.buttonContent}>
                    <SvgIcons 
                      name="play" 
                      color={colors.PRIMARYWHITE} 
                      size={isLargeDevice ? width * .025 : width * .04} 
                      viewBox="0 0 64 64"
                      strokeWidth={1.5}
                    />
                    <Text style={style.fancyButtonText}>
                      {!comingDate ? 'Coming Soon' : 'Watch Now'}
                    </Text>
                    {comingDate && (
                      <SvgIcons 
                        name="arrow-forward" 
                        color={colors.PRIMARYWHITE} 
                        size={isLargeDevice ? width * .02 : width * .035} 
                        viewBox="0 0 64 64"
                        strokeWidth={1.5}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      key={index} 
      style={[style.container, { flex: 0, height: viewHeight, width: width }]} 
      onPress={() => setState((prev: any) => ({ ...prev, controller: !prev.controller }))}
      activeOpacity={1}
    >
      <View key={index} style={[style.container, { flex: 0, height: viewHeight, width: width }]}>
        {/* Show thumbnail while video loads */}
        {showThumbnail && posterImage && (
          <FastImage 
            source={{ 
              uri: posterImage, 
              priority: 'high', 
              cache: 'immutable' 
            }}
            style={[style.videoContainer, { height: viewHeight, width: width }]}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}

        {/* Show loading indicator if no thumbnail */}
        {showThumbnail && !posterImage && <ActivityLoader />}

        {/* Use SimpleInstagramVideoPlayer */}
        <SimpleInstagramVideoPlayer
          episode={episodeData}
          isPlaying={play}
          style={{ width: '100%', height: '100%' }}
          isScrolling={false}
          onPauseStateChange={() => {}}
          externalPauseTrigger={0}
          externalSeekTime={0}
          onProgress={() => {}}
        />

        {/* Play/Pause Button - Show only when video is playing and controller is active */}
        {showPlayPauseButton && (
          <View style={[style.controller, { flex: 0, height: '100%' }]}>
            <View style={style.playbtnContainer}>
              <TouchableOpacity 
                onPress={() => setState((prev: any) => ({ ...prev, playPause: !prev.playPause }))} 
                style={style.playBtn}
                activeOpacity={0.8}
              >
                <SvgIcons 
                  name={!state.playPause ? "play" : "pause"} 
                  color={colors.PRIMARYWHITE} 
                  size={isLargeDevice ? width * .03 : width * .06} 
                  viewBox="0 0 64 64"
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            </View>

            {/* Fancy Watch Now Button */}
            <View style={style.bottomButtonContainer}>
              {/* Glow effect */}
              <Animated.View 
                style={[
                  style.glowEffect,
                  {
                    opacity: glowAnim,
                    transform: [{ scale: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2]
                    })}]
                  }
                ]}
              />
              
              {/* Main button with animations */}
              <Animated.View
                style={[
                  style.fancyButtonContainer,
                  {
                    transform: [
                      { scale: Animated.multiply(scaleAnim, pulseAnim) }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={!comingDate 
                    ? ['#666666', '#888888'] 
                    : ['#ED9B72', '#7D2537']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={style.gradientContainer}
                >
                  <TouchableOpacity
                    onPress={onPressEpisode}
                    disabled={!comingDate}
                    style={style.fancyButton}
                    activeOpacity={0.9}
                  >
                    <View style={style.buttonContent}>
                      <SvgIcons 
                        name="play" 
                        color={colors.PRIMARYWHITE} 
                        size={isLargeDevice ? width * .025 : width * .04} 
                        viewBox="0 0 64 64"
                        strokeWidth={1.5}
                      />
                      <Text style={style.fancyButtonText}>
                        {!comingDate ? 'Coming Soon' : 'Watch Now'}
                      </Text>
                      {comingDate && (
                        <SvgIcons 
                          name="arrow-forward" 
                          color={colors.PRIMARYWHITE} 
                          size={isLargeDevice ? width * .02 : width * .035} 
                          viewBox="0 0 64 64"
                          strokeWidth={1.5}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            </View>
          </View>
        )}

        {/* Replay Button - Show only when video has ended */}
        {showReplayButton && (
          <View style={style.replayContainer}>
            <TouchableOpacity 
              onPress={handleReplay} 
              style={style.replayBtn}
              activeOpacity={0.8}
            >
              <SvgIcons 
                name="replay" 
                color={colors.PRIMARYWHITE} 
                size={isLargeDevice ? width * .04 : width * .08} 
                viewBox="0 0 64 64"
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Fancy Watch Now Button - Always visible at bottom center */}
        <View style={style.bottomButtonContainer}>
          {/* Glow effect */}
          <Animated.View 
            style={[
              style.glowEffect,
              {
                opacity: glowAnim,
                transform: [{ scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2]
                })}]
              }
            ]}
          />
          
          {/* Main button with animations */}
          <Animated.View
            style={[
              style.fancyButtonContainer,
              {
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) }
                ]
              }
            ]}
          >
                         <LinearGradient
               colors={!comingDate 
                 ? ['#666666', '#888888'] 
                 : ['#ED9B72', '#7D2537']
               }
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               style={style.gradientContainer}
             >
              <TouchableOpacity
                onPress={onPressEpisode}
                disabled={!comingDate}
                style={style.fancyButton}
                activeOpacity={0.9}
              >
                <View style={style.buttonContent}>
                  <SvgIcons 
                    name="play" 
                    color={colors.PRIMARYWHITE} 
                    size={isLargeDevice ? width * .025 : width * .04} 
                    viewBox="0 0 64 64"
                    strokeWidth={1.5}
                  />
                  <Text style={style.fancyButtonText}>
                    {!comingDate ? 'Coming Soon' : 'Watch Now'}
                  </Text>
                  {comingDate && (
                    <SvgIcons 
                      name="arrow-forward" 
                      color={colors.PRIMARYWHITE} 
                      size={isLargeDevice ? width * .02 : width * .035} 
                      viewBox="0 0 64 64"
                      strokeWidth={1.5}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default VideoPromoComponent;

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.PRIMARYBLACK,
    justifyContent: 'center',
    position: 'relative',
  },
  videoContainer: {
    width: '100%',
    height: height,
    position: 'absolute'
  },
  controller: {
    flex: 1,
    padding: width * 0.03
  },
  playbtnContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  playBtn: {
    width: isLargeDevice ? width * .1 : width * .18,
    height: isLargeDevice ? width * .1 : width * .18,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.PRIMARYWHITEONE
  },
  replayContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width * 0.05 }, { translateY: -width * 0.05 }],
    zIndex: 1000,
  },
  replayBtn: {
    width: isLargeDevice ? width * .1 : width * .16,
    height: isLargeDevice ? width * .1 : width * .16,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.PRIMARYWHITEONE,
    opacity: 0.9,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: width * 0.08,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
     glowEffect: {
     position: 'absolute',
     width: isLargeDevice ? width * 0.5 : width * 0.7,
     height: isLargeDevice ? width * 0.12 : width * 0.15,
     borderRadius: 25,
     backgroundColor: 'rgba(237, 155, 114, 0.3)',
     shadowColor: '#ED9B72',
     shadowOffset: {
       width: 0,
       height: 0,
     },
     shadowOpacity: 0.8,
     shadowRadius: 20,
     elevation: 10,
   },
  fancyButtonContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  gradientContainer: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  fancyButton: {
    width: isLargeDevice ? width * 0.45 : width * 0.65,
    height: isLargeDevice ? width * 0.1 : width * 0.13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 0.015,
  },
  fancyButtonText: {
    color: theme.colors.PRIMARYWHITE,
    fontSize: isLargeDevice ? width * 0.035 : width * 0.045,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  watchButton: {
    height: isLargeDevice ? width * .08 : width * .12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: width * 0.01,
  },
  watchButtonText: {
    color: theme.colors.PRIMARYWHITE,
    fontSize: isLargeDevice ? width * .03 : width * .04,
    fontWeight: 'bold',
  },
  fallbackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  fallbackTitle: {
    fontSize: isLargeDevice ? width * .05 : width * .07,
    fontWeight: 'bold',
    color: theme.colors.PRIMARYWHITE,
    textAlign: 'center',
    marginBottom: 10,
  },
  fallbackDescription: {
    fontSize: isLargeDevice ? width * .03 : width * .04,
    color: theme.colors.GRAY,
    textAlign: 'center',
    marginBottom: 20,
  },
  directionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heading: {
    color: theme.colors.PRIMARYWHITE,
    fontWeight: 'bold',
  },
  txt: {
    color: theme.colors.GRAY,
    fontSize: isLargeDevice ? width * .025 : width * .03,
  },
}); 