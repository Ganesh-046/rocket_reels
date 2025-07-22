import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import Carousel from 'react-native-reanimated-carousel';
import { Image, Platform, View, Dimensions, InteractionManager } from 'react-native';
import BannerCard from './BannerCard';


const { width } = Dimensions.get('window');


const CAROUSEL_INTERVAL = 4000;
const PRELOAD_DISTANCE = 2; // Preload 2 items ahead


interface BannerComponentProps {
 banner_Data: any[];
 baseGradientColors: any;
 currentBannerIndex: number;
 setCurrentBannerIndex: (index: number) => void;
 navigation: any;
 onBannerScroll: (isScrolling: boolean) => void;
 onBannerIndexChange: (index: number) => void;
 onTouchStart: () => void;
 onTouchEnd: () => void;
}


// Device context mock (since DeviceContext doesn't exist)
const deviceContext = {
 isLargeDevice: width > 768,
 columns: width > 768 ? 3 : 2,
 dimension: { width, height: Dimensions.get('window').height },
 appFonts: {
   APP_FONT_SIZE_3: 16,
   APP_FONT_SIZE_4: 14,
   APP_FONT_SIZE_9: 24,
   APP_FONT_SIZE_20: 14,
   APP_FONT_SIZE_35: 12,
 }
};


const BannerComponent: React.FC<BannerComponentProps> = ({
 banner_Data,
 baseGradientColors,
 currentBannerIndex,
 setCurrentBannerIndex,
 navigation,
 onBannerScroll,
 onBannerIndexChange,
 onTouchStart,
 onTouchEnd
}) => {
 const { isLargeDevice, columns, dimension: { width }, appFonts } = deviceContext;


 const carouselRef = useRef(null);
 const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
 const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);


 // Memoized carousel dimensions for better performance
 const carouselDimensions = useMemo(() => ({
   width: width,
   height: isLargeDevice ? width * .7 : width + 80,
 }), [width, isLargeDevice]);


 // Memoized parallax config for better performance
 const parallaxConfig = useMemo(() => ({
   parallaxScrollingScale: isLargeDevice ? 1 : 0.9,
   parallaxScrollingOffset: Platform.OS === 'ios' ? 150 : isLargeDevice ? 500 : 120,
   parallaxAdjacentItemScale: isLargeDevice ? .85 : 0.75,
 }), [isLargeDevice]);


 // Optimized image preloading
 const preloadImages = useCallback((startIndex: number) => {
   if (!banner_Data?.length) return;


   // Clear previous preload timeout
   if (preloadTimeoutRef.current) {
     clearTimeout(preloadTimeoutRef.current);
   }


   // Use InteractionManager for better performance
   preloadTimeoutRef.current = setTimeout(() => {
     InteractionManager.runAfterInteractions(() => {
       // Preload current and next images
       for (let i = 0; i < PRELOAD_DISTANCE; i++) {
         const index = (startIndex + i) % banner_Data.length;
         const banner = banner_Data[index];
         if (banner?.imageUri) {
           Image.prefetch(banner.imageUri).catch(() => {
             // Silently handle preload errors
           });
         }
       }
     });
   }, 100);
 }, [banner_Data]);


 // Enhanced progress change handler with debouncing
 const handleProgressChange = useCallback((_: any, absoluteProgress: any) => {
   const newIndex = Math.round(absoluteProgress);
   if (
     newIndex !== currentBannerIndex &&
     newIndex >= 0 &&
     newIndex < banner_Data.length
   ) {
     setCurrentBannerIndex(newIndex);
    
     // Trigger immediate color change
     if (onBannerIndexChange) {
       onBannerIndexChange(newIndex);
     }


     // Preload images for the new index
     preloadImages(newIndex);
   }
 }, [currentBannerIndex, banner_Data.length, setCurrentBannerIndex, onBannerIndexChange, preloadImages]);


 // Optimized banner scroll handler with better isolation
 const handleBannerScroll = useCallback((event: any) => {
   if (onBannerScroll) {
     onBannerScroll(true);
    
     // Clear previous timeout
     if (scrollTimeoutRef.current) {
       clearTimeout(scrollTimeoutRef.current);
     }
    
     // Reset after delay for better isolation
     scrollTimeoutRef.current = setTimeout(() => {
       onBannerScroll(false);
     }, 1500); // Reduced delay for better responsiveness
   }
 }, [onBannerScroll]);


 // Enhanced touch handlers for better scroll isolation
 const handleTouchStart = useCallback(() => {
   if (onTouchStart) {
     onTouchStart();
   }
   if (onBannerScroll) {
     onBannerScroll(true);
   }
 }, [onTouchStart, onBannerScroll]);


 const handleTouchEnd = useCallback(() => {
   if (onTouchEnd) {
     onTouchEnd();
   }
   // Reset scroll state after a short delay
   setTimeout(() => {
     if (onBannerScroll) {
       onBannerScroll(false);
     }
   }, 500);
 }, [onTouchEnd, onBannerScroll]);


 // Initial preload effect
 useEffect(() => {
   if (banner_Data?.length > 0) {
     preloadImages(currentBannerIndex);
   }
 }, [banner_Data, currentBannerIndex, preloadImages]);


 // Cleanup effect
 useEffect(() => {
   return () => {
     if (scrollTimeoutRef.current) {
       clearTimeout(scrollTimeoutRef.current);
     }
     if (preloadTimeoutRef.current) {
       clearTimeout(preloadTimeoutRef.current);
     }
   };
 }, []);


 // Memoized render item for better performance
 const renderItem = useCallback(({ item, index }: { item: any; index: number }) => (
   <BannerCard
     key={`banner-${item.id}-${index}`}
     item={item}
     index={index}
     navigation={navigation}
     gradientColors={baseGradientColors}
     currentBannerIndex={currentBannerIndex}
   />
 ), [navigation, baseGradientColors, currentBannerIndex]);


 if (!banner_Data?.length) return null;


 return (
   <View
     style={{
       overflow: 'hidden',
       pointerEvents: 'box-none',
       zIndex: 0,
       elevation: 0,
       backgroundColor: 'transparent',
       paddingVertical: 20,
       paddingBottom: 0
     }}
     onTouchStart={handleTouchStart}
     onTouchMove={handleTouchStart}
     onTouchEnd={handleTouchEnd}
     onTouchCancel={handleTouchEnd}
   >
     <Carousel
       ref={carouselRef}
       width={carouselDimensions.width}
       height={carouselDimensions.height}
       data={banner_Data}
       autoPlay={true}
       autoPlayInterval={CAROUSEL_INTERVAL}
       loop={banner_Data.length > 1}
       mode="parallax"
       modeConfig={parallaxConfig}
       style={{
         height: carouselDimensions.height,
         overflow: 'hidden',
         backgroundColor: 'transparent',
       }}
       scrollAnimationDuration={500}
       renderItem={renderItem}
       onProgressChange={handleProgressChange}
     />
   </View>
 );
};


export default BannerComponent; 