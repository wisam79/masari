import type { Database } from './Database';

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

export type DailyAttendance = Database['public']['Tables']['daily_attendance']['Row'];
export type DailyAttendanceInsert = Database['public']['Tables']['daily_attendance']['Insert'];
export type DailyAttendanceUpdate = Database['public']['Tables']['daily_attendance']['Update'];

export type Institution = Database['public']['Tables']['institutions']['Row'];
export type InstitutionInsert = Database['public']['Tables']['institutions']['Insert'];
export type InstitutionUpdate = Database['public']['Tables']['institutions']['Update'];

export type DriverInstitution = Database['public']['Tables']['driver_institutions']['Row'];
export type DriverInstitutionInsert = Database['public']['Tables']['driver_institutions']['Insert'];
export type DriverInstitutionUpdate = Database['public']['Tables']['driver_institutions']['Update'];

export type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];
export type StudentProfileInsert = Database['public']['Tables']['student_profiles']['Insert'];
export type StudentProfileUpdate = Database['public']['Tables']['student_profiles']['Update'];

export type StudentDriverLink = Database['public']['Tables']['student_driver_link']['Row'];
export type StudentDriverLinkInsert = Database['public']['Tables']['student_driver_link']['Insert'];
export type StudentDriverLinkUpdate = Database['public']['Tables']['student_driver_link']['Update'];

export type DriverLocation = Database['public']['Tables']['driver_locations']['Row'];
export type DriverLocationInsert = Database['public']['Tables']['driver_locations']['Insert'];
export type DriverLocationUpdate = Database['public']['Tables']['driver_locations']['Update'];
