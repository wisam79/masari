/**
 * Application configuration constants.
 */
export const APP_CONFIG = {
  NAME: 'مساري',
  VERSION: '1.0.0',
} as const;

/**
 * User roles available in the system.
 */
export const USER_ROLES = {
  STUDENT: 'student',
  DRIVER: 'driver',
  UNASSIGNED: 'unassigned',
} as const;

/**
 * Subscription status states.
 */
export const SUBSCRIPTION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REJECTED: 'rejected',
} as const;

/**
 * Attendance status states.
 */
export const ATTENDANCE_STATUS = {
  PENDING: 'pending',
  PRESENT: 'present',
  ABSENT: 'absent',
  DRIVER_WAITING: 'driver_waiting',
  IN_TRANSIT: 'in_transit',
  COMPLETED: 'completed',
} as const;

/**
 * Financial calculation constants.
 */
export const FINANCIAL = {
  BASE_SUBSCRIPTION: 90000,
  COMPANY_COMMISSION: 20000,
  DRIVER_PROFIT: 70000,
  REFERRAL_DISCOUNT: 5000,
  WORK_DAYS: 22,
} as const;

export const PAYMENT_METHODS = {
  ZAINCASH: 'zaincash',
  FIB: 'fib',
  CASH: 'cash',
  OTHER: 'other',
} as const;

/**
 * Location tracking and proximity constants.
 */
export const LOCATION = {
  NORMAL_POLLING_INTERVAL: 5 * 60 * 1000,
  FAST_POLLING_INTERVAL: 1 * 60 * 1000,
  PROXIMITY_THRESHOLD: 500,
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type SubscriptionStatus = typeof SUBSCRIPTION_STATUS[keyof typeof SUBSCRIPTION_STATUS];
export type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];
export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];