# Troubleshooting Guide

## Current Issues & Solutions

### 1. ✅ Hydration Error (FIXED)

**Issue:** React hydration mismatch caused by browser extensions adding `fdprocessedid` attributes to form inputs.

**Solution:** Added `suppressHydrationWarning` to Footer component inputs.

**Status:** ✅ Fixed in `components/layout/Footer.tsx`

---

### 2. ❌ Database Connection Error

**Issue:** 
```
Can't reach database server at ep-patient-term-azqm6bcx-pooler.c-3.ap-southeast-1.aws.neon.tech:5432
```

**Possible Causes:**
1. Neon database is sleeping (free tier auto-pauses after inactivity)
2. Network/firewall blocking connection
3. Invalid credentials
4. Database has been deleted/moved

**Solutions:**

#### Option A: Wake Up the Database (Recommended)
1. Go to [Neon Console](https://console.neon.tech)
2. Login to your account
3. Find your project: `golf_charity_db`
4. If it shows "Sleeping" status, click to wake it up
5. Wait 10-15 seconds for it to become active
6. Refresh your app: http://localhost:3000

#### Option B: Create New Database Connection
1. Go to [Neon Console](https://console.neon.tech)
2. Navigate to your project
3. Click "Connection Details"
4. Copy the new connection string
5. Update `.env`:
   ```
   DATABASE_URL="your-new-connection-string"
   ```
6. Restart dev server:
   ```bash
   npm run dev
   ```

#### Option C: Use Local Development Data (Temporary)
If you just want to test the UI without real data:

1. Open `app/(public)/page.tsx`
2. Replace the database fetch with mock data:
   ```typescript
   const campaigns = [
     {
       id: "1",
       slug: "education-for-all",
       title: "Education for Underprivileged Children",
       shortDescription: "Help provide quality education to children in need",
       category: "EDUCATION",
       goalAmount: 50000,
       currentAmount: 25000,
       coverImageUrl: null,
       organizationName: "Hope Foundation",
     },
   ];
   ```

---

### 3. ⚠️ Supabase Auth Errors

**Issue:**
```
AuthRetryableFetchError: fetch failed
```

**Possible Causes:**
1. Supabase project is paused
2. Invalid API keys
3. Network connectivity issues

**Solutions:**

#### Verify Supabase Project Status
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Check if your project is active
3. Verify the URL matches: `https://gqlmmbdhkkfctyuvlaef.supabase.co`

#### Test Connection Manually
```bash
curl https://gqlmmbdhkkfctyuvlaef.supabase.co/rest/v1/
```

If this fails, your Supabase project may be paused or deleted.

#### Regenerate API Keys (if needed)
1. Go to Supabase Dashboard → Settings → API
2. Copy new keys
3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## Quick Fixes

### Clear Next.js Cache
```bash
rm -rf .next
npm run dev
```

### Restart Dev Server
```powershell
# Kill any running processes
Get-Process node | Stop-Process -Force

# Start fresh
npm run dev
```

### Check Environment Variables
```bash
# Print env vars (be careful not to share these!)
echo $env:DATABASE_URL
```

---

## Testing Checklist

Once issues are resolved, test these:

### ✅ Basic Functionality
- [ ] Homepage loads (http://localhost:3000)
- [ ] No hydration errors in console
- [ ] Footer displays correctly
- [ ] Navigation works

### ✅ Database-Dependent Features
- [ ] Campaigns display on homepage
- [ ] Browse campaigns page works
- [ ] Leaderboard displays
- [ ] Profile data loads

### ✅ Auth Features
- [ ] Login page accessible
- [ ] Signup page accessible
- [ ] Can create new account
- [ ] Can login with existing account

### ✅ Phase 13 AI Features
- [ ] AI search box appears on /campaigns/browse
- [ ] Example query chips work
- [ ] Search returns results
- [ ] Recommendations section visible (when logged in with history)

---

## Common Error Messages

### "Can't reach database server"
**Solution:** Database is sleeping. Wake it up via Neon Console.

### "Invalid `prisma.campaign.findMany()` invocation"
**Solution:** Database schema mismatch. Run:
```bash
npx prisma generate
npx prisma db push
```

### "Hydration failed"
**Solution:** Browser extension interfering. Either:
1. Disable password manager extensions
2. Use incognito mode
3. Add `suppressHydrationWarning` to affected elements

### "AuthRetryableFetchError"
**Solution:** Supabase connection issue. Check:
1. Project is active
2. API keys are correct
3. Internet connection works

---

## Development Workflow

### Start Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Database Migrations
```bash
npx prisma migrate dev
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Seed Database
```bash
npx prisma db seed
```

---

## Getting Help

If issues persist:

1. **Check browser console** for detailed error messages
2. **Check terminal output** for server-side errors
3. **Verify environment variables** are correct
4. **Test database connection** using Prisma Studio:
   ```bash
   npx prisma studio
   ```

5. **Check Neon dashboard** for database status
6. **Check Supabase dashboard** for project status

---

## Network Debugging

### Test Neon Connection
```bash
# Test if database is reachable
curl -v https://ep-patient-term-azqm6bcx-pooler.c-3.ap-southeast-1.aws.neon.tech:5432
```

### Test Supabase Connection
```bash
# Test if Supabase is reachable
curl https://gqlmmbdhkkfctyuvlaef.supabase.co/rest/v1/
```

---

## Contact Information

- **Neon Support:** https://neon.tech/docs
- **Supabase Support:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

*Last Updated: August 1, 2026*
