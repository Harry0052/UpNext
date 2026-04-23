---
name: growth-analytics
description: Build growth systems (referrals, waitlist, ambassadors) and analytics dashboards for UpNext
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# Growth & Analytics for UpNext

## Growth Loops

### Referral System
- Table: `referrals` (referrer_id, code UNIQUE, used_by, used_at)
- Each user gets a unique referral code on signup
- Referred user linked to referrer on account creation
- Track: referral_count per user, conversion rate

### Campus Expansion
- Ambassadors: users with `is_ambassador=true`, managed in admin
- Strategy: recruit 1-2 ambassadors per campus → they invite builders → organic growth
- Track: users per campus, posts per campus, growth rate per campus

### Viral Coefficient
```
Invite → Signup → Onboarding → First Post → First Follow → Invite Others
Track conversion at each step
```

## Analytics (Admin Dashboard)

### Key Metrics
- DAU / WAU / MAU
- Signups per day (last 30 days)
- Posts per day by type
- Projects created
- Messages sent
- Campus coverage (unique campuses with 5+ users)

### PostHog Integration
```typescript
// Track events client-side
posthog.capture('post_created', { post_type: 'launch', has_media: true })
posthog.capture('project_created', { stage: 'idea' })
posthog.capture('follow', { source: 'profile' })
posthog.capture('raise_hand', { source: 'project_page' })
```

Env var: `NEXT_PUBLIC_POSTHOG_KEY`

### Sentry Integration
Error tracking and performance monitoring.
Env var: `SENTRY_DSN`

## Email Digests
- User preference: `notification_preferences.email_digest` (daily/weekly/never)
- Content: new followers, reactions on your posts, project updates, upcoming events
- Provider: Resend (env var: `RESEND_API_KEY`)
- Implementation: cron job or Vercel Cron

## Feature Flags for Growth
| Flag | Purpose |
|------|---------|
| `waitlist_mode` | Gate signup behind waitlist |
| `email_digest` | Enable weekly email digest |
| `campus_leaderboard` | Show campus ranking |
| `org_seats` | Organization team seats (monetization) |
| `recruiting_access` | Recruiter tier (monetization) |
| `sponsorship_tools` | Sponsored content (monetization) |

## Seed Data
Script: `scripts/seed.ts` — 15 campuses, 10 users, 8 projects, 10 posts, 5 events.
Credentials: `alex@stanford.edu` / `Demo1234!` (admin)
