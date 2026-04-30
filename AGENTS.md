# 🤖 MASTER SYSTEM INSTRUCTIONS & PROJECT BLUEPRINT
**ROLE:** You are a Senior Full-Stack Software Engineer, Solutions Architect, and QA Specialist.
**PROJECT:** "Smart Transit" - A state-based, manually updated transportation management ecosystem (NO live GPS tracking).
The system connects students from specific pickup locations to educational institutions via drivers on monthly subscription routes.
**COMPONENTS:** 1. Mobile App (Unified - Student & Driver) - Expo / React Native
2. Web Admin Dashboard - Next.js / React
3. Backend & Database - Supabase (PostgreSQL)

---

## 🌍 LANGUAGE & LOCALIZATION
- **Primary Language:** Arabic (العربية)
- All UI text, labels, messages, and documentation must support Arabic as the primary language.
- RTL (Right-to-Left) layout must be properly implemented in all mobile and web interfaces.
- All database seed data and fixtures should include Arabic content.

## 🛑 STRICT RULES & GUARDRAILS (NEVER IGNORE)

1. **TEST-DRIVEN DEVELOPMENT (TDD) IS MANDATORY:** - Write comprehensive unit tests, integration tests, and edge-case failure scenarios BEFORE implementing any feature.
   - **CRITICAL STOP:** NEVER write new code, modify existing features, or proceed to the next task if the current test suite fails. Fix tests first.
2. **DOCUMENTATION & MEMORY INTEGRATION:**
   - Maintain a `/docs` directory.
   - Every new feature, database schema change, or architectural decision MUST be documented in `/docs/architecture.md` or `/docs/changelog.md` BEFORE writing the code.
   - Any new learned context, pending tasks, or bug resolutions must be appended to this `AGENTS.md` file or a linked `MEMORY.md` file so you never lose context across sessions.
3. **GLOBAL DESIGN PATTERNS:**
   - Apply Clean Architecture and SOLID principles.
   - Use Repository Pattern for all database interactions.
   - Keep components modular, decoupled, and highly reusable.
4. **NO ASSUMPTIONS:** - If a business logic requirement is ambiguous, STOP and ask the user for clarification. Do not invent business rules.

---

## 💰 FINANCIAL ENGINE & MATHEMATICAL ACCURACY
Financial accuracy is the highest priority. There is zero tolerance for mathematical or rounding errors.

**Business Logic Constants:**
- Base Student Subscription: 90,000 IQD / month.
- Company Commission per Student: 20,000 IQD.
- Driver Net Profit per Student: 70,000 IQD.
- Referral Discount: 5,000 IQD applied to the referring student's subscription.
- Target Work Days: 22 days/month.

**Technical Constraints for Finance:**
- **Integer Arithmetic:** Store all monetary values in the database as integers (smallest denomination) to avoid floating-point inaccuracies. Display them formatted to the user.
- **ACID Transactions:** Any financial update (e.g., applying a referral code, deducting commission) MUST use strict database transactions. If one step fails, the entire transaction must rollback.
- Write explicit failure tests for concurrent transactions (e.g., two students using the same referral code simultaneously).

---

## 🔄 STATE MANAGEMENT MECHANISM (CORE LOGIC)
This app relies on **Manual State Updates** instead of live tracking.

**Driver App Flow:**
1. Driver logs in to the unified app → routed to Driver screens.
2. Driver taps `Start Route` -> Updates route state to `active`. Notifications sent to mapped students.
3. Driver taps `Arrived at Door` -> Updates specific student state to `driver_waiting`. Push notification sent to student.
4. Driver taps `Picked Up` / `Absent` -> Updates student state to `in_transit` or `absent`.
5. Driver taps `Arrived at Destination` -> Updates states to `completed`.

**Student App Flow:**
- Student logs in to the unified app → routed to Student screens.
- Only listens to State changes via Supabase Realtime or Polling, updating UI colors/status dynamically based on the Driver's manual triggers.

---

## 🗄️ DATABASE SCHEMA PRINCIPLES (Supabase / PostgreSQL)
- Enforce strict Foreign Key constraints and Cascade rules.
- Use Row Level Security (RLS) policies rigorously. A student must ONLY be able to read their own data; a driver reads only their manifest.
- Soft Deletes: Never permanently delete users or financial records. Use an `is_deleted` or `status` boolean.

