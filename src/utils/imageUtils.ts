// ============================================================================
// IMAGE URL PROCESSING UTILITIES FOR ROCKET REELS
// ============================================================================

const NEXT_PUBLIC_ASSET_URL = "https://d1cuox40kar1pw.cloudfront.net";

/**
 * Process image URLs to include the correct base URL
 * @param imagePath - The image path from API response
 * @returns Complete image URL
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  return `${NEXT_PUBLIC_ASSET_URL}/${cleanPath}`;
};

/**
 * Process content item to include proper image URLs
 * @param content - Content item from API
 * @returns Content item with processed image URLs
 */
export const processContentImages = (content: any) => {
  if (!content) return content;

  // Handle different data structures based on API response
  const imageUri = getImageUrl(content.image || content.backdropImage);
  const posterUri = getImageUrl(content.posterImage || content.contentDetails?.posterImage);
  const backdropUri = getImageUrl(content.backdropImage || content.contentDetails?.backdropImage);
  const thumbUri = getImageUrl(content.thumb || content.contentDetails?.thumb);

  return {
    ...content,
    imageUri,
    posterUri,
    backdropUri,
    thumbUri,
  };
};

/**
 * Process banner item to include proper image URLs
 * @param banner - Banner item from API
 * @returns Banner item with processed image URLs
 */
export const processBannerImages = (banner: any) => {
  if (!banner) return banner;

  // For banners, prioritize the main image field, then fallback to contentDetails
  const imageUri = getImageUrl(banner.image || banner.contentDetails?.posterImage);
  const posterUri = getImageUrl(banner.contentDetails?.posterImage);
  const backdropUri = getImageUrl(banner.contentDetails?.backdropImage);
  const thumbUri = getImageUrl(banner.contentDetails?.thumb);

  return {
    ...banner,
    imageUri,
    posterUri,
    backdropUri,
    thumbUri,
  };
};

// Process content list images (for MovieCard, MasonryCard)
export const processContentListImages = (items: any[]): any[] => {
  return items.map(item => {
    const processedItem = { ...item };
    
    // Priority 1: backdropImage (main content image)
    if (item.backdropImage && typeof item.backdropImage === 'string') {
      processedItem.imageUri = item.backdropImage.startsWith('http') 
        ? item.backdropImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.backdropImage}`;
    }
    // Priority 2: image field (fallback)
    else if (item.image && typeof item.image === 'string') {
      processedItem.imageUri = item.image.startsWith('http') 
        ? item.image 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.image}`;
    }
    // Priority 3: contentDetails.backdropImage (fallback)
    else if (item.contentDetails?.backdropImage && typeof item.contentDetails.backdropImage === 'string') {
      processedItem.imageUri = item.contentDetails.backdropImage.startsWith('http') 
        ? item.contentDetails.backdropImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.backdropImage}`;
    }
    
    return processedItem;
  });
};

// Process banner list images (for BannerCard)
export const processBannerListImages = (items: any[]): any[] => {
  return items.map(item => {
    const processedItem = { ...item };
    
    // Priority 1: image field (main banner image)
    if (item.image && typeof item.image === 'string') {
      processedItem.imageUri = item.image.startsWith('http') 
        ? item.image 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.image}`;
    }
    // Priority 2: contentDetails.backdropImage (fallback)
    else if (item.contentDetails?.backdropImage && typeof item.contentDetails.backdropImage === 'string') {
      processedItem.imageUri = item.contentDetails.backdropImage.startsWith('http') 
        ? item.contentDetails.backdropImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.backdropImage}`;
    }
    // Priority 3: contentDetails.posterImage (fallback)
    else if (item.contentDetails?.posterImage && typeof item.contentDetails.posterImage === 'string') {
      processedItem.imageUri = item.contentDetails.posterImage.startsWith('http') 
        ? item.contentDetails.posterImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.contentDetails.posterImage}`;
    }
    
    return processedItem;
  });
};

// Process continue watching images (for RecentCard)
export const processContinueWatchingImages = (items: any[]): any[] => {
  return items.map(item => {
    const processedItem = { ...item };
    
    // Priority 1: content.continueWatchingImage (main continue watching image)
    if (item.content?.continueWatchingImage && typeof item.content.continueWatchingImage === 'string') {
      processedItem.imageUri = item.content.continueWatchingImage.startsWith('http') 
        ? item.content.continueWatchingImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.content.continueWatchingImage}`;
    }
    // Priority 2: content.posterImage (fallback)
    else if (item.content?.posterImage && typeof item.content.posterImage === 'string') {
      processedItem.imageUri = item.content.posterImage.startsWith('http') 
        ? item.content.posterImage 
        : `${NEXT_PUBLIC_ASSET_URL}/${item.content.posterImage}`;
    }
    
    return processedItem;
  });
};

/**
 * Get optimized image source for React Native components
 * @param imagePath - Image path or URL
 * @param fallback - Fallback image source
 * @returns Image source object
 */
export const getOptimizedImageSource = (
  imagePath: string | null | undefined,
  fallback?: any
) => {
  const imageUrl = getImageUrl(imagePath);
  
  if (!imageUrl) {
    return fallback || null;
  }
  
  return { uri: imageUrl };
};

/**
 * Validate if image URL is accessible
 * @param imageUrl - Image URL to validate
 * @returns Promise<boolean>
 */
export const validateImageUrl = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Image validation failed:', imageUrl, error);
    return false;
  }
};

/**
 * Get image dimensions from URL (React Native compatible)
 * @param imageUrl - Image URL
 * @returns Promise<{width: number, height: number} | null>
 */
export const getImageDimensions = (imageUrl: string): Promise<{width: number, height: number} | null> => {
  return new Promise((resolve) => {
    // For React Native, we'll need to use a different approach
    // This is a placeholder - you can implement using react-native-image-size or similar
    resolve(null);
  });
};

export default {
  getImageUrl,
  processContentImages,
  processBannerImages,
  processContentListImages,
  processBannerListImages,
  processContinueWatchingImages,
  getOptimizedImageSource,
  validateImageUrl,
  getImageDimensions,
}; 