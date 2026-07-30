import { useInfiniteQuery } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';
import { ReviewSortOption } from '../types';

export const useWorkerReviews = (workerId: string, sortBy: ReviewSortOption = 'recent') => {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['worker', workerId, 'reviews', sortBy],
    queryFn: ({ pageParam = 1 }) => workerApi.getWorkerReviews(workerId, { page: pageParam, limit: 10, sortBy }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    staleTime: 60_000,
  });

  const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];
  const summary = data?.pages[0]?.summary;
  const total = data?.pages[0]?.total ?? 0;

  return {
    reviews,
    summary,
    total,
    isLoading,
    isLoadingMore: isFetchingNextPage,
    hasNextPage,
    loadMore: fetchNextPage,
    refetch,
  };
};
