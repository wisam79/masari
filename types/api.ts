import type { PaymentMethod, AttendanceStatus } from '../lib/constants';
import type { User } from './models';

/**
 * Standard API response wrapper
 * @template T The type of the response data
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response wrapper
 * @template T The type of the paginated items
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Authentication response payload
 */
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Request payload for creating or updating a subscription
 */
export interface SubscriptionRequest {
  studentId: string;
  driverId: string;
  institutionId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  receiptImagePath?: string;
}

/**
 * Request payload for updating a student's daily attendance
 */
export interface AttendanceUpdate {
  studentId: string;
  status: AttendanceStatus;
}

/**
 * Request payload for updating a driver's current location
 */
export interface LocationUpdate {
  driverId: string;
  lat: number;
  lng: number;
}
