# Golf Charity Platform - Architecture Documentation

## Overview

This is a Next.js 15+ application built with the App Router, TypeScript, Prisma (Neon PostgreSQL), and Supabase Auth. The platform connects golfers with charitable organizations for fundraising campaigns.

## Tech Stack

- **Framework**: Next.js 16.2.2 (App Router)
- **Language**: TypeScript 5.x
- **Database**: Neon PostgreSQL (via Prisma 6.16.2)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for documents/images)
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom components with shadcn/ui patterns

## Project Structure

```
golf-charity-platform/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth pages (login, signup)
│   ├── (dashboard)/              # Protected dashboard pages
│   ├── (public)/                 # Public pages (landing, leaderboard)
│   ├── api/                      # API routes
│   └── actions/                  # Server actions (legacy location)
├── components/                   # React components
│   ├── auth/                     # Auth-related components
│   ├── dashboard/                # Dashboard-specific components
│   ├── landing/                  # Landing page sections
│   └── ui/                       # Reusable UI primitives
├── features/                     # Feature modules (preferred structure)
│   ├── analytics/                # Analytics feature
│   ├── auth/                     # Auth permissions & logic
│   ├── donation/                 # Donation processing
│   ├── email/                    # Email templates & services
│   ├── notification/             # Notifications
│   ├── organization/             # Organization management
│   └── profile/                  # User profiles
├── lib/                          # Shared utilities
│   ├── ai/                       # AI provider integrations
│   ├── supabase/                 # Supabase clients
│   ├── auth.ts                   # Auth helpers
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # General utilities
├── prisma/                       # Database schema & migrations
├── scripts/                      # Utility scripts
├── constants/                    # App-wide constants
├── schemas/                      # Zod validation schemas
├── types/                        # TypeScript type definitions
└── middleware.ts                 # Next.js middleware (auth routing)
```

## Architecture Principles

### 1. Feature-Based Organization

Complete features should be organized as self-contained modules in `/features/`:

```
features/[feature-name]/
├── actions/              # Server actions
├── components/           # Feature-specific components
├── hooks/                # Custom React hooks
├── repositories/         # Data access layer
├── schemas/              # Zod validation schemas
├── services/             # Business logic
├── types/                # TypeScript types
├── utils/                # Helper functions
└── index.ts              # Barrel export (public API)
```

**Examples of complete feature modules:**
- `features/organization/` - Organization management with documents
- `features/donation/` - Payment processing with Razorpay

### 2. Separation of Concerns

- **`app/`** - Routes, layouts, and page components only
- **`features/`** - Business logic, data access, and feature-specific UI
- **`components/`** - Shared/reusable UI components
- **`lib/`** - Infrastructure code (DB clients, external services)

### 3. Data Flow

```
User Action → Component → Server Action → Service → Repository → Database
                              ↓
                         Validation (Zod)
                              ↓
                       Permission Check
                              ↓
                        Business Logic
```

### 4. Authentication & Authorization

**Auth Stack:**
- **Supabase Auth** - User authentication (email/password, OAuth)
- **Neon PostgreSQL** - Profile data, roles, and permissions
- **Middleware** - Route protection (`middleware.ts`)

**Role System:**
- `ADMIN` - Full platform access
- `ORGANIZER` - Can create and manage campaigns
- `PENDING_ORGANIZER` - Awaiting admin approval
- `DONOR` - Can donate to campaigns

**Permission Model:**
All permission logic is centralized in `features/auth/permissions.ts`:

```typescript
import { hasPermission, PERMISSIONS } from "@/features/auth";

// Check if user can create campaigns
if (hasPermission(profile, PERMISSIONS.CREATE_CAMPAIGN)) {
  // Allow campaign creation
}
```

### 5. Database Architecture

**Primary Database:** Neon PostgreSQL (Prisma ORM)

**Key Models:**
- `Profile` - User profiles (synced from Supabase Auth)
- `Campaign` - Fundraising campaigns
- `Donation` - Donation records
- `Organization` - Charitable organizations
- `OrganizationDocument` - Verification documents
- `Notification` - In-app notifications

**Connection Strategy:**
- `DATABASE_URL` - Pooled connection (for application queries)
- `DIRECT_URL` - Direct connection (for Prisma migrations)

### 6. File Storage

**Supabase Storage** is used for:
- Campaign cover images
- Organization verification documents (501(c)(3) certificates, etc.)
- User avatars

**Storage Structure:**
```
organization-documents/
  └── {organizationId}/
      └── {documentType}/
          └── {filename}
```

### 7. Server Actions

**Preferred Location:** Inside feature modules (`features/[feature]/actions/`)

**Legacy Location:** `app/actions/` (being phased out)

Server actions follow this pattern:
```typescript
"use server";

export async function actionName(input: InputType): Promise<ActionResponse> {
  // 1. Auth check
  // 2. Input validation
  // 3. Permission check
  // 4. Business logic
  // 5. Return structured response
}
```

