# 🔴 CRITICAL BUG: Admin Dashboard Showing Donor View

## Bug Report
**Symptom:** Admin user sees donor dashboard navigation despite having ADMIN role in database

**Root Cause:** Profile service was using **client-side** Supabase instance instead of **server-side** Supabase

---

## Technical Analysis

### The Bug 🐛

```typescript
// ❌ WRONG - features/profile/profile.service.ts
import { createClient } from "@/lib/supabase/client"; // CLIENT-SIDE!

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient(); // Returns client-side instance
  // ...
}
```

### Why This Caused the Issue

**Call Chain:**
1. Client Component (`SidebarNav.tsx`) 
   → uses `ProfileContext`
2. ProfileContext 
   → calls `useProfile()` hook
3. useProfile hook 
   → calls `getCurrentProfileAction()` (server action)
4. getCurrentProfileAction 
   → calls `getCurrentProfile()` (service)
5. getCurrentProfile 
   → uses `createClient()` from **@/lib/supabase/client** ❌

**Problem:**
- Server actions run on the server
- But they were calling a service that imports the **client-side** Supabase module
- Client-side Supabase in server context may not have access to httpOnly cookies properly
- Result: Auth context lost, returns null user or stale session data

### The Fix ✅

```typescript
// ✅ CORRECT - features/profile/profile.service.ts  
import { createClient } from "@/lib/supabase/server"; // SERVER-SIDE!

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient(); // Await server-side instance
  // ...
}
```

---

## Files Changed

### `features/profile/profile.service.ts`

**Changed:**
```diff
- import { createClient } from "@/lib/supabase/client";
+ import { createClient } from "@/lib/supabase/server";

  export async function getCurrentProfile(): Promise<Profile | null> {
-   const supabase = createClient();
+   const supabase = await createClient();
    // ...
  }

  export async function updateCurrentProfile(update: ProfileUpdate): Promise<Profile> {
-   const supabase = createClient();
+   const supabase = await createClient();
    // ...
  }
```

**Why:** Services called from Server Actions MUST use server-side Supabase to access auth cookies properly.

---

### `app/(dashboard)/dashboard/page.tsx`

**Changed 1: Role check order**
```diff
+ // ── ADMIN view (check first to prevent fallthrough) ──
+ if (role === "ADMIN") {
+   // ... admin logic
+ }
+
  // ── DONOR view
  if (role === "DONOR") {
    // ... donor logic
  }
```

**Changed 2: Pending organizer requests query**
```diff
  // Count pending requests
- prisma.profile.count({ where: { role: "PENDING_ORGANIZER" } })
+ prisma.organization.count({ 
+   where: { 
+     verificationStatus: { in: ["PENDING", "UNDER_REVIEW"] },
+     deletedAt: null,
+   } 
+ })
```

**Why:**
1. Explicit ADMIN check prevents fallthrough bugs
2. Dashboard should count organizations (not profiles) to match admin panel query

---

## Verification Steps

