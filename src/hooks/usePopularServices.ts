import { useQuery } from '@tanstack/react-query';

export interface PopularService {
  id: string;
  name: string;
  categoryName: string;
  duration: string;
  startingPrice: number;
  currency: string;
  iconName?: string;
}

const mockPopularServices: PopularService[] = [
  { id: 'ps1', name: 'Fan Installation', categoryName: 'Electrician', duration: '45-60 min', startingPrice: 500, currency: 'Rs', iconName: 'zap' },
  { id: 'ps2', name: 'AC Deep Cleaning', categoryName: 'AC Repair', duration: '90-120 min', startingPrice: 1500, currency: 'Rs', iconName: 'wind' },
  { id: 'ps3', name: 'Bathroom Plumbing', categoryName: 'Plumber', duration: '60 min', startingPrice: 600, currency: 'Rs', iconName: 'droplet' },
  { id: 'ps4', name: 'Sofa Cleaning', categoryName: 'Cleaning', duration: '120 min', startingPrice: 1200, currency: 'Rs', iconName: 'sparkles' },
];

export const usePopularServices = () => {
  return useQuery({
    queryKey: ['popular-services'],
    queryFn: async () => {
      // API integration in Day 8
      return new Promise<PopularService[]>((resolve) => {
        setTimeout(() => resolve(mockPopularServices), 600);
      });
    },
    staleTime: 3600_000, // 1 hour
  });
};