### 8. Client-Side State Management

- **React Context** - Used sparingly for global state (e.g., ProfileContext)
- **Server Components** - Preferred for data fetching
- **Client Components** - Only when interactivity is needed

### 9. Type Safety

- All API responses use strongly-typed schemas
- Zod for runtime validation
- Prisma for database type generation
- No `any` types in production code

## Environment Variables

**Required Variables:**

```bash
# Supabase (Auth + Storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Neon PostgreSQL
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Optional Variables:**

```bash
# AI Providers (for campaign enhancement)
GEMINI_API_KEY=xxx
OPENAI_API_KEY=xxx

# Payment Gateway
RAZORPAY_KEY_ID=xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=xxx
```

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Database Commands

```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:push        # Push schema changes (dev only)
npm run db:studio      # Open Prisma Studio GUI
npm run db:seed        # Seed database with sample data
```

### Type Checking

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

## Design Patterns

### 1. Repository Pattern

Data access is abstracted through repository classes:

```typescript
class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    return prisma.organization.findUnique({ where: { id } });
  }
}
```

### 2. Service Layer

Business logic lives in service classes:

```typescript
class DonationService {
  async processDonation(input: DonationInput): Promise<Donation> {
    // Payment processing logic
    // Notification dispatching
    // Campaign update
  }
}
```

### 3. Action Response Pattern

All server actions return a consistent response shape:

```typescript
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### 4. Barrel Exports

Feature modules expose a clean public API via `index.ts`:

```typescript
// features/profile/index.ts
export type { Profile, ProfileUpdate } from "./profile.types";
export { getCurrentProfile, updateCurrentProfile } from "./profile.service";
export { ProfileProvider, useProfileContext } from "./context/ProfileContext";
```

## Security Considerations

1. **No Secrets in Client Code** - Use `NEXT_PUBLIC_` prefix only for safe values
2. **Row-Level Security** - Supabase RLS policies enforce data access
3. **Permission Checks** - All mutations verify user permissions
4. **Input Validation** - Zod schemas validate all user input
5. **SQL Injection Prevention** - Prisma prevents SQL injection
6. **XSS Protection** - React escapes output by default
7. **CSRF** - Next.js built-in CSRF protection

## Performance Optimizations

1. **Database Indexing** - Prisma schema includes strategic indexes
2. **Connection Pooling** - Neon pooled connection for queries
3. **Server Components** - Minimize client-side JavaScript
4. **Image Optimization** - Next.js Image component for images
5. **Static Generation** - Public pages use ISR where possible

## Known Technical Debt

1. **Server Actions Split** - Some actions still in `app/actions/` instead of feature modules
2. **Type Assertions** - A few `as unknown` casts need proper typing
3. **Missing Relations** - Some Prisma queries don't include relations (causes runtime errors)
4. **Notification Service** - Notification creation doesn't include user relation

## Migration Guidelines

### Moving Server Actions to Feature Modules

When moving actions from `app/actions/` to features:

1. Create `features/[feature]/actions/` directory
2. Move related action files
3. Update imports across the codebase
4. Add exports to `features/[feature]/index.ts`

### Adding New Features

1. Create `features/[feature-name]/` directory
2. Follow the feature module structure
3. Create barrel export (`index.ts`)
4. Add TypeScript types first
5. Implement services/repositories
6. Create server actions
7. Build UI components

## Useful Commands

```bash
# Update user role (admin script)
npx tsx scripts/update-user-role.ts user@example.com ORGANIZER

# Test database connection
npx tsx scripts/test-db-connection.ts

# Generate Prisma client after schema changes
npm run db:generate

# Create new migration
npx prisma migrate dev --name migration_name
```

## Troubleshooting

### Authentication Issues

- **Error: "Unable to connect to authentication server"**
  - Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
  - Verify Supabase project is active
  - Check internet connection

### Database Issues

- **Error: "Can't reach database server"**
  - Verify `DATABASE_URL` in `.env.local`
  - Check Neon project status
  - Ensure IP allowlist includes your location (or use 0.0.0.0/0 for dev)

### Build Errors

- **Module not found errors**
  - Run `npm install` to ensure dependencies are installed
  - Check import paths use `@/` alias correctly
  - Verify `tsconfig.json` paths configuration

### Type Errors

- **Prisma type errors**
  - Run `npm run db:generate` to regenerate Prisma client
  - Restart TypeScript server in your IDE

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Contributing

1. Follow the feature-based structure
2. Use TypeScript strict mode
3. Add Zod schemas for all inputs
4. Write self-documenting code with clear naming
5. Add JSDoc comments for public APIs
6. Test auth flows thoroughly
7. Check type safety with `npx tsc --noEmit`

---

**Last Updated:** 2026-10-09
**Version:** 0.1.0
