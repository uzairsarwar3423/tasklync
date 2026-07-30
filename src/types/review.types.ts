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
  serviceName?: string;
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
