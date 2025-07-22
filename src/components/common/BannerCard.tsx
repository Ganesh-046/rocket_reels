import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, Dimensions, Animated } from "react-native";
import useThemedStyles from "../../hooks/useThemedStyles";
import { PressableButton } from "../Button";
import useTheme from "../../hooks/useTheme";
import FastImage from "react-native-fast-image";
import { SvgIcons } from "./SvgIcons";
import Skeleton from "../Skeleton";


// Asset URL constant
const NEXT_PUBLIC_ASSET_URL = 'https://d1cuox40kar1pw.cloudfront.net';


const { width } = Dimensions.get('window');


// Font constants
const APP_FONT_BOLD = 'System-Bold';
const APP_FONT_REGULAR = 'System';


interface BannerCardProps {
 item: any;
 index: number;
 navigation: any;
 currentBannerIndex: number;
 gradientColors?: any;
}


const BannerCard = ({ item, index, navigation, currentBannerIndex }: BannerCardProps) => {
 const style = useThemedStyles(styles);
 const { theme: { colors } } = useTheme();
  // State for image loading and like functionality
 const [imageLoading, setImageLoading] = useState(true);
 const [imageError, setImageError] = useState(false);
 const [isLiked, setIsLiked] = useState(false);
 const [likeScale] = useState(new Animated.Value(1));


 // Optimized like animation
 const handleLikePress = useCallback(() => {
   setIsLiked(!isLiked);
  
   // Smooth scale animation
   Animated.sequence([
     Animated.timing(likeScale, {
       toValue: 1.3,
       duration: 150,
       useNativeDriver: true,
     }),
     Animated.timing(likeScale, {
       toValue: 1,
       duration: 150,
       useNativeDriver: true,
     }),
   ]).start();
 }, [isLiked, likeScale]);


 const handlePlayPress = useCallback(() => {
   // Extract data for episodes navigation
   const contentId = item.contentId || item._id || item.id;
   const contentTitle = item?.contentDetails?.title || item.title || item.name;
   const contentDescription = item?.contentDetails?.description || item.description;
  
   console.log('BannerCard clicked:', {
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
 }, [navigation, item]);


 // Optimized image loading handlers
 const handleImageLoadStart = useCallback(() => {
   setImageLoading(true);
   setImageError(false);
 }, []);


 const handleImageLoadEnd = useCallback(() => {
   setImageLoading(false);
 }, []);


 const handleImageError = useCallback(() => {
   setImageLoading(false);
   setImageError(true);
   console.log(`❌ BannerCard ${index} image error for URL:`, item?.imageUri);
 }, [index, item?.imageUri]);


 const handleImageLoad = useCallback(() => {
   setImageLoading(false);
   console.log(`✅ BannerCard ${index} image loaded successfully:`, item?.imageUri);
 }, [index, item?.imageUri]);


 return (
   <PressableButton
     key={index}
     style={[style.bannerContainer, {
       // borderColor: currentBannerIndex === index ? colors.PRIMARYWHITE : 'transparent',
       backgroundColor: currentBannerIndex === index ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
     }]}
     onPress={handlePlayPress}
     hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
     android_ripple={{
       color: colors.PRIMARYWHITE + '20',
       borderless: true,
       radius: 20
     }}
   >
     <View style={[style.imageContainer, currentBannerIndex === index && style.activeImageContainer]}>
       {/* Skeleton loader while image is loading */}
       {imageLoading && (
         <View style={style.skeletonContainer}>
           <Skeleton variant="banner" />
         </View>
       )}


       {/* Main image */}
       <FastImage
         style={[style.img, imageLoading && style.hiddenImage]}
         source={item?.imageUri ? {
           uri: item.imageUri,
           priority: "high",
           cache: 'immutable'
         } : {
           uri: 'https://via.placeholder.com/400x600/333333/FFFFFF?text=No+Image'
         }}
         resizeMode={FastImage.resizeMode.cover}
         onLoadStart={handleImageLoadStart}
         onLoadEnd={handleImageLoadEnd}
         onError={handleImageError}
         onLoad={handleImageLoad}
       />
      
       {/* Error fallback */}
       {imageError && (
         <View style={style.errorContainer}>
           <Text style={style.errorText}>Image unavailable</Text>
         </View>
       )}
      
       {/* OTT-style gradient overlay */}
       <View style={style.gradientOverlay} />
      
       {/* Content overlay */}
       {/* <View style={style.contentOverlay}>
         <Text style={style.title} numberOfLines={2}>
           {item?.contentDetails?.title || 'Unknown Title'}
         </Text>
        
         <View style={style.metaContainer}>
           <Text style={style.metaText}>
             {item.contentDetails?.maturityRating || 'TV-MA'}
           </Text>
           <View style={style.separator} />
           {item?.contentDetails?.genres && item.contentDetails.genres.length > 0 && (
             <>
               <Text style={style.metaText}>
                 {item.contentDetails.genres[0]?.name}
               </Text>
               <View style={style.separator} />
             </>
           )}
           <Text style={style.metaText}>
             {item?.contentDetails?.releasingDate ? new Date(item.contentDetails.releasingDate).getFullYear() : '2024'}
           </Text>
         </View>
       </View> */}


     
     




     </View>
   </PressableButton>
 );
};


export default BannerCard;


const styles = (theme: any, isLargeDevice: boolean, width: number, height: number, appFonts: any) => StyleSheet.create({
 bannerContainer: {
   width: isLargeDevice ? width * .4 : width * .8, // Decreased by 20% from .5 to .4 and .9 to .72
   backgroundColor: theme.colors.TRANSPARENT,
   overflow: 'hidden',
   marginHorizontal: isLargeDevice ? width * .3 : 35, // Increased horizontal spacing from .25 to .3 and 20 to 35
   borderRadius: width * 0.015,
   borderWidth: 1,
 },
 imageContainer: {
   position: 'relative',
   borderRadius: width * 0.015,
   overflow: 'hidden',
 },
 activeImageContainer: {
   elevation: 12,
   shadowColor: theme.colors.PRIMARYWHITE,
   shadowOffset: {
     width: 0,
     height: 8
   },
   shadowOpacity: 0.4,
   shadowRadius: 12
 },
 skeletonContainer: {
   position: 'absolute',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   zIndex: 1,
 },
 img: {
   width: '100%',
   height: isLargeDevice ? width * .65 : width + 60,
   borderRadius: width * 0.015,
   backgroundColor: theme.colors.PRIMARYBLACK,
 },
 hiddenImage: {
   opacity: 0,
 },
 errorContainer: {
   position: 'absolute',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: theme.colors.PRIMARYBLACK,
 },
 errorText: {
   color: theme.colors.PRIMARYWHITE,
   fontSize: appFonts.APP_FONT_SIZE_4,
   opacity: 0.7,
 },
 gradientOverlay: {
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
   height: '0%',
   backgroundColor: 'rgba(0, 0, 0, 0.6)',
   borderBottomLeftRadius: width * 0.015,
   borderBottomRightRadius: width * 0.015,
 },
 contentOverlay: {
   position: 'absolute',
   bottom: 0,
   left: 0,
   right: 0,
   padding: width * 0.025,
   paddingBottom: width * 0.03,
 },
 title: {
   fontSize: isLargeDevice ? appFonts.APP_FONT_SIZE_3 + 6 : appFonts.APP_FONT_SIZE_3 + 4,
   fontFamily: APP_FONT_BOLD,
   color: theme.colors.PRIMARYWHITE,
   marginBottom: width * 0.01,
   textShadowColor: 'rgba(0, 0, 0, 0.9)',
   textShadowOffset: { width: 1, height: 1 },
   textShadowRadius: 4,
 },
 metaContainer: {
   flexDirection: 'row',
   alignItems: 'center',
 },
 metaText: {
   fontSize: appFonts.APP_FONT_SIZE_4,
   fontFamily: APP_FONT_REGULAR,
   color: theme.colors.PRIMARYWHITE,
   opacity: 0.85,
   textShadowColor: 'rgba(0, 0, 0, 0.9)',
   textShadowOffset: { width: 1, height: 1 },
   textShadowRadius: 3,
 },
 separator: {
   width: isLargeDevice ? width * .006 : width * .008,
   height: isLargeDevice ? width * .006 : width * .008,
   borderRadius: 999,
   backgroundColor: theme.colors.PRIMARYWHITE,
   opacity: 0.6,
   marginHorizontal: width * 0.012,
 },
 likeButton: {
   position: 'absolute',
   top: width * 0.025,
   right: width * 0.025,
   width: 48,
   height: 48,
   borderRadius: 24,
   backgroundColor: 'rgba(0, 0, 0, 0.6)',
   justifyContent: 'center',
   alignItems: 'center',
   zIndex: 10,
 },
 playButton: {
   position: 'absolute',
   bottom: width * 0.08,
   right: width * 0.025,
   width: 56,
   height: 56,
   borderRadius: 28,
   backgroundColor: 'rgba(0, 0, 0, 0.8)',
   justifyContent: 'center',
   alignItems: 'center',
   zIndex: 10,
 },
}); 