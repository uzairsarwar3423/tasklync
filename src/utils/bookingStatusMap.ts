import { BookingStatus } from '../types/booking.types';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PlayCircle, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react-native';

export interface BookingStatusConfig {
  color: string;
  icon: React.ElementType;
  label: string;
}

export const bookingStatusMap: Record<BookingStatus, BookingStatusConfig> = {
  PENDING: { color: '#F59E0B', icon: Clock, label: 'Pending' },
  ACCEPTED: { color: '#3B82F6', icon: CheckCircle2, label: 'Accepted' },
  REJECTED: { color: '#EF4444', icon: XCircle, label: 'Rejected' },
  IN_PROGRESS: { color: '#10B981', icon: PlayCircle, label: 'In Progress' },
  COMPLETED_BY_WORKER: { color: '#10B981', icon: CheckCircle, label: 'Completed by Worker' },
  COMPLETED: { color: '#6B7280', icon: CheckCircle, label: 'Completed' },
  AUTO_COMPLETED: { color: '#6B7280', icon: CheckCircle, label: 'Completed' },
  DISPUTED: { color: '#EF4444', icon: AlertTriangle, label: 'Disputed' },
  RESOLVED: { color: '#10B981', icon: CheckCircle, label: 'Resolved' },
  REFUNDED: { color: '#6B7280', icon: CheckCircle, label: 'Refunded' },
  CANCELLED: { color: '#EF4444', icon: XCircle, label: 'Cancelled' },
};
