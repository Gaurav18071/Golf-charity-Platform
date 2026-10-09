# 🎯 Demo Guide for Recruiters

Welcome to the Golf Charity Platform demo! This guide will help you explore all features of the platform using pre-configured demo accounts.

## 🚀 Quick Start

### Demo Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@golfcharity.com | Demo@123 | Full platform access |
| **Organizer** | organizer@golfcharity.com | Demo@123 | Create & manage campaigns |
| **Donor** | donor@golfcharity.com | Demo@123 | Browse & donate to campaigns |
| **Pending Organizer** | pending@golfcharity.com | Demo@123 | Awaiting admin approval |

**Main Admin:** Your personal account has full admin privileges.

## 📊 Demo Data Overview

The platform is pre-populated with realistic data:

- **8 Campaigns** across different categories
  - 5 Active campaigns accepting donations
  - 1 Completed campaign (goal reached)
  - 1 Draft campaign (upcoming)
  - 1 Pending approval campaign
  
- **2 Organizations**
  - Golf For Good Foundation (Approved)
  - Green Earth Trust (Pending approval)
  
- **7 User Profiles** with different roles
- **50+ Donations** with complete payment history
- **Organization Documents** (certificates, verification docs)

## 🎭 Exploring Different Roles

### 1. Admin Dashboard (admin@golfcharity.com)

**What You Can Do:**
- ✅ View all campaigns, users, and organizations
- ✅ Approve or reject campaigns
- ✅ Manage user roles
- ✅ Review organization verification documents
- ✅ Access analytics and reports
- ✅ Monitor all donations and payments

**Key Features to Test:**
1. **Campaign Approvals**: Navigate to Admin → Campaign Approvals
2. **User Management**: Admin → Users
3. **Organization Verification**: Admin → Organizations → View pending requests
4. **Payment Tracking**: Admin → Payments
5. **Analytics**: View platform-wide statistics

### 2. Organizer Dashboard (organizer@golfcharity.com)

**What You Can Do:**
- ✅ Create new fundraising campaigns
- ✅ Edit existing campaigns
- ✅ View donations received
- ✅ Manage organization profile
- ✅ Upload verification documents
- ✅ Track campaign analytics

**Key Features to Test:**
1. **Create Campaign**: Campaigns → Create New Campaign
2. **View Analytics**: Dashboard → Campaign Performance
3. **Manage Organization**: Organizer → Organization Profile
4. **View Donations**: Donations → History
5. **Edit Campaigns**: Campaigns → My Campaigns → Edit

**Your Campaigns:**
- Summer Charity Golf Championship 2026 (₹342,500 / ₹500,000)
- Junior Golf Development Fund (₹187,000 / ₹300,000)
- Clean Water Golf Classic (COMPLETED - ₹350,000)
- Children's Health Invitational (₹125,000 / ₹750,000)
- Animal Welfare Charity Open (₹67,500 / ₹150,000)

### 3. Donor Dashboard (donor@golfcharity.com)

**What You Can Do:**
- ✅ Browse all active campaigns
- ✅ View campaign details and impact stories
- ✅ Make donations to campaigns
- ✅ View donation history
- ✅ Save favorite campaigns
- ✅ Download tax receipts

**Key Features to Test:**
1. **Browse Campaigns**: Campaigns → Browse
2. **Campaign Details**: Click any campaign to view full details
3. **Make Donation**: Select campaign → Donate button
4. **View History**: Donations → My Donations
5. **Saved Campaigns**: Campaigns → Saved

**Your Previous Donations:**
You'll see donations you made to various campaigns in the donation history.

### 4. Pending Organizer (pending@golfcharity.com)

**What You Can See:**
- ✅ Limited dashboard access
- ✅ Organization verification status
- ✅ Browse campaigns (read-only)
- ✅ Cannot create campaigns until approved

**Key Features to Test:**
1. **Verification Status**: Organizer → Verification Status
2. **Organization Setup**: Complete organization profile
3. **Document Upload**: Upload required verification documents
4. **Restricted Access**: Try to create campaign (should be blocked)

## 🎨 Featured Campaigns to Explore

### 1. Summer Charity Golf Championship 2026 ⭐ FEATURED
- **Category:** Education
- **Status:** Active
- **Progress:** 68.5% funded (₹342,500 / ₹500,000)
- **Highlights:** 
  - Featured on homepage
  - Multiple donations from different donors
  - Rich content with images and impact story
  - Active fundraising with upcoming event date

### 2. Junior Golf Development Fund ⭐ FEATURED
- **Category:** Sports
- **Status:** Active
- **Progress:** 62.3% funded (₹187,000 / ₹300,000)
- **Highlights:**
  - Youth sports development focus
  - Success stories from past beneficiaries
  - Scholarship program details

### 3. Clean Water Golf Classic ✅ COMPLETED
- **Category:** Environment
- **Status:** Completed
- **Progress:** 100% funded (₹350,000 / ₹350,000)
- **Highlights:**
  - Goal reached successfully
  - Unique "birdie count" donation mechanism
  - Environmental impact metrics

### 4. Children's Health Invitational ⭐ FEATURED
- **Category:** Healthcare
- **Status:** Active (Upcoming Event)
- **Progress:** 16.7% funded (₹125,000 / ₹750,000)
- **Highlights:**
  - High-value fundraising goal
  - Premium invitational format
  - Mobile medical unit program

### 5. Women Empowerment Golf Cup
- **Category:** Education
- **Status:** Active
- **Progress:** 39.2% funded (₹98,000 / ₹250,000)
- **Highlights:**
  - Women-only tournament
  - Vocational training focus
  - Entrepreneurship support

