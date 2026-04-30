# Supabase Configuration & Deployment Guide

**Project:** Smart Transit  
**Last Updated:** April 30, 2026

---

## 📋 Pre-Deployment Checklist

- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] PostgreSQL 15+ requirements met
- [ ] All migration files reviewed and approved
- [ ] RLS policies tested in development environment
- [ ] Backup strategy defined

---

## 🚀 Deployment Steps

### Step 1: Initialize Local Supabase (Development)

```bash
# Install Supabase CLI
npm install -g supabase

# Create a new Supabase project locally
supabase init smart-transit

# Start local PostgreSQL and Supabase services
supabase start
```

### Step 2: Apply Migrations Locally

```bash
# Run all migrations in order
supabase db pull  # Sync existing schema
supabase migration new create_base_schema
supabase db push  # Apply migrations locally
```

**Migration Execution Order:**
1. `001_create_users_and_roles.sql` - Base user system
2. `002_create_schools_and_students.sql` - Student data
3. `003_create_drivers.sql` - Driver data
4. `004_create_routes_and_assignments.sql` - Route management
5. `005_create_financial_tables.sql` - Financial tracking
6. `006_create_notifications_admin_audit.sql` - Notifications & Admin
7. `007_create_acid_functions.sql` - Transaction functions

### Step 3: Apply RLS Policies Locally

```bash
# Apply RLS policies in order
supabase sql 001_users_rls.sql
supabase sql 002_students_rls.sql
supabase sql 003_routes_rls.sql
supabase sql 004_financial_rls.sql
supabase sql 005_notifications_rls.sql
```

### Step 4: Test Locally

```bash
# Run tests against local database
npm test

# Manual testing:
# - Create test user via OTP
# - Create student/driver records
# - Verify RLS policies work
# - Test financial functions
```

### Step 5: Deploy to Staging

```bash
# Create staging Supabase project via web console
# Get staging project URL and anon key

# Push to staging
supabase link --project-ref your-staging-project-id
supabase db push --linked
```

### Step 6: Deploy to Production

```bash
# Create production Supabase project via web console
# Enable point-in-time backups

# Link and push
supabase link --project-ref your-prod-project-id
supabase db push --linked

# Verify deployed schema and policies
supabase db show --linked
```

---

## 🔐 Security Configuration

### Supabase Auth Settings

1. **OTP Provider:**
   - Go to Supabase Console → Authentication → Providers
   - Enable "Phone" provider
   - Configure SMS provider (Twilio or local dev)

2. **JWT Configuration:**
   - JWT Expiry: 3600 seconds (1 hour)
   - Refresh Token: 604800 seconds (7 days)

3. **Email/SMS Templates:**
   - Customize OTP message in Arabic
   - Template: "رمز التحقق الخاص بك هو: {{.Code}}"

### RLS Policies Validation

```sql
-- Test policy: Students can only read their own data
SELECT * FROM public.users WHERE auth.uid() != id;
-- Should return 0 rows (for non-admin users)

-- Test policy: Admins can read all
-- Login as admin, verify you can read all records
```

---

## 🌐 Supabase Project Configuration

### Environment Variables

Create `.env.local` for development:
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Create `.env.production` for production:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<actual-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<actual-service-role-key>
```

### Database Connection Settings

**Pooler Settings (PgBouncer):**
- Session mode: Use for web apps
- Min pool size: 0
- Max pool size: 10

**Connection Limits:**
- Max connections: 100 (default)
- Adjust based on expected concurrent users

---

## 📊 Database Monitoring

### Enable Query Performance Monitoring

```sql
-- Enable pg_stat_statements extension
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Query performance
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

### Indexes to Monitor

Key indexes created:
- `idx_users_role` - Fast role lookups
- `idx_routes_driver_id` - Driver route queries
- `idx_route_assignments_status` - Status queries
- `idx_subscriptions_student_id` - Student subscription lookups
- `idx_payments_status` - Payment status queries

---

## 🔄 Backup & Recovery

### Automated Backups

Supabase provides:
- **Daily backups** for production
- **7-day retention** for Standard plan
- **30-day retention** for paid plans

### Manual Backup

```bash
# Export entire database
pg_dump \
  postgresql://user:password@host:5432/postgres \
  > backup_2026-04-30.sql

# Restore from backup
psql postgresql://user:password@host:5432/postgres < backup_2026-04-30.sql
```

---

## 🧪 Testing Strategy

### Unit Tests
Test individual functions and repositories

### Integration Tests
Test complete flows:
- OTP login → Create student → Get subscription → Apply discount
- Driver login → Start route → Update student status → Complete route
- Financial transaction consistency

### Load Testing
```bash
# Example with k6
k6 run load-test.js --vus 100 --duration 30s
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: RLS Policy Blocking Valid Requests
**Solution:** Check policy logic, ensure user role is correctly set

### Issue 2: Migration Fails Halfway
**Solution:** Check migration SQL for syntax errors, run migrations one-by-one

### Issue 3: JWT Token Expired
**Solution:** Implement token refresh logic in client

### Issue 4: Performance Degradation
**Solution:** Add missing indexes, analyze query plans, optimize slow queries

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Auth response | < 200ms |
| Route query | < 100ms |
| Financial transaction | < 500ms |
| Dashboard load | < 2s |

---

## 🔄 Ongoing Maintenance

### Weekly
- Monitor error logs
- Check database size growth
- Verify backups

### Monthly
- Performance review
- Outdated index analysis
- Security audit

### Quarterly
- Major version updates
- Capacity planning
- Disaster recovery drill

---

## ✅ Deployment Sign-Off

- [ ] All migrations passed
- [ ] All RLS policies enforced
- [ ] ACID functions tested
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Backup strategy active
- [ ] Monitoring configured
- [ ] Incident response plan defined

**Deployed by:** _____________  
**Date:** _____________  
**Production URL:** _____________
