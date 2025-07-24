import { MMKV } from 'react-native-mmkv';

// Lazy initialization of MMKV storage
let storageInstance: MMKV | null = null;

const getStorage = (): MMKV => {
  if (!storageInstance) {
    try {
      storageInstance = new MMKV();
    } catch (error) {
      console.warn('MMKV initialization failed in GetAsyncData:', error);
      throw new Error('MMKV not available - React Native may not be ready');
    }
  }
  return storageInstance;
};

export const getAsyncData = async (key: string): Promise<string | null> => {
  try {
    const storage = getStorage();
    const value = storage.getString(key);
    return value || null;
  } catch (error) {
    console.warn(`Failed to get async data for key "${key}":`, error);
    return null;
  }
};

export const setAsyncData = async (key: string, value: string): Promise<void> => {
  try {
    const storage = getStorage();
    storage.set(key, value);
  } catch (error) {
    console.warn(`Failed to set async data for key "${key}":`, error);
  }
};

export const removeAsyncData = async (key: string): Promise<void> => {
  try {
    const storage = getStorage();
    storage.delete(key);
  } catch (error) {
    console.warn(`Failed to remove async data for key "${key}":`, error);
  }
}; 