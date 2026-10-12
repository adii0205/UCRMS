# Unified Campus Resource & Maintenance System

UCRMS is a local React and Express demo for campus room booking, maintenance tickets, notifications, administration, and booking-concurrency scenarios. The Express API and Vite frontend run together in one Node.js process. Docker is not used or required.

## Requirements

- Node.js 20.19+ (Node.js 22+ recommended)
- npm

## Run locally

```powershell
npm install
npm run dev
```

Open <http://localhost:3000>. The local API is available under `/api`.

## Demo accounts

Use **Sign in** and choose any seeded campus email. No password is required in this local simulation:

- `112415012@cse.iiitp.ac.in` — Student
- `neha.gupta@iiitp.ac.in` — Student
- `ramesh.patel@iiitp.ac.in` — Maintenance Staff
- `suresh.kumar@iiitp.ac.in` — Maintenance Staff
- `admin.facilities@iiitp.ac.in` — Admin

The persona switcher is provided for exercising role-specific screens and access checks.

## Verify and build

```powershell
npm test
npm run lint
npm run build
```

To serve a production build locally, set `NODE_ENV=production` and run `npm start` after `npm run build`.

## Local demo data and authentication

The included data store is in-memory and seeded when the server starts. Changes persist while that server process is running; restart or use the Admin reset control to restore the seeds. The email-only sign-in and persona switching are demo conveniences, not production authentication. Do not expose this server to the public internet or use it with real campus data without replacing the demo identity flow and in-memory store with production-grade identity and persistence.
