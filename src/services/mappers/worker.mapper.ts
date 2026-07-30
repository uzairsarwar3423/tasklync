import { WorkerNearby, WorkerPublicProfile, WorkerServiceOffering, WorkerSkill } from '../../types/worker.types';
import { WorkerReview, ReviewSummaryData, WorkerPortfolioImage } from '../../types/review.types';
import { parsePriceNumber } from '../../utils/formatters';

/**
 * Data Mapper / DTO Transformer for Worker Service API Spec v2.0.0
 * Converts backend snake_case JSON responses to type-safe frontend domain objects.
 */

const formatCategoryStringList = (rawList: any): string[] => {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') {
        return item.categoryName || item.category_name || item.name || item.title || item.categoryId || '';
      }
      return '';
    })
    .filter(Boolean);
};

export const mapRawWorkerNearby = (raw: any): WorkerNearby => {
  if (!raw) {
    return {
      id: '',
      name: 'Worker',
      avatarUrl: null,
      avgRating: 5.0,
      totalReviews: 0,
      currency: 'Rs',
      distanceMeters: 0,
      distanceLabel: 'Nearby',
      categories: [],
      availabilityStatus: 'AVAILABLE',
      availableUntil: null,
      isOnJob: false,
      responseTimeMins: 15,
      startingPrice: 500,
    };
  }

  const id = String(raw.worker_id || raw.workerId || raw.id || raw._id || '');
  const name =
    raw.name ||
    raw.full_name ||
    raw.fullName ||
    raw.worker_name ||
    raw.workerName ||
    raw.user?.name ||
    raw.user?.full_name ||
    raw.user?.fullName ||
    'Worker';

  const avatarUrl =
    raw.avatar_url ||
    raw.avatarUrl ||
    raw.photo_url ||
    raw.photoUrl ||
    raw.profile_picture ||
    raw.user?.avatar_url ||
    raw.user?.avatarUrl ||
    null;

  const avgRating =
    typeof raw.rating === 'number'
      ? raw.rating
      : typeof raw.avg_rating === 'number'
      ? raw.avg_rating
      : typeof raw.avgRating === 'number'
      ? raw.avgRating
      : typeof raw.rating_average === 'number'
      ? raw.rating_average
      : 5.0;

  const totalReviews =
    typeof raw.review_count === 'number'
      ? raw.review_count
      : typeof raw.total_reviews === 'number'
      ? raw.total_reviews
      : typeof raw.totalReviews === 'number'
      ? raw.totalReviews
      : 0;

  const currency = raw.currency || 'Rs';
  const distanceMeters =
    typeof raw.distance_meters === 'number'
      ? raw.distance_meters
      : typeof raw.distanceMeters === 'number'
      ? raw.distanceMeters
      : typeof raw.distance === 'number'
      ? raw.distance
      : 0;

  let distanceLabel = raw.distanceLabel || raw.distance_label;
  if (!distanceLabel) {
    distanceLabel =
      distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(1)} km`
        : distanceMeters > 0
        ? `${Math.round(distanceMeters)} m`
        : 'Nearby';
  }

  const rawStatus =
    raw.availability_status ||
    raw.availabilityStatus ||
    raw.status ||
    (raw.is_online ? 'AVAILABLE' : 'AVAILABLE');

  const rawCatList =
    raw.categories ||
    raw.category_names ||
    raw.categoryNames ||
    raw.skills ||
    raw.skills_list ||
    raw.services ||
    raw.category;

  const categories = formatCategoryStringList(rawCatList);

  const startingPrice =
    typeof raw.starting_price === 'number'
      ? raw.starting_price
      : typeof raw.startingPrice === 'number'
      ? raw.startingPrice
      : typeof raw.hourly_rate === 'number'
      ? raw.hourly_rate
      : typeof raw.rate === 'number'
      ? raw.rate
      : 500;

  return {
    id,
    name,
    avatarUrl,
    avgRating,
    totalReviews,
    currency,
    distanceMeters,
    distanceLabel,
    categories,
    availabilityStatus: rawStatus,
    availableUntil: raw.available_until || raw.availableUntil || null,
    isOnJob: raw.is_on_job ?? raw.isOnJob ?? false,
    responseTimeMins: raw.response_time_mins || raw.responseTimeMins || 15,
    startingPrice,
  };
};

export const mapRawWorkerProfile = (raw: any): WorkerPublicProfile => {
  const baseNearby = mapRawWorkerNearby(raw);

  const rawServicesList =
    raw.services ||
    raw.service_offerings ||
    raw.serviceOfferings ||
    raw.offerings ||
    raw.worker_services;

  const serviceOfferings = Array.isArray(rawServicesList)
    ? rawServicesList.map(mapRawWorkerServiceOffering)
    : [];

  return {
    ...baseNearby,
    bio: raw.bio || null,
    yearsExperience: raw.experience_years || raw.yearsExperience || 1,
    totalBookings: raw.total_jobs_completed || raw.totalBookings || 0,
    city: raw.city || null,
    verificationStatus: raw.is_verified ? 'VERIFIED' : 'UNVERIFIED',
    isVerified: Boolean(raw.is_verified ?? raw.isVerified ?? true),
    skills: Array.isArray(raw.skills_list) ? raw.skills_list.map(mapRawWorkerSkill) : (raw.skills || []),
    serviceOfferings,
  };
};

export const mapRawWorkerServiceOffering = (raw: any): WorkerServiceOffering => {
  const id = raw.offeringId || raw.offering_id || raw.serviceId || raw.service_id || raw.id || `so-${Math.random()}`;
  const rawPrice = raw.price ?? raw.custom_price ?? raw.customPrice ?? raw.basePrice ?? raw.base_price ?? raw.hourly_rate;
  const customPrice = parsePriceNumber(rawPrice, 500);

  const serviceName =
    raw.name ||
    raw.title ||
    raw.serviceName ||
    raw.service_name ||
    raw.service?.name ||
    raw.service?.title ||
    'General Service';

  return {
    id,
    serviceName,
    serviceNameUr: raw.nameUr || raw.name_ur || raw.title_ur || raw.serviceNameUr || null,
    customPrice,
    priceType: (raw.priceType === 'PER_HOUR' || raw.price_unit === 'PER_HOUR' || raw.priceType === 'hourly' || raw.price_type === 'hourly' ? 'hourly' : raw.priceType === 'QUOTE' || raw.price_unit === 'QUOTE' || raw.priceType === 'quote' || raw.price_type === 'quote' ? 'quote' : 'fixed'),
    isCustom: raw.isCustom ?? raw.is_custom ?? false,
    notes: raw.notes || null,
  };
};

export const mapRawWorkerSkill = (raw: any): WorkerSkill => {
  return {
    id: raw.skill_id || raw.id || '',
    categoryId: raw.category_id || raw.categoryId || raw.skill_id || '',
    categoryName: raw.name || raw.categoryName || 'Skill',
    isVerified: true,
    yearsExp: raw.experience_level === 'EXPERT' ? 5 : 2,
  };
};

export const mapRawWorkerPortfolio = (raw: any): WorkerPortfolioImage => {
  return {
    id: raw.id || '',
    workerId: raw.worker_id || raw.workerId || '',
    imageUrl: raw.image_url || raw.imageUrl || '',
    thumbnail: raw.thumbnail_url || raw.thumbnail || raw.image_url || '',
    caption: raw.title || raw.caption || null,
    width: raw.width || 800,
    height: raw.height || 600,
    order: raw.order || 0,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
};

export const mapRawWorkerReview = (raw: any): WorkerReview => {
  return {
    id: raw.id || '',
    bookingId: raw.booking_id || raw.bookingId || '',
    workerId: raw.worker_id || raw.workerId || '',
    reviewerId: raw.customer_id || raw.reviewerId || '',
    reviewerName: raw.customer_name || raw.reviewerName || 'Customer',
    reviewerAvatar: raw.customer_avatar || raw.reviewerAvatar || null,
    rating: typeof raw.rating === 'number' ? raw.rating : 5,
    punctuality: raw.punctuality || 5,
    quality: raw.quality || 5,
    communication: raw.communication || 5,
    value: raw.value || 5,
    comment: raw.comment || null,
    reply: raw.reply || null,
    repliedAt: raw.replied_at || raw.repliedAt || null,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    isVerified: true,
    serviceName: raw.service_name || raw.serviceName,
  };
};

export const mapRawReviewSummary = (raw: any): ReviewSummaryData => {
  return {
    avgRating: typeof raw?.average_rating === 'number' ? raw.average_rating : (raw?.avgRating || 5.0),
    totalReviews: typeof raw?.total_reviews === 'number' ? raw.total_reviews : (raw?.totalReviews || 0),
    ratingBreakdown: {
      5: raw?.["5_star_count"] ?? raw?.ratingBreakdown?.[5] ?? 0,
      4: raw?.["4_star_count"] ?? raw?.ratingBreakdown?.[4] ?? 0,
      3: raw?.["3_star_count"] ?? raw?.ratingBreakdown?.[3] ?? 0,
      2: raw?.["2_star_count"] ?? raw?.ratingBreakdown?.[2] ?? 0,
      1: raw?.["1_star_count"] ?? raw?.ratingBreakdown?.[1] ?? 0,
    },
    avgPunctuality: 4.8,
    avgQuality: 4.9,
    avgCommunication: 4.9,
    avgValue: 4.8,
  };
};
