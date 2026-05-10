# GujaratJobs — Project Handoff & Continuation Guide

> **Purpose of this document.** A complete handoff brief for any engineer or AI agent picking up this codebase. Reading this doc top to bottom should leave you fully oriented: what the product is, what's built, what works, what's broken, what to build next, the conventions to follow, and how to behave at every interaction edge case. No prior context required.

**Last updated:** 2026-05-10
**Maintainer:** Aryan Chauhan (aryannew2000@gmail.com)
**Repo:** https://github.com/aryanchauhanoffical/GujratJobs
**Live frontend:** https://gujratjobs.netlify.app
**Live backend:** https://gujaratjobs-api.onrender.com

---

## Table of contents

1. [Project overview](#1-project-overview)
2. [Current deployment & live status](#2-current-deployment--live-status)
3. [Tech stack](#3-tech-stack)
4. [Architecture diagram](#4-architecture-diagram)
5. [Repository layout](#5-repository-layout)
6. [Local setup](#6-local-setup)
7. [Environment variables (full reference)](#7-environment-variables-full-reference)
8. [Design system rules](#8-design-system-rules)
9. [What is built (phase by phase)](#9-what-is-built-phase-by-phase)
10. [Authentication & authorization](#10-authentication--authorization)
11. [Interaction patterns (rapid clicks, holds, edge cases)](#11-interaction-patterns)
12. [Logging & observability strategy](#12-logging--observability-strategy)
13. [Error handling patterns](#13-error-handling-patterns)
14. [State management](#14-state-management)
15. [API contracts (endpoint reference)](#15-api-contracts-endpoint-reference)
16. [Known issues & technical debt](#16-known-issues--technical-debt)
17. [Outstanding work (prioritized)](#17-outstanding-work-prioritized)
18. [Future roadmap](#18-future-roadmap)
19. [Testing strategy](#19-testing-strategy)
20. [Deployment pipeline](#20-deployment-pipeline)
21. [Conventions & house rules](#21-conventions--house-rules)
22. [Glossary](#22-glossary)

---

## 1. Project overview

### What is GujaratJobs?

A regional, walk-in-first hiring platform for Gujarat, India. Built for freshers (recent graduates) and the small/medium employers that hire them.

### Core differentiation

National job boards (LinkedIn, Naukri, Indeed) are flooded with **shadow postings** — jobs companies list to look active, with no real intent to hire. Freshers send hundreds of applications without a single interview. GujaratJobs solves three problems:

1. **No ghost listings** — every recruiter is verified before they can post.
2. **Walk-ins as first-class citizens** — same-day drives surface with countdown timers.
3. **Regional focus** — built for 16+ Gujarat cities, not retrofitted from a national platform.

### Voice / tone (per design system)

- Direct, regional, fact-led. No exclamation marks in CTAs.
- Real numbers only. Never fabricate user counts, revenue, ratings.
- Reject hype copy ("Discover amazing opportunities!") — prefer plain ("Find walk-in interviews near you").

### Target users

| Role | What they do |
|---|---|
| **Job seeker** (`role: "jobseeker"`) | Browses jobs, filters by city, finds walk-ins, applies, tracks status |
| **Recruiter** (`role: "recruiter"`) | Posts jobs, reviews applicants, marks hires (must be admin-approved first) |
| **Admin** (`role: "admin"`) | Approves recruiters, reviews scraped jobs, manages users, oversees platform |

---

## 2. Current deployment & live status

### Frontend — Netlify

- URL: `https://gujratjobs.netlify.app`
- Project: `gujratjobs`
- Auto-deploys on push to `main` branch
- Build config: `client/netlify.toml`
- Required env vars (set in Netlify dashboard):
  - `VITE_API_URL` = `https://gujaratjobs-api.onrender.com/api`
  - `VITE_SOCKET_URL` = `https://gujaratjobs-api.onrender.com`
  - `NODE_VERSION` = `20`

### Backend — Render

- URL: `https://gujaratjobs-api.onrender.com`
- Service: `gujaratjobs-api`
- Tier: **Free** (sleeps after 15 min idle, ~50s wake-up time)
- Auto-deploys on push to `main` (Blueprint sync from `render.yaml`)
- Health check: `GET /api/health` → `{success: true, ...}`

### Database — MongoDB Atlas

- Cluster: `gujaratjobs.aymkite.mongodb.net`
- Tier: **M0 Free** (512MB, shared)
- Database name: `gujaratjobs`
- IP whitelist: `0.0.0.0/0` (allow from anywhere — required for Render dynamic IPs)
- Database user: `gujaratjobs` (rotate password if compromised)

### Third-party services

| Service | Purpose | Status |
|---|---|---|
| **Apify** | Scrape jobs from LinkedIn / Indeed / Naukri | ⚠️ Free $5 limit hit; resets monthly |
| **ScrapeGraphAI** | Optional post-Apify enrichment | ✅ Wired (v2 `/api/extract` endpoint), gated by `USE_SCRAPEGRAPH_ENRICHMENT` flag |
| **Nodemailer** | Verification + password reset emails | ⚠️ SMTP creds not yet configured in production |

### Live admin credentials

- Email: `admin@gujaratjobs.in`
- Password: set via `ADMIN_PASSWORD` env var on Render
- To reset: `cd server && node seed_admin.js` against the prod DB

---

## 3. Tech stack

### Frontend (`client/`)

```
React 18.2          UI framework
Vite 5.4            Build tool / dev server
Tailwind CSS 3.4    Utility-first styling (with shadcn CSS variable bridge)
shadcn/ui           Radix-based component library (12 components installed)
Headless UI         Legacy; gradually being replaced by Radix
Framer Motion 12    Page transitions, scroll animations
React Router 6      Client-side routing
React Query 5       Server state, caching, mutations
Zustand 4           Client state (filters, preferences)
React Hook Form 7   Form state + validation
Axios               HTTP client
Socket.io-client    Real-time notifications
Heroicons           Icon set (outline variant by default)
date-fns            Date formatting
clsx + tailwind-merge  Class composition
```

### Backend (`server/`)

```
Node.js 20+        Runtime
Express 4.18       HTTP framework
Mongoose 8.0       MongoDB ODM
Socket.io 4.6      Real-time server
JWT (jsonwebtoken)  Auth tokens (access + refresh)
bcryptjs           Password hashing (cost 12)
express-rate-limit Rate limiting
helmet             Security headers
compression        Gzip
morgan             Request logging (dev only)
multer             File uploads (resumes, profile pics)
nodemailer         Transactional email
node-cron          Scheduled tasks
axios              External API calls (Apify, ScrapeGraphAI)
```

### Hosting

- **Netlify** — frontend (free tier, 100GB bandwidth/mo)
- **Render** — backend (free tier; consider upgrading to Starter $7/mo for stable WebSockets)
- **MongoDB Atlas** — database (M0 free, 512MB)

### Dev tools / MCPs (configured in `.vscode/mcp.json`)

| MCP | Purpose |
|---|---|
| `@21st-dev/magic` | AI-driven Tailwind component generation |
| `stitch-mcp` | AI screen design generation (Google) |
| `@testsprite/testsprite-mcp` | Automated UI testing |

---

## 4. Architecture diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Devices                             │
│       (mobile browser, desktop browser — no native apps)         │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Frontend — Netlify CDN                        │
│   React + Vite SPA at gujratjobs.netlify.app                     │
│   - React Router for routing                                     │
│   - React Query for server state cache                           │
│   - Zustand for client state (filters, view modes)               │
└────────────────────────────────┬─────────────────────────────────┘
                                 │ HTTPS REST (axios with JWT)
                                 │ WebSocket (Socket.io for notifs)
                                 ▼
┌──────────────────────────────────────────────────────────────────┐
│              Backend — Render (Node.js + Express)                │
│   gujaratjobs-api.onrender.com                                   │
│   ┌──────────────────────────────────────────────────────────┐   │
│   │  REST API           │  Socket.io      │  Cron jobs       │   │
│   │  /api/auth          │  Notifications  │  - Walk-in       │   │
│   │  /api/jobs          │  Real-time      │  - Scraper       │   │
│   │  /api/applications  │  user rooms     │                  │   │
│   │  /api/recruiter     │                 │                  │   │
│   │  /api/admin         │                 │                  │   │
│   │  /api/scraping      │                 │                  │   │
│   └──────────────────────────────────────────────────────────┘   │
│   Middleware: helmet, cors, rate-limit, JWT auth, role guard     │
└────┬──────────┬──────────┬──────────────────────────┬────────────┘
     │          │          │                          │
     ▼          ▼          ▼                          ▼
┌─────────┐ ┌────────┐ ┌──────────┐         ┌─────────────────────┐
│MongoDB  │ │Resume  │ │ Apify    │         │ ScrapeGraphAI       │
│ Atlas   │ │ files  │ │ Actors   │         │ /api/extract (v2)   │
│ (M0)    │ │ (FS)   │ │ - LI     │         │ Optional enrichment │
└─────────┘ └────────┘ │ - Indeed │         └─────────────────────┘
                       │ - Naukri │
                       └──────────┘
```

---

## 5. Repository layout

```
Ideathon/
├── README.md                       # User-facing readme (basic setup)
├── PROJECT_HANDOFF.md              # ← THIS FILE
├── DESIGN.md                       # Synthesized GujaratJobs design system (source of truth)
├── DESIGN-bmw.md                   # BMW reference (read-only)
├── DESIGN-starbucks.md             # Starbucks reference (read-only)
├── render.yaml                     # Render Blueprint config
├── docker-compose.yml              # Local dev (optional)
├── .gitignore                      # Excludes .env, node_modules, dist, uploads
│
├── client/                         # Frontend (React + Vite)
│   ├── netlify.toml                # Netlify build config
│   ├── package.json
│   ├── vite.config.js              # Path alias @/ → src/
│   ├── jsconfig.json               # Same alias for IDE
│   ├── tailwind.config.js          # Brand tokens + shadcn CSS var bridge
│   ├── public/
│   │   └── _redirects              # Netlify SPA fallback
│   └── src/
│       ├── main.jsx                # Entry; QueryClient + Router setup
│       ├── App.jsx                 # Routes
│       ├── index.css               # Tailwind + CSS variables on :root
│       ├── api/                    # Axios instance + endpoint wrappers
│       │   ├── axios.js            # Base instance, JWT interceptor
│       │   ├── auth.api.js
│       │   ├── jobs.api.js
│       │   ├── applications.api.js
│       │   ├── recruiter.api.js
│       │   └── user.api.js
│       ├── components/
│       │   ├── ui/                 # shadcn components (button, badge, dialog, etc.)
│       │   ├── layout/             # Navbar, Footer, Sidebar, NotificationBell, ProtectedRoute
│       │   ├── jobs/               # JobCard, WalkInCard, JobFilters, JobSearch, JobList, ApplyModal, WalkInCountdown
│       │   ├── dashboard/          # StatsCard, ApplicationCard
│       │   └── home/               # ScrollProgress, LiveTicker, AnimatedNumber, MagneticButton
│       ├── context/
│       │   └── AuthContext.jsx     # Auth provider + login/register/logout
│       ├── hooks/
│       │   └── useWalkInPriority.js
│       ├── lib/
│       │   ├── motion.js           # Framer Motion tokens (use these, don't invent)
│       │   └── utils.js            # cn() helper for shadcn
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── JobsPage.jsx
│       │   ├── JobDetailPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── seeker/             # SeekerDashboard, MyApplicationsPage, SeekerProfile, WalkInsPage
│       │   ├── recruiter/          # RecruiterDashboard, ManageJobsPage, PostJobPage, ViewApplicantsPage, RecruiterProfilePage
│       │   └── admin/              # AdminDashboard, ManageRecruitersPage, ManageUsersPage, ScrapedJobsPage
│       ├── store/
│       │   ├── useJobStore.js      # Filters, pagination, view mode (Zustand)
│       │   └── useNotificationStore.js
│       └── utils/
│           ├── constants.js        # GUJARAT_CITIES, JOB_TYPES, EXPERIENCE_LEVELS, etc.
│           ├── helpers.js          # formatSalary, timeAgo, getInitials, etc.
│           ├── storage.js          # safeStorage wrapper
│           └── validators.js
│
├── server/                         # Backend (Node + Express)
│   ├── package.json
│   ├── server.js                   # Entry; Express + Socket.io + cron init
│   ├── seed_admin.js               # Idempotent admin user seed
│   ├── .env.example                # Reference (real .env is gitignored)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── recruiterController.js
│   │   ├── adminController.js
│   │   ├── userController.js
│   │   ├── notificationController.js
│   │   └── scrapingController.js
│   ├── routes/                     # Express routers (one per controller)
│   ├── middleware/
│   │   ├── auth.js                 # JWT verify, role check
│   │   ├── rateLimiter.js
│   │   ├── upload.js               # Multer setup
│   │   └── locationVerify.js
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── RecruiterProfile.js
│   │   └── Notification.js
│   ├── utils/
│   │   ├── jwtUtils.js             # generateAccessToken, verifyAccessToken, etc.
│   │   ├── apifyIntegration.js     # Job scraping orchestration
│   │   ├── scrapeGraphService.js   # SGAI enrichment (optional)
│   │   ├── duplicateChecker.js
│   │   ├── jobStatusHelper.js      # decideJobStatus, isValidScrapedJob
│   │   ├── walkInUrgency.js
│   │   ├── walkInNotifier.js
│   │   ├── emailService.js
│   │   └── locationUtils.js
│   ├── cron/
│   │   ├── walkInScheduler.js      # Daily 6:30 IST: expire past, refresh urgency, notify, optional scrape
│   │   └── generalScraperScheduler.js  # Every 6h: pull jobs from all 3 sources
│   └── uploads/
│       └── resumes/                # User-uploaded resume files (filesystem)
│
└── apify-scraper/                  # Local Apify dev folder (not deployed)
```

---

## 6. Local setup

### Prerequisites

- Node.js 20+
- npm or pnpm
- MongoDB Atlas account (or local MongoDB)
- Apify account (optional, for scraping)
- ScrapeGraphAI account (optional, for enrichment)

### Steps

```bash
# 1. Clone
git clone https://github.com/aryanchauhanoffical/GujratJobs.git
cd GujratJobs

# 2. Install
cd server && npm install
cd ../client && npm install

# 3. Configure server env
cd ../server
cp .env.example .env
# Edit .env: set MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET (use openssl rand -hex 64)

# 4. Seed admin
node seed_admin.js

# 5. Start backend
npm run dev   # nodemon, port 5002

# 6. Start frontend (in another terminal)
cd ../client
npm run dev   # vite, port 5173, proxies /api → :5002
```

Visit http://localhost:5173. Login as admin: `admin@gujaratjobs.in` / your `ADMIN_PASSWORD`.

---

## 7. Environment variables (full reference)

### Backend (`server/.env`)

```ini
# Server
NODE_ENV=development          # development | production
PORT=5002                     # 10000 on Render

# MongoDB
MONGO_URI=mongodb+srv://gujaratjobs:<password>@gujaratjobs.aymkite.mongodb.net/gujaratjobs?retryWrites=true&w=majority&appName=gujaratjobs

# JWT (use `openssl rand -hex 64` for each)
JWT_SECRET=<64-char hex>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<different 64-char hex>
JWT_REFRESH_EXPIRES_IN=30d

# Cookies (cross-site needs sameSite=none + secure=true in prod)
COOKIE_SECURE=false           # true on Render

# CORS — comma-separated list
CLIENT_URL=http://localhost:5173,https://gujratjobs.netlify.app

# Email (Nodemailer SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GujaratJobs <noreply@gujaratjobs.in>

# Apify (job scraping)
APIFY_API_TOKEN=apify_api_xxxxx
ENABLE_SCRAPER=false          # set true to run cron + startup scrapes

# ScrapeGraphAI (optional enrichment)
USE_SCRAPEGRAPH_ENRICHMENT=false
SCRAPEGRAPH_API_KEY=sgai-xxxxx

# File uploads
MAX_FILE_SIZE=5242880         # 5MB
UPLOAD_PATH=./uploads

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000   # 15 min
RATE_LIMIT_MAX_REQUESTS=100

# Admin seed
ADMIN_EMAIL=admin@gujaratjobs.in
ADMIN_PASSWORD=<strong password>
```

### Frontend (`client/.env`)

```ini
# API base (include /api suffix)
VITE_API_URL=http://localhost:5002/api

# Socket.io origin (no /api)
VITE_SOCKET_URL=http://localhost:5002
```

### Production overrides

On **Render**, set the same backend vars but flip:
- `NODE_ENV=production`
- `PORT=10000`
- `COOKIE_SECURE=true`
- `CLIENT_URL=https://gujratjobs.netlify.app`
- `MONGO_URI` to the prod Atlas string

On **Netlify**, set:
- `VITE_API_URL=https://gujaratjobs-api.onrender.com/api`
- `VITE_SOCKET_URL=https://gujaratjobs-api.onrender.com`
- `NODE_VERSION=20`

---

## 8. Design system rules

**Read `DESIGN.md` for the full system.** This is the source of truth for every UI decision. Summary:

### Brand colors (Tailwind classes available)

| Token | Hex | Use |
|---|---|---|
| `saffron` | `#C44A0F` | Primary brand. All primary CTAs. |
| `saffron-active` | `#A23A0A` | Pressed/active state on saffron. |
| `marigold` | `#F59E0B` | Walk-in urgency, "today" indicators. **Reserved for urgency only**. |
| `canvas` | `#FFFFFF` | Default page surface. |
| `canvas-warm` | `#FBF7F0` | Hero bands, marketing sections. |
| `surface-dark` | `#1A1A1A` | Dark feature bands, footer. |
| `ink` | `#1A1A1A` | Headings on light. |
| `body` | `#3C3C3C` | Body text. |
| `muted-text` | `#6B6B6B` | Secondary text. |
| `muted-soft` | `#9A9A9A` | Tertiary/placeholder. |
| `hairline` | `#E6E6E6` | Default border. |
| `hairline-strong` | `#CCCCCC` | Stronger border. |

### Typography

- **Two weights only:** 400 (regular) and 700 (bold). Never use 500, 600, 800.
- **Family:** Inter (system fallback). Add `'Noto Sans Gujarati'` for vernacular.
- **Tracking:** `tracking-tighter` (-0.02em) on display, `tracking-tight` on titles, `tracking-[0.15em] uppercase` on BMW eyebrows.

### Geometry rules

| Surface | Radius |
|---|---|
| **Primary CTAs** ("Apply", "Post job") | `rounded-none` (0px — BMW sharp) |
| **Secondary CTAs** ("Save", "Cancel") | `rounded-full` (Starbucks pill) |
| **Cards** | `rounded-xl` (12px) |
| **Inputs / textareas** | `rounded-lg` (8px) |
| **Modals** | `rounded-xl` |
| **Image containers** | `rounded-none` (BMW photography) |

### Banned patterns (per DESIGN.md §11)

- ❌ Glassmorphism / `backdrop-blur` cards
- ❌ Gradient text headlines (`bg-gradient-to-r ... bg-clip-text`)
- ❌ Neon / glow effects
- ❌ Fake stat numbers
- ❌ Lottie / animated illustrations as primary visual
- ❌ "AI sparkle" iconography
- ❌ Multi-color brand palette (saffron is the ONE primary)
- ❌ Bouncy spring animations
- ❌ More than two type weights per page
- ❌ Emoji in microcopy

### Motion tokens (`client/src/lib/motion.js`)

Use these. Don't invent new durations or curves.

```js
import { fadeUp, stagger, easeOutCirc, D_REVEAL, D_HOVER } from "@/lib/motion";

// Variants for sections
<motion.div variants={fadeUp} initial="initial" whileInView="animate">

// Card hover — 2px lift, no shadow change
<motion.div whileHover={{ y: -2 }} transition={{ duration: D_HOVER, ease: easeOutQuart }}>

// Press feedback — scale 0.98 only, never 0.95
<button className="active:scale-[0.98] transition-transform duration-100">
```

---

## 9. What is built (phase by phase)

### Phase 0 — Foundation (commits `64df8a6`, `e164507`)

- ✅ DESIGN.md synthesized from BMW + Starbucks references via `npx getdesign@latest`
- ✅ shadcn/ui initialized (Vite + Radix + Nova preset)
- ✅ 12 shadcn components added: button, card, dialog, dropdown-menu, input, label, select, sheet, tabs, sonner, badge, avatar
- ✅ Path alias `@/` wired (jsconfig + vite.config)
- ✅ Tailwind CSS variable bridge (oklch via `var(--*)`) so shadcn 4 components render on Tailwind 3.4
- ✅ Brand tokens exposed as utility classes (`bg-saffron`, `text-ink`, etc.)

### Phase 1 — HomePage redesign (commits `b22bbab`, `b97f41c`)

- ✅ Full HomePage rewrite using DESIGN.md tokens
- ✅ New components: ScrollProgress, LiveTicker, AnimatedNumber, MagneticButton
- ✅ Word-by-word headline reveal with blur transition
- ✅ Animated saffron underline draw on hero "walk-in." word
- ✅ Live data tickers (real DB job count, walk-in count)
- ✅ Dark feature band with count-up animated stats
- ✅ Scroll-snap horizontal walk-in carousel on mobile
- ✅ Magnetic CTA buttons (cursor-following, capped at 8px pull)
- ✅ Scroll progress bar pinned to top

### Phase 2 — Public + browse pages (commit `7401c34`)

- ✅ JobDetailPage rebuilt — charcoal hero band for walk-ins, sticky apply card, walk-in action panel (Call/WhatsApp/Email/Maps)
- ✅ JobsPage rebuilt — cream hero, sticky filter sidebar, BMW pagination
- ✅ WalkInsPage rebuilt — charcoal hero, urgency-sorted grid, city chip filter
- ✅ LoginPage rebuilt — split layout (form + value-prop), state machine for account-not-found / wrong-pass
- ✅ RegisterPage rebuilt — mirror layout, role selector with LayoutGroup transition
- ✅ Shared components rebuilt: JobCard, WalkInCard, WalkInCountdown, JobFilters, JobSearch, JobList, ApplyModal, ApplicationCard, StatsCard, Sidebar, LoadingSpinner

### Phase 3 — Auth-gated pages (commit `3eead44`)

- ✅ SeekerDashboard, MyApplicationsPage, SeekerProfile rebuilt
- ✅ RecruiterDashboard, ManageJobsPage, PostJobPage, ViewApplicantsPage, RecruiterProfilePage rebuilt
- ✅ AdminDashboard, ManageRecruitersPage, ManageUsersPage, ScrapedJobsPage rebuilt

### Backend infrastructure (earlier commits)

- ✅ JWT auth (access + refresh tokens), bcrypt password hashing
- ✅ Role-based access (`jobseeker` / `recruiter` / `admin`)
- ✅ Multi-origin CORS (comma-separated `CLIENT_URL`)
- ✅ Cross-site cookies (`sameSite: 'none'`, `secure: true` in prod)
- ✅ Apify scraper for LinkedIn (curious_coder), Indeed (misceres), Naukri (epicscrapers)
- ✅ ScrapeGraphAI v2 `/api/extract` enrichment (gated, non-blocking, throttled)
- ✅ Walk-in cron (daily 6:30 IST: expire past, refresh urgency, notify, optional scrape)
- ✅ General scraper cron (every 6h, gated by `ENABLE_SCRAPER`)
- ✅ Real-time Socket.io notifications (user-room based)

### Removed / cleaned

- ✅ All fake demo data deleted (DEMO_RECRUITERS, DEMO_USERS, DEMO_SCRAPED_JOBS arrays)
- ✅ Fake hero stats removed ("Trusted by 2,400+", "12,500+ Jobs")
- ✅ Fake testimonials removed
- ✅ Public demo credentials box on login removed
- ✅ Old `seed.js` and `real_seed.js` deleted (admin-only seed remains)

---

## 10. Authentication & authorization

### Auth flow (frontend ↔ backend)

```
1. User submits LoginPage form (email + password).
2. POST /api/auth/login with body { email, password }.
3. Backend:
   a. Lookup user by lowercased trimmed email.
   b. Run bcrypt.compare(password, user.password).
   c. On success: generate access token (JWT, 7d) + refresh token (JWT, 30d).
   d. Save refresh token on user record.
   e. Set cookies (httpOnly, secure, sameSite='none' in prod).
   f. Return { user, token }.
4. Frontend:
   a. Save access token to localStorage (key: 'token').
   b. Set axios default Authorization header to "Bearer <token>".
   c. Update AuthContext state, redirect to role-based dashboard.
5. On 401 from any subsequent request:
   a. Axios response interceptor catches it.
   b. Calls POST /api/auth/refresh-token with stored refreshToken.
   c. On success: save new access token, retry original request.
   d. On failure: clear token, redirect to /login.
```

### Token storage

- **Access token:** localStorage (key `token`) AND httpOnly cookie. Frontend uses localStorage value in `Authorization: Bearer <token>` header. Cookie is backup for cross-domain edge cases.
- **Refresh token:** httpOnly cookie only. Never exposed to JS.

### Authorization patterns

#### Backend middleware (`server/middleware/auth.js`)

```js
// Verify JWT, attach user to req
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id);
    if (!req.user) throw new Error('User not found');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Role check
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
```

Usage in routes:

```js
router.post('/jobs', protect, authorize('recruiter'), createJob);
router.patch('/admin/recruiters/:id/approve', protect, authorize('admin'), approveRecruiter);
```

#### Frontend route guards (`client/src/components/layout/ProtectedRoute.jsx`)

Wrap routes that require auth:

```jsx
<Route path="/dashboard" element={
  <ProtectedRoute role="jobseeker">
    <SeekerDashboard />
  </ProtectedRoute>
} />
```

ProtectedRoute checks:
1. `isAuthenticated` from AuthContext — redirect to `/login` if false.
2. `user.role` matches required role — redirect to `/` if not.

### Required behaviors for new auth-gated features

When you add a new protected page or API endpoint:

1. **Backend:** apply `protect` middleware AND appropriate `authorize(role)` if role-restricted.
2. **Frontend:** wrap route in `<ProtectedRoute>`. Show role-appropriate sidebar.
3. **Sensitive operations** (delete, ban, mass-approve) must double-check role on backend even if frontend already gated. Never trust frontend.
4. **Recruiter-specific data** must filter by `req.user._id` to prevent recruiter A from seeing recruiter B's applicants.
5. **Admin actions** require `req.user.role === 'admin'`. No exceptions.

### Verification states

- `isVerified: false` — email not verified yet. User can browse but cannot apply (jobseeker) or post jobs (recruiter).
- `isApproved: false` — recruiter not yet approved by admin. Can sign up and create profile but cannot post jobs.
- `isActive: false` — account suspended by admin. Cannot log in.
- `isSuspended: true` — same as `isActive: false`. Backend should reject login.

### Where authentication is currently weak (TODO)

- ❌ **No email verification flow wired in production.** `verificationToken` is generated but `sendVerificationEmail` requires SMTP credentials. Emails fail silently.
- ❌ **No forgot password flow tested end-to-end.** Token generation works, but email delivery untested.
- ❌ **No 2FA / OTP option** for high-trust roles (admin).
- ❌ **No session list / "log out other devices"** feature.
- ❌ **No rate limiting on login by email** (only IP-based). Should add per-account lock-after-5-failed-attempts.

---

## 11. Interaction patterns

This section is critical for any new UI work. Document covers edge cases the design system implies but doesn't make explicit.

### Button click behaviors

#### Single click (default)

- Visual: `active:scale-[0.98]` for 100ms.
- Logic: trigger primary action.
- Feedback: if async, replace label with loading spinner inline (`<LoadingSpinner size="sm" />` + "Submitting" text).

#### Rapid clicks (5+ in 1s)

The user is anxious or thinks the button is broken. Defensive behavior:

1. **Disable the button while a mutation is pending.** Use `disabled={mutation.isPending}` (React Query pattern).
2. **Idempotent backend operations.** All POST/PATCH should be safe to call twice. Application creation has a unique index on `(jobId, applicantId)` — duplicate posts return 400 "Already applied", not a duplicate row.
3. **Visual: don't change appearance with each click.** Just stay disabled. Do NOT increment a counter visible to the user — that would suggest each click triggered a separate action.
4. **Logging:** if more than 3 click events arrive within 500ms with the same button id, log:
   ```js
   console.warn('[ui] Rapid click detected', { button: id, count: 5, intervalMs: 423 });
   ```
   Don't show user a toast. They're already frustrated; don't pile on.

#### Long press / hold (>500ms)

Mobile gesture. Default behavior on web buttons: nothing special. But for these specific cases:

| Element | Long press behavior |
|---|---|
| **Job card** | Show context menu (Save / Share / Hide) |
| **Notification item** | Mark as read / delete |
| **Application status badge** (recruiter view) | Quick-status changer popover |
| **Walk-in countdown** | Show full countdown in days/hours/min |

Implementation pattern:

```jsx
const longPressTimer = useRef(null);
const handleTouchStart = () => {
  longPressTimer.current = setTimeout(() => {
    setContextMenuOpen(true);
    if (navigator.vibrate) navigator.vibrate(10); // Subtle haptic on mobile
  }, 500);
};
const handleTouchEnd = () => clearTimeout(longPressTimer.current);
```

For desktop, equivalent is right-click or three-dot menu on the card. Don't require long-press on desktop.

#### Double-click

Generally not used. If a user double-clicks a primary CTA, the second click should be no-op (button is disabled while pending). For job cards, double-click opens detail page (same as single click — no special behavior).

#### Keyboard

- **Enter** on a focused button: same as click.
- **Space** on a focused button: same as click.
- **Tab** order: must follow visual reading order. Test with keyboard nav before shipping.
- **Escape** in modals: closes the modal.
- **Cmd+K / Ctrl+K** (TODO): open command palette / global search.

### Form behaviors

#### Validation timing

- **On change:** show errors only AFTER the user has touched the field once (set `touched: true` after first blur).
- **On blur:** validate the field; show inline error if invalid.
- **On submit:** validate all fields, focus the first invalid one, do not submit.

#### Submit button states

```jsx
<button
  type="submit"
  disabled={isSubmitting || !isValid}   // Both: prevent invalid + double-submit
  className="..."
>
  {isSubmitting ? (
    <>
      <LoadingSpinner size="sm" /> Saving
    </>
  ) : (
    "Save changes"
  )}
</button>
```

#### Auto-save behavior (where applicable)

Currently NOT implemented. Future: SeekerProfile and RecruiterProfile should auto-save 800ms after last keystroke (debounced). Show subtle "Saving..." → "Saved" indicator next to the section header.

#### Lost-changes warning

Currently NOT implemented. TODO: when user has unsaved form changes and tries to navigate away, show:

```
"You have unsaved changes. Are you sure you want to leave?"
```

Use `useBlocker` from React Router v6.

### Search behaviors

#### Debounce

Job search debounces 400ms after last keystroke before firing the query (`client/src/components/jobs/JobSearch.jsx`).

#### Empty state

If a search returns 0 results:

```
[icon] No jobs found
"Try adjusting your search or filters to find more jobs."
```

Don't suggest fake categories ("Try: Software, Sales, Manufacturing") — that's AI-generic.

#### Loading state

While search is fetching, show a centered LoadingSpinner with "Loading jobs..." text. Don't show a skeleton grid (we don't use skeletons in this design system).

### Modal behaviors

- **Backdrop click** → closes modal.
- **Escape key** → closes modal.
- **Submit while loading** → button is disabled; cannot trigger duplicate.
- **Form errors** → keep modal open, focus error field, scroll into view.
- **Network error during submit** → show toast `toast.error("Failed to ...")`, keep form state intact, stay open.

### Toast / notification behaviors

Use `react-hot-toast` (already wired in `client/src/main.jsx`).

| Type | When | Auto-dismiss |
|---|---|---|
| `toast.success(...)` | Successful create/update/delete | 4s |
| `toast.error(...)` | Backend errors, network failures | 6s |
| `toast.loading(...)` | Long operations (rare; prefer inline spinner) | until dismissed |

**Don't stack toasts.** If the same action fires twice, dismiss the previous toast first.

```js
const toastId = toast.loading('Submitting');
try {
  await mutation();
  toast.success('Saved', { id: toastId });
} catch {
  toast.error('Failed', { id: toastId });
}
```

### Real-time (Socket.io) behaviors

- On Socket.io connect: emit `join` with userId. Backend joins the user to room `user_<userId>`.
- On disconnect: log to console (debug level), don't show user.
- On message received (e.g. new walk-in):
  - Increment unread count badge on NotificationBell
  - If page is `/walk-ins`, refetch the list (React Query invalidate)
  - Don't show toast for every notification — only for high-urgency events (today's walk-in opens, application shortlisted)

---

## 12. Logging & observability strategy

### Levels

| Level | When to use | Visible where |
|---|---|---|
| `console.error` | Errors that need attention | Browser console, Render logs |
| `console.warn` | Recoverable anomalies (rapid clicks, fallback fired) | Browser console, Render logs |
| `console.info` | Notable events (login, scraping started, real DB query) | Render logs only (browser console gets quiet) |
| `console.log` | Debug only — should not exist in production code | Browser console |
| `console.debug` | Development noise (state changes) | Suppressed in production |

### Frontend logging conventions

**Tag every log with a category prefix in brackets:**

```js
console.info('[auth] User logged in', { userId, role });
console.warn('[ui] Rapid click on apply button');
console.error('[api] Job fetch failed', { url, status, error });
console.error('[socket] Reconnect failed after 5 attempts');
```

Categories to use:
- `[auth]` — login/logout/refresh/register
- `[api]` — REST request/response failures
- `[socket]` — Socket.io connection events
- `[ui]` — interaction edge cases (rapid clicks, long presses)
- `[router]` — navigation guard rejections
- `[query]` — React Query background refetch failures
- `[form]` — form validation issues

**For every API call that fails, log:**

```js
console.error('[api] POST /api/jobs failed', {
  status: error.response?.status,
  message: error.response?.data?.message,
  payload: { /* sanitized — no passwords */ }
});
```

**Never log sensitive data:** passwords, full JWT tokens (log first 8 chars only), API keys, credit card numbers.

### Backend logging conventions

**Use `console.log` for happy path, `console.error` for failures.** Future: replace with `pino` or `winston` for structured JSON logs.

```js
// Good
console.log('[auth] Login success', { userId: user._id, email: user.email });
console.error('[apify] Actor run failed', { actorId, error: err.message });

// Bad — too verbose
console.log('Function entered');
console.log('About to query DB');
```

**Tag categories on backend:**
- `[auth]` `[scraping]` `[scrapegraph]` `[cron]` `[socket]` `[email]` `[db]` `[api]`

**Log every error with:**
1. What was being attempted
2. Input that caused the issue (sanitized)
3. The error message
4. Stack trace if useful

```js
catch (err) {
  console.error('[scraping] Failed to normalize Naukri job', {
    jobId: rawJob.jobId,
    error: err.message,
    stack: err.stack?.slice(0, 200),
  });
  // Don't throw — graceful skip
  return null;
}
```

### Request logging (already wired)

`morgan('dev')` is enabled in development only. Each request logs:

```
GET /api/jobs 200 35.123 ms - 1234
```

In production, morgan is disabled. Render captures stdout automatically, so all `console.*` calls go to Render logs.

### What's NOT logged (intentional)

- User reading a job (no per-page-view logs to backend — too noisy)
- Socket connect/disconnect *during* normal use (only first connection per session)
- Form character-by-character changes (privacy, noise)
- Tailwind utility class warnings (development noise)

### Future observability

- ❌ Sentry for production error tracking (TODO)
- ❌ Mixpanel / PostHog for funnel analytics (TODO)
- ❌ LogRocket for session replay (optional, paid)
- ❌ Render's structured log search (free tier doesn't support; need Starter+)

---

## 13. Error handling patterns

### Frontend

#### API errors via React Query

```js
const mutation = useMutation({
  mutationFn: (data) => api.create(data),
  onSuccess: () => {
    qc.invalidateQueries(['list']);
    toast.success('Created');
  },
  onError: (error) => {
    const msg = error.response?.data?.message || 'Something went wrong';
    console.error('[api] Mutation failed', { error: error.message });
    toast.error(msg);
  },
});
```

#### Try/catch for direct axios calls

```js
try {
  const { data } = await axiosInstance.post('/...');
  // success path
} catch (err) {
  console.error('[api] Direct call failed', { ...sanitize(err) });
  toast.error(err.response?.data?.message || 'Action failed');
  throw err; // Re-throw so caller can handle if needed
}
```

#### Component-level error boundaries

Currently NOT implemented. TODO: wrap `<App />` with a top-level ErrorBoundary that:
1. Catches render errors
2. Logs to `console.error` with stack
3. Shows a fallback UI: "Something went wrong. [Refresh button]"
4. (Future) reports to Sentry

#### Network failure / offline

```js
if (!navigator.onLine) {
  toast.error('You are offline. Check your connection.');
  return;
}
```

Add this check before any non-idempotent mutation. For reads, React Query handles offline gracefully (uses cached data).

### Backend

#### Global error handler (already in `server.js`)

```js
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, error: 'Validation Error', message: ... });
  }
  if (err.code === 11000) {
    return res.status(400).json({ success: false, error: 'Duplicate Field', message: ... });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid Token', message: ... });
  }
  res.status(err.statusCode || 500).json({ success: false, error: err.name, message: err.message });
});
```

Always pass errors via `next(err)` from controllers, don't `res.json` an error directly.

#### Async wrapper (recommended TODO)

Currently controllers use try/catch directly. Cleaner: wrap each in `asyncHandler`:

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/jobs', protect, asyncHandler(createJob));
```

#### External API failures (Apify, SGAI, email)

**Never let an external service failure crash a request.** Wrap calls in try/catch and degrade gracefully:

```js
try {
  await sendVerificationEmail(user, token);
} catch (emailError) {
  console.error('[email] Verification failed, continuing', { error: emailError.message });
  // User registration still succeeds; they can request resend later
}
```

Pattern: log + continue. Never throw a third-party failure to the user unless it's the entire purpose of the request.

---

## 14. State management

### Server state — React Query

**Use React Query for everything that lives on the server.**

```js
const { data, isLoading, error } = useQuery({
  queryKey: ['jobs', filters, page],
  queryFn: () => jobsAPI.getAll({ ...filters, page }),
  keepPreviousData: true,  // Don't flicker during pagination
  staleTime: 60_000,        // 1 min before refetch
});
```

Cache invalidation:

```js
qc.invalidateQueries(['jobs']);    // After create/update/delete
```

### Client state — Zustand

**Use Zustand for UI-only state that doesn't live on the server.**

Stores:
- `useJobStore` — search filters, pagination, view mode (grid/list)
- `useNotificationStore` — unread count, recent notifications

```js
const { filters, setFilter } = useJobStore();
setFilter('city', 'Ahmedabad');
```

### Auth state — React Context

`AuthContext` (in `client/src/context/AuthContext.jsx`) provides:

```js
const { user, isAuthenticated, login, logout, register, updateUser } = useAuth();
```

This is wrapped at the top of the tree. Use it freely.

### Don't use

- ❌ Redux (overkill for this app)
- ❌ MobX
- ❌ Recoil
- ❌ Component-level state for things shared across pages (use Zustand instead)

### State persistence

- Auth token: `localStorage.token`
- View mode (grid/list): Zustand `persist` middleware (TODO: not yet implemented)
- Filters: NOT persisted — reset on navigation. Intentional.

---

## 15. API contracts (endpoint reference)

Base URL: `${VITE_API_URL}` → `/api/...`

### Auth

| Method | Path | Auth | Body / Params | Returns |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password, phone, role, companyName? }` | `{ user, token }` |
| POST | `/auth/login` | — | `{ email, password }` | `{ user, token }` |
| POST | `/auth/logout` | required | — | `{ success: true }` |
| GET | `/auth/me` | required | — | `{ user }` |
| POST | `/auth/refresh-token` | — | `{ refreshToken }` (cookie or body) | `{ token }` |
| POST | `/auth/forgot-password` | — | `{ email }` | `{ success: true }` |
| POST | `/auth/reset-password/:token` | — | `{ password }` | `{ token }` |
| POST | `/auth/update-password` | required | `{ currentPassword, newPassword }` | `{ token }` |
| GET | `/auth/verify-email/:token` | — | — | `{ success: true }` |

### Jobs

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/jobs` | — | Query: `search`, `city`, `type`, `experienceLevel`, `isWalkIn`, `page`, `limit`, `sort` |
| GET | `/jobs/walk-ins` | — | Query: `city`, `limit` |
| GET | `/jobs/my` | recruiter | Query: `status`, `page` |
| GET | `/jobs/:id` | optional | Returns `{ job, hasApplied }` |
| POST | `/jobs` | recruiter | Create job |
| PUT | `/jobs/:id` | recruiter (own) | Update |
| DELETE | `/jobs/:id` | recruiter (own) | Delete |
| PATCH | `/jobs/:id/close` | recruiter (own) | Mark as closed |

### Applications

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/applications/:jobId` | jobseeker | Body: `{ coverLetter?, expectedSalary? }` |
| GET | `/applications/my` | jobseeker | Query: `status`, `page` |
| GET | `/applications/job/:jobId` | recruiter | Query: `status`. Filtered to recruiter's own jobs. |
| PATCH | `/applications/:id/status` | recruiter | Body: `{ status, recruiterNotes? }` |
| DELETE | `/applications/:id/withdraw` | jobseeker (own) | |

### Recruiter

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/recruiter/profile` | recruiter | |
| PUT | `/recruiter/profile` | recruiter | |
| GET | `/recruiter/dashboard` | recruiter | Returns stats + recent apps + top jobs |

### User (jobseeker)

| Method | Path | Auth | Notes |
|---|---|---|---|
| PUT | `/users/profile` | required | |
| PUT | `/users/location` | required | |
| POST | `/users/upload-resume` | jobseeker | Multipart `resume` file |
| POST | `/users/upload-pic` | required | Multipart `profilePic` file |

### Admin

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/admin/analytics` | admin | Platform stats |
| GET | `/admin/users` | admin | Query: `search`, `city`, `status`, `page` |
| GET | `/admin/recruiters` | admin | Query: `search`, `status` |
| PATCH | `/admin/recruiters/:id/approve` | admin | |
| PATCH | `/admin/recruiters/:id/reject` | admin | |
| PATCH | `/admin/users/:id/suspend` | admin | |
| PATCH | `/admin/users/:id/activate` | admin | |
| PUT | `/admin/scraped-jobs/:id/approve` | admin | |
| DELETE | `/admin/scraped-jobs/:id/reject` | admin | |
| PUT | `/admin/scraped-jobs/approve-all` | admin | |

### Scraping

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/scraping/trigger` | admin | Manual trigger; ignores `ENABLE_SCRAPER` flag |
| GET | `/scraping/status` | admin | Last run status |
| GET | `/scraping/jobs` | admin | Query: `status`, `source`, `search` |

### Notifications

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/notifications` | required | |
| PATCH | `/notifications/:id/read` | required | |
| POST | `/notifications/read-all` | required | |

### Standard response shape

Every response follows:

```json
// Success
{ "success": true, "data": { ... }, "message": "Optional success message" }

// Error
{ "success": false, "error": "Error type", "message": "Human-readable description" }
```

Frontend `axiosInstance` always returns `response.data`, so consumers get the whole envelope.

---

## 16. Known issues & technical debt

### High priority

| Issue | Location | Impact |
|---|---|---|
| **Email delivery not configured** | Nodemailer setup | Verification + password reset emails fail silently |
| **No ErrorBoundary at top of React tree** | `App.jsx` | Render crashes show white screen |
| **No code splitting** | All pages bundled | 230KB gzipped JS — fine for now, will grow |
| **Resumes stored on server FS** | `server/uploads/` | Lost on Render redeploy. Need S3 or Cloudinary. |
| **No idempotency keys** | POST endpoints | Network retry could double-create |
| **Duplicate schema indexes** | `User.js`, `RecruiterProfile.js` | Mongoose warns on boot. Cosmetic. |

### Medium priority

| Issue | Location | Impact |
|---|---|---|
| **Headless UI + Radix mixed** | Navbar still uses Headless UI Menu | Bundle has both libraries (~10KB extra) |
| **No tests** | Anywhere | Regressions caught only by manual testing |
| **No CI** | `.github/workflows/` | All checks happen locally |
| **No CDN for resumes** | `/uploads/...` served from API | Slow + couples API uptime to file delivery |
| **No pagination cursor** | Most list endpoints | Offset pagination breaks under heavy concurrent inserts |

### Low priority

| Issue | Location | Impact |
|---|---|---|
| **Magic numbers** | Various components | Should reference DESIGN.md tokens or `lib/motion.js` constants |
| **Inconsistent error message tone** | Backend controllers | Some say "Failed to X", others say "X error" |
| **No dark mode** | All components | shadcn supports it; we never enabled |

### Bugs to verify

- [ ] **Apply button stays loading** if user navigates away during apply mutation (need to cancel in-flight requests on unmount).
- [ ] **Filter persistence** when navigating Job → Detail → Back: filters should restore. Verify with React Router history.
- [ ] **Notification dot** doesn't always disappear after marking read (refetch race).
- [ ] **Walk-in countdown** ticks every second even when tab is backgrounded — wastes battery. Should pause via Page Visibility API.

---

## 17. Outstanding work (prioritized)

### P0 — Required for production launch

1. **Wire SMTP credentials** for email verification + password reset.
2. **Move resume storage to S3 (or Cloudinary).** Render filesystem is ephemeral.
3. **Rotate exposed secrets** (current Atlas password, Apify token, SGAI key — all have been in chat history at some point). Do this BEFORE any public marketing push.
4. **Set up Sentry** for production error tracking.
5. **Add ErrorBoundary** at root.
6. **Test full auth flow end-to-end:** register → verify email → login → forgot password → reset.
7. **Disable demo data permanently.** Confirm zero hardcoded fakes (already done in commit `057718e`, but re-audit).

### P1 — Required for solid UX

8. **WhatsApp + SMS notifications** for walk-in alerts. Twilio integration. Big UX win — students check WhatsApp, not email.
9. **Auto-save profile changes** with 800ms debounce.
10. **Lost-changes warning** on form navigation.
11. **Accessibility audit:** keyboard navigation, ARIA labels, focus traps in modals, prefers-reduced-motion.
12. **Mobile-only walk-in feed** — full-screen vertical swipe between today's walk-ins (Tinder-style).
13. **Push notifications** (web push API) for same-day walk-in alerts.

### P2 — Stability & scale

14. **Code splitting** by route (`React.lazy()` + `Suspense`).
15. **Replace Headless UI with Radix** entirely (Navbar dropdown is the last remaining use).
16. **Add Jest + React Testing Library tests** for critical paths (auth, apply, post job).
17. **CI pipeline** — GitHub Actions for build verification + lint on PR.
18. **Cursor-based pagination** for jobs and applications endpoints.
19. **Index audit** — review Mongoose schemas, drop duplicates, add compound indexes for hot queries.
20. **Rate limit by user** (not just IP) for sensitive endpoints (login, password reset).

### P3 — Quality polish

21. **Dark mode** (shadcn already supports — flip the class on `<html>` based on user preference).
22. **Vernacular Gujarati** support — toggle in settings, translate microcopy.
23. **Keyboard shortcuts:** Cmd+K command palette, J/K to navigate job cards, A to apply.
24. **Recruiter analytics dashboard:** time-to-hire, applicant funnel, hiring sources breakdown.
25. **Saved searches + alerts** for jobseekers.
26. **Job recommendations** — naive content-based (skills + location matching).
27. **Recruiter response-time SLA** displayed publicly. Pressure recruiters to actually respond.
28. **Verified resume + skill badges** for jobseekers.

### P4 — Future bets

29. **Skill-based matching engine** — auto-rank applicants by resume similarity to job description.
30. **Campus ambassador program** — UI for college students to refer peers.
31. **B2B for MSMEs:** bulk hiring tools, walk-in event management, attendance tracking.
32. **Mobile apps** (React Native or PWA install prompt).
33. **Pan-India expansion** — Maharashtra, Rajasthan, Karnataka region by region.
34. **AI-powered resume parser** (Gemini API) — auto-fill profile from uploaded PDF.
35. **AI interview preparation** — practice questions based on job description (Gemini API).

---

## 18. Future roadmap

### Q3 2026 (next 3 months)

- ✅ Hackathon launch (done — DONE)
- 🔲 Migrate fake-tier scraping to a paid Apify plan (~₹4k/mo) so it doesn't cap monthly
- 🔲 Onboard first 100 verified Gujarat recruiters manually
- 🔲 Run campus pilots at 3-5 Ahmedabad colleges
- 🔲 Wire WhatsApp + SMS alerts (P1)
- 🔲 Hit 5,000 registered jobseekers

### Q4 2026

- 🔲 Mobile-optimized walk-in swipe feed
- 🔲 Recruiter SLA scoring system
- 🔲 First 50 paid recruiters at ₹999/mo per company
- 🔲 Vernacular Gujarati interface

### 2027

- 🔲 Maharashtra expansion
- 🔲 Native mobile apps
- 🔲 1 lakh registered jobseekers
- 🔲 AI matching engine
- 🔲 Series Seed fundraising

---

## 19. Testing strategy

### Current state: ⚠️ no automated tests.

### Recommended setup

1. **Backend unit tests** — Jest + Supertest
   - Critical paths: auth (register/login/refresh), job CRUD, application status changes, recruiter approval
   - Aim: 70% coverage on controllers
2. **Frontend component tests** — Vitest + React Testing Library
   - Critical paths: Login form, Apply modal, JobFilters, RoleGuard
   - Aim: 50% coverage on components
3. **E2E tests** — Playwright or TestSprite (MCP already configured)
   - Critical journeys:
     - Sign up → verify → log in → apply for job
     - Recruiter sign up → admin approve → post job → review applicant → mark hired
     - Admin → run scrape → approve scraped job → it appears on /jobs
4. **Manual QA checklist** before each release:
   - [ ] All three roles can log in
   - [ ] Job seeker can browse, filter, apply
   - [ ] Recruiter can post job, see applicants
   - [ ] Admin can approve recruiter, manage scraped jobs
   - [ ] Walk-in countdown ticks correctly
   - [ ] Real-time notifications arrive (test by triggering walk-in cron manually)
   - [ ] Mobile layout works on iPhone Safari + Android Chrome

### What to test FIRST when changing existing code

If you modify auth code:
- Test login from scratch
- Test logout clears session
- Test refresh token rotation works after access token expiry
- Test 401 → refresh → retry chain
- Test a different role can't access another role's pages

If you modify scraping:
- Trigger one full scrape end-to-end
- Verify Apify console shows 3 actor runs (LinkedIn, Indeed, Naukri)
- Verify jobs appear in `/admin/scraped-jobs` with correct source badge
- Verify SGAI enrichment logs ("Enriched X/Y jobs") if `USE_SCRAPEGRAPH_ENRICHMENT=true`

If you modify the design system:
- Visual regression check on all 18+ pages (manually for now)
- Confirm zero indigo/purple/yellow utility classes (`grep -r "bg-indigo\|text-purple\|bg-yellow" client/src`)
- Confirm DESIGN.md banned patterns aren't introduced (`grep -r "bg-gradient-to\|backdrop-blur" client/src`)

---

## 20. Deployment pipeline

### Branching

- `main` — protected, auto-deploys to production (Netlify + Render)
- Feature branches → PR → merge to `main`
- Hot fixes — same flow, tagged in commit message

### Frontend pipeline (Netlify)

1. Push to `main` triggers Netlify build
2. Build command: `cd client && npm install && npm run build`
3. Publish: `client/dist`
4. Env vars from Netlify dashboard injected at build time (Vite bakes them in)
5. SPA fallback: `_redirects` rewrites all paths to `/index.html`
6. Auto-deploy on success; preview URL on PR

### Backend pipeline (Render Blueprint)

1. Push to `main` triggers Render auto-deploy
2. Reads `render.yaml` for service spec
3. Build: `cd server && npm install`
4. Start: `node server.js`
5. Health check: GET `/api/health` after start
6. If health fails 3 times, deploy fails and rolls back

### Manual deploy

- Render: Dashboard → service → Manual Deploy → Deploy latest commit
- Netlify: Deploys → Trigger deploy → Clear cache and deploy site (required after env var changes)

### Rollback

- Render: Dashboard → service → Events → Click previous successful deploy → "Rollback to this deploy"
- Netlify: Deploys → click previous deploy → "Publish deploy"

### Database migrations

Currently NONE — Mongoose schemas evolve in place. For breaking schema changes:
1. Add new field with default value (additive change)
2. Deploy backend with both old and new fields supported
3. Run a one-off migration script to backfill old records
4. Remove old field handling in next deploy

---

## 21. Conventions & house rules

### Code style

- **Single quotes** for JS strings, **double quotes** for JSX attributes.
- **Arrow function components** for React. No class components.
- **Named exports** for utils, **default exports** for pages and components.
- **No semicolons missing** — Prettier-default style.
- **Prefer `function ComponentName()` over `const ComponentName = () =>`** for top-level component declarations (better stack traces).

### File naming

- Pages: `PascalCase.jsx` (e.g. `JobDetailPage.jsx`)
- Components: `PascalCase.jsx`
- Utilities: `camelCase.js`
- API wrappers: `*.api.js` (e.g. `jobs.api.js`)
- Stores: `useXStore.js`

### Imports order

```js
// 1. React + framework
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Third-party
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// 3. Aliased internal (@/)
import { Badge } from '@/components/ui/badge';

// 4. Relative
import Navbar from '../components/layout/Navbar';
import { jobsAPI } from '../api/jobs.api';

// 5. Constants
import { GUJARAT_CITIES } from '../utils/constants';
```

### Comments

- **No comments by default.** Code should be self-documenting via good names.
- **Add a comment when:** there's a non-obvious WHY (workaround, hidden constraint, future-self note).
- **No JSDoc for trivial functions.** Heavy JSDoc only on complex utilities (e.g. `apifyIntegration.js`).
- **File-level docstrings** at the top of new files: 1-3 lines saying what the file is for.

### Git conventions

- Commit messages: imperative present tense, capitalized first word, no period.
  - ✅ `Fix LinkedIn scraper input format`
  - ✅ `Add ScrapeGraphAI enrichment layer`
  - ❌ `fixed bug` / `Adding feature.`
- Multi-line commits: short summary line + blank line + body explaining WHY.
- Always include: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` on AI-assisted commits.

### Pull request conventions

- Title: same style as commit summary.
- Body has **Summary** (3 bullets max) + **Test plan** (manual checklist).
- Link to issue if any.

### When in doubt

1. Check `DESIGN.md` for visual decisions.
2. Check `PROJECT_HANDOFF.md` (this file) for behavior decisions.
3. Check `CLAUDE.md` if it exists in repo root.
4. Default to BMW + Starbucks aesthetic — sharp, restrained, regional.
5. If still unsure, **ask the user before committing.**

---

## 22. Glossary

| Term | Meaning |
|---|---|
| **Walk-in** | An interview drive where candidates show up at a venue without prior appointment. The platform's flagship feature. |
| **Shadow posting** | A job listed publicly that the company has no real intent to fill. Common on national boards. |
| **Urgency score** | A 0-100 number on walk-in jobs. 100 = today, 80 = tomorrow, 50 = this week, 10 = future. |
| **Scraped job** | A job ingested via Apify from LinkedIn/Indeed/Naukri, not posted directly by a recruiter. |
| **Pending approval** | A scraped job's status before an admin manually approves it (only Naukri jobs hit this — LinkedIn + Indeed auto-approve via `decideJobStatus`). |
| **Verified recruiter** | A recruiter whose company has been admin-approved (`isApproved: true`). Required to post jobs. |
| **DESIGN.md** | The single source of truth for UI decisions. Read it before designing anything. |
| **MCP** | Model Context Protocol — Claude/Cursor IDE extensions that expose tools (Stitch, 21st.dev, TestSprite). |
| **BMW × Starbucks × Gujarat** | The three design system inputs synthesized into "Disciplined warmth". |
| **Disciplined warmth** | The product's aesthetic. BMW's confidence + Starbucks' approachability + Gujarat's regional identity. |
| **Hairline** | A 1px border with the `--hairline` color (`#E6E6E6`). Used as default border throughout. |
| **Saffron eyebrow** | The `text-[13px] font-bold tracking-[0.15em] uppercase text-saffron` label that introduces every section. |

---

## Appendix A: Onboarding checklist for new contributors

If you're an AI agent or human picking up this codebase, do these steps in order:

1. ☐ Read this entire document.
2. ☐ Read `DESIGN.md` (~580 lines).
3. ☐ Clone repo, run local setup (Section 6).
4. ☐ Sign in as admin and explore each role's UI (use a private window per role).
5. ☐ Open Render logs and watch them while clicking around.
6. ☐ Read one controller end-to-end (recommended: `authController.js` — auth flow is foundational).
7. ☐ Read one frontend page end-to-end (recommended: `JobDetailPage.jsx` — high signal).
8. ☐ Run `git log --oneline | head -30` to see recent work.
9. ☐ Pick a P1 item from Section 17 to start.
10. ☐ Open a feature branch, do the work, open PR.

## Appendix B: Common pitfalls to avoid

1. **Don't add new colors to Tailwind without updating DESIGN.md.** The palette is intentionally constrained.
2. **Don't `console.log` in production code.** Use `console.info` with a `[category]` tag.
3. **Don't trust the frontend.** Recheck role + ownership in every backend controller, even if the UI gates it.
4. **Don't return 200 with `{ success: false }`.** Use proper HTTP status codes.
5. **Don't introduce a 5th type weight.** 400 and 700 only. Period.
6. **Don't auto-approve Naukri jobs.** Only LinkedIn + Indeed auto-approve. Naukri goes to admin queue (per `jobStatusHelper.js`).
7. **Don't hardcode the API URL.** Use `axiosInstance` from `client/src/api/axios.js` which respects `VITE_API_URL`.
8. **Don't store tokens in sessionStorage.** localStorage for access token, httpOnly cookie for refresh.
9. **Don't enable scraping cron without budget.** Apify free tier is $5/mo total. Cron + startup scrape can blow this fast.
10. **Don't break the build.** Always run `npm run build` (in `client/`) before committing UI changes.

## Appendix C: Quick-reference commands

```bash
# Install
cd server && npm install
cd client && npm install

# Run dev
cd server && npm run dev
cd client && npm run dev

# Build frontend
cd client && npm run build

# Seed admin user
cd server && node seed_admin.js

# Add a shadcn component
cd client && npx shadcn@latest add tooltip

# Force redeploy on Render
# (via dashboard: Manual Deploy → Deploy latest commit)

# Force redeploy on Netlify
# (via dashboard: Deploys → Trigger deploy → Clear cache and deploy)

# Generate JWT secrets
openssl rand -hex 64

# Test API health
curl https://gujaratjobs-api.onrender.com/api/health

# Trigger manual scrape (admin only)
curl -X POST https://gujaratjobs-api.onrender.com/api/scraping/trigger \
  -H "Authorization: Bearer <admin-token>"
```

---

**End of handoff document.**

If you find anything missing or wrong, update this file in the same PR as your changes. This document is a living artifact — it must stay accurate or it stops being useful.
