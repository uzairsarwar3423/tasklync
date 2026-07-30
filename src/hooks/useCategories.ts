import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../services/api/category.api';
import { Category, CategoryWithServices, Service } from '../types';

const MOCK_CATEGORIES: Category[] = [
  { id: 'electrician', name: 'Electrician', nameUr: 'الیکٹریشن', iconUrl: null, parentId: null, isActive: true, sortOrder: 1 },
  { id: 'plumber', name: 'Plumber', nameUr: 'پلمبر', iconUrl: null, parentId: null, isActive: true, sortOrder: 2 },
  { id: 'ac_repair', name: 'AC Repair', nameUr: 'اے سی مرمت', iconUrl: null, parentId: null, isActive: true, sortOrder: 3 },
  { id: 'cleaning', name: 'Cleaning', nameUr: 'صفائی', iconUrl: null, parentId: null, isActive: true, sortOrder: 4 },
  { id: 'carpenter', name: 'Carpenter', nameUr: 'بڑھئی', iconUrl: null, parentId: null, isActive: true, sortOrder: 5 },
  { id: 'painter', name: 'Painter', nameUr: 'پینٹر', iconUrl: null, parentId: null, isActive: true, sortOrder: 6 },
];

export const MOCK_CATEGORY_DETAILS: Record<string, CategoryWithServices> = {
  electrician: {
    id: 'electrician',
    name: 'Electrician',
    nameUr: 'الیکٹریشن',
    iconUrl: null,
    parentId: null,
    isActive: true,
    sortOrder: 1,
    services: [
      { id: 'fan_installation', categoryId: 'electrician', name: 'Ceiling Fan Installation', nameUr: 'چھت والے پنکھے کی تنصیب', description: 'Professional mounting and installation of standard ceiling fans. Includes blade balancing, wiring, regulator setting, and safety testing.', basePrice: 850, priceType: 'fixed', minDurationMins: 45, iconUrl: null, isActive: true, sortOrder: 1 },
      { id: 'switch_board', categoryId: 'electrician', name: 'Switchboard Replacement', nameUr: 'سوئچ بورڈ کی تبدیلی', description: 'Complete swap or repair of damaged switchboards. We supply or wire standard switches/sockets safely to prevent spark risks.', basePrice: 490, priceType: 'fixed', minDurationMins: 30, iconUrl: null, isActive: true, sortOrder: 2 },
      { id: 'circuit_breaker', categoryId: 'electrician', name: 'Circuit Breaker Repair', nameUr: 'سرکٹ بریکر کی مرمت', description: 'Diagnose overloading or tripping issues and replace damaged single/double-pole circuit breakers with brand new certified parts.', basePrice: 1200, priceType: 'fixed', minDurationMins: 60, iconUrl: null, isActive: true, sortOrder: 3 }
    ]
  },
  plumber: {
    id: 'plumber',
    name: 'Plumber',
    nameUr: 'پلمبر',
    iconUrl: null,
    parentId: null,
    isActive: true,
    sortOrder: 2,
    services: [
      { id: 'leakage_repair', categoryId: 'plumber', name: 'Tap Leakage Repair', nameUr: 'نلکے کے بہاؤ کی مرمت', description: 'Repair or replacement of leaking water taps, mixers and spindle cartridges to stop waste and protect your water lines.', basePrice: 590, priceType: 'fixed', minDurationMins: 30, iconUrl: null, isActive: true, sortOrder: 1 },
      { id: 'toilet_install', categoryId: 'plumber', name: 'Commode Repair & Install', nameUr: 'کمموڈ کی مرمت اور تنصیب', description: 'Full installation of Western commodes or repair of leaking flush tanks, push buttons, cistern systems and inlet valves.', basePrice: 2400, priceType: 'fixed', minDurationMins: 90, iconUrl: null, isActive: true, sortOrder: 2 },
      { id: 'blockage', categoryId: 'plumber', name: 'Drainage Clog Cleaning', nameUr: 'ڈرینیج بلاکیج کی صفائی', description: 'Unblocking stubborn kitchen, sink, or bathroom floor drains using modern spring cables and high-pressure cleaning tools.', basePrice: 990, priceType: 'fixed', minDurationMins: 60, iconUrl: null, isActive: true, sortOrder: 3 }
    ]
  },
  ac_repair: {
    id: 'ac_repair',
    name: 'AC Repair',
    nameUr: 'اے سی مرمت',
    iconUrl: null,
    parentId: null,
    isActive: true,
    sortOrder: 3,
    services: [
      { id: 'ac_service', categoryId: 'ac_repair', name: 'Split AC Service', nameUr: 'اسپلٹ اے سی سروس', description: 'Standard pressure washer cleaning of filter screens, cooling coils, drain tray and outdoor unit to optimize efficiency.', basePrice: 1490, priceType: 'fixed', minDurationMins: 60, iconUrl: null, isActive: true, sortOrder: 1 },
      { id: 'ac_refill', categoryId: 'ac_repair', name: 'AC Gas Leakage Refill', nameUr: 'اے سی گیس چارجنگ', description: 'Pressure test lines for leaks, braze connection gaps, vacuum the system and recharge high-quality coolant gas.', basePrice: 4200, priceType: 'fixed', minDurationMins: 90, iconUrl: null, isActive: true, sortOrder: 2 }
    ]
  },
  cleaning: {
    id: 'cleaning',
    name: 'Cleaning',
    nameUr: 'صفائی',
    iconUrl: null,
    parentId: null,
    isActive: true,
    sortOrder: 4,
    services: [
      { id: 'sofa_clean', categoryId: 'cleaning', name: 'Sofa Deep Cleaning', nameUr: 'صوفہ کی گہری صفائی', description: 'Vacuuming, shampoo treatment and hot-water extraction to remove stains and dust mites from fabric sofas.', basePrice: 1800, priceType: 'fixed', minDurationMins: 120, iconUrl: null, isActive: true, sortOrder: 1 },
      { id: 'home_clean', categoryId: 'cleaning', name: 'Home Deep Cleaning', nameUr: 'گھر کی مکمل صفائی', description: 'Intense floor scrubbing, bathroom sanitizing, kitchen cabinet cleaning, window washing, and dusting.', basePrice: 5000, priceType: 'fixed', minDurationMins: 240, iconUrl: null, isActive: true, sortOrder: 2 }
    ]
  }
};

export const useCategories = () => {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const data = await categoryApi.getCategories();
        return data.length ? data : MOCK_CATEGORIES;
      } catch (err) {
        return MOCK_CATEGORIES;
      }
    },
    staleTime: 3600_000, // 1 hour
    gcTime: 86400_000, // 24 hours
    refetchOnMount: false,
  });

  return {
    categories: query.data || MOCK_CATEGORIES,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useCategoryById = (id: string) => {
  const query = useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      try {
        return await categoryApi.getCategoryById(id);
      } catch (err) {
        return MOCK_CATEGORY_DETAILS[id] || {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          nameUr: null,
          iconUrl: null,
          parentId: null,
          isActive: true,
          sortOrder: 10,
          services: [],
        };
      }
    },
    staleTime: 3600_000,
    enabled: !!id,
  });

  return {
    category: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useCategoryServices = (categoryId: string) => {
  const query = useQuery({
    queryKey: ['services', categoryId],
    queryFn: async () => {
      try {
        return await categoryApi.getCategoryServices(categoryId);
      } catch (err) {
        return MOCK_CATEGORY_DETAILS[categoryId]?.services || [];
      }
    },
    staleTime: 3600_000,
    enabled: !!categoryId,
  });

  return {
    services: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
