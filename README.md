# 🚌 Smart Transit - Transportation Management System

**A state-based transportation management ecosystem connecting students to educational institutions via driver-operated routes.**

---

## 📋 Project Overview

**Smart Transit** is a comprehensive transportation solution that:
- ✅ Connects students from pickup locations to schools
- ✅ Manages drivers on monthly subscription routes
- ✅ Handles financial transactions with strict accuracy (ACID compliance)
- ✅ Provides real-time state updates (NOT GPS tracking)
- ✅ Supports Arabic as primary language with RTL layout
- ✅ Offers unified mobile app for students & drivers
- ✅ Includes admin dashboard for management & reporting

### Key Principles
- **State-Based:** Manual driver updates, not live GPS
- **Arabic-First:** All UI and database content primarily in Arabic
- **Zero-Trust Finance:** Integer arithmetic, ACID transactions, no floating-point errors
- **Privacy-First:** Row-level security policies on all data

---

## 🏗️ Project Structure

```
smart-transit/
├── docs/                    # Documentation
│   ├── database_schema.md   # PostgreSQL schema reference
│   ├── system_architecture.md # System design & data flows
│   └── changelog.md          # Version history
│
├── supabase/               # Database & backend configuration
│   ├── migrations/         # SQL migration files (001-007)
│   ├── rls-policies/       # Row-level security policies (001-005)
│   ├── functions/          # Edge Functions (placeholder)
│   └── DEPLOYMENT.md       # Setup & deployment guide
│
├── apps/
│   ├── mobile/             # Expo/React Native (Student & Driver)
│   │   ├── src/
│   │   ├── jest.config.js
│   │   ├── jest.setup.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── admin-dashboard/    # Next.js admin dashboard
│       ├── app/
│       ├── jest.config.js
│       ├── jest.setup.js
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   └── shared/             # Shared types, constants, utilities
│       ├── src/
│       │   ├── index.ts    # Exports all types & utilities
│       │   └── __tests__/
│       ├── jest.config.js
│       ├── tsconfig.json
│       └── package.json
│
├── AGENTS.md              # Master system instructions & session log
├── package.json           # Root monorepo config
└── README.md              # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+
- Supabase account or local setup
- Git

### Installation

```bash
# Clone repository
git clone <repo-url>
cd smart-transit

# Install dependencies (pnpm workspaces)
pnpm install

# Setup Supabase locally (optional)
npm install -g supabase
supabase start
```

### Environment Setup

Create `.env.local` in root:
```bash
# Supabase (local development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

---

## 📱 Components

### 1. Mobile App (Expo/React Native)
**Location:** `apps/mobile/`

**Features:**
- 🎓 **Student Features:** View routes, track status, apply referral codes
- 🚗 **Driver Features:** Manage routes, update student states, track earnings
- 🔐 **Auth:** OTP-based login (phone number)
- 🔔 **Notifications:** Push notifications for state changes
- 🌍 **Localization:** Arabic (RTL) & English

**Getting Started:**
```bash
pnpm -w -C apps/mobile install
pnpm -w -C apps/mobile start

# Test on Android
pnpm -w -C apps/mobile android

# Test on iOS
pnpm -w -C apps/mobile ios
```

### 2. Admin Dashboard (Next.js)
**Location:** `apps/admin-dashboard/`

**Features:**
- 👥 **User Management:** Create/manage students, drivers, admins
- 🛣️ **Route Management:** Create routes, assign students
- 💰 **Financial:** View payments, commissions, reports
- 🏫 **School Management:** Manage schools & locations
- 📊 **Analytics:** Dashboard with KPIs and charts

**Getting Started:**
```bash
pnpm -w -C apps/admin-dashboard install
pnpm -w -C apps/admin-dashboard dev
# Open http://localhost:3000
```

### 3. Shared Package
**Location:** `packages/shared/`

**Exports:**
- 🔤 Type definitions for all entities (User, Student, Driver, Route, etc.)
- 💰 Financial constants & utilities
- 🎯 Enums for statuses & roles
- 🛠️ Utility functions (price formatting, validation)

**Usage:**
```typescript
import { 
  UserRole, 
  RouteStatus, 
  FINANCIAL_CONSTANTS,
  User,
  calculateDriverProfit 
} from '@smart-transit/shared';
```

---

## 🧪 Testing

### Run All Tests
```bash
# Run tests in all packages
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Test Structure
- **Mobile:** `apps/mobile/src/__tests__/`
- **Admin:** `apps/admin-dashboard/__tests__/`
- **Shared:** `packages/shared/src/__tests__/`

### Writing Tests
All tests use **Jest**. Follow TDD: write tests first, then code.

```typescript
// Example test
describe('Financial Calculations', () => {
  it('should calculate driver profit correctly', () => {
    const profit = calculateDriverProfit(5); // 5 students
    expect(profit).toBe(5 * 70000); // 350,000 IQD
  });
});
```

---

## 💾 Database

### Schema Overview
- **15 Tables:** users, students, drivers, schools, routes, route_assignments, subscriptions, payments, referral_codes, push_tokens, notification_queue, admin_users, audit_logs, financial_summaries
- **ACID Functions:** `process_subscription_payment()`, `apply_referral_code()`, `complete_route()`
- **RLS Policies:** Row-level security on all tables
- **Indexes:** 15+ indexes for query optimization

### Deployment

**Local Development:**
```bash
supabase start
supabase db push
```

**Staging/Production:**
See `supabase/DEPLOYMENT.md` for detailed instructions.

### Database Schema
Full schema documentation: [database_schema.md](docs/database_schema.md)

---

## 💰 Financial System

### Constants (All in IQD)
| Item | Amount |
|------|--------|
| Student Subscription (monthly) | 90,000 |
| Company Commission (per student) | 20,000 |
| Driver Net Profit (per student) | 70,000 |
| Referral Discount | 5,000 |

### Transaction Flow
```
Student pays 90,000 IQD
    ↓
