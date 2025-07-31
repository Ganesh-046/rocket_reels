import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../hooks/useTheme';
import useThemedStyles from '../../hooks/useThemedStyles';

const { width } = Dimensions.get('window');

interface SearchBarProps {
  placeholder: string;
  value: string;
  setValue: (text: string) => void;
  navigation: any;
  onFocus?: () => void;
  onBlur?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  setValue,
  navigation,
  onFocus,
  onBlur,
}) => {
  const { theme } = useTheme();
  const style = useThemedStyles(styles);
  
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, focusAnim]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={style.container}>
      <TouchableOpacity style={style.backButton} onPress={handleBack}>
        <Icon name="arrow-back" size={24} color={theme.colors.PRIMARYWHITE} />
      </TouchableOpacity>
      
      <Animated.View style={[style.searchContainer, {
        borderColor: focusAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.6)'],
        }),
      }]}>
        <Icon 
          name="search" 
          size={20} 
          color={isFocused ? theme.colors.PRIMARYWHITE : 'rgba(255, 255, 255, 0.6)'} 
        />
        <TextInput
          ref={inputRef}
          style={style.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          value={value}
          onChangeText={setValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={style.clearButton}>
            <Icon name="close" size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.03,
    paddingTop: height * 0.05, // Add top margin like acu_ott
    gap: width * 0.03,
  },
  backButton: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: width * 0.06,
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.03,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_16 : appFonts.APP_FONT_SIZE_18,
    fontFamily: 'System',
    color: theme.colors.PRIMARYWHITE,
    marginLeft: width * 0.02,
  },
  clearButton: {
    padding: width * 0.01,
  },
});

export default SearchBar; 