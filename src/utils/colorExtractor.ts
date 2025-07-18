// Dummy color extraction function
export const extractColorsFromImage = async (imageUri: string) => {
  // Simulate color extraction delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return dummy colors based on image URI hash
  const hash = imageUri.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colors = [
    { light: '#ed9b72', dark: '#7d2537' },
    { light: '#ff6b6b', dark: '#ee5a52' },
    { light: '#4ecdc4', dark: '#44a08d' },
    { light: '#45b7d1', dark: '#96c93d' },
    { light: '#f7b731', dark: '#f39c12' },
  ];
  
  return colors[Math.abs(hash) % colors.length];
}; 