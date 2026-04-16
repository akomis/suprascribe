# Suprascribe - Deployment & Restore Runbook

This document covers full deployment, re-deployment, and disaster recovery for the Suprascribe application.

**Stack:** Next.js 15 · Supabase (Postgres + Auth + Edge Functions) · Railway (hosting) · Stripe · Resend · Sentry

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Initial Deployment](#3-initial-deployment)
4. [Re-deployment (Updates)](#4-re-deployment-updates)
5. [Supabase Edge Functions](#5-supabase-edge-functions)
6. [Stripe Webhook Setup](#6-stripe-webhook-setup)
7. [Rollback](#7-rollback)
8. [Disaster Recovery](#8-disaster-recovery)
9. [Health Verification](#9-health-verification)
10. [Service Dependencies](#10-service-dependencies)

---

## 1. Prerequisites

| Tool         | Version | Install                                                      |
| ------------ | ------- | ------------------------------------------------------------ |
| Node.js      | ≥ 20    | https://nodejs.org                                           |
| Yarn         | v4.10.3 | `corepack enable && corepack prepare yarn@4.10.3 --activate` |
| Supabase CLI | latest  | `npm i -g supabase`                                          |
| Railway CLI  | latest  | `npm i -g @railway/cli` (if deploying via CLI)               |

**External accounts required:** Supabase, Railway, Stripe, Resend, OpenRouter, Brandfetch, Sentry, Google Cloud Console, Microsoft Azure (Entra ID).

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before running locally. For production, set these in your hosting platform (Railway → Project → Service → Variables).

| Variable                          | Where to Get It                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_BASE_URL`            | Your production domain, e.g. `https://suprascribe.com`                                  |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase Dashboard → Project Settings → API                                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase Dashboard → Project Settings → API                                             |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase Dashboard → Project Settings → API (keep secret)                               |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID`    | Google Cloud Console → Credentials                                                      |
| `GOOGLE_CLIENT_SECRET`            | Google Cloud Console → Credentials                                                      |
| `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` | Azure Portal → App Registrations                                                        |
| `MICROSOFT_CLIENT_SECRET`         | Azure Portal → App Registrations → Certificates & Secrets                               |
| `MODEL_API_KEY`                   | https://openrouter.ai/keys                                                              |
| `BRANDFETCH_API_KEY`              | https://brandfetch.com/developers                                                       |
| `RESEND_API_KEY`                  | https://resend.com/api-keys                                                             |
| `NEXT_PUBLIC_STRIPE_PAYMENT_LINK` | Stripe Dashboard → Payment Links                                                        |
| `STRIPE_SECRET_KEY`               | Stripe Dashboard → Developers → API Keys                                                |
| `STRIPE_WEBHOOK_SECRET`           | Generated when registering webhook endpoint (see §6)                                    |
| `ENCRYPTION_SECRET`               | Generate: `openssl rand -base64 32` - store securely, never rotate without migrating DB |
| `SENTRY_AUTH_TOKEN`               | Sentry → Settings → Auth Tokens                                                         |

> **Critical:** `ENCRYPTION_SECRET` is the master key for all BYOK API keys stored in the database. Losing it makes all encrypted keys unrecoverable. Back it up in a secrets manager (e.g. 1Password, AWS Secrets Manager).

---

## 3. Initial Deployment

### 3.1 Database (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Apply the database schema via the Supabase SQL Editor or migrations:
   ```bash
   supabase db push
   ```
3. Enable the following Auth providers in Supabase Dashboard → Authentication → Providers:
   - **Google** - paste `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - **Microsoft Azure** - paste `NEXT_PUBLIC_MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET`
   - **Apple** (optional)
4. Set **Site URL** and **Redirect URLs** in Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `https://your-domain.com`
   - Redirect URL: `https://your-domain.com/api/auth/callback/**`
5. Enable Row Level Security (RLS) - all tables must have RLS enabled. Verify in Table Editor.

### 3.2 OAuth App Configuration

**Google:**

- Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client
- Authorised redirect URIs: `https://your-domain.com/api/auth/callback/google`, `https://your-domain.com/api/discovery/callback/google`

**Microsoft:**

- Azure Portal → App Registrations → Redirect URIs
- Add: `https://your-domain.com/api/auth/callback/microsoft`, `https://your-domain.com/api/discovery/callback/microsoft`

### 3.3 Application (Railway)

```bash
# Install dependencies
yarn install

# Verify build passes locally before deploying
yarn build

# Deploy via Railway CLI
railway up
```

Or connect the GitHub repository to Railway for automatic deployments on push to `main`.

### 3.4 Deploy Supabase Edge Functions

```bash
supabase functions deploy send-renewal-reminders
supabase functions deploy process-subscription-renewals
```

Set the function secrets in Supabase Dashboard → Edge Functions → Secrets (or via CLI):

```bash
supabase secrets set RESEND_API_KEY=re-...
supabase secrets set NEXT_PUBLIC_SUPABASE_URL=https://...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

### 3.5 Configure Cron Jobs

In Supabase Dashboard → Edge Functions, set up scheduled invocations:

- `send-renewal-reminders` - daily at a fixed time (e.g. 08:00 UTC)
- `process-subscription-renewals` - daily, same or earlier time

---

## 4. Re-deployment (Updates)

The pre-commit hook (`prettier + eslint + yarn build`) enforces that only passing builds reach `main`. Re-deployment is triggered automatically by Railway on every push to `main`.

**Manual re-deployment:**

```bash
yarn build        # verify locally first
railway up        # deploy
```

**Re-deploy Edge Functions after changes:**

```bash
supabase functions deploy send-renewal-reminders
supabase functions deploy process-subscription-renewals
```

**Database schema changes:**

```bash
# Create a new migration
supabase migration new <description>
# Edit the generated SQL file, then apply
supabase db push
```

---

## 5. Supabase Edge Functions

| Function                        | Trigger      | Purpose                                                                |
| ------------------------------- | ------------ | ---------------------------------------------------------------------- |
| `send-renewal-reminders`        | Cron (daily) | Emails PRO users about upcoming renewals                               |
| `process-subscription-renewals` | Cron (daily) | Calls `process_subscription_renewals()` DB RPC to update renewal dates |

Both functions require a Bearer token (`Authorization: Bearer <SUPABASE_ANON_KEY>`) and are protected by Supabase's built-in auth.

**Test a function manually:**

```bash
supabase functions invoke send-renewal-reminders --no-verify-jwt
```

---

## 6. Stripe Webhook Setup

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-domain.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `charge.failed`
4. Copy the **Signing secret** → set as `STRIPE_WEBHOOK_SECRET`
5. Set the **Success URL** on your Payment Link:
   - Production: `https://your-domain.com/confirmation`
   - Local dev: `http://localhost:3000/confirmation`

The webhook handler stores processed event IDs in `stripe_webhook_events` to prevent duplicate processing on replay.

**Test webhooks locally:**

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## 7. Rollback

### Application rollback

Via Railway Dashboard → Project → Deployments → select a previous deployment → **Rollback**.

Or via CLI:

```bash
railway rollback
```

### Database rollback

Supabase provides point-in-time recovery (PITR) on Pro plans. To restore:

1. Supabase Dashboard → Database → Backups
2. Select a restore point and follow the UI wizard

For manual schema rollback, write a down-migration SQL file and apply:

```bash
supabase migration new rollback_<description>
# add reverse SQL, then:
supabase db push
```

---

## 8. Disaster Recovery

### Scenario: Application is down

1. Check Railway status and deployment logs: Railway Dashboard → Project → Deployments
2. Check Sentry for runtime errors: Sentry project dashboard
3. Verify all env vars are set correctly in Railway → Project → Service → Variables
4. If a bad deploy: rollback (see §7)
5. If infra issue: check Supabase status at https://status.supabase.com

### Scenario: Database corrupted or data lost

1. Supabase Dashboard → Database → Backups → restore to last known-good point
2. After restore, verify RLS policies are intact (Table Editor → RLS)
3. Re-apply any migrations created after the backup point:
   ```bash
   supabase db push
   ```
4. Notify affected users if data loss is confirmed

### Scenario: `ENCRYPTION_SECRET` lost

**This is a critical, partially unrecoverable event.** All BYOK API keys stored in `USER_API_KEYS.encrypted_key` become unreadable.

1. Set a new `ENCRYPTION_SECRET` in the environment
2. All existing encrypted keys in `USER_API_KEYS` must be deleted - they cannot be decrypted
3. Notify users to re-enter their API keys
4. SQL to clear orphaned keys:
   ```sql
   DELETE FROM "USER_API_KEYS";
   UPDATE "USER_SETTINGS" SET active_key_id = NULL;
   ```

**Prevention:** Store `ENCRYPTION_SECRET` in a secrets manager with access logging. Treat it like a private key.

### Scenario: Stripe webhook secret rotated/lost

1. Stripe Dashboard → Developers → Webhooks → select endpoint → Roll secret
2. Update `STRIPE_WEBHOOK_SECRET` in Railway environment variables
3. Redeploy to pick up the new value
4. Check `stripe_webhook_events` table for any missed events during the gap and replay if needed from Stripe Dashboard

### Full re-deployment from scratch

If all infrastructure must be rebuilt from zero:

```bash
# 1. Create Supabase project, apply schema
supabase db push

# 2. Install deps and verify build
yarn install && yarn build

# 3. Set all env vars in Railway (see §2)

# 4. Deploy application
railway up

# 5. Deploy Edge Functions
supabase functions deploy send-renewal-reminders
supabase functions deploy process-subscription-renewals

# 6. Set Edge Function secrets (see §3.4)

# 7. Configure cron jobs (see §3.5)

# 8. Register Stripe webhook (see §6)

# 9. Configure OAuth redirect URIs (see §3.2)

# 10. Verify (see §9)
```

Estimated time: 30–60 minutes from scratch with all credentials available.

---

## 9. Health Verification

After any deployment or restore, verify the following:

| Check                   | How                                                       |
| ----------------------- | --------------------------------------------------------- |
| App loads               | Visit `https://your-domain.com` - landing page renders    |
| Auth works              | Sign in with Google or Microsoft OAuth                    |
| Dashboard accessible    | Navigate to `/dashboard` after login                      |
| Subscriptions load      | Dashboard subscription list renders without errors        |
| Stripe payment flow     | Use Stripe test mode to complete a checkout               |
| Stripe webhook received | Stripe Dashboard → Webhooks → recent deliveries show 200  |
| Email reminders         | Manually invoke `send-renewal-reminders` Edge Function    |
| Sentry connected        | Trigger a test error; verify it appears in Sentry         |
| API key encryption      | Add a BYOK key in Settings; verify it saves and is usable |

**Local smoke test:**

```bash
yarn dev
# visit http://localhost:3000
```

---

## 10. Service Dependencies

| Service            | Role                                       | Status Page                  |
| ------------------ | ------------------------------------------ | ---------------------------- |
| Supabase           | Database, Auth, Edge Functions             | https://status.supabase.com  |
| Railway            | Hosting, serverless functions              | https://status.railway.app   |
| Stripe             | Payments, webhooks                         | https://status.stripe.com    |
| Resend             | Transactional email                        | https://resend-status.com    |
| OpenRouter         | Default AI provider for discovery          | https://status.openrouter.ai |
| Brandfetch         | Service logo fetching                      | -                            |
| Sentry             | Error monitoring                           | https://status.sentry.io     |
| Google / Microsoft | OAuth providers for auth + email discovery | -                            |

If a non-critical dependency (Brandfetch, OpenRouter) is unavailable, core auth and subscription management remain operational. If Supabase or Railway is down, the application is unavailable.
