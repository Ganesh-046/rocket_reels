import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import { useTheme } from './useTheme';

const { width, height } = Dimensions.get('window');

export const useThemedStyles = (styleFunction: any) => {
  const { theme } = useTheme();
  const isLargeDevice = width > 768;
  const columns = isLargeDevice ? 3 : 2;
  
  const appFonts = {
    APP_FONT_SIZE_3: 16,
    APP_FONT_SIZE_9: 12,
    APP_FONT_SIZE_20: 14,
    APP_FONT_SIZE_35: 12,
  };

  return useMemo(() => {
    return styleFunction(theme, isLargeDevice, width, height, columns, appFonts);
  }, [styleFunction, theme, isLargeDevice, width, height, columns, appFonts]);
};

export default useThemedStyles; 