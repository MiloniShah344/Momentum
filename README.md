# Momentum 💪

> A full-stack workout consistency tracker. Log workouts, build streaks, track progress.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | NestJS + TypeORM |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + JWT |
| Deployment (FE) | Vercel |
| Deployment (BE) | Railway |
| Deployment (DB) | Supabase |

## Project Structure
momentum/
├── apps/
│   ├── backend/     # NestJS REST API (port 3001)
│   └── frontend/    # Next.js App (port 3000)
├── .gitignore
├── .prettierrc
└── README.md

## Local Setup

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/momentum.git
cd momentum
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Set up environment variables
```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
# Fill in your Supabase values

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
# Fill in your Supabase values
```

### 4. Run both apps
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api

## Environment Variables

See `apps/backend/.env.example` and `apps/frontend/.env.example`

## Status

🚧 In active development — Phase 1 complete