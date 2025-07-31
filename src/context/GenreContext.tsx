import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/api.service';
import { Genre } from '../types/api';

interface GenreContextType {
  genreData: Genre[];
  onGetGenres: () => Promise<void>;
}

const GenreContext = createContext<GenreContextType | undefined>(undefined);

export const useGenreContext = () => {
  const context = useContext(GenreContext);
  if (!context) {
    throw new Error('useGenreContext must be used within a GenreProvider');
  }
  return context;
};

interface GenreProviderProps {
  children: React.ReactNode;
}

export const GenreProvider: React.FC<GenreProviderProps> = ({ children }) => {
  const [genreData, setGenreData] = useState<Genre[]>([]);

  const onGetGenres = useCallback(async () => {
    try {
      console.log('🔍 Fetching genres...');
      const response = await apiService.getGenres();
      
      if (response.status === 200 && response.data) {
        setGenreData(response.data);
        console.log('✅ Genres updated:', response.data.length, 'genres');
      } else {
        console.warn('⚠️ Genres response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Error fetching genres:', error);
    }
  }, []);

  const value: GenreContextType = {
    genreData,
    onGetGenres,
  };

  return (
    <GenreContext.Provider value={value}>
      {children}
    </GenreContext.Provider>
  );
}; 