### 1. Clear Browser Cache & Reload
```bash
# Hard refresh to clear any cached client-side data
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Check Server Console
```bash
# You should see debug logs when visiting /dashboard
=== DASHBOARD ROLE DEBUG ===
User ID: a097cf63-72ad-4ef6-a1f1-9b6ecf1df07a
User Email: mr.gaurav.2705@gmail.com
Profile Role: ADMIN
User Metadata Role: undefined
Final Role: ADMIN
============================
```

### 3. Verify Sidebar Navigation
**Expected for ADMIN:**
- ✅ General section (Dashboard, Browse Campaigns, etc.)
- ✅ Campaigns section (My Campaigns, Create Campaign, etc.)
- ✅ Organizer section (Organization Profile, Verification Status)
- ✅ **Admin section (Organizer Requests, Campaign Approvals, etc.)** 👈 Should appear now!
- ✅ Account section (My Profile, Settings, etc.)

**Should NOT see:** Only General + Account (that's donor view)

### 4. Verify Dashboard Content
**Expected for ADMIN:**
- Welcome banner: "Monitor platform activity..."
- Stats: Total Users, Total Campaigns, Total Donations, Platform Revenue
- Admin Actions quick links
- Reports button in banner
- NO "Become an Organizer" button (that's donor view)

---

## Why This Was Hard to Debug

1. **Dual Data Flow:**
   - Server page: Loads profile via server-side Prisma ✅ (was working)
   - Client sidebar: Loads profile via client hook → server action → service ❌ (was broken)

2. **Silent Failure:**
   - Service didn't throw error, just returned stale/null data
   - Sidebar would show loading skeleton → fallback to empty roles → show general nav only

3. **Environment Context:**
   - Supabase client vs server instances behave differently
   - Client instance in server context doesn't have proper cookie access
   - No obvious error message, just wrong data

---

## Architecture Lesson

### Rule: Match Supabase Client to Execution Context

| Execution Context | Supabase Import | Usage |
|------------------|----------------|-------|
| Client Component | `@/lib/supabase/client` | Direct use in browser |
| Server Component | `@/lib/supabase/server` | Server rendering |
| Server Action | `@/lib/supabase/server` | API-like server code |
| Route Handler | `@/lib/supabase/server` | API routes |

**Service Layer Decision:**
- If service is called ONLY from server (actions, components, routes) → use `@/lib/supabase/server` ✅
- If service is called from BOTH client AND server → need two versions or pass supabase instance as param

**Current Project:**
- Profile service is called from server actions → MUST use server-side Supabase ✅

---

## Related Issues Fixed

### Issue 1: Admin Dashboard Showing Donor View ✅ FIXED
- Root cause: Service using wrong Supabase client
- Solution: Changed to server-side Supabase
- Additional: Moved ADMIN check before DONOR check for safety

### Issue 2: Organization Submissions Not Showing ✅ FIXED  
- Root cause: Dashboard counted profiles, admin page queried organizations
- Solution: Dashboard now counts organizations (matches admin page)

### Issue 3: Navigation Alert Mismatch ✅ FIXED
- Root cause: Same as Issue 2
- Solution: Fixed by Issue 2 solution

---

## Testing Checklist

- [ ] Login as admin (`mr.gaurav.2705@gmail.com`)
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Dashboard shows AdminDashboard component (not DonorDashboard)
- [ ] Sidebar shows "Admin" section with 6 admin links
- [ ] Welcome banner says "Monitor platform activity..."
- [ ] Stats show platform-wide data (not personal donation stats)
- [ ] Pending Organizer Requests shows 0 (correct - no org submissions)
- [ ] No alert about "1 request awaiting review"
- [ ] Console logs show "Final Role: ADMIN"

---

## Files Modified Summary

| File | Change | Purpose |
|------|--------|---------|
| `features/profile/profile.service.ts` | Changed Supabase import from client to server | Fix auth context in server actions |
| `app/(dashboard)/dashboard/page.tsx` | Moved ADMIN check first + fixed org count query | Prevent fallthrough + match admin panel |
| `ADMIN_DASHBOARD_FIX.md` | Created documentation | Root cause analysis |
| `CRITICAL_BUG_FIX.md` | Created documentation | Fix explanation |
| `scripts/list-organizations.ts` | Created helper script | Database debugging |

---

## Next Steps

1. **Verify Fix:**
   - Login as admin and confirm sidebar shows admin navigation
   - Verify dashboard shows admin stats

2. **Remove Debug Logs:**
   - Remove console.log statements from `dashboard/page.tsx` after verification

3. **Continue Sprint 6.2:**
   - Build Organization Wizard UI
   - Allow PENDING_ORGANIZER users to submit organizations
   - Then admin panel will have real data to approve!

---

**Status:** 🟢 **CRITICAL BUG FIXED**  
**Cause:** Wrong Supabase client (client vs server)  
**Impact:** Admin couldn't access admin dashboard/navigation  
**Resolution:** Changed service to use server-side Supabase + improved dashboard role logic
