@AGENTS.md

# UpNext — Claude Code Operating System

## Product Thesis

UpNext is the social network where ambitious college students discover who is building on their campus, share structured updates, find teammates, join projects, attend events, and build reputation by shipping. It should feel bold, energetic, high-signal, and young — not like LinkedIn, not like a generic forum, and not like startup Twitter. Every feature must serve the core loop: **build, share, connect, ship, repeat**.

## UX Philosophy

- **Speed over ceremony** — minimize clicks between intent and action. Follow someone in one tap. Raise a hand in two. Post in three.
- **Signal over noise** — structured post types (Launch, Ask, Win, Learn) keep the feed high-quality. No "what I had for lunch."
- **Campus-first, network-second** — start with your school, expand outward. Local trust enables global discovery.
- **Dark mode first** — the target audience lives in dark mode. Light mode is a good alternative, not the default.
- **Mobile-native feel** — responsive isn't enough. It must feel like an app: sticky nav, optimistic updates, smooth transitions.
- **Earned, not gamed** — reputation comes from shipping and helping, not gaming metrics. Vouches, shipped streaks, and completion signals.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui (Base UI variant) + custom design system |
| Database | Supabase Postgres with RLS |
| Auth | Supabase Auth (.edu email, magic link, password) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (messages, presence) |
| Validation | Zod (client + server) |
| Forms | React Hook Form + @hookform/resolvers |
| Analytics | PostHog |
| Errors | Sentry |
| Email | Resend |
| Deployment | Vercel |
| Testing | Vitest (unit), Playwright (E2E) |

## Architecture Rules

### Next.js 16 Patterns
- **Server components by default.** Only add `'use client'` when you need interactivity, browser APIs, or React hooks.
- **`proxy.ts` not `middleware.ts`.** Next.js 16 renamed middleware. Export `proxy()` and `proxyConfig`.
- **`params` and `searchParams` are async.** Always `await` them: `const { slug } = await params`.
- **Server actions for mutations.** All writes go through `'use server'` functions in `lib/actions/`. Never mutate from client-side Supabase calls.
- **Route handlers for special cases only.** File uploads, webhooks, streaming responses. Everything else uses server actions.
- **No Edge runtime unless explicitly justified.** Default to Node.js Fluid Compute.

### Data Access Patterns
```
lib/
├── supabase/
│   ├── client.ts       # Browser client (no DB generics)
│   ├── server.ts       # Server client (cookie-based)
│   ├── admin.ts        # Service role (scripts, webhooks)
│   └── middleware.ts    # Auth refresh for proxy.ts
├── actions/            # Server actions ('use server')
│   ├── posts.ts
│   ├── projects.ts
│   ├── social.ts
│   ├── messages.ts
│   ├── events.ts
│   └── notifications.ts
├── queries/            # Read-only data fetching
│   └── posts.ts
├── validations.ts      # All Zod schemas
└── constants.ts        # Enums, labels, config values
```

### Supabase Rules
- **RLS on every table.** No exceptions. Use `auth.uid()` for user context.
- **Validate with Zod before writing.** Server actions parse input with Zod schemas before any DB call.
- **No raw SQL in application code.** Use the Supabase client library. SQL lives in migration files only.
- **Composite primary keys need `as any` casts.** Supabase TypeScript types produce `never` for composite PKs. This is a known issue — use untyped clients.

### Component Architecture
- **`components/ui/`** — shadcn/ui primitives. Do not modify unless fixing compatibility (e.g., `asChild` support).
- **`components/layout/`** — shell components (sidebar, mobile nav, mobile header).
- **`components/posts/`** — post-related components (post card, composer).
- **`components/*.tsx`** — shared components (logo, user-avatar, role-badge, stage-badge, post-type-badge).
- **Feature-specific components** live inside their route directory (e.g., `app/(main)/feed/feed-filters.tsx`).

## Coding Standards

### TypeScript
- Strict mode enabled. No `@ts-ignore` unless documented with a reason.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Export types from `types/database.ts`. Use `Tables<'tablename'>` helper for DB row types.
- Use `any` sparingly and only for Supabase join query results where TypeScript inference breaks.

### Naming Conventions
| Thing | Convention | Example |
|-------|-----------|---------|
| Files | kebab-case | `post-card.tsx`, `feed-filters.tsx` |
| Components | PascalCase | `PostCard`, `FeedFilters` |
| Functions | camelCase | `createPost`, `toggleFollow` |
| Server actions | camelCase, verb-first | `createPost`, `deletePost`, `toggleReaction` |
| Constants | UPPER_SNAKE_CASE | `MAX_POST_LENGTH`, `POST_TYPES` |
| DB tables | snake_case, plural | `post_reactions`, `project_members` |
| DB columns | snake_case | `created_at`, `author_id` |
| URL slugs | kebab-case | `studysync-ai`, `hackmit-2026` |
| CSS classes | Tailwind utilities | No custom CSS classes unless in globals.css |
| Route groups | `(groupname)` | `(auth)`, `(main)` |

