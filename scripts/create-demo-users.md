# Creating Demo Users in Supabase Auth

After running the seed script (`npm run db:seed`), you need to create the corresponding users in Supabase Auth so they can log in.

## Method 1: Via Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. Click **Add User** button

Create each of these users:

### Admin User (Demo)
```
Email: admin@golfcharity.com
Password: Demo@123
```
- After creating, confirm the email manually
- No need to set metadata

### Organizer User (Demo)
```
Email: organizer@golfcharity.com
Password: Demo@123
```
- After creating, confirm the email manually

### Donor User (Demo)
```
Email: donor@golfcharity.com
Password: Demo@123
```
- After creating, confirm the email manually

### Pending Organizer User (Demo)
```
Email: pending@golfcharity.com
Password: Demo@123
```
- After creating, confirm the email manually

### Your Admin Account
```
Email: gaurav@example.com (replace with your actual email)
Password: <your-strong-password>
```
- This will be your main admin account
- After creating, confirm the email manually

## Method 2: Programmatic Creation (Advanced)

If you have the Supabase Service Role key, you can use the signup API:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key, not anon key
)

async function createDemoUsers() {
  const users = [
    { email: 'admin@golfcharity.com', password: 'Demo@123' },
    { email: 'organizer@golfcharity.com', password: 'Demo@123' },
    { email: 'donor@golfcharity.com', password: 'Demo@123' },
    { email: 'pending@golfcharity.com', password: 'Demo@123' },
  ]

  for (const user of users) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
    })

    if (error) {
      console.error(`Failed to create ${user.email}:`, error)
    } else {
      console.log(`✓ Created ${user.email}`)
    }
  }
}

createDemoUsers()
```

## Method 3: Manual Signup via UI

You can also create users by going through the signup flow:

1. Start your dev server: `npm run dev`
2. Go to: `http://localhost:3000/signup`
3. Sign up with each demo email
4. Check the email confirmation in Supabase Dashboard → Authentication → Users
5. Click the three dots → Confirm User

## Verification

After creating users in Supabase, verify they work:

1. Go to `http://localhost:3000/login`
2. Try logging in with:
   ```
   Email: admin@golfcharity.com
   Password: Demo@123
   ```
3. You should be redirected to the dashboard

## Important Notes

⚠️ **User IDs Must Match**

The seed script uses specific UUIDs for each user. When you create users in Supabase, they will get new UUIDs. You have two options:

### Option A: Update Seed Script (Recommended)
After creating users in Supabase:
1. Copy each user's UUID from Supabase Dashboard
2. Update the IDs in `prisma/seed.ts` in the `DEMO_ACCOUNTS` object
3. Re-run `npm run db:seed`

### Option B: Manually Set UUIDs in Supabase
This is more complex and requires SQL:
1. Use the exact UUIDs from the seed script
2. You'll need to execute SQL commands in Supabase

**Example:**
```sql
UPDATE auth.users 
SET id = '00000000-0000-0000-0000-000000000002'
WHERE email = 'admin@golfcharity.com';
```

## Disable Email Confirmation (Development Only)

For easier testing during development:

1. Go to: Supabase Dashboard → Authentication → Settings
2. Under "Email Auth", toggle OFF **"Enable email confirmations"**
3. Save changes

Now users can sign up without email confirmation!

## Quick Test Checklist

- [ ] Created admin@golfcharity.com user
- [ ] Created organizer@golfcharity.com user
- [ ] Created donor@golfcharity.com user
- [ ] Created your personal admin account
- [ ] Disabled email confirmations (dev only)
- [ ] Ran `npm run db:seed` successfully
- [ ] Tested login with admin credentials
- [ ] Dashboard loads correctly
- [ ] Can view campaigns
- [ ] Donations show up in history

## Troubleshooting

**Problem:** "User already exists" error
- **Solution:** Delete the user from Supabase Dashboard first, then recreate

**Problem:** Login succeeds but profile not found
- **Solution:** Make sure UUIDs match between Supabase Auth and database profiles

**Problem:** "Invalid login credentials"
- **Solution:** Verify the password is exactly `Demo@123` (case-sensitive)

**Problem:** Email confirmation required
- **Solution:** Either confirm manually in dashboard or disable email confirmations

---

**Ready?** After creating users, you can showcase your platform to recruiters! 🚀
