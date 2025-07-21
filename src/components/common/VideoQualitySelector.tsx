import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useVideoQualityStore, VideoQuality } from '../../store/videoQualityStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoQualitySelectorProps {
  videoUrls: {
    '360p'?: string;
    '480p'?: string;
    '720p'?: string;
    '1080p'?: string;
    master?: string;
  };
  onQualityChange?: (quality: VideoQuality) => void;
}

const VideoQualitySelector: React.FC<VideoQualitySelectorProps> = ({
  videoUrls,
  onQualityChange,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const {
    currentQuality,
    availableQualities,
    setQuality,
    setAvailableQualities,
  } = useVideoQualityStore();

  // Get available qualities from video URLs
  const getAvailableQualities = (): VideoQuality[] => {
    const qualities: VideoQuality[] = ['auto'];
    
    if (videoUrls['360p']) qualities.push('360p');
    if (videoUrls['480p']) qualities.push('480p');
    if (videoUrls['720p']) qualities.push('720p');
    if (videoUrls['1080p']) qualities.push('1080p');
    
    return qualities;
  };

  // Initialize available qualities
  useEffect(() => {
    const qualities = getAvailableQualities();
    setAvailableQualities(qualities);
    
    console.log('🎬 VideoQualitySelector - Available qualities:', qualities);
    console.log('🎬 VideoQualitySelector - Current global quality:', currentQuality);
  }, [videoUrls]);

  // Handle quality selection
  const handleQualitySelect = (quality: VideoQuality) => {
    console.log('🎬 VideoQualitySelector - Selecting global quality:', quality);
    
    setQuality(quality);
    
    // Call parent callback
    if (onQualityChange) {
      onQualityChange(quality);
    }
    
    // Close modal
    setIsModalVisible(false);
    
    // Show confirmation
    Alert.alert(
      'Quality Changed',
      `Global video quality set to ${quality.toUpperCase()}`,
      [{ text: 'OK' }]
    );
  };

  // Get quality display name
  const getQualityDisplayName = (quality: VideoQuality): string => {
    switch (quality) {
      case 'auto':
        return 'Auto (Recommended)';
      case '360p':
        return '360p - Low Quality';
      case '480p':
        return '480p - Standard';
      case '720p':
        return '720p - HD';
      case '1080p':
        return '1080p - Full HD';
      default:
        return quality;
    }
  };

  // Get quality icon
  const getQualityIcon = (quality: VideoQuality): string => {
    switch (quality) {
      case 'auto':
        return 'settings-outline';
      case '360p':
        return 'cellular-outline';
      case '480p':
        return 'cellular';
      case '720p':
        return 'wifi-outline';
      case '1080p':
        return 'wifi';
      default:
        return 'settings-outline';
    }
  };

  // Get quality color
  const getQualityColor = (quality: VideoQuality): string => {
    switch (quality) {
      case 'auto':
        return '#007AFF';
      case '360p':
        return '#FF3B30';
      case '480p':
        return '#FF9500';
      case '720p':
        return '#34C759';
      case '1080p':
        return '#5856D6';
      default:
        return '#ffffff';
    }
  };

  const availableQualitiesList = getAvailableQualities();

  return (
    <>
      {/* Quality Button */}
      <TouchableOpacity 
        style={styles.actionItem} 
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.actionIconContainer}>
          <Icon 
            name={getQualityIcon(currentQuality)} 
            size={24} 
            color={getQualityColor(currentQuality)} 
          />
        </View>
        <Text style={styles.actionLabel}>Quality</Text>
      </TouchableOpacity>

      {/* Quality Selection Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <Icon name="settings-outline" size={20} color="#ffffff" />
                <Text style={styles.modalTitle}>Video Quality</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Quality Options */}
            <View style={styles.qualityList}>
              {availableQualitiesList.map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityOption,
                    currentQuality === quality && styles.selectedQualityOption
                  ]}
                  onPress={() => handleQualitySelect(quality)}
                >
                  <View style={styles.qualityOptionContent}>
                    <View style={styles.qualityIconContainer}>
                      <Icon 
                        name={getQualityIcon(quality)} 
                        size={18} 
                        color={getQualityColor(quality)} 
                      />
                    </View>
                    <View style={styles.qualityTextContainer}>
                      <Text style={styles.qualityText}>
                        {getQualityDisplayName(quality)}
                      </Text>
                      {quality !== 'auto' && (
                        <Text style={styles.qualitySubtext}>
                          {videoUrls[quality] ? 'Available' : 'Not available'}
                        </Text>
                      )}
                    </View>
                  </View>
                  {currentQuality === quality && (
                    <View style={styles.checkmarkContainer}>
                      <Icon name="checkmark" size={16} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Current Quality Info */}
            <View style={styles.currentQualityInfo}>
              <View style={styles.infoRow}>
                <Icon name="information-circle-outline" size={16} color="#999999" />
                <Text style={styles.currentQualityText}>
                  Current: {getQualityDisplayName(currentQuality)}
                </Text>
              </View>
              {currentQuality !== 'auto' && videoUrls[currentQuality as keyof typeof videoUrls] && (
                <Text style={styles.urlInfo}>
                  {videoUrls[currentQuality as keyof typeof videoUrls]?.substring(0, 40)}...
                </Text>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  actionItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.85,
    maxWidth: 380,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    maxHeight: screenHeight * 0.7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityList: {
    paddingVertical: 8,
  },
  qualityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedQualityOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  qualityOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qualityIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  qualityTextContainer: {
    flex: 1,
  },
  qualityText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '500',
  },
  qualitySubtext: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  checkmarkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentQualityInfo: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentQualityText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 6,
  },
  urlInfo: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    fontFamily: 'monospace',
    marginLeft: 22,
  },
});

export default VideoQualitySelector; 