### Imports
```typescript
// 1. React/Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// 2. External libraries
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

// 3. Internal — components
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user-avatar'

// 4. Internal — lib
import { createClient } from '@/lib/supabase/server'
import { createPost } from '@/lib/actions/posts'
import { createPostSchema } from '@/lib/validations'
import { POST_TYPES } from '@/lib/constants'

// 5. Types
import type { PostWithAuthor } from '@/types/database'
```

## Testing Standards

### Unit Tests (Vitest)
- Test all Zod schemas in `lib/validations.ts`.
- Test utility functions and data transformers.
- Test component rendering with React Testing Library where appropriate.
- Files: `*.test.ts` or `*.test.tsx` next to the source file.

### E2E Tests (Playwright)
- Cover all critical user flows: signup, onboarding, post creation, follow, raise hand, messaging.
- Tests live in `tests/e2e/`.
- Use page object pattern for reusable selectors.
- Run against a seeded test database.

### Test Requirements
- Every server action must have at least one test for the happy path.
- Every form must have validation tests (valid + invalid input).
- Visual regression tests for landing page and key UI states.

## Security Rules

- **All inputs validated with Zod on the server.** Client validation is UX sugar, not security.
- **RLS on every table.** Never bypass with service role in user-facing code.
- **No raw SQL in app code.** SQL injection is impossible if you only use the Supabase client.
- **File uploads validated.** Check MIME type, file size, and dimensions server-side.
- **CSRF protection via server actions.** Next.js handles this automatically.
- **XSS prevention via React.** Never use `dangerouslySetInnerHTML` with user content.
- **Rate limiting on auth endpoints.** Supabase handles this at the auth layer.
- **Content Security Policy headers.** Configure in `next.config.ts`.
- **Secrets never committed.** All secrets in `.env.local` (gitignored). Use `.env.local.example` as template.
- **Admin routes double-gated.** proxy.ts checks auth, layout.tsx checks `is_admin` on the user row.

## Content Principles (High-Signal Founder Network)

### What belongs on UpNext
- Structured updates about real projects (launches, milestones, asks for help, wins, lessons)
- Requests for teammates, feedback, and collaboration
- Events that bring builders together (hackathons, demo days, workshops)
- Genuine skill vouches based on working together

### What does NOT belong
- Content farm / engagement bait posts
- Pure opinion pieces with no builder context
- Job postings from companies (this is for students building, not recruiting)
- Self-promotion without substance
- Any content that could exist on LinkedIn or Twitter without modification

### Moderation Philosophy
- Reports are reviewed by human admins, not auto-moderated (for now)
- Content is removed only for clear violations (spam, harassment, inappropriate)
- Accounts require .edu verification — this is the primary spam gate
- Feature flags gate experimental content types

## Directory Structure
```
app/
├── (auth)/           # Auth flows (login, signup, verify, onboarding)
├── (main)/           # Authenticated app shell
│   ├── feed/         # Home feed with composer and filters
│   ├── explore/      # Discover people, projects, events, campuses
│   ├── projects/     # Browse, create, detail pages
│   ├── events/       # Browse, create, detail, RSVP
│   ├── messages/     # Conversations, realtime chat
│   ├── notifications/# Notification center
│   ├── search/       # Global search with tabs
│   ├── settings/     # Profile editing, preferences
│   ├── compose/      # Standalone post composer
│   ├── post/[id]/    # Post detail with comments
│   └── [handle]/     # User profile pages
├── admin/            # Admin dashboard (role-gated)
├── api/              # Route handlers
└── auth/callback/    # OAuth callback
components/
├── ui/               # shadcn/ui primitives
├── layout/           # App shell (sidebar, nav)
├── posts/            # Post card, composer
└── *.tsx             # Shared components
lib/
├── supabase/         # Client factories
├── actions/          # Server actions
├── queries/          # Read queries
├── validations.ts    # Zod schemas
├── constants.ts      # Enums and config
└── utils.ts          # Utilities (cn)
types/database.ts     # Supabase types
supabase/migrations/  # SQL migrations
scripts/              # Seed script
docs/                 # Specs and decisions
tests/                # E2E and integration tests
```

## Commands
```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # Production build
npm run lint          # ESLint
npm run start         # Start production server
npx tsx scripts/seed.ts  # Seed demo data
```

## Key Files
- `proxy.ts` — auth middleware (Next.js 16 convention)
- `lib/validations.ts` — all Zod schemas, single source of truth
- `lib/constants.ts` — all enums, labels, limits
- `types/database.ts` — Supabase types + helper types
- `supabase/migrations/00001_initial_schema.sql` — full DB schema with RLS
- `app/globals.css` — design system (colors, gradients, animations)
