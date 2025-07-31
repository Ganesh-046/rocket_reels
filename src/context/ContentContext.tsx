import React, { createContext, useContext, useState, useCallback } from 'react';
import apiService from '../services/api.service';
import { ContentType } from '../types/api';

interface ContentItem {
  _id: string;
  title: string;
  type?: string;
  language?: string;
  genre?: string;
  imageUri?: string;
  backdropImage?: string;
  rating?: number;
  year?: number;
  description?: string;
}

interface ContentData {
  allContentData: ContentItem[];
  totalPages?: number;
  currentPage?: number;
}

interface ContentContextType {
  contentData: ContentData | null;
  isAdult: boolean;
  pages: number;
  onGetContentData: (
    isAdult: boolean,
    searchText?: string,
    type?: string,
    language?: string,
    genre?: string,
    trgtAud?: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContentContext = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContentContext must be used within a ContentProvider');
  }
  return context;
};

interface ContentProviderProps {
  children: React.ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [isAdult, setIsAdult] = useState(false);
  const [pages, setPages] = useState(1);

  const onGetContentData = useCallback(async (
    isAdult: boolean,
    searchText: string = '',
    type: string = '',
    language: string = '',
    genre: string = '',
    trgtAud: string = '',
    page: number = 1,
    limit: number = 30
  ) => {
    try {
      console.log('🔍 Fetching content data:', {
        isAdult,
        searchText,
        type,
        language,
        genre,
        trgtAud,
        page,
        limit
      });

      // Use the same API call structure as acu_ott
      const response = await apiService.getContentList(
        isAdult,
        searchText,
        type,
        language,
        genre,
        trgtAud,
        page,
        limit
      );

      if (response.status === 200 && response.data) {
        const newData = response.data.result || [];
        
        if (page === 1) {
          // First page - replace data
          setContentData({
            allContentData: newData,
            totalPages: response.data.page || 1,
            currentPage: page,
          });
        } else {
          // Subsequent pages - append data
          setContentData(prev => ({
            allContentData: [...(prev?.allContentData || []), ...newData],
            totalPages: response.data.page || 1,
            currentPage: page,
          }));
        }
        
        setPages(page);
        console.log('✅ Content data updated:', newData.length, 'items');
      } else {
        console.warn('⚠️ Content data response not successful:', response);
        if (page === 1) {
          setContentData({ allContentData: [] });
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching content data:', error);
      
      // Handle 401 Unauthorized errors specifically
      if (error?.response?.status === 401) {
        console.log('⚠️ 401 Unauthorized - Content API requires authentication');
        // You can add navigation to login screen here if needed
      }
      
      if (page === 1) {
        setContentData({ allContentData: [] });
      }
    }
  }, []);

  const value: ContentContextType = {
    contentData,
    isAdult,
    pages,
    onGetContentData,
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}; 