process_subscription_payment() [ACID]
    ├─ Create payment record
    ├─ Company receives 20,000 IQD commission
    ├─ Driver receives 70,000 IQD profit
    ├─ Update student subscription status
    └─ All-or-nothing commit
```

### Accuracy Guarantees
- ✅ All monetary values stored as integers (no floating-point errors)
- ✅ ACID transactions ensure atomicity
- ✅ Database constraints prevent invalid states
- ✅ Audit logs track all changes

---

## 🔐 Security

### Authentication
- **OTP-Based:** SMS verification via Supabase Auth
- **JWT Tokens:** Secure session management
- **Role-Based Access:** student, driver, admin, unassigned roles

### Authorization
- **Row-Level Security (RLS):** PostgreSQL policies enforce access control
- **Users see only their data** (students ↔ drivers ↔ admins)
- **Service role key** for admin operations

### Best Practices
- Never expose service_role key in client code
- Use anon key for public operations
- Store secrets in `.env.local` (never commit)
- Enable HTTPS in production
- Regular security audits

---

## 🌍 Language & Localization

### Arabic (العربية) First
- **Primary Language:** All UI text defaults to Arabic
- **RTL Layout:** Right-to-left layout in mobile & web
- **Database Fields:** Arabic field names (`full_name_ar`, `name_ar`, etc.)
- **i18n Setup:** i18n-next configured for English fallback

### English Support
- Secondary language option
- Fallback for missing Arabic translations

---

## 📝 API Documentation

### Authentication Endpoints
```
POST /auth/otp/send        → Send OTP to phone
POST /auth/otp/verify      → Verify OTP, return JWT
POST /auth/logout          → Invalidate session
```

### Student Endpoints
```
GET  /students/me          → Get own profile
GET  /students/me/route    → Get current route
GET  /students/subscriptions → Subscription history
POST /students/referral/apply → Apply referral code
```

### Driver Endpoints
```
GET  /drivers/me           → Get own profile
GET  /drivers/routes/today → Today's routes
POST /drivers/routes/:id/start → Start route
POST /drivers/routes/:id/complete → Complete route
POST /drivers/assignments/:id/pickup → Mark picked up
```

### Admin Endpoints
```
POST /admin/users          → Create user
GET  /admin/users          → List all users
PUT  /admin/users/:id      → Update user
DELETE /admin/users/:id    → Soft delete user
```

---

## 🛠️ Development Workflow

### Branch Strategy
```
main (production)
  ↓
staging (pre-production)
  ↓
develop (development)
  ↓
feature/* (feature branches)
```

### Commit Messages
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
test: Add/update tests
refactor: Code refactoring
chore: Maintenance
```

### Code Quality
```bash
pnpm lint        # Run linter on all packages
pnpm build       # Build all packages
pnpm test:ci     # Run tests with coverage
```

---

## 📚 Documentation

- [Database Schema](docs/database_schema.md) - Complete PostgreSQL reference
- [System Architecture](docs/system_architecture.md) - Design & data flows
- [Deployment Guide](supabase/DEPLOYMENT.md) - Setup & deployment
- [AGENTS.md](AGENTS.md) - Master system instructions & session log

---

## 🤝 Contributing

### Development Checklist
- [ ] Create feature branch (`git checkout -b feature/my-feature`)
- [ ] Write tests first (TDD)
- [ ] Implement feature
- [ ] Run all tests (`pnpm test`)
- [ ] Update docs if needed
- [ ] Create pull request with clear description

### Test-Driven Development (TDD)
**CRITICAL:** Always write tests BEFORE code. See [AGENTS.md](AGENTS.md) Rule #1.

---

## 🐛 Known Issues & Gaps

- Admin-created users don't auto-create in `auth.users` (manual creation needed)
- Seed data SQL not yet created
- Edge Functions for push notifications not deployed
- UI components for mobile & admin not yet built
- Tests are currently dummy tests (framework validation only)

---

## 📞 Support & Contact

For questions or issues:
1. Check documentation in `/docs`
2. Review [AGENTS.md](AGENTS.md) for context
3. Check `.env` configuration
4. Review test files for examples

---

## 📄 License

Smart Transit - All Rights Reserved

---

## 🗓️ Version History

**v1.0.0 (2026-04-30)** - Initial project setup
- Project structure created
- Database schema designed
- Supabase configuration setup
- Testing framework configured
- Documentation completed
