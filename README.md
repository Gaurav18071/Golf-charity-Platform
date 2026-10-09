# 🏌️ Golf Charity Platform

A modern fundraising platform connecting golfers with charitable organizations. Built with Next.js, TypeScript, Prisma, and Supabase.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password auth via Supabase
- 👥 **Role-Based Access Control** - Admin, Organizer, Donor, and Pending Organizer roles
- 🎯 **Campaign Management** - Create, edit, and manage fundraising campaigns
- 💰 **Donation Processing** - Integrated payment processing with Razorpay
- 📊 **Analytics Dashboard** - Track campaign performance and donations
- 🏢 **Organization Verification** - Document upload and admin approval workflow
- 🔔 **Real-time Notifications** - In-app and email notifications
- 🤖 **AI-Powered Features** - Campaign enhancement and impact analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A Supabase account ([sign up](https://supabase.com))
- A Neon PostgreSQL database ([sign up](https://neon.tech))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd golf-charity-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

   # Neon PostgreSQL
   DATABASE_URL=postgresql://user:password@host/database
   DIRECT_URL=postgresql://user:password@host/database

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed sample data (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Architecture Guide](./ARCHITECTURE.md)** - Detailed architecture and design patterns
- **[Cleanup Summary](./CLEANUP_SUMMARY.md)** - Recent refactoring and improvements

## 🏗️ Project Structure

```
golf-charity-platform/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard
│   └── (public)/          # Public landing pages
├── components/            # React components
├── features/              # Feature modules (recommended structure)
│   ├── auth/             # Authentication & permissions
│   ├── donation/         # Donation processing
│   ├── organization/     # Organization management
│   └── profile/          # User profiles
├── lib/                   # Shared utilities
├── prisma/               # Database schema & migrations
└── scripts/              # Utility scripts
```

## 🛠️ Available Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes (dev only)
npm run db:studio    # Open Prisma Studio GUI
npm run db:seed      # Seed database with sample data
```

### Utility Scripts
```bash
# Update a user's role
npx tsx scripts/update-user-role.ts user@example.com ORGANIZER

# Test database connection
npx tsx scripts/test-db-connection.ts
```

## 🔐 User Roles

- **ADMIN** - Full platform access, can approve campaigns and manage users
- **ORGANIZER** - Can create and manage fundraising campaigns
- **PENDING_ORGANIZER** - Awaiting admin approval to become organizer
- **DONOR** - Can browse campaigns and make donations

## 💳 Payment Integration

The platform uses Razorpay for payment processing. To enable payments:

1. Sign up at [Razorpay](https://razorpay.com)
2. Get your API keys from the dashboard
3. Add to `.env.local`:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_your_key
   RAZORPAY_KEY_SECRET=your_secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key
   ```

## 🤖 AI Features (Optional)

AI-powered features use Google Gemini or OpenAI for:
- Campaign description enhancement
- Impact analysis and reporting
- Donation suggestions

To enable AI features, add to `.env.local`:
```bash
GEMINI_API_KEY=your_gemini_key
# OR
OPENAI_API_KEY=your_openai_key
```

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Run linter
npm run lint
```

## 📦 Tech Stack

- **Framework:** Next.js 16.2.2 (App Router)
- **Language:** TypeScript 5.x
- **Database:** Neon PostgreSQL + Prisma ORM
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **UI Components:** Custom components with shadcn/ui patterns
- **Payment:** Razorpay
- **AI:** Google Gemini / OpenAI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the feature-based architecture (see `ARCHITECTURE.md`)
- Use TypeScript strict mode
- Add Zod schemas for all user inputs
- Run type checking before committing: `npx tsc --noEmit`
- Write self-documenting code with clear naming
- Add JSDoc comments for public APIs

## 🐛 Known Issues

See [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md#-known-issues-to-be-fixed) for a list of known issues and planned fixes.

## 📝 License

This project is private and proprietary.

## 🆘 Troubleshooting

### Authentication Error
**Error:** "Unable to connect to the authentication server"

**Solution:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
2. Verify your Supabase project is active
3. Check your internet connection

### Database Connection Error
**Error:** "Can't reach database server"

**Solution:**
1. Verify `DATABASE_URL` in `.env.local`
2. Check your Neon project status
3. Ensure your IP is allowed in Neon's IP allowlist (or use `0.0.0.0/0` for development)

### Build Errors
**Error:** Module not found

**Solution:**
1. Run `npm install` to ensure all dependencies are installed
2. Check that import paths use the `@/` alias correctly
3. Verify `tsconfig.json` paths configuration

### Type Errors After Schema Changes
**Error:** Prisma type errors

**Solution:**
1. Run `npm run db:generate` to regenerate the Prisma client
2. Restart your TypeScript server in your IDE

## 📞 Support

For questions or issues:
1. Check the [Architecture Guide](./ARCHITECTURE.md)
2. Review the [Cleanup Summary](./CLEANUP_SUMMARY.md)
3. Search existing issues in the repository

## 🙏 Acknowledgments

Built with modern web development best practices and inspired by successful charity platforms.

---

**Last Updated:** October 9, 2026  
**Version:** 0.1.0
