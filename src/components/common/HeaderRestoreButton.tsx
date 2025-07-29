import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { SvgIcons } from './SvgIcons';

interface HeaderRestoreButtonProps {
  onRestore: () => void;
  isProcessing: boolean;
  disabled?: boolean;
  isLargeDevice?: boolean;
  width?: number;
  appFonts?: any;
}

const HeaderRestoreButton: React.FC<HeaderRestoreButtonProps> = ({
  onRestore,
  isProcessing,
  disabled = false,
  isLargeDevice = false,
  width = 0,
  appFonts = {},
}) => {
  const { theme: { colors } } = useTheme();

  const handlePress = () => {
    if (!disabled && !isProcessing) {
      onRestore();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          opacity: disabled || isProcessing ? 0.5 : 1,
          paddingHorizontal: isLargeDevice ? width * 0.01 : width * 0.02,
          paddingVertical: isLargeDevice ? width * 0.005 : width * 0.01,
        }
      ]}
      onPress={handlePress}
      disabled={disabled || isProcessing}
    >
      <SvgIcons
        name="restore"
        size={isLargeDevice ? width * 0.025 : width * 0.04}
        color={colors.PRIMARYWHITE}
      />
      <Text style={[
        styles.text,
        {
          fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_12 : appFonts.APP_FONT_SIZE_20,
          color: colors.PRIMARYWHITE,
          marginLeft: isLargeDevice ? width * 0.005 : width * 0.01,
        }
      ]}>
        {isProcessing ? 'Restoring...' : 'Restore'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontWeight: '600',
  },
});

export default HeaderRestoreButton; 