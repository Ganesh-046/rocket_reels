import React, { useEffect } from 'react';
import {
  View,
  Modal as RNModal,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { theme } from '../../../theme';

const { colors, spacing, borderRadius } = theme;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'center' | 'bottom' | 'fullscreen';
  backdropOpacity?: number;
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  closeOnBackdropPress?: boolean;
  closeOnBackButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  children,
  variant = 'center',
  backdropOpacity = 0.5,
  containerStyle,
  contentStyle,
  closeOnBackdropPress = true,
  closeOnBackButton = true,
}) => {
  useEffect(() => {
    if (closeOnBackButton && visible) {
      // Handle back button press for Android
      const backHandler = () => {
        onClose();
        return true;
      };
      // You would typically use BackHandler from react-native here
      // For now, we'll just handle it through the modal's built-in behavior
    }
  }, [visible, closeOnBackButton, onClose]);

  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  const modalContentStyle = [
    styles.content,
    styles[variant],
    contentStyle,
  ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={[styles.backdrop, { backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }, containerStyle]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={modalContentStyle}>
              {children}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxWidth: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
  },
  center: {
    // Default center positioning
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxWidth: '100%',
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

export default Modal; 