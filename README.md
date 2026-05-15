# Enzora

Enzora is a smart wound-care health-tech platform that pairs a connected bandage device with a digital app and website for monitoring, alerts, and customer support. This repository contains the public storefront, the order-tracking portal, and the admin dashboard — fully bilingual (Arabic/English) and built on a pnpm monorepo.

## Repository Structure

```
enzora/
├── artifacts/
│   ├── enzora/          # Public website & admin dashboard (React + Vite)
│   ├── api-server/      # REST API (Express + PostgreSQL + Drizzle ORM)
│   └── mockup-sandbox/  # Design canvas (internal, Replit only)
├── lib/
│   ├── api-client-react/  # Generated React Query hooks (from OpenAPI spec)
│   ├── api-spec/          # OpenAPI specification (source of truth for the API)
│   ├── api-zod/           # Generated Zod schemas (from OpenAPI spec)
│   └── db/                # Drizzle ORM schema and database client
├── scripts/             # Utility scripts
├── app/                 # Future: mobile companion app (React Native / Expo)
├── docs/
│   ├── screenshots/     # Future: app screenshots for documentation
│   └── diagrams/        # Future: architecture and flow diagrams
├── hardware/            # Future: hardware/IoT integration code
└── firebase/            # Future: Firebase services (push notifications, etc.)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Package management | pnpm workspaces |
| Runtime | Node.js 24 |
| Language | TypeScript 5.9 |
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui |
| Backend | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| API contracts | OpenAPI spec → Orval codegen |
| Build | esbuild (API server CJS bundle) |

## Website Overview

The Enzora website (`artifacts/enzora`) serves two audiences:

- **Customers** — Browse products, place orders with delivery details, pay via bank transfer or cash on delivery, and track their order through an 8-stage timeline. The site is fully bilingual (Arabic/English) with RTL layout support.
- **Admins** — Log in at `/admin` to manage orders, update order statuses and payment states, edit product details and pricing, and view order history.

## Future Areas

- **`app/`** — A React Native (Expo) mobile companion app for customers to browse and order on iOS and Android.
- **`hardware/`** — IoT or hardware integration code (e.g. smart compression device monitoring).
- **`firebase/`** — Firebase services such as push notifications, real-time updates, and cloud messaging. See [`firebase/firebase-setup.md`](firebase/firebase-setup.md) for planned integration notes.

## Local Development

**Prerequisites:** Node.js 24, pnpm 10+, a running PostgreSQL database.

```bash
# Install all dependencies
pnpm install

# Push the database schema (first time or after schema changes)
pnpm --filter @workspace/db run push

# Start the API server (port 5000)
pnpm --filter @workspace/api-server run dev

# In a separate terminal, start the website (port from $PORT env var)
pnpm --filter @workspace/enzora run dev
```

**Required environment variables** (set in `.env` or your shell):

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_EMAIL` | Email address for the `/admin` login |
| `ADMIN_PASSWORD` | Password for the `/admin` login |
| `SESSION_SECRET` | HMAC secret used to sign admin session tokens |

### Regenerate API helpers after spec changes

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Type-check the entire project

```bash
pnpm run typecheck
```

## Running in Replit

In Replit, all three services start automatically via configured workflows. See `replit.md` for Replit-specific operational notes.
