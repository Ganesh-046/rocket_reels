import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

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

interface EpisodesModalProps {
  visible: boolean;
  onClose: () => void;
  episodes: Episode[];
  currentEpisodeId?: string;
  onEpisodePress: (episode: Episode, index: number) => void;
  userProfileInfo?: any;
  episodeUnlockedLists?: string[];
}

const EpisodesModal: React.FC<EpisodesModalProps> = ({
  visible,
  onClose,
  episodes,
  currentEpisodeId,
  onEpisodePress,
  userProfileInfo,
  episodeUnlockedLists = [],
}) => {
  if (!visible) return null;

  const renderEpisode = useCallback(({ item, index }: { item: Episode; index: number }) => {
    const isCurrentEpisode = currentEpisodeId === item._id;
    const isLocked = item.status === 'locked' && 
      !episodeUnlockedLists?.includes(item._id) &&
      !(
        userProfileInfo?.isSubscriber || 
        userProfileInfo?.yearlySubscriber ||
        userProfileInfo?.weeklySubscriber
      );

    const handleEpisodePress = () => {
      // Don't allow playing locked episodes
      if (isLocked) {
        // You can show a subscription modal here
        console.log('Episode is locked. Please subscribe to unlock.');
        return;
      }
      onEpisodePress(item, index);
    };

    const imageSource = item.thumbnail ? {
      uri: `https://d1cuox40kar1pw.cloudfront.net/${item.thumbnail}`,
      priority: FastImage.priority.high,
      cache: FastImage.cacheControl.immutable,
    } : require('../../assets/images/logo.png');

    return (
      <TouchableOpacity
        style={styles.episodeCard}
        onPress={handleEpisodePress}
        activeOpacity={isLocked ? 0.5 : 0.8}
      >
        <FastImage
          source={imageSource}
          style={styles.episodeImage}
          resizeMode={item.thumbnail ? FastImage.resizeMode.cover : FastImage.resizeMode.contain}
        />
        
        {/* Episode Number Overlay - Always visible */}
        <View style={styles.lockContainer}>
          <Text style={styles.episodeNumber}>{index + 1}</Text>
        </View>

        {/* Lock Icon */}
        {isLocked && (
          <View style={[styles.lockContainer, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
            <Icon name="lock-closed" size={width * 0.06} color="#ffffff" />
          </View>
        )}

        {/* Current Episode Indicator */}
        {isCurrentEpisode && (
          <View style={[styles.lockContainer, { opacity: 1 }]}>
            <Icon name="play" size={width * 0.06} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
    );
  }, [currentEpisodeId, episodeUnlockedLists, userProfileInfo, onEpisodePress]);

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Episodes ({episodes?.length || 0})
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Episodes List */}
        <FlatList
          numColumns={3}
          data={episodes}
          key={3}
          renderItem={renderEpisode}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Episodes not found.</Text>
            </View>
          }
          keyExtractor={(item, index) => item._id?.toString() || index.toString()}
          contentContainerStyle={styles.episodesList}
          removeClippedSubviews={false}
          maxToRenderPerBatch={12}
          windowSize={10}
          initialNumToRender={12}
          getItemLayout={(data, index) => ({
            length: width * 0.18 + width * 0.03, // height + margin
            offset: (width * 0.18 + width * 0.03) * Math.floor(index / 3),
            index,
          })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 20,
    maxHeight: height * 0.8,
    width: width * 0.9,
    maxWidth: 600,
    marginBottom: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: isLargeDevice ? 20 : 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  episodesList: {
    padding: 20,
  },
  episodeCard: {
    width: width * 0.28,
    height: width * 0.18,
    borderRadius: width * 0.015,
    margin: width * 0.015,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  episodeImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.01,
  },
  lockContainer: {
    position: 'absolute',
    padding: isLargeDevice ? width * 0.01 : width * 0.02,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.01,
  },
  episodeNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default EpisodesModal; 