import { useState, useCallback, useEffect } from 'react';
import { useTrailerStore } from '../store/trailerStore';
import { Trailer, TrailerFilters } from '../types/trailer.types';
import trailerService from '../services/trailerService';

export const useTrailerList = () => {
  const {
    trailers,
    isLoading,
    hasError,
    errorMessage,
    currentPage,
    hasMore,
    refreshing,
    setTrailers,
    setLoading,
    setError,
    setCurrentPage,
    setHasMore,
    setRefreshing,
  } = useTrailerStore();

  const [filters, setFilters] = useState<TrailerFilters>({});

  // Load trailers
  const loadTrailers = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await trailerService.getTrailers(page, 20, filters);

      if (response.success && response.data) {
        const newTrailers = response.data as Trailer[];
        
        if (isRefresh) {
          setTrailers(newTrailers);
        } else {
          setTrailers([...trailers, ...newTrailers]);
        }
        
        setCurrentPage(page);
        setHasMore(newTrailers.length === 20);
      } else {
        setError(response.error || 'Failed to load trailers');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load trailers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [trailers, filters, setTrailers, setLoading, setError, setCurrentPage, setHasMore, setRefreshing]);

  // Load more trailers
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadTrailers(currentPage + 1);
    }
  }, [isLoading, hasMore, currentPage, loadTrailers]);

  // Refresh trailers
  const refresh = useCallback(() => {
    setRefreshing(true);
    loadTrailers(1, true);
  }, [loadTrailers, setRefreshing]);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<TrailerFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Load initial trailers
  useEffect(() => {
    loadTrailers(1, true);
  }, [filters]);

  return {
    trailers,
    isLoading,
    hasError,
    errorMessage,
    currentPage,
    hasMore,
    refreshing,
    filters,
    loadMore,
    refresh,
    updateFilters,
    clearFilters,
  };
}; 