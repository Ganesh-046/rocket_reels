import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface ProcessingOverlayProps {
  isVisible: boolean;
  message?: string;
  onCancel?: () => void;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isVisible,
  message = 'Processing your request...',
  onCancel,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#7d2537" />
          <Text style={styles.message}>{message}</Text>
          {onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: isLargeDevice ? width * 0.03 : width * 0.06,
    alignItems: 'center',
    minWidth: isLargeDevice ? width * 0.3 : width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: isLargeDevice ? 16 : 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginTop: isLargeDevice ? width * 0.02 : width * 0.04,
    fontFamily: 'System',
  },
  cancelButton: {
    marginTop: isLargeDevice ? width * 0.02 : width * 0.04,
    paddingVertical: isLargeDevice ? width * 0.01 : width * 0.02,
    paddingHorizontal: isLargeDevice ? width * 0.02 : width * 0.04,
  },
  cancelText: {
    fontSize: isLargeDevice ? 14 : 16,
    color: '#7d2537',
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default ProcessingOverlay; 