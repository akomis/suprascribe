# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Start dev server with Turbopack
yarn build        # Production build (also runs pre-commit hook)
yarn lint         # ESLint with auto-fix
yarn lint:check   # ESLint check only
yarn format       # Prettier auto-format
yarn format:check # Prettier check only
```

**Package manager:** Yarn v4 (use `yarn`, not `npm`)

**Pre-commit hook:** Runs `prettier + eslint --fix` then `yarn build` on staged files. Build must pass before commits.

## Architecture Overview

Suprascribe is a **subscription management SaaS** with a freemium model (Basic free / Pro paid). The core feature is AI-powered email scanning to automatically discover active subscriptions.

### Key Flows

1. **Auth:** OAuth (Google, Microsoft, Apple) → Supabase session → middleware guards all `/dashboard/*` routes
2. **Discovery:** User connects email provider → IMAP/OAuth fetch emails → AI (Vercel AI SDK) extracts subscription data → stored in Supabase
3. **Management:** Dashboard CRUD for subscriptions, insights/analytics, renewal reminders via Supabase cron jobs
4. **Monetization:** Stripe payment link → `POST /api/stripe/webhook` → updates user tier to PRO in DB

### Directory Structure

- `app/api/` - Route handlers (REST API)
- `app/dashboard/` - Protected authenticated pages
- `components/` - React components grouped by feature (`ui/`, `dashboard/`, `landing/`, `shared/`, `auth/`)
- `lib/services/` - Core business logic: `email-analyzer.ts` (AI extraction), `email-fetcher.ts` (IMAP/OAuth), `ai-provider.ts` (LLM abstraction)
- `lib/hooks/` - React Query hooks for data fetching/mutation
- `lib/utils/` - Pure utilities (validation, crypto, rate limiting)
- `lib/config/features.ts` - **Single source of truth** for tier definitions and feature flags
- `lib/database.types.ts` - **Auto-generated** Supabase types, do not edit manually
- `supabase/migrations/` - Database migrations

### Data Layer

- **Database:** Supabase (PostgreSQL) with direct PostgREST queries - no ORM
- **Types:** `lib/database.types.ts` is auto-generated; use convenience aliases from `lib/types/database.ts`
- **Server client:** `lib/supabase/server.ts` - use for all server-side DB access
- **Encryption:** BYOK API keys are encrypted at rest via `lib/utils/server-crypto.ts`

### AI / Discovery

- `lib/services/ai-provider.ts` abstracts the Vercel AI SDK to support 11+ providers (OpenAI, Anthropic, Google, Groq, etc.) plus OpenRouter
- Users can bring their own API key (BYOK) stored encrypted in `USER_API_KEYS` table
- Default discovery uses `MODEL_API_KEY` env var (OpenRouter)
- Discovery config (keywords, model settings) lives in `lib/config/email-discovery.ts`

### Tier / Feature Access

- Check `lib/config/features.ts` before adding any gated functionality
- Client-side hook: `useFeatureAccess()` from `lib/hooks/useFeatureAccess.ts`
- Server-side: query `USER_SETTINGS` table for `tier` field

## Code Style

- **Prettier:** no semicolons, single quotes, trailing commas, 100-char line width
- **TypeScript:** strict mode - avoid `any`, prefer inferred types
- **Components:** shadcn/ui ("new-york" style) for all UI primitives; icons from `lucide-react`
- **Data fetching:** TanStack React Query v5 for all client-side server state; mutations invalidate relevant query keys

## Environment Variables

Required vars - see `.env.example` for full list:

| Variable                                                      | Purpose                                 |
| ------------------------------------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Supabase client                         |
| `SUPABASE_SERVICE_ROLE_KEY`                                   | Server-side admin access                |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`       | Google OAuth                            |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth                         |
| `MODEL_API_KEY`                                               | OpenRouter key for default AI discovery |
| `ENCRYPTION_SECRET`                                           | Base64 key for BYOK API key encryption  |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`                 | Stripe payments                         |
| `RESEND_API_KEY`                                              | Transactional emails                    |
| `BRANDFETCH_API_KEY`                                          | Service logo fetching                   |
