import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface WithoutNativeButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
}

const WithoutNativeButton: React.FC<WithoutNativeButtonProps> = ({
  children,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
};

export default WithoutNativeButton; 