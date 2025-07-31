import React, { createContext, useContext, useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

interface Dimension {
  width: number;
  height: number;
}

interface AppFonts {
  APP_FONT_SIZE_14: number;
  APP_FONT_SIZE_16: number;
  APP_FONT_SIZE_18: number;
  APP_FONT_SIZE_20: number;
  APP_FONT_SIZE_22: number;
  APP_FONT_SIZE_24: number;
}

interface DeviceContextType {
  isLargeDevice: boolean;
  dimension: Dimension;
  appFonts: AppFonts;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const useDeviceContext = () => {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDeviceContext must be used within a DeviceProvider');
  }
  return context;
};

interface DeviceProviderProps {
  children: React.ReactNode;
}

export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [dimension, setDimension] = useState<Dimension>({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  });

  const isLargeDevice = dimension.width > 768;

  const appFonts: AppFonts = {
    APP_FONT_SIZE_14: 14,
    APP_FONT_SIZE_16: 16,
    APP_FONT_SIZE_18: 18,
    APP_FONT_SIZE_20: 20,
    APP_FONT_SIZE_22: 22,
    APP_FONT_SIZE_24: 24,
  };

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimension({
        width: window.width,
        height: window.height,
      });
    });

    return () => subscription?.remove();
  }, []);

  const value: DeviceContextType = {
    isLargeDevice,
    dimension,
    appFonts,
  };

  return (
    <DeviceContext.Provider value={value}>
      {children}
    </DeviceContext.Provider>
  );
}; 