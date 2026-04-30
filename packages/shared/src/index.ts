/**
 * Smart Transit Shared Package
 * Common types, constants, and utilities shared across mobile and admin apps
 */

// Financial Constants (All in IQD - Iraqi Dinar)
export const FINANCIAL_CONSTANTS = {
  STUDENT_SUBSCRIPTION_MONTHLY: 90000, // IQD
  COMPANY_COMMISSION_PER_STUDENT: 20000, // IQD
  DRIVER_NET_PROFIT_PER_STUDENT: 70000, // IQD
  REFERRAL_DISCOUNT: 5000, // IQD
  TARGET_WORK_DAYS_PER_MONTH: 22,
} as const;

// User Roles
export enum UserRole {
  Student = 'student',
  Driver = 'driver',
  Admin = 'admin',
  Unassigned = 'unassigned',
}

// Route Statuses
export enum RouteStatus {
  Inactive = 'inactive',
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

// Assignment Statuses (Route Assignment States)
export enum AssignmentStatus {
  Pending = 'pending',
  DriverWaiting = 'driver_waiting',
  InTransit = 'in_transit',
  Completed = 'completed',
  Absent = 'absent',
}

// Subscription Statuses
export enum SubscriptionStatus {
  Pending = 'pending',
  Paid = 'paid',
  Cancelled = 'cancelled',
  Refunded = 'refunded',
}

// Interfaces
export interface User {
  id: string;
  role: UserRole;
  phone_number?: string;
  full_name_ar: string;
  full_name_en?: string;
  profile_picture_url?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Student extends User {
  school_id?: string;
  parent_phone?: string;
  parent_name_ar?: string;
  home_location_address_ar?: string;
  home_location_latitude?: number;
  home_location_longitude?: number;
  monthly_subscription_status: SubscriptionStatus;
  referral_code?: string;
  referred_by_student_id?: string;
}

export interface Driver extends User {
  vehicle_plate_number: string;
  vehicle_color_ar?: string;
  vehicle_capacity: number;
  national_id_number: string;
  bank_account_number?: string;
  total_routes_completed: number;
  total_students_served: number;
  net_profit_iqd: number;
  is_approved: boolean;
}

export interface Route {
  id: string;
  driver_id: string;
  school_id: string;
  route_name_ar: string;
  status: RouteStatus;
  estimated_pickup_start_time?: string;
  estimated_pickup_end_time?: string;
  estimated_arrival_time?: string;
  total_students_assigned: number;
  total_students_present: number;
  total_students_absent: number;
  gross_revenue_iqd: number;
  route_date: string;
  created_at: string;
  updated_at: string;
}

export interface RouteAssignment {
  id: string;
  route_id: string;
  student_id: string;
  status: AssignmentStatus;
  driver_arrived_at_door_time?: string;
  pickup_time?: string;
  dropoff_time?: string;
  is_absent: boolean;
  absence_reason_ar?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  student_id: string;
  subscription_month: string;
  base_price_iqd: number;
  discount_iqd: number;
  final_price_iqd: number;
  status: SubscriptionStatus;
  payment_date?: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title_ar: string;
  title_en?: string;
  body_ar: string;
  body_en?: string;
  notification_type: string;
  related_entity_id?: string;
  related_entity_type?: string;
  is_sent: boolean;
  sent_at?: string;
  created_at: string;
}

// Utility Functions
export function calculateStudentPrice(
  basePrice: number = FINANCIAL_CONSTANTS.STUDENT_SUBSCRIPTION_MONTHLY,
  discountAmount: number = 0
): number {
  return basePrice - discountAmount;
}

export function calculateDriverProfit(numberOfStudents: number): number {
  return numberOfStudents * FINANCIAL_CONSTANTS.DRIVER_NET_PROFIT_PER_STUDENT;
}

export function calculateCompanyCommission(numberOfStudents: number): number {
  return numberOfStudents * FINANCIAL_CONSTANTS.COMPANY_COMMISSION_PER_STUDENT;
}

export function isValidPhone(phone: string): boolean {
  // Basic validation for Iraqi phone numbers
  return /^(\+964|964|0)?[0-9]{10}$/.test(phone.replace(/\s/g, ''));
}

export function formatPrice(priceInIQD: number): string {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
  }).format(priceInIQD);
}