## 🔍 Key Features to Demonstrate

### For Recruiters Evaluating Code Quality:

1. **Authentication & Authorization**
   - Role-based access control (RBAC)
   - Secure password handling via Supabase
   - Protected routes with middleware
   - Session management

2. **Database Architecture**
   - PostgreSQL with Prisma ORM
   - Well-structured schema with relations
   - Soft deletes for data integrity
   - Proper indexing for performance

3. **Payment Integration**
   - Razorpay gateway integration
   - Complete payment lifecycle tracking
   - Fee calculation and net amount
   - Refund support

4. **File Upload & Storage**
   - Supabase Storage integration
   - Organization document verification
   - Image optimization
   - Secure file access

5. **User Experience**
   - Responsive design (mobile-first)
   - Loading states and error handling
   - Toast notifications
   - Form validation with Zod

6. **Code Organization**
   - Feature-based architecture
   - Clean separation of concerns
   - Server actions for mutations
   - Reusable components

## 📱 User Flows to Test

### Flow 1: Donor Making a Donation
1. Login as donor (donor@golfcharity.com)
2. Browse campaigns or use search
3. Click on "Summer Charity Golf Championship"
4. Read campaign details and impact story
5. Click "Donate Now"
6. Enter donation amount
7. Fill payment details (test mode)
8. Complete donation
9. View receipt and confirmation
10. Check donation history

### Flow 2: Organizer Creating a Campaign
1. Login as organizer (organizer@golfcharity.com)
2. Go to Campaigns → Create New
3. Fill in campaign details:
   - Title and description
   - Category selection
   - Goal amount
   - Start and end dates
   - Upload cover image
4. Save as draft
5. Preview campaign
6. Submit for approval
7. View in "Pending Approval" status
8. (Switch to admin to approve)

### Flow 3: Admin Approving Content
1. Login as admin (admin@golfcharity.com)
2. Navigate to Admin → Campaign Approvals
3. View pending campaigns list
4. Click on a pending campaign
5. Review details and documentation
6. Approve or reject with feedback
7. View approval notification
8. Verify campaign now shows as "Active"

### Flow 4: Organization Verification
1. Login as pending organizer (pending@golfcharity.com)
2. Complete organization profile
3. Upload required documents:
   - Registration certificate
   - PAN card
   - Tax exemption certificate
4. Submit for verification
5. (Switch to admin)
6. Review documents
7. Approve organization
8. (Switch back) See organizer status updated

## 📊 Analytics & Reports

### What to Explore:

**Organizer Analytics:**
- Campaign performance metrics
- Donation trends over time
- Donor demographics
- Conversion rates

**Admin Analytics:**
- Platform-wide statistics
- Revenue tracking
- User growth metrics
- Campaign success rates
- Payment gateway analytics

## 🎓 Technical Highlights for Recruiters

### Architecture Patterns:
- ✅ **Next.js 15 App Router** with React Server Components
- ✅ **TypeScript** strict mode throughout
- ✅ **Feature-based folder structure** for scalability
- ✅ **Server Actions** for data mutations
- ✅ **Prisma ORM** with type-safe queries
- ✅ **Supabase Auth** for authentication
- ✅ **Zod** for runtime validation
- ✅ **Tailwind CSS** for styling

### Security Features:
- ✅ Row-level security with permission checks
- ✅ Input validation on both client and server
- ✅ SQL injection prevention via Prisma
- ✅ XSS protection with React
- ✅ CSRF protection built-in
- ✅ Secure password hashing

### Performance Optimizations:
- ✅ Database connection pooling
- ✅ Strategic indexes on queries
- ✅ Image optimization with Next.js
- ✅ Server-side rendering for SEO
- ✅ React Server Components for reduced JS

### Code Quality:
- ✅ Comprehensive error handling
- ✅ Loading and error states
- ✅ Reusable component library
- ✅ Consistent naming conventions
- ✅ Well-documented code
- ✅ Type-safe throughout

## 🐛 Known Demo Limitations

1. **Payment Gateway**: Using test/mock mode (no real payments)
2. **Email Notifications**: Not configured (requires SMTP setup)
3. **File Uploads**: Limited to allowed file types
4. **AI Features**: May require API keys for full functionality

## 💡 Tips for Best Demonstration

1. **Start with Donor View**: Show the user-facing experience first
2. **Demonstrate Role Switching**: Log out and log in with different accounts
3. **Show Complete Flow**: Walk through end-to-end user journeys
4. **Highlight Security**: Demonstrate permission-based access
5. **Showcase Responsive Design**: Resize browser or test on mobile
6. **Point Out Code Quality**: Mention architecture decisions

## 📞 Support & Questions

If you encounter any issues during the demo:

1. Check that you've seeded the database: `npm run db:seed`
2. Verify Supabase users are created (see `scripts/create-demo-users.md`)
3. Ensure `.env.local` has all required variables
4. Restart the development server

## 🎯 Ready to Impress Recruiters!

Your platform now has:
- ✅ 8 realistic campaigns with rich content
- ✅ Multiple demo accounts for testing
- ✅ 50+ transactions for data depth
- ✅ Complete organization verification workflow
- ✅ Admin, Organizer, and Donor perspectives
- ✅ Beautiful UI with proper loading states
- ✅ Production-ready code architecture

**Start the demo:**
```bash
npm run dev
```

Then visit: `http://localhost:3000`

**Good luck with your presentation!** 🚀

---

*Last Updated: October 9, 2026*
