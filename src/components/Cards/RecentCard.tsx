import { StyleSheet, View, Text, Dimensions } from 'react-native';
import useThemedStyles from '../../hooks/useThemedStyles';
import { PressableButton } from '../Button';
import { SvgIcons } from '../common/SvgIcons';
import useTheme from '../../hooks/useTheme';
import FastImage from 'react-native-fast-image';


const { width } = Dimensions.get('window');
const APP_FONT_BOLD = 'System-Bold';


const NEXT_PUBLIC_ASSET_URL = "https://d1cuox40kar1pw.cloudfront.net";


interface RecentCardProps {
 item: any;
 index: number;
 navigation: any;
 propCard?: any;
}


const RecentCard: React.FC<RecentCardProps> = ({ item, index, navigation, propCard }) => {
 const isLargeDevice = width > 768;
 const appFonts = {
   APP_FONT_SIZE_18: width * .018,
   APP_FONT_SIZE_3: width * .03,
 };
 const style = useThemedStyles(styles);
 const { theme: { colors } } = useTheme();






 const { _id, timestamp } = item;


 const handlePress = () => {
   if (item._id || item.id) {
     // Extract data for episodes navigation
     const contentId = item.contentId || item._id || item.id;
     const contentTitle = item.title || item.name;
     const contentDescription = item.description;
    

    
     // Navigate to EpisodePlayerScreen with content data
     navigation.navigate('EpisodePlayer', {
       contentId: contentId,
       contentName: contentTitle,
       episodes: [], // Will be loaded by EpisodePlayerScreen
       initialIndex: 0,
       trailerData: {
         id: item._id || item.id,
         title: contentTitle,
         description: contentDescription,
         contentId: contentId
       }
     });
   }
 };


 return (
   <PressableButton
     key={index}
     style={[style.card, propCard]}
     onPress={handlePress}
   >
     <View style={style.imgContainer}>
       <FastImage
         style={[style.img, { resizeMode: (item.backdropImage || item.posterImage) ? 'cover' : 'contain' }]}
         source={
           (item.backdropImage || item.posterImage)
             ? {
                 uri: `${NEXT_PUBLIC_ASSET_URL}/${item.backdropImage || item.posterImage}`,
                 priority: 'high',
                 cache: 'immutable'
               }
             : { uri: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=No+Image' }
         }
         resizeMode={FastImage.resizeMode.contain}
       />
     </View>
     {/* <View style={style.directionContainer}>
       <Text numberOfLines={1} ellipsizeMode='tail' style={style.txt}>
         {item?.title}
       </Text>
       <Text numberOfLines={1} ellipsizeMode='tail' style={[style.txt, { marginLeft: width * .01 }]}>
         {item?.episode}
       </Text>
     </View> */}
   </PressableButton>
 );
};


export default RecentCard;


const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
 card: {
   margin: width * .01,
   borderRadius: width * .01,
   marginHorizontal: width * .017,
   backgroundColor: theme.colors.PRIMARBLACK
 },
 imgContainer: {
   height: isLargeDevice ? width * .38 : width * .58,
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: theme.colors.PRIMARBLACK,
   position: 'relative',
   borderRadius: width * .01,
   marginBottom: isLargeDevice ? width * .008 : width * .01
 },
 img: {
   width: isLargeDevice ? width * .5 : width * .5,
   height: isLargeDevice ? width * 1 : width * 1,
   borderRadius: width * .01,
   resizeMode: 'cover'
 },
 btnContainer: {
   borderRadius: width * .01,
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: theme.colors.LIGHTTRANSPARENT,
   position: 'absolute',
   bottom: isLargeDevice ? width * .013 : width * .01,
   left: isLargeDevice ? width * .01 : width * .025
 },
 playbtn: {
   width: isLargeDevice ? width * .035 : width * .06,
   height: isLargeDevice ? width * .035 : width * .06,
   alignItems: 'center',
   justifyContent: 'center',
   backgroundColor: theme.colors.LIGHTTRANSPARENT,
   borderRadius: isLargeDevice ? width * .005 : width * .01,
   borderWidth: 1,
   borderColor: theme.colors.PRIMARYWHITE
 },
 txt: {
   fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_18 : appFonts.APP_FONT_SIZE_3,
   fontFamily: APP_FONT_BOLD,
   color: theme.colors.PRIMARYWHITE,
   maxWidth: isLargeDevice ? width * .18 : width * .2
 },
 directionContainer: {
   flex: 1,
   flexDirection: 'row',
   justifyContent: 'flex-start'
 }
}); 