export type ReviewCategoryKey = 'punctuality' | 'quality' | 'communication' | 'value';

export interface ReviewCategoryRatings {
  punctuality?: number | undefined;
  quality?: number | undefined;
  communication?: number | undefined;
  value?: number | undefined;
}

export interface ReviewFormState {
  overallRating: number;
  categoryRatings: Record<ReviewCategoryKey, number>;
  comment: string;
  canSubmit: boolean;
  shouldShowCategorySection: boolean;
}

export interface ReviewSubmitPayload {
  bookingId: string;
  targetId: string;
  targetType: 'worker' | 'service';
  rating: number;
  categories?: {
    punctuality?: number | undefined;
    quality?: number | undefined;
    communication?: number | undefined;
    value?: number | undefined;
  } | undefined;
  comment?: string | undefined;
}

export interface PendingReviewItem {
  bookingId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string | null;
  serviceName: string;
  completedAt: string;
  totalAmount?: number | undefined;
}

export interface WorkerReview {
  id: string;
  bookingId: string;
  workerId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string | null;
  rating: number; // 1-5, supports decimals like 4.5
  punctuality: number | null; // 1-5 subcategory rating
  quality: number | null;
  communication: number | null;
  value: number | null;
  comment: string | null;
  reply: string | null; // worker's reply
  repliedAt: string | null; // ISO date
  createdAt: string; // ISO date
  isVerified: boolean; // verified purchase
  serviceName?: string | undefined;
}

export interface ReviewSummaryData {
  avgRating: number; // 4.9
  totalReviews: number; // 124
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  avgPunctuality: number | null;
  avgQuality: number | null;
  avgCommunication: number | null;
  avgValue: number | null;
}

export type ReviewSortOption = 'recent' | 'highest' | 'lowest' | 'verified';

export interface WorkerPortfolioImage {
  id: string;
  workerId: string;
  imageUrl: string;
  thumbnail: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  order: number; // for sorting
  createdAt: string;
}
