# 🌿 Verdant — "Grow your career"

> A serene, conscious, full-stack job platform connecting thoughtful candidates with flourishing companies. Built with Next.js 14 (App Router) and MongoDB Atlas.

---

## 🪴 Overview

Verdant is a complete production-quality web platform with a custom design system inspired by a sunlit plant shop and modern wellness spaces.

### Key Highlights
- **No Heavy UI Kits**: Bespoke CSS Modules + custom design tokens in `app/globals.css`.
- **Serene Aesthetics**: White base, layered botanical greens (`#1E9A56`, `#2FB36A`, `#0B3D24`), mint accents (`#E3F4E9`), and crisp lime highlights (`#C8F169`). Fraunces serif typography for welcoming headings paired with Plus Jakarta Sans.
- **Dual-Mode Data Layer**: Runs instantly out of the box with fallback seed data, and connects seamlessly to MongoDB Atlas with cached Mongoose connections (`lib/dbConnect.js`).
- **Complete Role-Based Security**: Three user roles (**Job Seeker**, **Employer**, **Admin**) protected by NextAuth JWT sessions, bcrypt hashing, and route middleware guards (`middleware.js`).

---

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: MongoDB Atlas with Mongoose (with cached connection helper for serverless reuse)
- **Authentication**: NextAuth (Auth.js) Credentials Provider with role-based JWT session callbacks
- **Forms & Validation**: Zod schemas for both client and API Route Handlers
- **State & UI Extras**:
  - `@dnd-kit/core` & `@dnd-kit/sortable` for interactive candidate pipeline Kanban drag-and-drop
  - `recharts` for applications over time and candidate stage breakdowns
  - `lucide-react` for crisp icons
  - `react-hot-toast` for notifications
  - `canvas-confetti` for celebratory botanical leaf application submission particles
  - `nextjs-toploader` for the green navigation progress bar

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default contents of `.env.local`:
```env
# MongoDB Connection String (Local or Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/verdant

# NextAuth secret
NEXTAUTH_SECRET=verdant-super-secret-auth-key-change-in-production-2024
NEXTAUTH_URL=http://localhost:3000

# Scheduled Vercel Cron Secret
CRON_SECRET=verdant_cron_secret_secure_987654321
```

### 3. Seed Database
Run the seed script to populate realistic companies, jobs, seekers, and applications:
```bash
npm run seed
```

> **Demo Accounts created by seed script:**
> - **Admin**: `admin@verdant.com` / `Admin@123`
> - **Employers**: `aarav@floralabs.io`, `priya@sproutify.co`, `kavita@fernstone.design` / `Employer@123`
> - **Job Seekers**: `ananya@gmail.com`, `aditya@gmail.com`, `meera@gmail.com` / `Seeker@123`

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌿 Feature Walkthrough

### 1. Public Experience
- **Landing Page**: Botanical radial glow hero, search bar with recent searches, trusted brand strip, craft categories grid, featured jobs, "The Verdant Way" 3-step walkthrough, animated platform statistics band, testimonials, and employer CTA.
- **Search & Filter Hub (`/jobs`)**: 2-column layout with sticky search, URL query sync (`useSearchParams`), multi-faceted filters (work mode chips, job type checkboxes, experience level, salary range, date posted), and list/grid view toggle.
- **Job Details (`/jobs/[id]`)**: SEO metadata via `generateMetadata`, breadcrumbs, salary format in INR (LPA/stipend), responsibilities checklist, requirements, skills chips, similar jobs, mobile sticky apply bar, and one-click application modal.
- **Apply Flow Modal**: Profile resume selector or drag-and-drop PDF upload, cover note with live character counter, confirmation stage, and botanical confetti celebration.

### 2. Job Seeker Dashboard (`/dashboard/seeker`)
- **Overview**: 4 stat cards (Applications, In Review, Interviews, Saved), recent application cards with horizontal stepper pipeline, profile strength ring (sprout to tree progress indicator), upcoming interview alert, and recommended roles.
- **My Applications**: Filter by status (Applied, Shortlisted, Interview, Offered, Rejected, Withdrawn) with employer notes and option to withdraw.
- **Saved Jobs**: Quick bookmark management.
- **Profile Builder**: Cover strip, avatar upload overlay, bio editor, interactive skills tag manager, work experience timeline modal, and education history.

