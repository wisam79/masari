import type { Database } from './Database';

/** Represents a user in the system (e.g., student or driver) */
export type User = Database['public']['Tables']['users']['Row'];
/** Payload for inserting a new user */
export type UserInsert = Database['public']['Tables']['users']['Insert'];
/** Payload for updating an existing user */
export type UserUpdate = Database['public']['Tables']['users']['Update'];

/** Represents a subscription between a student and a driver */
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
/** Payload for inserting a new subscription */
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
/** Payload for updating an existing subscription */
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

/** Represents a daily attendance record for a student */
export type DailyAttendance = Database['public']['Tables']['daily_attendance']['Row'];
/** Payload for inserting a new daily attendance record */
export type DailyAttendanceInsert = Database['public']['Tables']['daily_attendance']['Insert'];
/** Payload for updating an existing daily attendance record */
export type DailyAttendanceUpdate = Database['public']['Tables']['daily_attendance']['Update'];

/** Represents an educational institution */
export type Institution = Database['public']['Tables']['institutions']['Row'];
/** Payload for inserting a new institution */
export type InstitutionInsert = Database['public']['Tables']['institutions']['Insert'];
/** Payload for updating an existing institution */
export type InstitutionUpdate = Database['public']['Tables']['institutions']['Update'];

/** Represents an association between a driver and an institution */
export type DriverInstitution = Database['public']['Tables']['driver_institutions']['Row'];
/** Payload for inserting a driver-institution link */
export type DriverInstitutionInsert = Database['public']['Tables']['driver_institutions']['Insert'];
/** Payload for updating a driver-institution link */
export type DriverInstitutionUpdate = Database['public']['Tables']['driver_institutions']['Update'];

/** Represents a student's profile details */
export type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];
/** Payload for inserting a new student profile */
export type StudentProfileInsert = Database['public']['Tables']['student_profiles']['Insert'];
/** Payload for updating an existing student profile */
export type StudentProfileUpdate = Database['public']['Tables']['student_profiles']['Update'];

/** Represents an active link between a student and a driver */
export type StudentDriverLink = Database['public']['Tables']['student_driver_link']['Row'];
/** Payload for inserting a new student-driver link */
export type StudentDriverLinkInsert = Database['public']['Tables']['student_driver_link']['Insert'];
/** Payload for updating an existing student-driver link */
export type StudentDriverLinkUpdate = Database['public']['Tables']['student_driver_link']['Update'];

/** Represents a driver's current or last known location */
export type DriverLocation = Database['public']['Tables']['driver_locations']['Row'];
/** Payload for inserting a new driver location */
export type DriverLocationInsert = Database['public']['Tables']['driver_locations']['Insert'];
/** Payload for updating an existing driver location */
export type DriverLocationUpdate = Database['public']['Tables']['driver_locations']['Update'];
