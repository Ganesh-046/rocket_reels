export const env = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.rocketreels.com',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG === 'true',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
};
