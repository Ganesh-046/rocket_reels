import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface ReelActionsProps {
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

const ReelActions: React.FC<ReelActionsProps> = memo(({
  likes,
  comments,
  shares,
  isLiked,
  onLike,
  onComment,
  onShare,
  onBookmark,
  isBookmarked = false,
}) => {
  // Animated values for smooth interactions
  const likeScale = useSharedValue(1);
  const commentScale = useSharedValue(1);
  const shareScale = useSharedValue(1);
  const bookmarkScale = useSharedValue(1);
  const likeRotation = useSharedValue(0);

  // Format numbers for display
  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }, []);

  // Animated styles
  const likeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: likeScale.value },
      { rotate: `${likeRotation.value}deg` },
    ],
  }));

  const commentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: commentScale.value }],
  }));

  const shareAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
  }));

  const bookmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  // Optimized touch handlers with debouncing
  const handleLike = useCallback(() => {
    // Animate like button with spring and rotation
    likeScale.value = withSequence(
      withSpring(1.3, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    
    likeRotation.value = withSequence(
      withTiming(15, { duration: 100 }),
      withTiming(-15, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Execute callback
    runOnJS(onLike)();
  }, [likeScale, likeRotation, onLike]);

  const handleComment = useCallback(() => {
    // Animate comment button
    commentScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );

    runOnJS(onComment)();
  }, [commentScale, onComment]);

  const handleShare = useCallback(() => {
    // Animate share button
    shareScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );

    runOnJS(onShare)();
  }, [shareScale, onShare]);

  const handleBookmark = useCallback(() => {
    if (!onBookmark) return;

    // Animate bookmark button
    bookmarkScale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );

    runOnJS(onBookmark)();
  }, [bookmarkScale, onBookmark]);

  // Render action button with optimized performance
  const renderActionButton = useCallback((
    icon: string,
    count: string,
    onPress: () => void,
    animatedStyle: any,
    isActive?: boolean,
    activeIcon?: string
  ) => (
    <Animated.View style={[styles.actionButton, animatedStyle]}>
      <TouchableOpacity
        style={styles.actionButtonTouchable}
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View style={[
          styles.iconContainer,
          isActive && styles.activeIconContainer
        ]}>
          <Text style={[styles.actionIcon, isActive && styles.activeIcon]}>
            {isActive && activeIcon ? activeIcon : icon}
          </Text>
        </View>
        <Text style={[styles.actionText, isActive && styles.activeText]}>
          {count}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  ), []);

  return (
    <View style={styles.container}>
      {renderActionButton(
        '🤍',
        formatNumber(likes),
        handleLike,
        likeAnimatedStyle,
        isLiked,
        '❤️'
      )}
      
      {renderActionButton(
        '💬',
        formatNumber(comments),
        handleComment,
        commentAnimatedStyle
      )}
      
      {renderActionButton(
        '📤',
        formatNumber(shares),
        handleShare,
        shareAnimatedStyle
      )}
      
      {onBookmark && renderActionButton(
        isBookmarked ? '🔖' : '📑',
        '',
        handleBookmark,
        bookmarkAnimatedStyle,
        isBookmarked
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonTouchable: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255, 20, 147, 0.3)',
    borderColor: '#ff1493',
    shadowColor: '#ff1493',
    shadowOpacity: 0.5,
  },
  actionIcon: {
    fontSize: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activeIcon: {
    textShadowColor: 'rgba(255, 20, 147, 0.8)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activeText: {
    color: '#ff1493',
    textShadowColor: 'rgba(255, 20, 147, 0.8)',
  },
});

// Display name for debugging
ReelActions.displayName = 'ReelActions';

export default ReelActions;
