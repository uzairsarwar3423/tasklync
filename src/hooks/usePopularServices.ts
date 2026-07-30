import { useQuery } from '@tanstack/react-query';

export interface PopularService {
  id: string;
  name: string;
  categoryName: string;
  duration: string;
  startingPrice: number;
  currency: string;
  iconName?: string;
  imageUrl?: any;
}

const mockPopularServices: PopularService[] = [
  { id: 'ps1', name: 'Fan Installation', categoryName: 'Electrician', duration: '45-60 min', startingPrice: 500, currency: 'Rs', imageUrl: require('../../assets/images/fan-installtion.png') },
  { id: 'ps2', name: 'AC Deep Cleaning', categoryName: 'AC Repair', duration: '90-120 min', startingPrice: 1500, currency: 'Rs', imageUrl: require('../../assets/images/ac-deep-cleaning.png') },
  { id: 'ps3', name: 'Bathroom Plumbing', categoryName: 'Plumber', duration: '60 min', startingPrice: 600, currency: 'Rs', imageUrl: require('../../assets/images/bathroom-plumbering.png') },
  { id: 'ps4', name: 'Sofa Cleaning', categoryName: 'Cleaning', duration: '120 min', startingPrice: 1200, currency: 'Rs', imageUrl: require('../../assets/images/sofa-cleaning.png') },
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
