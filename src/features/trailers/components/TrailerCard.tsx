import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TrailerCardProps } from '../types/trailer.types';

const { width } = Dimensions.get('window');

const TrailerCard: React.FC<TrailerCardProps> = ({
  trailer,
  onPress,
  onLike,
  onShare,
  style,
}) => {
  const handlePress = () => {
    onPress?.(trailer);
  };

  const handleLike = () => {
    onLike?.(trailer._id);
  };

  const handleShare = () => {
    onShare?.(trailer);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: trailer.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationOverlay}>
          <Text style={styles.durationText}>{formatDuration(trailer.duration)}</Text>
        </View>
        <View style={styles.playButton}>
          <Icon name="play" size={20} color="#ffffff" />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {trailer.title}
        </Text>
        
        {trailer.description && (
          <Text style={styles.description} numberOfLines={1}>
            {trailer.description}
          </Text>
        )}
        
        <View style={styles.meta}>
          <Text style={styles.genre}>{trailer.genre}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.views}>{formatViewCount(trailer.viewCount || 0)} views</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Icon
              name={trailer.isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={trailer.isLiked ? '#ff4757' : '#666'}
            />
            <Text style={[styles.actionText, trailer.isLiked && styles.likedText]}>
              {formatViewCount(trailer.likeCount || 0)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-outline" size={16} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  durationOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  genre: {
    color: '#ff4757',
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    color: '#666',
    fontSize: 12,
    marginHorizontal: 6,
  },
  views: {
    color: '#999',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  likedText: {
    color: '#ff4757',
  },
});

export default TrailerCard; 