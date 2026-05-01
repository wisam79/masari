# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-05-01

### Added
- Initial project setup
- Supabase project "masari" created (ID: ncffmgqqyxvggqhlhgmz)
- Database schema with 5 tables:
  - `users`: User information
  - `subscriptions`: Subscription management
  - `daily_attendance`: Attendance tracking
  - `student_driver_link`: Student-driver relationships
  - `driver_locations`: Driver location updates
- Row Level Security (RLS) policies on all tables
- TypeScript types generated from Supabase schema
- Authentication system with phone OTP
- Role-based routing (student/driver)
- Repository pattern for data access
- Service layer for business logic
- Zustand store for state management
- Custom hooks for authentication
- Expo Router navigation
- Student tabs (Home, Subscription, Attendance, Profile)
- Driver tabs (Home, Students, Route, Profile)
- Utility functions for formatting and validation
- Jest configuration for testing
- ESLint configuration with TypeScript rules

### Database
- Created 5 tables with proper relationships
- Added 15 indexes for performance
- Added 7 triggers for auto-updating timestamps
- Implemented RLS policies for security
- Foreign key constraints with CASCADE deletes

### Features
- Phone-based authentication with OTP
- Role selection for new users
- Automatic routing based on user role
- Sign out functionality
- Loading states
- Error handling

### Documentation
- Database schema documentation
- System architecture documentation
- Step-by-step completion guides
- README with getting started guide

### Configuration
- TypeScript configuration with strict mode
- Expo configuration
- Babel configuration
- Jest configuration
- ESLint configuration
- Environment variables template

---

## [Unreleased]

### Planned
- Subscription management with file upload
- Location polling and tracking
- Real-time attendance updates
- Push notifications
- Admin dashboard