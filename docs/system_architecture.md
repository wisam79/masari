# Smart Transit System Architecture

**Last Updated:** April 30, 2026  
**Language:** Arabic (العربية) - Primary  
**Status:** Step 1 - Architecture Documentation

---

## 🏗️ System Overview

**Smart Transit** is a state-based transportation management ecosystem for connecting students to educational institutions. The system operates on **manual state updates** (not live GPS tracking) and enforces strict **financial accuracy** with zero tolerance for mathematical errors.

### Core Principle
Drivers manually update route and student states throughout the day → students receive real-time notifications → financial transactions are automatically calculated and recorded.

---

## 📦 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  ┌──────────────────────┬──────────────────────┐        │
│  │ Mobile App (Expo)    │ Web Dashboard (Next) │        │
│  │ - Student UI         │ - Admin CRUD         │        │
│  │ - Driver UI          │ - Analytics          │        │
│  │ - RTL Support        │ - Financial Reports  │        │
│  └──────────────────────┴──────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│                   Business Logic Layer                    │
│  ┌─────────────────────────────────────────┐            │
│  │ Services (Repositories + State Mgmt)     │            │
│  │ - SubscriptionService (finance)         │            │
│  │ - RouteService (state updates)          │            │
│  │ - NotificationService (push/email)      │            │
│  │ - AuthService (OTP, roles)              │            │
│  │ - FinancialService (ACID transactions)  │            │
│  └─────────────────────────────────────────┘            │
├─────────────────────────────────────────────────────────┤
│                    API Layer                             │
│  ┌──────────────────────┬──────────────────────┐        │
│  │ REST/GraphQL APIs    │ Supabase Realtime    │        │
│  │ - Auth Endpoints     │ - State subscriptions│        │
│  │ - CRUD Operations    │ - Notifications      │        │
│  │ - Financial Ops      │ - Updates            │        │
│  └──────────────────────┴──────────────────────┘        │
├─────────────────────────────────────────────────────────┤
│                  Data Access Layer                       │
│  ┌───────────────────────────────────────────┐          │
│  │ Supabase SDK / Repository Pattern         │          │
│  │ - User Repository                         │          │
│  │ - Student Repository                      │          │
│  │ - Driver Repository                       │          │
│  │ - Route Repository                        │          │
│  │ - Subscription/Payment Repository         │          │
│  │ - Notification Repository                 │          │
│  └───────────────────────────────────────────┘          │
├─────────────────────────────────────────────────────────┤
│              Database & External Services                │
│  ┌──────────────┬──────────────┬────────────────┐       │
│  │ PostgreSQL   │ Supabase     │ Push Service   │       │
│  │ (Supabase)   │ Auth         │ (FCM/APNS)     │       │
│  │ - Tables     │ - OTP        │ - Notifications│       │
│  │ - RLS        │ - Session    │                │       │
│  │ - Functions  │              │                │       │
│  └──────────────┴──────────────┴────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Architecture

### 1. Mobile App (Expo / React Native)
**Purpose:** Unified application for both students and drivers
**Language:** Arabic (RTL-first)

#### Student Features
- Login via OTP (phone-based)
- View assigned route & driver details
- Track real-time route status (via Realtime subscriptions)
  - Driver approaching → Green
  - Driver waiting at door → Yellow
  - Student in transit → Blue
  - Arrived at school → Completed
- View subscription history & balance
- Apply referral codes
- Contact driver

#### Driver Features
- Login via OTP
- View daily routes & assigned students
- Manual state transitions:
  1. **Start Route** → Route state changes to `active`
  2. **Arrived at Door** → Student state changes to `driver_waiting`
  3. **Picked Up / Absent** → Student state to `in_transit` or `absent`
  4. **Arrived at Destination** → Route state to `completed`
- Track daily earnings
- View payment history

#### Technical Stack
- **Framework:** Expo (React Native)
- **State Management:** Zustand (lightweight) or Redux (if complex)
- **API Client:** React Query + Supabase JS SDK
- **Realtime:** Supabase Realtime subscriptions
- **Push Notifications:** React Native Firebase / Expo Notifications
- **Localization:** i18n (Arabic/English) with RTL support
- **Styling:** NativeWind or Tailwind for RN

**Testing:** Jest + React Native Testing Library

---

### 2. Web Admin Dashboard (Next.js 14+)
**Purpose:** Administrative control, CRUD operations, financial reporting
**Language:** Arabic (RTL-first)

#### Admin Screens
- **Dashboard:** Overview of students, drivers, routes, revenue
- **User Management:**
  - Create/edit students
  - Create/edit drivers
  - Assign roles (student, driver, admin)
  - Approve drivers
