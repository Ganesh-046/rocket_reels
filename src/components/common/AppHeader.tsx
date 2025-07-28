import React, { useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import useThemedStyles from '../../hooks/useThemedStyles';
import { SvgIcons } from './SvgIcons.tsx';
import { PressableButton } from '../Button';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');
const isLargeDevice = width > 768;

interface AppHeaderProps {
  title?: string;
  titleStyle?: any;
  isLeft?: boolean;
  isLeftIcons?: boolean;
  tintColor?: string;
  isLeftIconColor?: string;
  leftIconName?: string;
  rightIconName?: string;
  isRight?: boolean;
  rightcolor?: string;
  rightIconSize?: number;
  onRightPress?: () => void;
  isRightIcons?: boolean;
  onPress?: () => void;
  propscontainer?: any;
  isLeftImgUrl?: any;
  isLeftImg?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  title, 
  titleStyle, 
  isLeft = false, 
  isLeftIcons = false, 
  tintColor, 
  isLeftIconColor, 
  leftIconName, 
  rightIconName, 
  isRight = false, 
  rightcolor, 
  rightIconSize, 
  onRightPress, 
  isRightIcons = false, 
  onPress, 
  propscontainer, 
  isLeftImgUrl, 
  isLeftImg = false 
}) => {
  const { theme: { colors } } = useTheme();
  const style = useThemedStyles(styles);
  const navigation = useNavigation();

  const renderLeftContent = () => {
    if (isLeftIcons) {
      return (
        <PressableButton
          onPress={onPress}
          style={[style.righticon, style.leftContentContainer, { paddingLeft: width * .01, justifyContent: 'flex-start' }]}>
          <Icon name="arrow-back" size={isLargeDevice ? width * .03 : width * 0.05} color={colors.PRIMARYWHITE} />
          <Text
            numberOfLines={1}
            ellipsizeMode='tail'
            style={[style.title, { marginLeft: width * .01 }, titleStyle]}>
            {title}
          </Text>
        </PressableButton>
      );
    } else if (isLeft) {
      return (
        <View style={style.leftContentContainer}>
          <Icon name="arrow-back" size={isLargeDevice ? width * .03 : width * .06} color={isLeftIconColor || colors.PRIMARYWHITE} />
          <View style={style.titlecontainer}>
            {isLeftImg ?
              <Image
                style={{
                  width: width * 0.18,
                  height: width * 0.12,
                  resizeMode: 'contain',
                  tintColor: tintColor
                }}
                source={isLeftImgUrl}
              />
              :
              <Text
                numberOfLines={1}
                ellipsizeMode='tail'
                style={[style.title, titleStyle]}>
                {title}
              </Text>
            }
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[style.container, {}, propscontainer, { justifyContent: isRight ? 'space-between' : null }]}>
      {isLeft ?
        <PressableButton
          onPress={() => navigation.goBack()}
          style={style.leftButtonContainer}
        >
          {renderLeftContent()}
        </PressableButton>
        :
        <>
          {isLeftIcons && renderLeftContent()}
          <View style={
            isLeft ? style.titlecontainer : {
              justifyContent: 'center',
              alignItems: 'flex-start',
              marginLeft: isLeft ? 0 : 10,
              flex: isRightIcons ? 1 : 0
            }}>
            {isLeftImg ?
              <Image
                style={{
                  width: width * 0.18,
                  height: width * 0.12,
                  resizeMode: 'contain',
                  tintColor: tintColor
                }}
                source={isLeftImgUrl}
              />
              :
              <Text
                numberOfLines={1}
                ellipsizeMode='tail'
                style={[style.title, titleStyle]}>
                {title}
              </Text>
            }
          </View>
        </>
      }
      
      {isRight && (
        <PressableButton
          onPress={onRightPress}
          style={style.righticon}>
          {isRightIcons ? (
            <SvgIcons 
              name={rightIconName || 'info'} 
              size={rightIconSize || (isLargeDevice ? width * .03 : width * .05)} 
              color={rightcolor || colors.PRIMARYWHITE} 
              viewBox="0 0 64 64"
              strokeWidth={1.5}
            />
          ) : (
                          <Text style={[style.rightText, { color: rightcolor || colors.PRIMARYWHITE }]}>
                {rightIconName || 'Info'}
              </Text>
          )}
        </PressableButton>
      )}
    </View>
  );
};

export default AppHeader;

const styles = (theme: any, isLargeDevice: boolean, width: number, height: number) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.02,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  leftButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titlecontainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: width * 0.02,
  },
  title: {
    fontSize: isLargeDevice ? width * 0.04 : width * 0.05,
    fontWeight: 'bold',
    color: theme.colors.PRIMARYWHITE,
    textAlign: 'left',
  },
  righticon: {
    padding: width * 0.01,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightText: {
    fontSize: isLargeDevice ? width * 0.03 : width * 0.04,
    color: theme.colors.PRIMARYWHITE,
  },
}); 