# UBO Application - Next.js Frontend

A Next.js 14+ frontend for the Ultimate Beneficial Ownership (UBO) application, built with the LHB enterprise design system.

## Features

- **App Router** - Modern Next.js 14+ with App Router
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - LHB design system with custom CSS variables
- **Better Auth** - Authentication with LDAP plugin support
- **API Proxy** - Forward requests to FastAPI backend
- **Responsive Design** - Mobile-first responsive layout

## Pages

- `/login` - Split layout login with LDAP authentication
- `/dashboard` - KPI cards, charts, quick actions, recent activity
- `/search` - Company registration ID search with language selector
- `/history` - Filterable search history table
- `/settings` - Tabbed settings: Users, API, Auth, Logs, Environment
- `/result/[id]` - Company details, shareholders, UBO cards, ownership graph

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + LHB Design System
- **Auth**: Better Auth with LDAP plugin
- **Charts**: Chart.js (react-chartjs-2)
- **Graphs**: vis-network (ownership visualization)
- **Icons**: Bootstrap Icons

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- FastAPI backend (for API proxy)

### Installation

```bash
# Clone the repository
git clone https://github.com/houstoncmd/ubo-app-nextjs.git
cd ubo-app-nextjs

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL | `http://localhost:8000` |
| `BETTER_AUTH_SECRET` | Better Auth secret key | - |
| `LDAP_URL` | LDAP server URL | `ldap://ldap.example.com:389` |
| `LDAP_BIND_DN` | LDAP bind DN | `cn=admin,dc=example,dc=com` |
| `LDAP_BIND_PASSWORD` | LDAP bind password | - |

### Development

```bash
npm run dev    # Start dev server on port 3000
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build the image manually
docker build -t ubo-app-nextjs .
docker run -p 3000:3000 ubo-app-nextjs
```

## Project Structure

```
ubo-app-nextjs/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Better Auth catch-all
│   │   │   └── proxy/          # Backend API proxy
│   │   ├── login/              # Login page
│   │   ├── dashboard/          # Dashboard page
│   │   ├── search/             # Search page
│   │   ├── history/            # Search history page
│   │   ├── settings/           # Settings page
│   │   └── result/[id]/        # Result page
│   ├── components/             # Reusable components
│   │   ├── Navbar.tsx          # Navigation bar
│   │   ├── Breadcrumbs.tsx     # Breadcrumb navigation
│   │   ├── StatCard.tsx        # Statistics card
│   │   ├── SettingsLayout.tsx  # Settings tab layout
│   │   └── PageHeader.tsx      # Page header with breadcrumbs
│   ├── lib/                    # Utilities
│   │   ├── auth.ts             # Better Auth configuration
│   │   └── api.ts              # API proxy utilities
│   ├── globals.css             # Global styles + LHB design system
│   └── layout.tsx              # Root layout
├── public/                     # Static assets
├── Dockerfile                  # Docker build file
├── docker-compose.yml          # Docker Compose config
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## LHB Design System

The application uses a custom design system with the following CSS variables:

```css
--lhb-navy: #0f172a;
--lhb-navy-light: #1e293b;
--lhb-gold: #f59e0b;
--lhb-primary: #2563eb;
--lhb-success: #10b981;
--lhb-danger: #ef4444;
--lhb-bg: #f1f5f9;
--lhb-surface: #ffffff;
--lhb-border: #e2e8f0;
```

## Backend Integration

This frontend connects to a FastAPI backend via the API proxy routes:

- `/api/proxy/*` - Forward requests to `NEXT_PUBLIC_API_URL`
- `/api/auth/*` - Better Auth authentication endpoints

Configure the backend URL in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

Private - LHB Internal Use Only
