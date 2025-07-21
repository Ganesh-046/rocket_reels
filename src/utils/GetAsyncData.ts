import { MMKV } from 'react-native-mmkv';

// Create a storage instance
const storage = new MMKV();

export const getAsyncData = async (key: string): Promise<string | null> => {
  try {
    const value = storage.getString(key);
    return value || null;
  } catch (error) {
    return null;
  }
};

export const setAsyncData = async (key: string, value: string): Promise<void> => {
  try {
    storage.set(key, value);
  } catch (error) {
  }
};

export const removeAsyncData = async (key: string): Promise<void> => {
  try {
    storage.delete(key);
  } catch (error) {
  }
}; 