import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SimpleInstagramVideoPlayer from '../../common/SimpleInstagramVideoPlayer.js';
import { useTrailerVideoQualityStore } from '../store/trailerVideoQualityStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isLargeDevice = screenWidth > 768;

interface TrailerVideoPlayerProps {
    episode: any;
    isPlaying: boolean;
    style?: any;
    isScrolling?: boolean;
    onPauseStateChange?: (isPaused: boolean) => void;
    externalPauseTrigger?: number;
    externalSeekTime?: number;
    onProgress?: (currentTime: number, duration: number) => void;
    onWatchNow?: (episode: any) => void;
    onLike?: (episodeId: string) => void;
    onShare?: (episode: any) => void;
}

const TrailerVideoPlayer: React.FC<TrailerVideoPlayerProps> = ({
    episode,
    isPlaying,
    style,
    isScrolling = false,
    onPauseStateChange,
    externalPauseTrigger = 0,
    externalSeekTime = 0,
    onProgress,
    onWatchNow,
    onLike,
    onShare,
}) => {
    const [showControls, setShowControls] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Auto-hide timer ref
    const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Get current video quality
    const { currentQuality } = useTrailerVideoQualityStore();

    // Quality indicator text
    const getQualityText = () => {
        if (currentQuality === '1080p') return 'FHD';
        if (currentQuality === '720p') return 'HD';
        if (currentQuality === '480p') return 'SD';
        if (currentQuality === '360p') return 'LD';
        return 'HD'; // Default for auto
    };

    // Auto-hide controls after 2 seconds (but not when paused)
    useEffect(() => {
        console.log('🎬 Auto-hide effect triggered:', { showControls, isPaused });

        // Clear existing timer
        if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }

        // Only set auto-hide timer if controls are shown and not paused
        if (showControls && !isPaused) {
            console.log('🎬 Setting auto-hide timer for 2 seconds');
            hideTimerRef.current = setTimeout(() => {
                console.log('🎬 Auto-hiding controls');
                setShowControls(false);
                hideTimerRef.current = null;
            }, 2000);
        }

        // Cleanup on unmount
        return () => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, [showControls, isPaused]);

    const handleScreenTap = useCallback(() => {
        console.log('🎬 Screen tapped, toggling controls. Current state:', showControls);
        setShowControls(prev => !prev);
    }, [showControls]);

    const handlePlayPause = useCallback(() => {
        const newPauseState = !isPaused;
        setIsPaused(newPauseState);

        // Show controls when user pauses and clear auto-hide timer
        if (newPauseState) {
            setShowControls(true);
            // Clear auto-hide timer when paused
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }
        }

        // Notify parent component about pause state change
        if (onPauseStateChange) {
            onPauseStateChange(newPauseState);
        }
    }, [isPaused, onPauseStateChange]);

    const handleWatchNow = useCallback(() => {
        console.log('🎬 Watch Now button clicked for episode:', episode.title);
        if (onWatchNow) {
            onWatchNow(episode);
        }
    }, [episode, onWatchNow]);

    const handleLike = useCallback(() => {
        setIsLiked(prev => !prev);
        if (onLike) {
            onLike(episode._id);
        }
    }, [episode._id, onLike]);

    const handleShare = useCallback(() => {
        if (onShare) {
            onShare(episode);
        }
    }, [episode, onShare]);

    const handleSave = useCallback(() => {
        setIsSaved(prev => !prev);
        // TODO: Implement save functionality
    }, []);

    const handleInfo = useCallback(() => {
        // TODO: Implement info functionality
        console.log('Info clicked for episode:', episode.title);
    }, [episode.title]);

    return (
        <View style={[styles.container, style]}>
            {/* Video Player */}
            <SimpleInstagramVideoPlayer
                episode={episode}
                isPlaying={isPlaying && !isPaused}
                style={styles.videoPlayer}
                isScrolling={isScrolling}
                onPauseStateChange={onPauseStateChange}
                externalPauseTrigger={externalPauseTrigger}
                externalSeekTime={externalSeekTime}
                onProgress={onProgress}
            />

            {/* Tap Area for Controls */}
            <TouchableOpacity
                style={styles.tapArea}
                onPress={handleScreenTap}
                activeOpacity={1}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            />

            {/* Play/Pause Button Overlay */}
            {showControls && (
                <View style={styles.playPauseOverlay}>
                    <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
                        <Icon
                            name={isPaused ? "play" : "pause"}
                            size={isLargeDevice ? screenWidth * .04 : screenWidth * .06}
                            color="#ffffff"
                        />
                    </TouchableOpacity>
                </View>
            )}

            {/* Top Overlay with Title and Controls */}
            {showControls && (
                <LinearGradient
                    colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.3)', 'transparent']}
                    style={styles.topOverlay}
                >
                    <View style={styles.topContent}>
                        <View style={styles.titleRow}>
                            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                                {episode.title}
                            </Text>
                            {/* <View style={styles.qualityBadge}>
                <Text style={styles.qualityText}>{getQualityText()}</Text>
              </View> */}
                        </View>
                        {/* <View style={styles.topControls}>
                            <TouchableOpacity style={styles.iconButton} onPress={handleLike}>
                                <Icon
                                    name={isLiked ? "heart" : "heart-outline"}
                                    size={isLargeDevice ? screenWidth * .03 : screenWidth * .06}
                                    color={isLiked ? "#ff4757" : "#ffffff"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                                <FontAwesome 
                                    name="share" 
                                    size={isLargeDevice ? screenWidth * .03 : screenWidth * .06}
                                    color="#ffffff" 
                                />
                            </TouchableOpacity>
                        </View> */}
                    </View>
                </LinearGradient>
            )}

            {/* Bottom Overlay with Description and Watch Now Button */}
            {showControls && (
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.9)']}
                    style={styles.bottomOverlay}
                >
                    <View style={styles.bottomContent}>
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.author}>{episode.author}</Text>
                            <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
                                {episode.description}
                            </Text>
                            <View style={styles.statsContainer}>
                                <Text style={styles.stats}>{episode.views} views</Text>
                                <Text style={styles.stats}>•</Text>
                                <Text style={styles.stats}>{episode.likes} likes</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
            )}

            {/* Side Menu (Like, Save, Share, Info) */}
            {showControls && (
                <View style={styles.sideMenu}>
                    <TouchableOpacity style={styles.sideButton} onPress={handleLike}>
                        <View style={[styles.sideIconContainer, { backgroundColor: isLiked ? '#ffffff' : 'rgba(0,0,0,0.6)' }]}>
                            <Icon
                                name={isLiked ? "heart" : "heart-outline"}
                                size={isLargeDevice ? screenWidth * .03 : screenWidth * .06}
                                color={isLiked ? '#ff4757' : '#ffffff'}
                            />
                        </View>
                        <Text style={styles.sideButtonText}>
                            {isLiked ? 'Liked' : 'Like'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sideButton} onPress={handleSave}>
                        <View style={[styles.sideIconContainer, { backgroundColor: isSaved ? '#ffffff' : 'rgba(0,0,0,0.6)' }]}>
                            <Icon
                                name={isSaved ? "star" : "star-outline"}
                                size={isLargeDevice ? screenWidth * .025 : screenWidth * .05}
                                color={isSaved ? '#ffd700' : '#ffffff'}
                            />
                        </View>
                        <Text style={styles.sideButtonText}>
                            {isSaved ? 'Saved' : 'Save'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sideButton} onPress={handleShare}>
                        <View style={[styles.sideIconContainer, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <FontAwesome 
                                name="share" 
                                size={isLargeDevice ? screenWidth * .03 : screenWidth * .04}
                                color="#ffffff" 
                            />
                        </View>
                        <Text style={styles.sideButtonText}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.sideButton} onPress={handleInfo}>
                        <View style={[styles.sideIconContainer, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                            <Icon 
                                name="information-circle-outline" 
                                size={isLargeDevice ? screenWidth * .03 : screenWidth * .06}
                                color="#ffffff" 
                            />
                        </View>
                        <Text style={styles.sideButtonText}>Info</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Always Visible Watch Now Button at Bottom Center */}
            {!showControls && <View style={styles.alwaysVisibleWatchNow}>
                <TouchableOpacity
                    style={styles.alwaysVisibleButton}
                    onPress={handleWatchNow}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#ED9B72', '#7D2537']}
                        style={styles.alwaysVisibleGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.alwaysVisibleText}>Watch Now</Text>
                        <Icon 
                            name="play" 
                            size={isLargeDevice ? screenWidth * .02 : screenWidth * .025}
                            color="#ffffff" 
                        />
                    </LinearGradient>
                </TouchableOpacity>
            </View>}


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        position: 'relative',
    },
    videoPlayer: {
        flex: 1,
    },
    tapArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 15, // Higher than controls to ensure taps work
    },
    topOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 140,
        zIndex: 10,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
    },
    topContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    titleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    qualityBadge: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    qualityText: {
        color: '#000000',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    title: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    topControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: isLargeDevice ? screenWidth * .11 : screenWidth * .11,
        height: isLargeDevice ? screenWidth * .11 : screenWidth * .11,
        borderRadius: isLargeDevice ? screenWidth * .055 : screenWidth * .055,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    bottomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 180,
        zIndex: 10,
        paddingBottom: Platform.OS === 'ios' ? 100 : 80,
    },
    bottomContent: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    descriptionContainer: {
        marginBottom: 20,
    },
    author: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    description: {
        color: '#ffffff',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
        opacity: 0.95,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stats: {
        color: '#ffffff',
        fontSize: 12,
        opacity: 0.8,
        marginRight: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    alwaysVisibleWatchNow: {
        position: 'absolute',
        bottom: 120,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 20, // Higher than tap area (zIndex: 15)
    },
    alwaysVisibleButton: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 12,
        // Add visual feedback for better UX
        transform: [{ scale: 1 }],
    },
    alwaysVisibleGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 32,
    },
    alwaysVisibleText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    sideMenu: {
        position: 'absolute',
        right: 20,
        bottom: 140,
        alignItems: 'center',
        zIndex: 20, // Higher than tap area (zIndex: 15)
    },
    sideButton: {
        alignItems: 'center',
        marginBottom: 24,
    },
    sideIconContainer: {
        width: isLargeDevice ? screenWidth * .11 : screenWidth * .11,
        height: isLargeDevice ? screenWidth * .11 : screenWidth * .11,
        borderRadius: isLargeDevice ? screenWidth * .055 : screenWidth * .055,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    sideButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    playPauseOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, // Higher than tap area (zIndex: 15)
    },
    playPauseButton: {
        width: isLargeDevice ? screenWidth * .175 : screenWidth * .175,
        height: isLargeDevice ? screenWidth * .175 : screenWidth * .175,
        borderRadius: isLargeDevice ? screenWidth * .0875 : screenWidth * .0875,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
});

export default TrailerVideoPlayer; 