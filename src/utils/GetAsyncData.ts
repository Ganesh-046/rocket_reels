import MMKVStorage from '../lib/mmkv';

export const getAsyncData = async (key: string): Promise<string | null> => {
  try {
    const value = MMKVStorage.get(key);
    return typeof value === 'string' ? value : null;
  } catch (error) {
    console.warn(`Failed to get async data for key "${key}":`, error);
    return null;
  }
};

export const setAsyncData = async (key: string, value: string): Promise<void> => {
  try {
    MMKVStorage.set(key, value);
  } catch (error) {
    console.warn(`Failed to set async data for key "${key}":`, error);
  }
};

export const removeAsyncData = async (key: string): Promise<void> => {
  try {
    MMKVStorage.remove(key);
  } catch (error) {
    console.warn(`Failed to remove async data for key "${key}":`, error);
  }
}; 