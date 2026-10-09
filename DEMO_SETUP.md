# 🎬 Demo Setup Instructions

Follow these steps to set up the platform with demo data for recruiter showcase.

## Prerequisites

Before starting, ensure you have:
- [x] Node.js 18+ installed
- [x] PostgreSQL database (Neon) set up
- [x] Supabase project created
- [x] `.env.local` configured

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Ensure your `.env.local` has these variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Generate Prisma Client

```bash
npm run db:generate
```

### Step 4: Run Database Migrations

```bash
npm run db:migrate
```

### Step 5: Update Your Email in Seed File

Open `prisma/seed.ts` and replace the email:

```typescript
const YOUR_EMAIL = "gaurav@example.com"; // ⚠️ REPLACE WITH YOUR ACTUAL EMAIL
```

Change it to your actual email address.

### Step 6: Seed the Database

```bash
npm run db:seed
```

You should see output like:
```
🌱 Starting comprehensive database seeding...
📋 Creating Demo Profiles:
  ✓ Gaurav Mishra (Admin) (ADMIN)
  ✓ Admin Demo (ADMIN)
  ✓ Sarah Johnson (ORGANIZER)
  ...
✅ Created 7 demo profiles
🏢 Creating Organizations:
  ✓ Golf For Good Foundation (APPROVED)
  ...
🎯 Creating Campaigns:
  ✓ Summer Charity Golf Championship 2026
  ...
💰 Creating Donations & Payments:
  ✓ Summer Charity Golf Championship 2026: 8 donations
  ...
🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!
```

### Step 7: Create Supabase Auth Users

You have two options:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User**

Create these users:

| Email | Password |
|-------|----------|
| admin@golfcharity.com | Demo@123 |
| organizer@golfcharity.com | Demo@123 |
| donor@golfcharity.com | Demo@123 |
| pending@golfcharity.com | Demo@123 |
| YOUR_EMAIL | your-password |

5. For each user, click the three dots → **Confirm User** (or disable email confirmations)

#### Option B: Disable Email Confirmation (Faster)

1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. Under "Email Auth", toggle OFF **"Enable email confirmations"**
3. Save
4. Now users can sign up directly without email confirmation

Then either:
- Use the signup page at `http://localhost:3000/signup` to create accounts
- Or use the dashboard method above

### Step 8: Match User IDs (Important!)

After creating users in Supabase, you need to sync the IDs:

1. Go to Supabase Dashboard → Authentication → Users
2. Copy each user's UUID
3. Update `prisma/seed.ts` with the correct UUIDs in `DEMO_ACCOUNTS`
4. Re-run: `npm run db:seed`

**OR** use SQL to update Supabase Auth IDs (advanced):

```sql
-- Run in Supabase SQL Editor
UPDATE auth.users 
SET id = '00000000-0000-0000-0000-000000000002'
WHERE email = 'admin@golfcharity.com';

-- Repeat for each user with their corresponding ID from seed.ts
```

### Step 9: Start the Development Server

```bash
npm run dev
```

### Step 10: Test Demo Login

1. Open: `http://localhost:3000/login`
2. You should see a blue demo banner with account cards
3. Click on "Admin" card to copy credentials
4. Paste email and password
5. Click "Sign In"
6. You should be redirected to the admin dashboard!

## Verification Checklist

After setup, verify these work:

- [ ] Landing page loads at `http://localhost:3000`
- [ ] Login page shows demo banner
- [ ] Can login with admin@golfcharity.com
- [ ] Dashboard loads with data
- [ ] Can see 8 campaigns on campaigns page
- [ ] Can view campaign details
- [ ] Donations show in history
- [ ] Can switch between accounts
- [ ] Each role shows appropriate access

## Demo Data Summary

After successful seeding, you'll have:

### Users (7 profiles)
- 2 Admins (including you)
- 1 Organizer
- 3 Donors
- 1 Pending Organizer

### Organizations (2)
- Golf For Good Foundation (Approved)
- Green Earth Trust (Pending)

### Campaigns (8)
- 5 Active campaigns
- 1 Completed campaign
- 1 Draft campaign
- 1 Pending campaign

### Donations
- 50+ donations across campaigns
- Realistic donation amounts
- Mix of anonymous and public donations
- Complete payment records

### Documents
- 3 verification documents for approved organization
- Registration certificate
- PAN card
- Tax exemption certificate

## Troubleshooting

### Issue: "User not found" after login
**Solution:** Make sure user IDs match between Supabase Auth and database profiles.

### Issue: "Invalid credentials"
**Solution:** 
- Verify password is exactly `Demo@123` (case-sensitive)
- Check user exists in Supabase Auth
- Ensure email confirmation is disabled or user is confirmed

### Issue: "Cannot connect to database"
**Solution:**
- Verify `DATABASE_URL` in `.env.local`
- Check Neon database is active
- Run `npm run db:generate` again

### Issue: "No campaigns showing"
**Solution:**
- Run `npm run db:seed` again
- Check for errors in seed output
- Verify database migrations ran successfully

### Issue: "Demo banner not showing"
**Solution:**
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors
- Verify `components/demo/DemoBanner.tsx` exists

## Quick Reset

If you need to start over:

```bash
# Reset database (⚠️ DELETES ALL DATA)
npx prisma db push --force-reset

# Run migrations
npm run db:migrate

# Seed again
npm run db:seed
```

## Production Considerations

Before deploying to production:

1. **Remove Demo Banner**
   - Delete or comment out `<DemoBanner />` in `app/(auth)/login/page.tsx`

2. **Remove Demo Data**
   - Don't run seed script on production database
   - Or create a separate production seed with real data

3. **Change Demo Passwords**
   - If keeping demo accounts, use strong passwords
   - Store in environment variables

4. **Enable Email Confirmation**
   - Turn ON email confirmations in Supabase
   - Configure SMTP for production emails

5. **Update Your Admin Email**
   - Ensure your real email is set as ADMIN role
   - Remove demo admin accounts

## Next Steps

After setup is complete:

1. Read `DEMO_GUIDE.md` for demonstration tips
2. Test all user flows
3. Prepare your presentation script
4. Take screenshots of key features
5. Practice switching between accounts

## Support

For issues during setup:
- Check the `README.md` for general setup
- Review `ARCHITECTURE.md` for technical details
- See `DEMO_GUIDE.md` for usage instructions

---

**Setup Time:** ~15 minutes  
**Result:** Fully-functional demo platform with realistic data  
**Status:** Ready for recruiter showcase! 🎉