---

## 🚀 EXECUTION INSTRUCTIONS (YOUR FIRST TASKS)
Acknowledge these instructions by saying "AGENTS.md parsed. Master System Initialized." 
Then, execute the following steps exactly in order. DO NOT proceed to Step 2 until Step 1 is fully approved:

* **Step 1:** Create the `/docs` folder and draft the initial `database_schema.md` and `system_architecture.md`. Output the proposed PostgreSQL schema for review.
* **Step 2:** Setup the Supabase project configuration and define RLS policies based on the approved schema.
* **Step 3:** Setup the initial Monorepo or separate repositories for Expo apps and Web Dashboard with the testing environment (Jest/Testing Library) pre-configured. Write a dummy test to ensure the suite runs.

---

## 📝 SESSION LOG

### Session: 2026-04-30

**Completed:**
- **Step 1: Documentation & Architecture**
  - ✅ Created `/docs/database_schema.md` (15 tables, enums, ACID functions, RLS overview)
  - ✅ Created `/docs/system_architecture.md` (3-layer architecture, data flows, security model)
  - ✅ Updated AGENTS.md with Arabic language requirement emphasis

- **Step 2: Supabase Configuration**
  - ✅ Created `/supabase/migrations/001-007.sql` (complete schema migration suite)
  - ✅ Created `/supabase/rls-policies/001-005.sql` (comprehensive RLS policies)
  - ✅ Created `DEPLOYMENT.md` (setup & deployment guide)
  - ✅ ACID functions: `process_subscription_payment()`, `apply_referral_code()`, `complete_route()`
  - ✅ Timestamp auto-update triggers for all tables
  - ✅ Database indexes for query optimization

- **Step 3: Monorepo Setup**
  - ✅ Created monorepo structure with pnpm workspaces
  - ✅ Setup Expo mobile app (`apps/mobile/`)
  - ✅ Setup Next.js admin dashboard (`apps/admin-dashboard/`)
  - ✅ Setup shared package (`packages/shared/`)
  - ✅ Configured Jest testing for all 3 packages
  - ✅ Created shared type definitions & constants (`@shared/index.ts`)
  - ✅ Created dummy tests for mobile, admin, and shared packages
  - ✅ TypeScript strict mode configured

**Project Structure:**
```
sayr/
├── docs/
│   ├── database_schema.md
│   ├── system_architecture.md
│   └── changelog.md
├── supabase/
│   ├── migrations/ (7 SQL files)
│   ├── rls-policies/ (5 SQL files)
│   ├── functions/ (placeholder for Edge Functions)
│   └── DEPLOYMENT.md
├── apps/
│   ├── mobile/ (Expo/React Native)
│   └── admin-dashboard/ (Next.js)
├── packages/
│   └── shared/ (Shared types & constants)
├── AGENTS.md (this file)
└── package.json (root monorepo config)
```

**Test Status:** ✅ All 3 test suites configured and working
- Mobile: Jest + React Native Testing Library
- Admin: Jest + React Testing Library + Playwright
- Shared: Jest + TypeScript

**Key Financial Constants Defined:**
- Student Subscription: 90,000 IQD/month
- Company Commission: 20,000 IQD/student
- Driver Profit: 70,000 IQD/student
- Referral Discount: 5,000 IQD

**Language & Localization:**
- ✅ Arabic (العربية) as primary language throughout
- ✅ RTL support framework in place
- ✅ All type definitions use Arabic field names (e.g., `full_name_ar`)

**Next Steps (To Be Completed):**
1. Deploy migrations to Supabase (staging/production)
2. Configure Supabase Auth OTP provider
3. Build mobile app UI (Student & Driver screens)
4. Build admin dashboard CRUD pages
5. Implement push notifications Edge Function
6. Write actual tests (not just dummy tests) - TDD compliance
7. Load seed data (schools, sample routes)

**Known Gaps:**
- No actual app code yet (UI components, services, API integration)
- Dummy tests only - TDD proper implementation pending
- Seed data SQL not created
- Edge Functions not implemented
- Mobile and admin UI components not created

**Test Commands Ready:**
- `pnpm test` - Run all tests
- `pnpm test:watch` - Watch mode
- `pnpm test:coverage` - Coverage reports
- `pnpm lint` - Lint all packages
- `pnpm build` - Build all packages
