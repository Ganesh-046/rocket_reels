import React from 'react';
import { View } from 'react-native';

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>;
};

export default ToastProvider;
