import { useQuery } from '@tanstack/react-query';
import { workerApi } from '../services/api/worker.api';
import { WorkerPublicProfile, WorkerSkill, WorkerServiceOffering } from '../types/worker.types';
import { WorkerReview } from '../types/review.types';
import { PaginatedResponse } from '../types/api.types';

const MOCK_PROFILES: Record<string, WorkerPublicProfile> = {
  w1: {
    id: 'w1',
    name: 'Ahmed Khan',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.9,
    totalReviews: 124,
    currency: 'Rs',
    distanceMeters: 1200,
    distanceLabel: '1.2 km',
    categories: ['Electrician', 'AC Repair'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '18:00',
    isOnJob: false,
    responseTimeMins: 5,
    startingPrice: 500,
    bio: 'Professional certified partner with over 6 years of verified field experience in electrical installations, wiring, and AC maintenance.',
    yearsExperience: 6,
    totalBookings: 136,
    city: 'Karachi',
    verificationStatus: 'VERIFIED',
    isVerified: true,
    skills: [
      { id: 's1', categoryId: 'electrician', categoryName: 'Electrician', isVerified: true, yearsExp: 6 },
      { id: 's2', categoryId: 'ac_repair', categoryName: 'AC Repair', isVerified: true, yearsExp: 4 },
    ],
    serviceOfferings: [
      { id: 'so1', serviceName: 'Ceiling Fan Installation', serviceNameUr: null, customPrice: 500, priceType: 'fixed', isCustom: false, notes: null },
      { id: 'so2', serviceName: 'AC General Service', serviceNameUr: null, customPrice: 1500, priceType: 'fixed', isCustom: false, notes: null },
    ],
  },
  w2: {
    id: 'w2',
    name: 'Sarah Ali',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.7,
    totalReviews: 89,
    currency: 'Rs',
    distanceMeters: 2300,
    distanceLabel: '2.3 km',
    categories: ['Cleaning', 'Plumber'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '19:00',
    isOnJob: false,
    responseTimeMins: 12,
    startingPrice: 1200,
    bio: 'Dedicated deep cleaning and plumbing specialist. Focused on hygiene, pipeline repairs, and reliable kitchen fittings.',
    yearsExperience: 4,
    totalBookings: 101,
    city: 'Karachi',
    verificationStatus: 'VERIFIED',
    isVerified: true,
    skills: [
      { id: 's3', categoryId: 'cleaning', categoryName: 'Cleaning', isVerified: true, yearsExp: 4 },
      { id: 's4', categoryId: 'plumber', categoryName: 'Plumber', isVerified: true, yearsExp: 2 },
    ],
    serviceOfferings: [
      { id: 'so3', serviceName: 'Full Home Deep Cleaning', serviceNameUr: null, customPrice: 2500, priceType: 'fixed', isCustom: false, notes: null },
      { id: 'so4', serviceName: 'Kitchen Sink Tap Installation', serviceNameUr: null, customPrice: 1200, priceType: 'fixed', isCustom: false, notes: null },
    ],
  },
  w3: {
    id: 'w3',
    name: 'Bilal Malik',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.8,
    totalReviews: 205,
    currency: 'Rs',
    distanceMeters: 3100,
    distanceLabel: '3.1 km',
    categories: ['AC Repair', 'Electrician'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '19:00',
    isOnJob: false,
    responseTimeMins: 8,
    startingPrice: 800,
    bio: 'Expert in residential and commercial cooling systems. Prompt service, original parts, and quick troubleshooting.',
    yearsExperience: 8,
    totalBookings: 217,
    city: 'Karachi',
    verificationStatus: 'VERIFIED',
    isVerified: true,
    skills: [
      { id: 's5', categoryId: 'ac_repair', categoryName: 'AC Repair', isVerified: true, yearsExp: 8 },
      { id: 's6', categoryId: 'electrician', categoryName: 'Electrician', isVerified: true, yearsExp: 5 },
    ],
    serviceOfferings: [
      { id: 'so5', serviceName: 'AC Installation', serviceNameUr: null, customPrice: 3500, priceType: 'fixed', isCustom: false, notes: null },
      { id: 'so6', serviceName: 'Switchboard Repair', serviceNameUr: null, customPrice: 800, priceType: 'fixed', isCustom: false, notes: null },
    ],
  },
  w4: {
    id: 'w4',
    name: 'Zainab Bibi',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.5,
    totalReviews: 42,
    currency: 'Rs',
    distanceMeters: 800,
    distanceLabel: '800 m',
    categories: ['Cleaning'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '20:00',
    isOnJob: false,
    responseTimeMins: 2,
    startingPrice: 600,
    bio: 'Specialist in house cleaning, kitchen cleaning, dusting, and standard laundry support.',
    yearsExperience: 3,
    totalBookings: 48,
    city: 'Karachi',
    verificationStatus: 'VERIFIED',
    isVerified: true,
    skills: [
      { id: 's7', categoryId: 'cleaning', categoryName: 'Cleaning', isVerified: true, yearsExp: 3 },
    ],
    serviceOfferings: [
      { id: 'so7', serviceName: 'Standard Room Cleaning', serviceNameUr: null, customPrice: 600, priceType: 'fixed', isCustom: false, notes: null },
    ],
  },
  w5: {
    id: 'w5',
    name: 'Tariq Mahmood',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    avgRating: 4.6,
    totalReviews: 67,
    currency: 'Rs',
    distanceMeters: 1700,
    distanceLabel: '1.7 km',
    categories: ['Plumber', 'Electrician'],
    availabilityStatus: 'AVAILABLE',
    availableUntil: '17:00',
    isOnJob: false,
    responseTimeMins: 15,
    startingPrice: 700,
    bio: 'Experienced technician specialized in sanitary work, water pumps, drain blockage removal, and electrical repairs.',
    yearsExperience: 5,
    totalBookings: 79,
    city: 'Karachi',
    verificationStatus: 'VERIFIED',
    isVerified: true,
    skills: [
      { id: 's8', categoryId: 'plumber', categoryName: 'Plumber', isVerified: true, yearsExp: 5 },
      { id: 's9', categoryId: 'electrician', categoryName: 'Electrician', isVerified: true, yearsExp: 3 },
    ],
    serviceOfferings: [
      { id: 'so8', serviceName: 'Water Pump Repairing', serviceNameUr: null, customPrice: 1500, priceType: 'fixed', isCustom: false, notes: null },
      { id: 'so9', serviceName: 'Commode Leakage Repair', serviceNameUr: null, customPrice: 1000, priceType: 'fixed', isCustom: false, notes: null },
    ],
  },
};

const MOCK_REVIEWS: Record<string, WorkerReview[]> = {
  w1: [
    {
      id: 'r1',
      bookingId: 'b1',
      workerId: 'w1',
      reviewerId: 'u1',
      reviewerName: 'Usman Ghani',
      reviewerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      rating: 5,
      punctuality: 5,
      quality: 5,
      communication: 5,
      value: 5,
      comment: 'Exceptional service! Arrived exactly on time and fixed the electrical issue in 15 minutes.',
      reply: 'Thank you Usman! Happy to help.',
      repliedAt: '2026-07-01T11:00:00Z',
      createdAt: '2026-07-01T10:00:00Z',
      isVerified: true,
    },
    {
      id: 'r2',
      bookingId: 'b2',
      workerId: 'w1',
      reviewerId: 'u2',
      reviewerName: 'Ayesha Raza',
      reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      rating: 4.8,
      punctuality: 5,
      quality: 4.5,
      communication: 5,
      value: 5,
      comment: 'Very polite and professional. Did a great job cleaning the AC filters.',
      reply: null,
      repliedAt: null,
      createdAt: '2026-06-28T14:30:00Z',
      isVerified: true,
    },
  ],
};

export const useWorkerSkills = (workerId: string) => {
  const query = useQuery<WorkerSkill[], Error>({
    queryKey: ['worker', workerId, 'skills'],
    queryFn: async () => {
      if (workerId.startsWith('w')) {
        const mockProfile = MOCK_PROFILES[workerId];
        if (mockProfile) return mockProfile.skills;
        return [];
      }
      try {
        return await workerApi.getWorkerSkills(workerId);
      } catch (err) {
        const mockProfile = MOCK_PROFILES[workerId];
        if (mockProfile) return mockProfile.skills;
        throw err;
      }
    },
    enabled: !!workerId,
    staleTime: 300_000,
  });

  return {
    skills: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useWorkerServiceOfferings = (workerId: string) => {
  const query = useQuery<WorkerServiceOffering[], Error>({
    queryKey: ['worker', workerId, 'services'],
    queryFn: async () => {
      if (workerId.startsWith('w')) {
        const mockProfile = MOCK_PROFILES[workerId];
        if (mockProfile) return mockProfile.serviceOfferings;
        return [];
      }
      try {
        return await workerApi.getWorkerServices(workerId);
      } catch (err) {
        const mockProfile = MOCK_PROFILES[workerId];
        if (mockProfile) return mockProfile.serviceOfferings;
        throw err;
      }
    },
    enabled: !!workerId,
    staleTime: 300_000,
  });

  return {
    services: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useWorkerProfile = (workerId: string) => {
  const profileQuery = useQuery<WorkerPublicProfile, Error>({
    queryKey: ['worker', workerId],
    queryFn: async () => {
      if (workerId.startsWith('w')) {
        const mockProfile = MOCK_PROFILES[workerId];
        if (mockProfile) return mockProfile;
        throw new Error('Worker profile not found');
      }
      try {
        return await workerApi.getWorkerProfile(workerId);
      } catch (err) {
        const mockProfile = MOCK_PROFILES[workerId];
        if (mockProfile) return mockProfile;
        throw err;
      }
    },
    enabled: !!workerId,
    staleTime: 300_000,
  });

  const skillsQuery = useWorkerSkills(workerId);
  const servicesQuery = useWorkerServiceOfferings(workerId);

  // Fall back to profileQuery's serviceOfferings if sub-query services is empty
  const services =
    servicesQuery.services && servicesQuery.services.length > 0
      ? servicesQuery.services
      : profileQuery.data?.serviceOfferings && profileQuery.data.serviceOfferings.length > 0
      ? profileQuery.data.serviceOfferings
      : [];

  return {
    worker: profileQuery.data,
    skills: skillsQuery.skills.length > 0 ? skillsQuery.skills : (profileQuery.data?.skills || []),
    services,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: () => {
      profileQuery.refetch();
      skillsQuery.refetch();
      servicesQuery.refetch();
    },
  };
};

export const useWorkerReviews = (workerId: string, page: number = 1) => {
  const query = useQuery<PaginatedResponse<WorkerReview>, Error>({
    queryKey: ['worker', workerId, 'reviews', page],
    queryFn: async () => {
      if (workerId.startsWith('w')) {
        const reviews = MOCK_REVIEWS[workerId] || [];
        return {
          items: reviews,
          meta: {
            pagination: {
              total: reviews.length,
              page,
              limit: 20,
              hasMore: false,
            },
          },
        } as any;
      }
      try {
        return await workerApi.getWorkerReviews(workerId, { page });
      } catch (err) {
        const reviews = MOCK_REVIEWS[workerId] || [];
        return {
          items: reviews,
          meta: {
            pagination: {
              total: reviews.length,
              page,
              limit: 20,
              hasMore: false,
            },
          },
        } as any;
      }
    },
    enabled: !!workerId,
    staleTime: 300_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