### 3. Employer Dashboard (`/dashboard/employer`)
- **Overview**: Active jobs count, total applicants, shortlisted count, views, Recharts area chart with green gradient fill, and donut status breakdown.
- **4-Step Job Posting Wizard (`/dashboard/employer/post-job`)**:
  - Step 1: Basics (title, category, type, work mode, location)
  - Step 2: Details (description, dynamic responsibilities, requirements, skills chips)
  - Step 3: Compensation & Deadline (salary band, experience, openings, date picker)
  - Step 4: Preview with exact live job card preview & instant publish or save as draft.
- **My Jobs (`/dashboard/employer/my-jobs`)**: Listing table with quick actions to Close, Reopen, Duplicate, or Delete roles.
- **Interactive Kanban (`/dashboard/employer/applicants`)**: Full drag-and-drop pipeline powered by `@dnd-kit` across 5 columns (*Applied*, *Shortlisted*, *Interview*, *Offered*, *Rejected*), list view toggle, and a slide-in candidate drawer with PDF resume viewer and private notes.

### 4. Admin Control Room (`/dashboard/admin`)
- Control sidebar in `green-900` with active lime indicators.
- **Overview**: Platform-wide metrics, candidate & job growth area chart, listing moderation queue with instant Approve/Reject, and live activity stream.
- **User Management**: Searchable user table, filter by role, block/unblock, delete, and CSV export.
- **Job Moderation**: Status management, feature toggle with star icon, and CSV export.
- **Company Verification**: Verify/Unverify trust ticks on employer profiles.
- **Community Reports**: Moderate flagged listings and resolve candidate reports.
- **Platform Settings**: Toggle "Require Admin Approval for New Jobs" and test Vercel Cron trigger.

### 5. Scheduled Automation
- **Vercel Cron (`app/api/cron/expire-jobs/route.js`)**: Automatically closes postings whose deadline has passed. Protected by `CRON_SECRET`.

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/login & register
│   ├── (public)/jobs, jobs/[id], companies
│   ├── dashboard/
│   │   ├── seeker/ (overview, applications, saved, recommended, profile, settings)
│   │   ├── employer/ (overview, post-job, my-jobs, applicants, company, settings)
│   │   └── admin/ (overview, users, jobs, companies, reports, categories, settings)
│   ├── api/ (auth, jobs, applications, saved, users, companies, admin, cron)
│   ├── globals.css
│   ├── layout.js & page.jsx
│   ├── not-found.jsx & error.jsx
├── components/
│   ├── ui/ (Button, Input, Select, Badge, Chip, Card, Modal, Drawer, Tabs, Stepper, StatCard, DataTable, Pagination, EmptyState, Skeleton)
│   ├── layout/ (Navbar, Footer)
│   ├── jobs/ (JobCard, ApplyModal)
│   ├── landing/ (LandingHero)
│   └── providers/ (AuthProvider)
├── lib/
│   ├── dbConnect.js
│   ├── auth.js
│   ├── validators.js
│   ├── ratelimit.js
│   ├── utils.js
│   └── dataService.js & seedData.js
├── models/
│   ├── User.js
│   ├── JobSeekerProfile.js
│   ├── Company.js
│   ├── Job.js
│   ├── Application.js
│   ├── SavedJob.js
│   ├── Report.js
│   ├── Notification.js
│   ├── Category.js
│   └── PlatformSetting.js
└── scripts/
    └── seed.js
```

---

## 🔒 Security & Performance
- HTTP Security headers (`X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`) configured in `next.config.js`.
- Sliding-window rate limiter on auth registration and job application endpoints (`lib/ratelimit.js`).
- Zod schema validation on all inputs and API routes (`lib/validators.js`).
- Passwords hashed with bcrypt (salt rounds = 10) and omitted from API responses (`select: false`).
- Mobile-first responsive breakpoints (360px, 480px, 768px, 1024px, 1280px).
