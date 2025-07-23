import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import useThemedStyles from '../../hooks/useThemedStyles';
import { PressableButton } from '../Button';
import FastImage from 'react-native-fast-image';


const NEXT_PUBLIC_ASSET_URL = "https://d1cuox40kar1pw.cloudfront.net";


interface MovieCardProps {
 item: any;
 index: number;
 navigation: any;
 propCard?: any;
 propImg?: any;
 disabled?: boolean;
}


const MovieCard: React.FC<MovieCardProps> = ({
 item,
 index,
 navigation,
 propCard,
 propImg,
 disabled = false
}) => {
 const style = useThemedStyles(styles);
 const { width } = Dimensions.get('window');


 const premium = item.genres ? item.genres.some((genre: any) => genre.name === 'Exclusive') : false;


 const handlePress = () => {
   if (item._id || item.id) {
     // Extract data for episodes navigation
     const contentId = item.contentId || item._id || item.id;
     const contentTitle = item.title || item.name;
     const contentDescription = item.description;
    
     console.log('MovieCard clicked:', {
       contentId,
       contentTitle,
       contentDescription
     });
    
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
     style={[style.card, propCard]}
     disabled={disabled}
     onPress={handlePress}
   >
     <View style={style.imageContainer}>
       <FastImage
         style={[style.img, propImg]}
         source={
           item?.backdropImage || item?.image
             ? {
                 uri: `${NEXT_PUBLIC_ASSET_URL}/${item?.backdropImage || item?.image}`,
                 priority: 'high',
                 cache: 'immutable'
               }
             : { uri: 'https://via.placeholder.com/300x450/333333/FFFFFF?text=No+Image' }
         }
         resizeMode={FastImage.resizeMode.contain}
       />
       {premium && (
         <View style={style.exclusiveBadge}>
           <FastImage
             style={style.exclusiveIcon}
             source={{ uri: 'https://via.placeholder.com/40x40/FFD700/000000?text=★' }}
             resizeMode={FastImage.resizeMode.contain}
           />
         </View>
       )}
     </View>
   </PressableButton>
 );
};


export default MovieCard;


const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, columns: number, appFonts: any) => StyleSheet.create({
 card: {
   width: isLargeDevice ? width * .3135 : width * .45,
   justifyContent: 'center',
   margin: width * .01,
   marginBottom: -20,
   borderRadius: width * .01,
   marginHorizontal: width * .01,
   backgroundColor: theme.colors.PRIMARYWHITEONE
 },
 imageContainer: {
   flex: 1,
   position: 'relative'
 },
 img: {
   width: '100%',
   height: isLargeDevice ? width * .38 : width * .58,
   borderRadius: width * .01,
   resizeMode: 'contain'
 },
 exclusiveBadge: {
   position: 'absolute',
   right: 0,
   top: 0,
 },
 exclusiveIcon: {
   width: isLargeDevice ? width * .04 : width * .08,
   height: isLargeDevice ? width * .04 : width * .08,
   resizeMode: 'contain'
 }
}); 