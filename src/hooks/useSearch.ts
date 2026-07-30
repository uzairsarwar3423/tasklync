import { useState, useEffect, useRef, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { searchApi } from '../services/api/search.api';
import { FilterState, DEFAULT_FILTERS, SearchParams } from '../types/search.types';
import { useLocationStore } from '../store/location.store';

export const useSearch = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const timeoutId = useRef<any>(null);

  // Real GPS location from persisted location store
  const { currentLocation } = useLocationStore();
  const lat = currentLocation?.lat;
  const lng = currentLocation?.lng;

  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [query]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categories.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.maxRate > 0) count++;
    if (filters.sortBy !== 'distance') count++;
    if (filters.available !== 'any') count++;
    return count;
  }, [filters]);

  const filtersToParams = (f: FilterState): Partial<SearchParams> => {
    return {
      category: f.categories.length > 0 ? f.categories.join(',') : undefined,
      minRating: f.minRating > 0 ? f.minRating : undefined,
      maxRate: f.maxRate > 0 ? f.maxRate : undefined,
      sortBy: f.sortBy,
      available: f.available !== 'any' ? f.available : undefined,
      lat,
      lng,
    };
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['search', debouncedQuery, filters, lat, lng],
    queryFn: ({ pageParam = 1 }) =>
      searchApi.searchWorkers({
        q: debouncedQuery,
        ...filtersToParams(filters),
        page: pageParam as number,
        limit: 20,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    enabled: debouncedQuery.length >= 2 || activeFilterCount > 0,
    staleTime: 30000,
  });

  const workers = useMemo(() => {
    return data?.pages.flatMap((page) => page.workers) ?? [];
  }, [data]);

  const total = data?.pages[0]?.total ?? 0;

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
    resetFilters();
    queryClient.removeQueries({ queryKey: ['search'] });
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    filters,
    setFilters,
    resetFilters,
    activeFilterCount,
    workers,
    total,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    isError,
    error,
    hasMore: !!hasNextPage,
    loadMore: fetchNextPage,
    refetch,
    clearSearch,
  };
};
