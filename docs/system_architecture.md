# System Architecture - مساري (Masari)

## Overview
Masari is a mobile-first transportation management system connecting university students with monthly bus subscription drivers. The system uses a state-based approach where drivers manually update trip status, and students receive real-time notifications.

---

## Technology Stack

### Frontend (Mobile App)
- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand + TanStack React Query
- **Maps & Location**: react-native-maps, expo-location
- **Styling**: NativeWind / StyleSheet

### Backend / BaaS
- **Database**: Supabase (PostgreSQL 17)
- **Authentication**: Supabase Auth (Phone OTP)
- **Storage**: Supabase Storage (Receipt images)
- **Realtime**: Supabase Realtime (Status updates)
- **Edge Functions**: Supabase Edge Functions (Push notifications)

### Development Tools
- **Package Manager**: npm / yarn
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Testing**: Jest + React Native Testing Library

---

## Architecture Patterns

### 1. Clean Architecture
```
┌─────────────────────────────────────────┐
│           Presentation Layer              │
│  (UI Components, Screens, Navigation)    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         Business Logic Layer             │
│  (Custom Hooks, Services, State)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           Data Access Layer              │
│  (Repository Pattern, Supabase Client)  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│            Infrastructure Layer           │
│  (Supabase, Storage, Auth, Realtime)     │
└─────────────────────────────────────────┘
```

### 2. Repository Pattern
All database interactions go through repository classes:
- `UserRepository`: User data operations
- `SubscriptionRepository`: Subscription management
- `AttendanceRepository`: Attendance tracking
- `DriverLocationRepository`: Location updates
- `StudentDriverLinkRepository`: Student-driver relationships

### 3. Separation of Concerns (SoC)
- **UI Components**: Pure presentation logic
- **Custom Hooks**: Business logic and state management
- **Services**: Complex business operations
- **Repositories**: Data access abstraction

---

## Project Structure

```
masari/
├── app/                          # Expo Router pages
│   ├── (auth)/                  # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Phone input
│   │   └── otp.tsx              # OTP verification
│   ├── (student_tabs)/          # Student tab navigation
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── subscription.tsx
│   │   └── attendance.tsx
│   ├── (driver_tabs)/           # Driver tab navigation
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── students.tsx
│   │   └── route.tsx
│   ├── role-selection.tsx       # Role selection screen
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── common/                  # Shared components
│   ├── student/                 # Student-specific components
│   └── driver/                  # Driver-specific components
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Authentication logic
│   ├── useSubscription.ts      # Subscription management
│   ├── useAttendance.ts        # Attendance tracking
│   ├── useLocation.ts          # Location polling
│   └── usePushNotifications.ts # Push notifications
├── services/                    # Business logic services
│   ├── AuthService.ts
│   ├── SubscriptionService.ts
│   ├── AttendanceService.ts
│   ├── LocationService.ts
│   └── NotificationService.ts
├── repositories/                # Data access layer
│   ├── UserRepository.ts
│   ├── SubscriptionRepository.ts
│   ├── AttendanceRepository.ts
│   ├── DriverLocationRepository.ts
│   └── StudentDriverLinkRepository.ts
├── store/                       # Zustand stores
│   ├── authStore.ts
│   ├── subscriptionStore.ts
│   └── attendanceStore.ts
├── types/                       # TypeScript types
│   ├── Database.ts             # Supabase generated types
│   ├── models.ts               # Application models
│   └── api.ts                  # API response types
├── utils/                       # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
├── lib/                         # External library configs
│   ├── supabase.ts             # Supabase client
│   └── navigation.ts           # Navigation helpers
├── docs/                        # Documentation
│   ├── database_schema.md
│   └── system_architecture.md
├── assets/                      # Static assets
│   ├── images/
│   └── fonts/
├── package.json
├── tsconfig.json
├── app.json
└── README.md
```

---

## Core Features Implementation

### 1. Authentication Flow

#### Student Flow
```
Phone Input → OTP Verification → Role Selection → Student Dashboard
```

#### Driver Flow
```
Phone Input → OTP Verification → Role Selection → Driver Dashboard
```

#### Implementation Details
- **Phone Auth**: Supabase Auth with OTP
- **Session Management**: Supabase Auth session
- **Role Assignment**: User selects role after first login
- **Persistence**: Secure storage for session tokens

### 2. Subscription Management

#### Student Side
1. Student uploads receipt image to Supabase Storage
2. Creates subscription record with `status: 'pending'`
3. Waits for driver approval
4. Receives notification when approved

#### Driver Side
1. Views pending subscriptions
2. Reviews receipt image
3. Approves or rejects subscription
4. If approved, sets `start_date` and `end_date` (30 days)

#### Implementation Details
- **File Upload**: Supabase Storage with bucket `receipts`
- **Status Updates**: Supabase Realtime for live updates
- **Notifications**: Push notifications via Edge Functions
- **Validation**: Image format and size validation

### 3. Location Polling

#### Smart Polling Strategy
```
Normal Mode: Every 5-10 minutes
Near Student: Every 1 minute
```

