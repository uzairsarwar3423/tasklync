export type WorkerAvailabilityStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'PAUSED' | 'INACTIVE' | 'UNAVAILABLE';

export interface WorkerNearby {
  id: string;
  name: string;
  avatarUrl: string | null;
  avgRating: number;
  totalReviews: number;
  currency: string;
  distanceMeters: number;
  distanceLabel: string;
  categories: string[];
  availabilityStatus: WorkerAvailabilityStatus;
  availableUntil: string | null;
  isOnJob: boolean;
  responseTimeMins: number;
  startingPrice: number | null;
}

export interface WorkerSkill {
  id: string;
  categoryId: string;
  categoryName: string;
  isVerified: boolean;
  yearsExp: number;
}

export interface WorkerServiceOffering {
  id: string;
  serviceName: string;
  serviceNameUr: string | null;
  customPrice: number;
  priceType: 'fixed' | 'hourly' | 'quote';
  isCustom: boolean;
  notes: string | null;
}

export interface WorkerPublicProfile extends WorkerNearby {
  bio: string | null;
  yearsExperience: number;
  totalBookings: number;
  city: string | null;
  verificationStatus: 'VERIFIED' | 'PENDING_REVIEW' | 'UNVERIFIED';
  isVerified: boolean;
  skills: WorkerSkill[];
  serviceOfferings: WorkerServiceOffering[];
}

export interface WorkerReview {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  rating: number;
  punctuality: number | null;
  quality: number | null;
  communication: number | null;
  value: number | null;
  comment: string | null;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
}
