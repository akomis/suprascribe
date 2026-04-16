<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Suprascribe. The project already had extensive instrumentation in place. This session supplemented that with: SSO click tracking, a server-side discovery completion event with timing and stats, contact form analytics, and error boundary exception capture. Environment variables were verified and updated, and a reverse-proxy ingestion rewrite was already correctly configured in `next.config.ts`.

**Changes made in this session:**

- `components/auth/SSOButton.tsx` — Added `sso_sign_in_initiated` capture when user clicks an SSO provider button.
- `app/api/discovery/discover/[provider]/route.ts` — Added `discovery_completed` server-side event after a successful discovery run, including provider, BYOK mode, emails scanned, subscriptions found, and duration.
- `app/api/contact/route.ts` — Added `contact_form_submitted` capture after a successful contact form email send.
- `app/error.tsx` — Added `posthog.captureException(error)` alongside the existing `console.error` for PostHog error tracking.
- `app/global-error.tsx` — Added `posthog.captureException(error)` alongside the existing `console.error` for PostHog error tracking.

| Event                              | Description                                                                                     | File                                             |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `sso_sign_in_initiated`            | User clicked an SSO provider button (Google, Microsoft, Apple) to start OAuth                   | `components/auth/SSOButton.tsx`                  |
| `discovery_completed`              | Server-side: discovery finished successfully with duration, emails scanned, subscriptions found | `app/api/discovery/discover/[provider]/route.ts` |
| `contact_form_submitted`           | User successfully submitted the contact form                                                    | `app/api/contact/route.ts`                       |
| `$exception` (captureException)    | Error boundary caught an unhandled React exception                                              | `app/error.tsx`                                  |
| `$exception` (captureException)    | Global error boundary caught an unhandled React exception                                       | `app/global-error.tsx`                           |
| `user_signed_up`                   | User completed email/password sign-up                                                           | `components/auth/LoginClient.tsx`                |
| `user_signed_in`                   | User signed in with email/password                                                              | `components/auth/LoginClient.tsx`                |
| `password_reset_requested`         | User submitted a password reset request                                                         | `components/auth/LoginClient.tsx`                |
| `subscription_discovery_completed` | Client-side: discovery run finished (Google)                                                    | `lib/hooks/discovery/useGoogleDiscovery.ts`      |
| `subscription_discovery_completed` | Client-side: discovery run finished (Microsoft)                                                 | `lib/hooks/discovery/useMicrosoftDiscovery.ts`   |
| `subscription_discovery_completed` | Client-side: discovery run finished (IMAP)                                                      | `lib/hooks/discovery/useImapDiscovery.ts`        |
| `discovery_started`                | Server-side: discovery run began                                                                | `app/api/discovery/discover/[provider]/route.ts` |
| `discovery_rate_limit_hit`         | Server-side: user blocked by rate limiter                                                       | `app/api/discovery/discover/[provider]/route.ts` |
| `discovery_failed`                 | Server-side: discovery run failed during email fetch                                            | `app/api/discovery/discover/[provider]/route.ts` |
| `subscription_created`             | User created a subscription                                                                     | `app/api/subscriptions/route.ts`                 |
| `subscription_updated`             | User updated a subscription                                                                     | `app/api/subscriptions/[id]/route.ts`            |
| `subscription_deleted`             | User deleted a subscription                                                                     | `app/api/subscriptions/[id]/route.ts`            |
| `subscription_auto_renew_toggled`  | User toggled auto-renew                                                                         | `app/api/subscriptions/[id]/route.ts`            |
| `pro_upgrade_completed`            | User upgraded to Pro via Stripe checkout                                                        | `app/api/stripe/webhook/route.ts`                |
| `charge_failed`                    | Stripe charge attempt failed                                                                    | `app/api/stripe/webhook/route.ts`                |
| `byok_api_key_added`               | User added a BYOK API key                                                                       | `app/api/user/api-keys/route.ts`                 |
| `byok_api_key_activated`           | User switched their active BYOK API key                                                         | `app/api/user/api-keys/route.ts`                 |
| `byok_api_key_removed`             | User removed a BYOK API key                                                                     | `app/api/user/api-keys/route.ts`                 |
| `reminder_settings_updated`        | Pro user updated renewal reminder settings                                                      | `app/api/user/reminder-settings/route.ts`        |
| `user_data_reset`                  | User deleted all subscriptions and discovery history                                            | `app/api/user/reset/route.ts`                    |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/159502/dashboard/622072
- **Free-to-Pro Conversion Funnel** (sign-up → subscription → Pro): https://eu.posthog.com/project/159502/insights/QoD7gBmd
- **New User Sign-ups Trend** (email + SSO daily): https://eu.posthog.com/project/159502/insights/yK68GxiG
- **Email Discovery Funnel** (started → completed → saved): https://eu.posthog.com/project/159502/insights/EVYEdJkS
- **Pro Upgrades Over Time** (weekly revenue indicator): https://eu.posthog.com/project/159502/insights/jFTY4YlR
- **Churn Signals** (subscription deletions + data resets): https://eu.posthog.com/project/159502/insights/9JrQc8B1

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
