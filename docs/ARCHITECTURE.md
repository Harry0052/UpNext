# UpNext — Architecture

## System Overview

```
┌─────────────────────────────────────────────────┐
│                   Vercel Edge                    │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Next.js  │  │  Proxy   │  │  Vercel Blob  │  │
│  │App Router│  │ (auth)   │  │  (media)      │  │
│  └────┬─────┘  └────┬─────┘  └───────────────┘  │
└───────┼──────────────┼───────────────────────────┘
        │              │
┌───────┼──────────────┼───────────────────────────┐
│       ▼              ▼         Supabase           │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐   │
│  │Postgres │  │   Auth   │  │   Realtime    │   │
│  │ + RLS   │  │          │  │  (messages,   │   │
│  │         │  │          │  │  notifications)│   │
│  └─────────┘  └──────────┘  └───────────────┘   │
│  ┌─────────┐  ┌──────────┐                       │
│  │ Storage │  │  Edge    │                       │
│  │ (media) │  │Functions │                       │
│  └─────────┘  └──────────┘                       │
└──────────────────────────────────────────────────┘
        │
┌───────┼──────────────────────────────────────────┐
│       ▼          External Services               │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ PostHog │  │  Sentry  │  │  Resend       │   │
│  │analytics│  │  errors  │  │  (email)      │   │
│  └─────────┘  └──────────┘  └───────────────┘   │
└──────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui + custom design system |
| Database | Supabase Postgres |
| Auth | Supabase Auth (email/password + magic link) |
| File Storage | Supabase Storage |
| Realtime | Supabase Realtime (presence + broadcast) |
| Validation | Zod |
| Forms | React Hook Form + Zod resolver |
| Analytics | PostHog |
| Error Tracking | Sentry |
| Email | Resend |
| Deployment | Vercel |
| Testing | Vitest (unit) + Playwright (E2E) |

## App Structure

```
app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   ├── verify/
│   └── onboarding/
├── (main)/
│   ├── layout.tsx          # Authenticated shell with sidebar
│   ├── page.tsx            # Home feed
│   ├── explore/
│   ├── projects/
│   │   ├── page.tsx        # Browse projects
│   │   ├── new/
│   │   └── [slug]/
│   ├── events/
│   ├── messages/
│   │   ├── page.tsx
│   │   └── [conversationId]/
│   ├── notifications/
│   ├── search/
│   ├── [handle]/           # User profiles
│   │   └── page.tsx
│   └── settings/
├── admin/
│   ├── layout.tsx
│   ├── page.tsx            # Dashboard
│   ├── users/
│   ├── content/
│   ├── campuses/
│   ├── reports/
│   ├── analytics/
│   └── features/
├── api/
│   ├── auth/
│   ├── upload/
│   ├── search/
│   └── webhooks/
└── layout.tsx              # Root layout
```

## Key Patterns

### Server Components by Default
All pages and layouts are server components. Client components only for:
- Interactive forms
- Real-time subscriptions
- Client-side state (modals, dropdowns)
- Browser APIs

### Server Actions for Mutations
All data mutations use server actions with Zod validation:
```typescript
'use server'
export async function createPost(formData: FormData) {
  const parsed = postSchema.safeParse(...)
  // validate, authorize, mutate, revalidate
}
```

### Route Handlers for APIs
Used for:
- File uploads (multipart)
- Webhook receivers
- Search (streaming results)
- External integrations

### Data Access Layer
```
lib/
├── supabase/
│   ├── client.ts       # Browser client
│   ├── server.ts       # Server client (cookies)
│   ├── admin.ts        # Service role client
│   └── middleware.ts    # Auth refresh
├── db/
│   ├── queries/        # Read operations
│   └── mutations/      # Write operations
└── actions/            # Server actions
```

### RLS Strategy
- All tables have RLS enabled
- Policies use `auth.uid()` for user context
- Public read for profiles, projects, posts
- Owner-only write for own content
- Team member write for project content
- Admin bypass via role check

### Realtime Strategy
- Messages: Supabase Realtime channels per conversation
- Notifications: User-specific channel
- Presence: Online status in messages
- Feed updates: Polling with revalidation (not realtime)

### Caching Strategy
- Static pages: ISR where appropriate
- Dynamic pages: No cache, fresh on every request
- API routes: Cache-Control headers for search
- Client: React Query for optimistic updates on messages

## Security

- All inputs validated with Zod on server
- RLS on every table
- CSRF protection via server actions
- XSS prevention via React's built-in escaping
- File upload validation (type, size, dimensions)
- Rate limiting on auth endpoints
- Content Security Policy headers

## Performance

- Server components reduce client JS
- Image optimization via next/image
- Font optimization via next/font
- Code splitting per route
- Streaming with Suspense boundaries
- Database indexes on all query patterns
- Connection pooling via Supabase
