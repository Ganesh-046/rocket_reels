import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface ModalViewProps {
  children: React.ReactNode;
  heading?: string;
  onRequestClose: () => void;
  bottomBox?: any;
}

export const ModalView: React.FC<ModalViewProps> = ({
  children,
  heading,
  onRequestClose,
  bottomBox,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, bottomBox]}>
          {heading && (
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{heading}</Text>
              <TouchableOpacity onPress={onRequestClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#EBE2DA',
    borderTopLeftRadius: width * 0.02,
    borderTopRightRadius: width * 0.02,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isLargeDevice ? width * 0.02 : width * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalTitle: {
    fontSize: isLargeDevice ? 18 : 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
}); 