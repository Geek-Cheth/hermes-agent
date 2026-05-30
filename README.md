# Agent Autopilot

Hermes-powered dashboard: describe a product idea in plain text, and the agent autonomously researches competitors, writes a landing page, drafts launch posts, and generates waitlist backend code.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind)
- **Clerk** — authentication and per-user run history
- **Hermes Agent** — OpenAI-compatible API at `/v1/chat/completions` (port 8642)
- **Supabase** — run storage + waitlist
- **Coolify** — reverse proxy on DigitalOcean VPS

## Quick start (local)

1. Copy env file:

```bash
cp .env.example .env
```

2. Run Supabase schema in your project SQL editor:

```bash
# See supabase/schema.sql
```

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `HERMES_URL` | Hermes gateway URL (e.g. `http://hermes-agent:8642`) |
| `HERMES_API_KEY` | `API_SERVER_KEY` from Hermes |
| `NEXT_PUBLIC_APP_URL` | Public app URL for landing page form POSTs |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `TELEGRAM_BOT_TOKEN` | Optional fallback Telegram bot |
| `TELEGRAM_CHAT_ID` | Optional fallback chat ID |
| `MONTHLY_RUN_LIMIT` | Monthly run cap per user (default `10`) |
| `ENFORCE_MONTHLY_LIMIT` | Set `true` to enforce the monthly cap |
| `STREAM_DEBUG` | Set `1` to log Hermes SSE payloads in the server terminal |

## API routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/run-task` | GET (SSE) | Runs one agent task (step-by-step) |
| `/api/runs` | GET | List your past runs (auth required) |
| `/api/preview/[id]` | GET | Serve generated landing page HTML |
| `/api/status/[id]` | GET (SSE) | Resume/poll run progress |
| `/api/runs/[id]` | GET | Fetch run outputs (JSON) |
| `/api/waitlist` | POST | Join waitlist `{email, source, run_id?}` |

## Deployment (DigitalOcean + Coolify)

1. Ensure Hermes Agent is running with MiniMax configured and `API_SERVER_ENABLED=true`.

2. Add this app to your existing `docker-compose.yml` or use the provided one. Export required variables in your shell or place them in a root `.env` file (gitignored) for Compose — including Clerk keys, Supabase credentials, `HERMES_API_KEY`, and `APP_URL` / `NEXT_PUBLIC_APP_URL`:

```bash
docker compose up -d --build autopilot-app
```

3. Point your Coolify reverse proxy at `127.0.0.1:3000`.

4. Set `NEXT_PUBLIC_APP_URL` (or `APP_URL`) to your public domain so generated landing pages POST to the correct waitlist endpoint.

## Project structure

```
hermes-agent/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── results/[id]/page.tsx    # Output viewer
│   └── api/
│       ├── run-task/route.ts    # SSE agent trigger
│       ├── status/[id]/route.ts
│       ├── runs/[id]/route.ts
│       └── waitlist/route.ts
├── lib/
│   ├── hermes.ts                # Hermes API client
│   ├── supabase.ts              # DB helpers
│   └── parse-stream.ts          # SSE stream parser
├── components/
│   ├── IdeaForm.tsx
│   ├── ProgressTracker.tsx
│   └── OutputPanel.tsx
└── docker-compose.yml
```
