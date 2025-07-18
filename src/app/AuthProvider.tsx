import React from 'react';
import { View } from 'react-native';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>;
};

export default AuthProvider;
