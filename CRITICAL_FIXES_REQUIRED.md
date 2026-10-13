# Critical Fixes Required Before Production Deployment

**Date:** October 13, 2026  
**Priority:** HIGH  
**Estimated Time:** 2-4 hours

---

## 🔴 HIGH PRIORITY (Must Fix Before Deployment)

### 1. Campaign Ownership Verification Missing

**File:** `app/actions/campaign.actions.ts`  
**Function:** `updateCampaignAction()` (around line 159)  
**Issue:** Organizers can potentially edit other organizers' campaigns

**Current Code:**
```typescript
export async function updateCampaignAction(input: UpdateCampaignInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Missing ownership check here!
  
  const updated = await prisma.campaign.update({
    where: { id: input.campaignId },
    data: { ...input }
  });
}
```

**Required Fix:**
```typescript
export async function updateCampaignAction(input: UpdateCampaignInput) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Get user profile for role check
  const userProfile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true }
  });

  // Get campaign to verify ownership
  const campaign = await prisma.campaign.findUnique({
    where: { id: input.campaignId },
    select: { organizerId: true }
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // Verify ownership (allow ADMIN to edit any campaign)
  if (campaign.organizerId !== user.id && userProfile?.role !== "ADMIN") {
    throw new Error("You do not have permission to edit this campaign");
  }

  // Now safe to update
  const updated = await prisma.campaign.update({
    where: { id: input.campaignId },
    data: { ...input }
  });
  
  return updated;
}
```

---

### 2. Update .env.example (Completed ✅)

**Status:** FIXED in this session

**Added:**
- `RAZORPAY_WEBHOOK_SECRET` documentation
- `SUPABASE_SERVICE_ROLE_KEY` with warnings
- Improved comments and organization

---

### 3. Supabase Storage Bucket Policies

**Location:** Supabase Dashboard → Storage → organization-documents → Policies

**Required RLS Policies:**

```sql
-- Policy 1: Allow users to upload to their organization folder
CREATE POLICY "Users can upload to their organization"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'organization-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public."Organization"
    WHERE "profileId" = auth.uid()
  )
);

-- Policy 2: Allow users to read their organization's documents
CREATE POLICY "Users can read their organization documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public."Organization"
    WHERE "profileId" = auth.uid()
  )
);

-- Policy 3: Allow admins to read all documents
CREATE POLICY "Admins can read all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'organization-documents' AND
  EXISTS (
    SELECT 1 FROM public."Profile"
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- Policy 4: Allow users to delete their organization's documents
CREATE POLICY "Users can delete their organization documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'organization-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM public."Organization"
    WHERE "profileId" = auth.uid()
  )
);
```

**How to Apply:**
1. Log into Supabase Dashboard
2. Go to Storage → Buckets
3. Click `organization-documents`
4. Navigate to **Policies** tab
5. Click **New Policy**
6. Paste each policy above
7. Click **Review** → **Save**

---

## 🟡 MEDIUM PRIORITY (Should Fix Within Week 1)

### 4. Replace Inline Role Strings with Constants

**Files:** Multiple action files  
**Issue:** Uses `"ADMIN"` instead of `ROLES.ADMIN` from constants

**Example in:** `app/actions/campaign.actions.ts`

**Find:**
```typescript
if (userProfile?.role !== "ADMIN") {
```

**Replace With:**
```typescript
import { ROLES } from "@/features/auth/permissions";

if (userProfile?.role !== ROLES.ADMIN) {
```

**Benefits:**
- Type safety
- Prevents typos
- Single source of truth
- Easier refactoring

---

### 5. Add Rate Limiting to AI Endpoints

**Files:** 
- `app/api/campaigns/ai-search/route.ts`
- `app/actions/ai.actions.ts`

**Recommended Implementation:**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});

// In your API route:
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  
  const { success } = await aiRateLimit.limit(user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }
  
  // Process AI request...
}
```

---

### 6. Implement Automated Tests

**Priority:** High (but can be done post-launch)

**Create:** `tests/` directory with:

```
tests/
  auth/
    signup.test.ts
    login.test.ts
    authorization.test.ts
  payments/
    donation-flow.test.ts
    webhook-verification.test.ts
  campaigns/
    ownership.test.ts
  organizations/
    document-access.test.ts
```

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test  # for E2E tests
```

**package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test"
  }
}
```

---

## 🟢 LOW PRIORITY (Post-Launch Improvements)

### 7. Migrate Middleware to Proxy Pattern

**Current:** `middleware.ts`  
**New Pattern:** `proxy.ts` (Next.js 16)

**Deprecation Warning:**
```
⚠ The "middleware" file convention is deprecated. 
Please use "proxy" instead.
```

**Note:** This is **cosmetic only** and does not affect functionality. The current middleware works perfectly in production.

---

### 8. Add Comprehensive JSDoc Comments

**Example:**

```typescript
/**
 * Creates a new campaign for the authenticated organizer.
 * 
 * @param input - Campaign creation data (validated against schema)
 * @returns Created campaign object
 * @throws {Error} If user is not authenticated or not an organizer
 * @throws {Error} If organization is not verified
 * 
 * @example
 * const result = await createCampaignAction({
 *   title: "Help Build School",
 *   description: "...",
 *   goalAmount: 100000,
 *   organizationId: "uuid"
 * });
 */
export async function createCampaignAction(input: CreateCampaignInput) {
  // implementation
}
```

---

### 9. Optimize Database Queries

**Examples of potential optimizations:**

```typescript
// Before: N+1 query problem
const campaigns = await prisma.campaign.findMany();
for (const campaign of campaigns) {
  const donations = await prisma.donation.findMany({
    where: { campaignId: campaign.id }
  });
}

// After: Use include or select
const campaigns = await prisma.campaign.findMany({
  include: {
    donations: true
  }
});
```

**Tool:** Use Prisma Studio to analyze slow queries
```bash
npm run db:studio
```

---

## Verification Checklist

After implementing fixes:

- [ ] Run `npm run build` - should succeed
- [ ] Test campaign edit as different users
- [ ] Test document upload (verify storage policies)
- [ ] Test payment flow end-to-end
- [ ] Check Vercel Function Logs for errors
- [ ] Verify AI endpoints return proper errors when rate limited
- [ ] Run automated tests (once implemented)
- [ ] Deploy to staging/preview first

---

## Deployment Order

1. ✅ Fix campaign ownership verification
2. ✅ Update .env.example (already done)
3. ✅ Configure Supabase storage policies
4. 🚀 Deploy to Vercel (preview first)
5. ✅ Test all critical flows
6. ✅ Monitor logs for 24 hours
7. 🔄 Implement rate limiting
8. 🔄 Add automated tests
9. 🔄 Optimize queries
10. 🔄 Migrate middleware (optional)

---

## Emergency Contacts

**If critical issues arise:**

1. **Vercel:** https://vercel.com/support
2. **Neon:** support@neon.tech
3. **Supabase:** support@supabase.com
4. **Razorpay:** https://razorpay.com/support

**Rollback Plan:** See `DEPLOYMENT_CHECKLIST.md` Section "Rollback Plan"

---

**Last Updated:** October 13, 2026  
**Next Review:** After implementing fixes
