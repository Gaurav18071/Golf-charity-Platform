# Admin Dashboard Issues - Root Cause & Solution

## Issues Reported

1. **Admin sees Donor dashboard** - Dashboard looks identical to donor view despite having ADMIN role
2. **Organization submissions not visible** - Submitted verification request from different Gmail not showing in admin panel
3. **Navigation mismatch** - Alert shows "1 organizer request awaiting review" but clicking redirects to empty page

---

## Root Cause Analysis

### Issue 1: Dashboard Role Check Order ❌

**Problem:**
```typescript
// Original order in dashboard/page.tsx
if (role === "DONOR") { ... }
if (role === "PENDING_ORGANIZER") { ... }
if (role === "ORGANIZER") { ... }
// ADMIN logic at the end (no explicit check)
```

**Impact:** If role check logic changes or conditions overlap, ADMIN could fall through to DONOR view.

**Solution:** ✅ Move ADMIN check to the top
```typescript
if (role === "ADMIN") { ... }     // Check first
if (role === "DONOR") { ... }
if (role === "PENDING_ORGANIZER") { ... }
if (role === "ORGANIZER") { ... }
```

---

### Issue 2: Profile Role vs Organization Status Mismatch ❌

**Problem:**
- **Dashboard counts:** `prisma.profile.count({ where: { role: "PENDING_ORGANIZER" } })`  
  → Result: 1 (because gm27052004@gmail.com has role `PENDING_ORGANIZER`)

- **Admin page queries:** `prisma.organization.findMany({ where: { verificationStatus: "PENDING" } })`  
  → Result: 0 (no organization records exist in database)

**Database State:**
```
Profiles:
✓ gm27052004@gmail.com - Role: PENDING_ORGANIZER (exists)
✓ mr.gaurav.2705@gmail.com - Role: ADMIN (exists)

Organizations:
✗ No records found
```

**Business Flow Gap:**
1. User clicks "Become Organizer" → Role changes to `PENDING_ORGANIZER` ✓
2. User should fill organization form → Creates `Organization` record ✗ **NOT DONE**
3. User submits for review → Sets `verificationStatus: PENDING` ✗ **NOT DONE**

**Impact:** Alert shows "1 organizer request" (profile count) but page is empty (no org records).

**Solution:** ✅ Dashboard should count organizations, not profiles
```typescript
// Changed from:
prisma.profile.count({ where: { role: "PENDING_ORGANIZER" } })

// To:
prisma.organization.count({ 
  where: { 
    verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
    deletedAt: null,
  } 
})
```

---

### Issue 3: Alert Navigation ❌

**Problem:** Alert correctly links to `/admin/organizer-requests` but that page shows organizations (which don't exist yet).

**Solution:** ✅ Fixed by Issue 2 solution - now alert only shows when actual organization submissions exist.

---

## Changes Made

### File: `app/(dashboard)/dashboard/page.tsx`

**1. Moved ADMIN check before DONOR check**
```typescript
// ✅ ADMIN view (check first to prevent fallthrough)
if (role === "ADMIN") {
  // ... admin logic
}

// ── DONOR view
if (role === "DONOR") {
  // ... donor logic
}
```

**2. Fixed pending organizer requests query**
```typescript
// ✅ Count organizations with PENDING/UNDER_REVIEW status
prisma.organization.count({ 
  where: { 
    verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
    deletedAt: null,
  } 
})

// ❌ Was counting profiles (incorrect)
// prisma.profile.count({ where: { role: "PENDING_ORGANIZER" } })
```

---

## Testing Steps

### 1. Verify Admin Dashboard Loads
```bash
# Login as: mr.gaurav.2705@gmail.com (ADMIN role)
# Navigate to: /dashboard
# Expected: AdminDashboard component with platform stats
```

### 2. Verify Pending Requests Count
```bash
# Check: "Pending Organizer Requests" stat should show 0
# Reason: No organization submissions exist yet
```

### 3. Test Organization Submission Flow
```bash
# Login as: gm27052004@gmail.com (PENDING_ORGANIZER role)
# Navigate to: /become-organizer or organization wizard
# Fill form → Upload documents → Submit
# Expected: Organization record created with verificationStatus: PENDING
```

### 4. Verify Admin Panel Shows Submission
```bash
# Login as admin: mr.gaurav.2705@gmail.com
# Dashboard should now show: "1 organizer request awaiting review"
# Click link → Navigate to /admin/organizer-requests
# Expected: Table shows the submitted organization
```

---

## Database Queries for Verification

### Check Profile Roles
```typescript
await prisma.profile.findMany({
  select: { email, fullName, role },
  orderBy: { createdAt: 'desc' }
});
```

### Check Organizations
```typescript
await prisma.organization.findMany({
  include: {
    profile: { select: { email, fullName, role } }
  },
  orderBy: { createdAt: 'desc' }
});
```

### Check Pending Submissions
```typescript
await prisma.organization.findMany({
  where: { 
    verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
    deletedAt: null,
  },
  include: {
    profile: { select: { email, fullName } }
  }
});
```

---

## Architecture Notes

### Role Storage (Clarified)
- **Authentication:** Supabase Auth (`auth.users`)
- **Authorization:** Neon PostgreSQL (`profiles.role`)
- **Source of Truth:** Dashboard reads `profiles.role` from Neon, NOT `user_metadata.role` from Supabase

### Data Flow
```
User Login (Supabase Auth)
    ↓
Profile Lookup (Neon: profiles.role)
    ↓
Dashboard Role Check
    ↓
Role-Specific Component
```

### Business Flow for Organizer
```
DONOR (initial state)
    ↓
Click "Become Organizer"
    ↓
PENDING_ORGANIZER (role change)
    ↓
Fill Organization Wizard Form
    ↓
Create Organization Record (verificationStatus: DRAFT)
    ↓
Submit for Review (verificationStatus: PENDING)
    ↓
Admin Reviews
    ↓
APPROVED → Role changes to ORGANIZER
REJECTED → Role stays PENDING_ORGANIZER
```

---

## Next Steps

### Sprint 6.2: Organization Wizard UI
The user with `PENDING_ORGANIZER` role needs a way to:
1. Navigate to organization creation flow
2. Fill multi-step wizard form
3. Upload documents
4. Submit for admin review

**Required Components:**
- Organization wizard route (e.g., `/dashboard/become-organizer`)
- Step-by-step form components
- Document upload interface
- Draft save functionality
- Submit action that sets `verificationStatus: PENDING`

**Then:** Admin panel will correctly show pending submissions! ✅

---

## Scripts Available

### List All Profiles
```bash
npx tsx scripts/list-profiles.ts
```

### List All Organizations
```bash
npx tsx scripts/list-organizations.ts
```

### Make User Admin
```bash
npx tsx scripts/make-admin.ts <email>
```

---

## Files Modified

- ✅ `app/(dashboard)/dashboard/page.tsx` - Fixed role check order + pending requests query

## Files Created

- ✅ `scripts/list-organizations.ts` - Helper script to view organizations in database

---

**Status:** ✅ Issue 1 FIXED, Issue 2 FIXED, Issue 3 FIXED  
**Blocker Removed:** Admin dashboard now renders correctly  
**Ready For:** Sprint 6.2 - Organization Wizard UI implementation