- **Route Management:**
  - Create/assign routes to drivers
  - View daily routes
  - Monitor route status
- **Subscription Management:**
  - View student subscriptions
  - Apply discounts
  - Process manual payments
- **Financial Reports:**
  - Monthly revenue by driver
  - Commission tracking
  - Referral tracking
  - Outstanding payments
- **School Management:**
  - CRUD schools
  - Define pickup/dropoff locations
- **Settings:**
  - Rate configuration
  - Notification templates
  - System configuration

#### Technical Stack
- **Framework:** Next.js 14+ (App Router)
- **Backend:** Server Actions + API Routes
- **Database Client:** Supabase SDK (with service_role key for admin actions)
- **Authentication:** Next.js Auth (JWT from Supabase)
- **UI Library:** React + Tailwind CSS
- **Form Handling:** React Hook Form + Zod validation
- **Tables/Charts:** Tanstack React Table + Recharts/Chart.js
- **Localization:** i18n-next (RTL support)

**Testing:** Jest + React Testing Library + Playwright (E2E)

---

### 3. Backend Services (Supabase)
**Purpose:** Data persistence, authentication, real-time updates, financial transactions

#### Components

##### 3a. PostgreSQL Database
- 15+ tables with strict FK constraints
- RLS policies for row-level access control
- Stored procedures for ACID financial transactions
- Indexes for query performance
- Auto-updating timestamp triggers

##### 3b. Supabase Authentication
- OTP-based login (phone number)
- JWT token management
- Role management (student, driver, admin)
- Session handling

##### 3c. Supabase Realtime
- Route state subscriptions (students listening to driver updates)
- Notification subscriptions
- Live student list for drivers

##### 3d. Supabase Edge Functions
- Push notification trigger
- Payment processing webhooks
- Background job processing (if needed)

##### 3e. Stored Procedures (PL/pgSQL)
- `process_subscription_payment()` - ACID financial transaction
- `apply_referral_code()` - Atomic discount application
- `complete_route()` - Route completion with financial settlement

---

## 🔐 Security Architecture

### Authentication Flow
```
User Phone Number
    ↓
OTP Generation (via Supabase Auth)
    ↓
OTP Verification
    ↓
JWT Token Issued
    ↓
Stored in Device SecureStorage (mobile) / HttpOnly Cookie (web)
    ↓
All API calls include JWT Authorization header
```

### Authorization (RLS Policies)
```
┌─────────────────────────────────────────┐
│ Request with JWT + User ID              │
├─────────────────────────────────────────┤
│ RLS Policy Check:                       │
│ - Is this user allowed to READ table?   │
│ - Is this user allowed to UPDATE row?   │
├─────────────────────────────────────────┤
│ Allow or Deny based on Role + Row Data  │
└─────────────────────────────────────────┘
```

### Financial Security (ACID Transactions)
```
SQL TRANSACTION:
  1. BEGIN;
  2. Lock subscription row
  3. Validate amount
  4. Insert payment record
  5. Update driver commission
  6. Update student balance
  7. COMMIT or ROLLBACK (all-or-nothing)
```

---

## 📡 API Layer

### Authentication Endpoints
- `POST /auth/otp/send` → Send OTP to phone
- `POST /auth/otp/verify` → Verify OTP, return JWT
- `POST /auth/logout` → Invalidate session

### Student Endpoints
- `GET /students/me` → Get own profile
- `GET /students/me/route` → Get current route assignment
- `GET /students/me/subscriptions` → Get subscription history
- `POST /students/referral/apply` → Apply referral code
- `GET /students/notifications` → Get notification history

### Driver Endpoints
- `GET /drivers/me` → Get own profile
- `GET /drivers/me/routes/today` → Get today's routes
- `GET /drivers/routes/:id/assignments` → Get students on route
- `POST /drivers/routes/:id/start` → Start route
- `POST /drivers/routes/:id/complete` → Complete route
- `POST /drivers/assignments/:id/pickup` → Mark picked up
- `POST /drivers/assignments/:id/absent` → Mark absent
- `GET /drivers/me/earnings` → Get daily/monthly earnings

### Admin Endpoints
- `POST /admin/users` → Create user
- `GET /admin/users` → List users
- `PUT /admin/users/:id` → Update user
- `DELETE /admin/users/:id` → Soft delete user
- `POST /admin/subscriptions/:id/apply-discount` → Apply discount
- Similar CRUD for students, drivers, routes, schools, etc.

### Realtime Subscriptions
- `route-assignments:route_id` → Subscribe to route state changes
- `notifications:user_id` → Subscribe to new notifications
- `drivers:driver_id` → Subscribe to driver location updates

---

## 💰 Financial Flow