#### Distance Calculation
```typescript
function shouldIncreasePolling(driverLat, driverLng, studentLat, studentLng) {
  const distance = calculateDistance(driverLat, driverLng, studentLat, studentLng);
  return distance < 500; // 500 meters threshold
}
```

#### Implementation Details
- **Location Updates**: `expo-location` for GPS
- **Polling Logic**: Custom hook with dynamic intervals
- **Database Storage**: `driver_locations` table
- **Optimization**: Background task management

### 4. Attendance Management

#### Driver Flow
1. Driver taps "Start Route" → Updates route state to `active`
2. Driver taps "Arrived at Door" → Updates student state to `driver_waiting`
3. Driver taps "Picked Up" → Updates student state to `in_transit`
4. Driver taps "Arrived at Destination" → Updates student state to `completed`

#### Student Flow
1. Student taps "Mark Absent" → Updates state to `absent`
2. Student disappears from driver's route list

#### Implementation Details
- **State Management**: Zustand for local state
- **Realtime Updates**: Supabase Realtime subscriptions
- **Push Notifications**: Edge Functions for status changes
- **History Tracking**: `daily_attendance` table

---

## Data Flow Diagrams

### Subscription Approval Flow
```
Student App                    Supabase                    Driver App
    |                            |                            |
    |-- Upload Receipt -------->|                            |
    |                            |-- Store Image ------------>|-- Review Receipt
    |                            |                            |
    |                            |<-- Approve/Reject ---------|
    |<-- Notification -----------|                            |
    |                            |                            |
    |-- Update Status ---------->|                            |
    |                            |-- Realtime Update -------->|
```

### Location Polling Flow
```
Driver App                    Supabase                    Student App
    |                            |                            |
    |-- Get Location ---------->|                            |
    |                            |-- Store Location ---------->|
    |                            |                            |
    |<-- Check Distance --------|                            |
    |                            |                            |
    |-- Adjust Polling Rate --->|                            |
    |                            |                            |
    |<-- Realtime Update -------|                            |
```

### Attendance Update Flow
```
Driver App                    Supabase                    Student App
    |                            |                            |
    |-- Update Status ---------->|                            |
    |                            |-- Realtime Update -------->|
    |                            |                            |
    |                            |<-- Notification -----------|
    |                            |                            |
    |                            |-- Update UI --------------->|
```

---

## Security Considerations

### 1. Authentication
- Phone-based authentication with OTP
- Secure session management
- Token refresh handling

### 2. Data Access
- Row Level Security (RLS) on all tables
- User-specific data isolation
- No cross-user data access

### 3. API Security
- Supabase client with proper keys
- Anon key for client-side operations
- Service role key for admin operations

### 4. Storage Security
- Private storage buckets
- Signed URLs for image access
- File size and type validation

---

## Performance Optimization

### 1. Database
- Indexed columns for fast queries
- Optimized RLS policies
- Connection pooling

### 2. Mobile App
- Lazy loading of screens
- Image caching
- Background task optimization

### 3. Realtime
- Selective subscriptions
- Debounced updates
- Offline support

---

## Error Handling

### 1. Network Errors
- Retry logic with exponential backoff
- Offline mode support
- User-friendly error messages

### 2. Validation Errors
- Form validation before submission
- Clear error messages
- Input sanitization

### 3. Business Logic Errors
- Transaction rollback on failure
- Consistent state management
- Error logging

---

## Testing Strategy

### 1. Unit Tests
- Repository methods
- Service functions
- Utility functions

### 2. Integration Tests
- API endpoints
- Database operations
- Authentication flow

### 3. E2E Tests
- User flows
- Critical paths
- Error scenarios

---

## Deployment

### 1. Mobile App
- Expo EAS Build
- App Store (iOS)
- Play Store (Android)

### 2. Backend
- Supabase Cloud
- Edge Functions deployment
- Storage bucket configuration

### 3. CI/CD
- GitHub Actions
- Automated testing
- Deployment pipelines

---

## Monitoring & Logging

### 1. Application Logs
- Error tracking
- Performance metrics
- User activity

### 2. Database Logs
- Query performance
- Slow query detection
- Connection monitoring

### 3. User Analytics
- Feature usage
- Error rates
- Performance metrics

---

## Future Enhancements

### 1. Advanced Features
- Live GPS tracking (optional)
- Route optimization
- Multi-stop routes
- Payment integration

### 2. Admin Dashboard
- Web-based admin panel
- User management
- Analytics dashboard
- Revenue tracking

### 3. Notifications
- In-app notifications
- Email notifications
- SMS notifications

---

## Documentation

### Code Documentation
- JSDoc comments for functions
- TypeScript types for interfaces
- README for each module

### API Documentation
- Supabase API reference
- Edge Functions documentation
- Storage API reference

### User Documentation
- User guide
- Driver guide
- FAQ section

---

## Development Guidelines

### 1. Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting

### 2. Git Workflow
- Feature branches
- Pull request reviews
- Semantic versioning

### 3. Code Review
- Peer review required
- Automated checks
- Security review

---

## Conclusion

This architecture provides a solid foundation for building a scalable, maintainable, and secure transportation management system. The clean separation of concerns, repository pattern, and comprehensive error handling ensure the application can grow and evolve over time.