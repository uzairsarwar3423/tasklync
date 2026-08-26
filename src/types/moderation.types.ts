/**
 * Moderation & Account Control Types (Day 38)
 */

export interface BlockedWorker {
  id: string;
  worker_id: string;
  name: string;
  avatar_url?: string;
  category?: string;
  blocked_at: string; // ISO timestamp
  reason?: string;
  active_booking_id?: string;
}

export type BlockReason =
  | 'unprofessional'
  | 'made_me_uncomfortable'
  | 'poor_quality_work'
  | 'other';

export interface BlockReasonOption {
  key: BlockReason;
  label: string;
  description?: string;
}

export type DeleteAccountReason =
  | 'found_better_app'
  | 'too_expensive'
  | 'did_not_need'
  | 'privacy_concerns'
  | 'other';

export interface DeleteAccountReasonOption {
  key: DeleteAccountReason;
  label: string;
}

export interface DeleteAccountPayload {
  reason?: string;
  feedback?: string;
  confirmation: 'DELETE';
}

export interface BookingHistoryFilter {
  year?: number | 'all';
  category?: string | 'all';
}
