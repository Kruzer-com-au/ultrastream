# ULTRASTREAM Website — Deployment Guide

## Overview

ULTRASTREAM is a Next.js 16 marketing website with a 3D interactive battle game, waitlist system, and leaderboard. This guide covers deployment on any server.

---

## Prerequisites

| Requirement | Minimum Version |
|------------|----------------|
| **Node.js** | 20.x LTS or newer |
| **pnpm** | 9.x or newer |
| **RAM** | 1 GB minimum (2 GB recommended for build) |
| **Disk** | 500 MB free |

### Install Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows — download from https://nodejs.org
```

### Install pnpm
```bash
npm install -g pnpm
```

---

## Quick Start (5 minutes)

```bash
# 1. Extract the ZIP
unzip ultrastream-website.zip -d ultrastream
cd ultrastream

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables section)

# 4. Build for production
pnpm build

# 5. Start the production server
pnpm start
# Server runs on http://localhost:3000
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# REQUIRED — Your public site URL (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://ultrastream.gg

# OPTIONAL — Supabase (for persistent waitlist storage)
# Without these, waitlist uses in-memory storage (resets on restart)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OPTIONAL — Resend (for waitlist confirmation emails)
RESEND_API_KEY=re_xxxxxxxxxx
RESEND_FROM_EMAIL=noreply@ultrastream.gg

# OPTIONAL — Analytics
# NEXT_PUBLIC_PLAUSIBLE_DOMAIN=ultrastream.gg
```

**Note:** The leaderboard currently uses in-memory storage. Scores reset when the server restarts. For persistent storage, integrate Supabase (see comments in `src/app/api/leaderboard/route.ts`).

---

## Deployment Options

### Option A: Vercel (Recommended — Zero Config)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Set environment variables in Vercel Dashboard → Settings → Environment Variables.

### Option B: Docker

Create a `Dockerfile` in the project root:

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

> **Note:** To use standalone output, add `output: "standalone"` to `next.config.ts`.

```bash
docker build -t ultrastream .
docker run -p 3000:3000 --env-file .env.local ultrastream
```

### Option C: Linux Server (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Build the project
pnpm install
pnpm build

# Start with PM2 (auto-restart, logs, monitoring)
pm2 start pnpm --name "ultrastream" -- start

# Save PM2 config for system reboot
pm2 save
pm2 startup
```

### Option D: Windows Server (IIS with iisnode)

```bash
# Build the project
pnpm install
pnpm build

# Run directly
pnpm start
```

For IIS, use iisnode or run as a Windows Service with `node-windows` or NSSM.

---

## Custom Port

```bash
# Change port via environment variable
PORT=8080 pnpm start

# Or set in .env.local
PORT=8080
```

---

## Reverse Proxy (Nginx)

If running behind Nginx:

```nginx
server {
    listen 80;
    server_name ultrastream.gg;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## SSL/HTTPS

For production, always use HTTPS:

```bash
# With Certbot (Let's Encrypt)
sudo certbot --nginx -d ultrastream.gg
```

---

## Health Check

After deployment, verify:

| Check | URL | Expected |
|-------|-----|----------|
| Homepage | `GET /` | 200 OK |
| Leaderboard API | `GET /api/leaderboard` | `{"leaderboard":[],"total":0}` |
| Waitlist API | `POST /api/waitlist` | 200/201 |

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `pnpm: command not found` | Run `npm install -g pnpm` |
| Build fails with memory error | Set `NODE_OPTIONS=--max_old_space_size=4096` before build |
| Port 3000 already in use | Use `PORT=3001 pnpm start` |
| 3D scene not loading | Ensure HTTPS in production (WebGL needs secure context on some browsers) |
| Styles missing | Clear `.next` folder and rebuild: `rm -rf .next && pnpm build` |

---

## Tech Stack

- **Framework:** Next.js 16.1.6 (React 19, Turbopack)
- **Styling:** Tailwind CSS v4
- **3D Engine:** React Three Fiber + Three.js
- **Animations:** GSAP, Lenis (smooth scroll)
- **Validation:** Zod
- **Package Manager:** pnpm

---

## Support

For questions, contact the development team or refer to the codebase documentation in the `src/` directory.
