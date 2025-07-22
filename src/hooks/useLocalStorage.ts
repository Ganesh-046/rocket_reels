import { useState, useEffect, useCallback } from 'react';
import { MMKV } from 'react-native-mmkv';
import { log } from '../utils/logger';

const storage = new MMKV();

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getString(key);
      return item ? JSON.parse(item) : initialValue;
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
        storage.set(key, JSON.stringify(valueToStore));
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
      storage.delete(key);
      log.cacheClear(key);
    } catch (error) {
      log.error('STORAGE', `Error removing localStorage key "${key}"`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    const listener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === key) {
        try {
          const item = storage.getString(key);
          const newValue = item ? JSON.parse(item) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Error reading localStorage key "${key}":`, error);
        }
      }
    });

    return () => {
      listener.remove();
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Utility functions for direct storage access
export const storageUtils = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = storage.getString(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading storage key "${key}":`, error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      storage.delete(key);
    } catch (error) {
      console.error(`Error removing storage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  getAllKeys: (): string[] => {
    try {
      return storage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
}; 