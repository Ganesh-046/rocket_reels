import { useState, useEffect, useCallback } from 'react';
import MMKVStorage from '../lib/mmkv';
import { log } from '../utils/logger';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = MMKVStorage.get(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        MMKVStorage.set(key, valueToStore);
        log.cacheSet(key, valueToStore);
      } catch (error) {
        log.error('STORAGE', `Error setting localStorage key "${key}"`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      MMKVStorage.remove(key);
      log.cacheClear(key);
    } catch (error) {
      log.error('STORAGE', `Error removing localStorage key "${key}"`, error);
    }
  }, [key, initialValue]);

  // Listen to changes in other tabs/windows
  useEffect(() => {
    // Note: MMKVStorage doesn't support cross-tab listeners
    // This is a limitation of the centralized approach
    // For now, we'll skip this functionality
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Utility functions for direct storage access
export const storageUtils = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = MMKVStorage.get(key);
      return item !== null ? item : defaultValue || null;
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      MMKVStorage.set(key, value);
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      MMKVStorage.remove(key);
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      MMKVStorage.clearAll();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  getAllKeys: (): string[] => {
    try {
      // Note: MMKVStorage doesn't expose getAllKeys directly
      // This is a limitation of the centralized approach
      return [];
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
}; 