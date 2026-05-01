import type { User } from './models';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface SubscriptionRequest {
  studentId: string;
  driverId: string;
  institutionId: string;
  amount: number;
  paymentMethod: 'zaincash' | 'fib' | 'cash' | 'other';
  paymentReference?: string;
  receiptImagePath?: string;
}

export interface AttendanceUpdate {
  studentId: string;
  status: 'pending' | 'present' | 'absent' | 'driver_waiting' | 'in_transit' | 'completed';
}

export interface LocationUpdate {
  driverId: string;
  lat: number;
  lng: number;
}
