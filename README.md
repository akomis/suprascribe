# Suprascribe

Subscription management platform that automatically discovers and tracks your recurring subscriptions from email receipts.

## Features

**Basic (free)**

- Subscription management dashboard with insights
- Manual subscription creation (unlimited)
- Multi-currency support
- Bring Your Own Key (BYOK) — use your own AI API keys for unlimited discovery

**Pro (one-time)**

- Auto-discovery from Gmail, Outlook, iCloud, or any IMAP provider
- Complete subscription history
- Search, sort, and group subscriptions
- Quick unsubscribe (two-click)
- Renewal email reminders
- Calendar view
- Email support

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL) with Row-Level Security
- **Auth:** Supabase Auth — Google, Microsoft, Apple OAuth
- **AI:** Vercel AI SDK with multi-provider support (OpenAI, Anthropic, Groq, etc.)
- **Payments:** Stripe (one-time payment link)
- **Styling:** Tailwind CSS v4 + shadcn/ui

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn v4 (`corepack enable && corepack prepare yarn@stable --activate`)
- A [Supabase](https://supabase.com) project (free tier works)
- Optional: accounts for Stripe, Resend, Brandfetch (see env table below)

### 1. Clone and install

```bash
git clone https://github.com/akomis/suprascribe.git
cd suprascribe
yarn
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
3. Run database migrations — in your Supabase project go to **SQL Editor** and run each file in `supabase/migrations/` in order, or use the Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### 3. Configure OAuth providers

**Google** (for Gmail discovery + Google sign-in):

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 client (Web application)
3. Add `https://<your-supabase-url>/auth/v1/callback` as an authorized redirect URI
4. Copy Client ID → `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and Client Secret → `GOOGLE_CLIENT_SECRET`
5. Enable **Gmail API** in the API library

**Microsoft** (for Outlook discovery + Microsoft sign-in):

1. Go to [Azure Portal](https://portal.azure.com) → App registrations → New registration
2. Add `https://<your-supabase-url>/auth/v1/callback` as a redirect URI
3. Under **Certificates & secrets**, create a new client secret
4. Copy Application (client) ID → `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` and the secret → `MICROSOFT_CLIENT_SECRET`
5. Enable `Mail.Read` permission under API permissions

In your Supabase project, go to **Authentication → Providers** and enable Google and Microsoft with the credentials above.

### 4. AI / Email discovery

The default discovery model runs via [OpenRouter](https://openrouter.ai):

- Create an account, generate an API key → `MODEL_API_KEY`

Alternatively, leave `MODEL_API_KEY` empty — users can bring their own key (BYOK) via the dashboard settings.

### 5. Optional services

| Service                              | Variable(s)                                                                     | Purpose                      |
| ------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------- |
| [Stripe](https://stripe.com)         | `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | One-time Pro upgrade payment |
| [Resend](https://resend.com)         | `RESEND_API_KEY`                                                                | Renewal reminder emails      |
| [Brandfetch](https://brandfetch.com) | `BRANDFETCH_API_KEY`                                                            | Service logo fetching        |

For local Stripe webhook testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 6. Environment setup

```bash
cp .env.example .env.local
```

Generate the encryption secret for BYOK API key storage:

```bash
openssl rand -base64 32
# paste output into ENCRYPTION_SECRET
```

Fill in all variables in `.env.local` — see `.env.example` for the full list and descriptions.

### 7. Run

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
yarn dev          # Development server (Turbopack)
yarn build        # Production build
yarn lint         # Lint and auto-fix
yarn format       # Format with Prettier
```

## Architecture & Security

### Trust Boundaries

| Boundary              | Control                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Public internet → App | Next.js middleware validates Supabase session on every request; all `/dashboard/*` routes require authentication                                |
| App → Supabase        | Server-side client uses scoped keys; Row-Level Security (RLS) enforces per-user data isolation                                                  |
| App → Email providers | OAuth tokens (Gmail, Outlook) or user-supplied IMAP credentials; SSRF protection blocks private/loopback IP ranges and cloud metadata endpoints |
| App → AI providers    | Email content forwarded only after user initiates discovery; BYOK keys encrypted at rest (AES-256-GCM) and decrypted only at request time       |
| App → Stripe          | Webhook payloads verified via Stripe signature before processing; idempotency guard prevents duplicate tier upgrades                            |

### Key Components

| Component                        | Role                                                                        |
| -------------------------------- | --------------------------------------------------------------------------- |
| `middleware.ts`                  | Auth guard — enforces session validity on every protected route             |
| `app/api/`                       | REST API route handlers (discovery, subscriptions, payments, user settings) |
| `lib/services/email-fetcher.ts`  | Retrieves emails from Gmail API, Microsoft Graph, or IMAP                   |
| `lib/services/email-analyzer.ts` | AI-powered extraction of subscription data from email content               |
| `lib/services/ai-provider.ts`    | Abstracts 11+ LLM providers via Vercel AI SDK; supports BYOK                |
| `lib/utils/server-crypto.ts`     | AES-256-GCM encryption/decryption for stored API keys                       |
| `lib/config/features.ts`         | Single source of truth for tier definitions and feature flags               |
| `supabase/migrations/`           | PostgreSQL schema with RLS policies per table                               |

## Contributing

PRs are welcome. Before submitting:

```bash
yarn lint    # must pass
yarn build   # must pass
```

Please keep changes focused — one feature or fix per PR.