### Subscription Payment Flow
```
Student registers and gets monthly subscription → 90,000 IQD

                    ↓
            
        Payment processor (or manual entry)
        
                    ↓
        
    process_subscription_payment() ACID Transaction:
    - Validate subscription
    - Create payment record
    - Company gets: 20,000 IQD (commission)
    - Driver gets: 70,000 IQD (added to net_profit)
    - Update financial_summaries
    
                    ↓
        
    Student receives "Payment Confirmed" notification
    Driver receives earnings update notification
```

### Referral Discount Flow
```
Student A (referring) shares referral code with Student B

                    ↓
        
    Student B applies code during subscription
    
                    ↓
        
    apply_referral_code() ACID Transaction:
    - Validate code (active, has usage left)
    - Create subscription with 5,000 IQD discount
    - Final price: 85,000 IQD (instead of 90,000)
    - Increment code usage count
    - Update Student A's referral stats
    
                    ↓
    
    Both students notified of successful referral
```

---

## 🔄 State Management

### Route States
```
inactive → active → completed
           ↓
        cancelled
```

### Student (Route Assignment) States
```
pending → driver_waiting → in_transit → completed
   ↓                          ↓
absent                     (automatic)
```

### Subscription States
```
pending → paid → (monthly renewal)
   ↓
cancelled / refunded
```

---

## 📊 Data Flow Example: Driver Picks Up Student

```
1. Driver taps "Picked Up" button on Student Card
   └─ Mobile App calls: POST /drivers/assignments/:id/pickup
   
2. Backend updates route_assignments.status = 'in_transit'
   └─ Database triggers updated_at
   
3. Supabase Realtime publishes change to "route-assignments:route_id"
   
4. Student's app receives real-time update
   └─ UI changes color from Yellow to Blue
   └─ Shows notification: "تم التقاطك من قبل السائق"
   
5. Notification Queue triggered
   └─ Creates notification record for student
   └─ Edge Function sends push notification
   └─ Student receives: "Driver started driving you to school"
```

---

## 🧪 Testing Strategy

### Unit Tests
- Repository layer logic
- Service layer business rules
- Financial calculation accuracy
- Validation functions

### Integration Tests
- API endpoint flows (E2E request → database → response)
- ACID transaction correctness
- Concurrent transaction handling
- RLS policy enforcement

### E2E Tests
- Student login → view route → see driver → receive notification
- Driver login → start route → pickup student → complete route → earn money
- Admin dashboard CRUD operations

---

## 🚀 Deployment Architecture

### Development Environment
```
Local Machine:
- Supabase Local (Docker)
- Next.js Dev Server (http://localhost:3000)
- Expo Dev Server
- Jest test runner
```

### Staging Environment
```
Supabase Staging Project
- Staging database
- Staging auth configuration
- All staging secrets in .env.staging
```

### Production Environment
```
Supabase Production Project
- PostgreSQL (Managed)
- Production authentication
- SSL/TLS enabled
- Backups enabled
- RLS policies enforced
- Edge functions deployed
```

---

## 📋 Deployment Checklist

- [ ] Database schema migrated
- [ ] RLS policies enforced
- [ ] Stored procedures deployed
- [ ] Indexes created for performance
- [ ] Supabase Auth configuration (OTP settings)
- [ ] Push notification service configured
- [ ] Environment variables secured (.env.local, .env.production)
- [ ] Mobile app built and released
- [ ] Web dashboard deployed
- [ ] Admin account created
- [ ] Seed data loaded (schools, sample routes)
- [ ] Smoke tests passed
- [ ] Performance tested
- [ ] Security audit completed

---

## 🛠️ Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native / Expo |
| **Web** | Next.js 14+, React, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime) |
| **API** | REST / Supabase Realtime |
| **Authentication** | Supabase Auth (OTP) |
| **Database** | PostgreSQL (managed by Supabase) |
| **Push Notifications** | FCM (Android) / APNS (iOS) / Expo |
| **Testing** | Jest, React Testing Library, Playwright |
| **Language** | Arabic (Primary), English (Secondary) |
| **Localization** | i18n-next, React Native i18n |

---

## ✅ Next Steps (Step 2 & 3)

**Step 2:** Supabase Project Configuration
- Create Supabase project
- Deploy database schema
- Configure RLS policies
- Set up authentication
- Deploy Edge Functions

**Step 3:** Monorepo Setup
- Initialize monorepo structure (pnpm workspaces or yarn)
- Setup Expo app with testing
- Setup Next.js dashboard with testing
- Write dummy tests to verify test suite runs
- Configure CI/CD (GitHub Actions)

**Status:** ⏳ Awaiting approval before proceeding to Step 2
