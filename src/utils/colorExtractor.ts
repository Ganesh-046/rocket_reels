import { getPalette } from "@somesoap/react-native-image-palette";

// Helper function to calculate color brightness
const getColorBrightness = (hexColor: string): number => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate brightness using luminance formula
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

// Helper function to ensure minimum contrast between colors
const ensureContrast = (lightColor: string, darkColor: string): { light: string; dark: string } => {
  const lightBrightness = getColorBrightness(lightColor);
  const darkBrightness = getColorBrightness(darkColor);
  
  // If colors are too similar in brightness, adjust them
  const brightnessDiff = Math.abs(lightBrightness - darkBrightness);
  
  if (brightnessDiff < 0.3) { // If difference is less than 30%
    // Make the light color brighter and dark color darker
    const adjustedLight = lightBrightness > 0.7 ? lightColor : '#ffffff';
    const adjustedDark = darkBrightness < 0.3 ? darkColor : '#000000';
    
    return { light: adjustedLight, dark: adjustedDark };
  }
  
  return { light: lightColor, dark: darkColor };
};

// Helper function to get the most visible color from palette
const getMostVisibleColor = (palette: any): { light: string; dark: string } => {
  const colors = [
    { name: 'lightVibrant', color: palette.lightVibrant },
    { name: 'vibrant', color: palette.vibrant },
    { name: 'lightMuted', color: palette.lightMuted },
    { name: 'muted', color: palette.muted },
    { name: 'darkVibrant', color: palette.darkVibrant },
    { name: 'darkMuted', color: palette.darkMuted }
  ].filter(c => c.color); // Remove undefined colors

  if (colors.length === 0) {
    return { light: '#ed9b72', dark: '#7d2537' };
  }

  // Sort by brightness to find the most visible colors
  const sortedColors = colors.sort((a, b) => {
    const brightnessA = getColorBrightness(a.color);
    const brightnessB = getColorBrightness(b.color);
    return brightnessB - brightnessA; // Sort from brightest to darkest
  });

  // Use the brightest color as light, and a medium brightness as dark
  const lightColor = sortedColors[0].color;
  const darkColor = sortedColors[Math.min(2, sortedColors.length - 1)].color;

  // Ensure good contrast between the selected colors
  const finalColors = ensureContrast(lightColor, darkColor);

  // Debug logging
  console.log('🎨 Color extraction:', {
    availableColors: colors.map(c => ({ name: c.name, color: c.color, brightness: getColorBrightness(c.color) })),
    selectedLight: { color: finalColors.light, brightness: getColorBrightness(finalColors.light) },
    selectedDark: { color: finalColors.dark, brightness: getColorBrightness(finalColors.dark) }
  });

  return finalColors;
};

export const extractColorsFromImage = async (imageUri: string) => {
  if (!imageUri) {
    return { light: '#ed9b72', dark: '#7d2537' };
  }
  
  try {
    const palette = await getPalette(encodeURI(imageUri));
    if (palette) {
      // Get the most visible colors from the palette
      return getMostVisibleColor(palette);
    }
  } catch (error) {
    console.log('Color extraction error:', error);
  }
  
  // Fallback colors if extraction fails
  return { light: '#ed9b72', dark: '#7d2537' };
}; 