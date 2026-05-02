import { SUBSCRIPTION_STATUS, ATTENDANCE_STATUS, PAYMENT_METHODS } from '../lib/constants';

const subscriptionStatusMap: Record<string, string> = {
  [SUBSCRIPTION_STATUS.ACTIVE]: 'فعّال',
  [SUBSCRIPTION_STATUS.PENDING]: 'بانتظار المراجعة',
  [SUBSCRIPTION_STATUS.REJECTED]: 'مرفوض',
  [SUBSCRIPTION_STATUS.EXPIRED]: 'منتهي',
};

const attendanceStatusMap: Record<string, string> = {
  [ATTENDANCE_STATUS.PRESENT]: 'حاضر',
  [ATTENDANCE_STATUS.ABSENT]: 'غائب اليوم',
  [ATTENDANCE_STATUS.DRIVER_WAITING]: 'السائق بانتظارك',
  [ATTENDANCE_STATUS.IN_TRANSIT]: 'تم الصعود',
  [ATTENDANCE_STATUS.COMPLETED]: 'اكتملت الرحلة',
  [ATTENDANCE_STATUS.PENDING]: 'بانتظار التحديث',
};

const driverAttendanceStatusMap: Record<string, string> = {
  [ATTENDANCE_STATUS.PRESENT]: 'حاضر',
  [ATTENDANCE_STATUS.ABSENT]: 'غائب',
  [ATTENDANCE_STATUS.DRIVER_WAITING]: 'السائق وصل',
  [ATTENDANCE_STATUS.IN_TRANSIT]: 'داخل الباص',
  [ATTENDANCE_STATUS.COMPLETED]: 'مكتمل',
  [ATTENDANCE_STATUS.PENDING]: 'بانتظار',
};

const paymentMethodMap: Record<string, string> = {
  [PAYMENT_METHODS.ZAINCASH]: 'زين كاش',
  [PAYMENT_METHODS.FIB]: 'FIB',
  [PAYMENT_METHODS.CASH]: 'نقداً',
  [PAYMENT_METHODS.OTHER]: 'أخرى',
};

export function translateSubscriptionStatus(status: string): string {
  return subscriptionStatusMap[status] ?? status;
}

export function translateAttendanceStatus(status: string): string {
  return attendanceStatusMap[status] ?? 'بانتظار التحديث';
}

export function translateDriverAttendanceStatus(status: string): string {
  return driverAttendanceStatusMap[status] ?? 'بانتظار';
}

export function translatePaymentMethod(method: string): string {
  return paymentMethodMap[method] ?? 'أخرى';
}
