# Enzora Website (`artifacts/enzora`)

The public-facing website and admin dashboard for Enzora. Built with React 19, Vite, and Tailwind CSS v4.

## Pages

| Route | Description |
|---|---|
| `/` | Public landing page — hero, products, ordering form, order tracking link |
| `/track-order` | Customer order-tracking portal (8-stage timeline) |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard — manage orders, products, and payment status |

## Install

Run from the **repo root** (installs all workspace packages):

```bash
pnpm install
```

## Run (development)

### In Replit

The workflow `artifacts/enzora: web` starts automatically. Open the preview pane to see the site.

### Locally

```bash
# Start the API server first (in a separate terminal)
pnpm --filter @workspace/api-server run dev

# Then start the website
pnpm --filter @workspace/enzora run dev
```

The dev server listens on the port specified by the `PORT` environment variable (defaults to Vite's port 5173 if unset).

## Build

```bash
pnpm --filter @workspace/enzora run build
```

Output goes to `artifacts/enzora/dist/`.

## Type-check

```bash
pnpm --filter @workspace/enzora run typecheck
```

## Environment variables

This package itself is a static frontend — it does not read environment variables at runtime. All server-side configuration is consumed by `artifacts/api-server`.

The API the website talks to requires the following secrets to be set on the server:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `ADMIN_EMAIL` | Email for the `/admin` login |
| `ADMIN_PASSWORD` | Password for the `/admin` login |
| `SESSION_SECRET` | HMAC secret for signing admin session tokens |

Configure these in Replit under **Tools → Secrets**, or in a local `.env` file at the repo root (never committed).
