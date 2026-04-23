# UpNext — Architecture Decisions

## 1. Supabase over custom backend
**Decision**: Use Supabase for Postgres, Auth, Storage, and Realtime instead of a custom API.
**Rationale**: Fastest path to production for a full-featured social network. RLS provides row-level security without middleware. Realtime subscriptions enable live messaging without WebSocket infrastructure.
**Tradeoff**: Vendor lock-in on auth and realtime patterns. Mitigated by keeping business logic in server actions.

## 2. Server Actions over Route Handlers for mutations
**Decision**: Use Next.js server actions for all CRUD operations.
**Rationale**: Simpler DX, automatic form integration, built-in CSRF protection. Route handlers reserved for file uploads, webhooks, and streaming responses.
**Tradeoff**: Server actions can't return non-JSON responses. Not an issue for this app.

## 3. Untyped Supabase clients
**Decision**: Removed Database generic from Supabase client factories.
**Rationale**: Supabase's generated types for composite primary keys and join queries produce `never` types that break basic CRUD operations. The typed client was causing more problems than it solved.
**Tradeoff**: Less type safety on DB queries. Mitigated by Zod validation on all inputs and explicit type annotations on query results.

## 4. Dark mode first
**Decision**: Design dark theme as the primary, polished experience.
**Rationale**: Target audience (college tech builders) expects dark mode. Sets the tone as a premium, developer-friendly product.

## 5. proxy.ts for auth gating
**Decision**: Use Next.js 16 proxy.ts to check auth state and onboarding status on every request.
**Rationale**: Centralizes auth redirects. Prevents unauthenticated access to protected routes without per-page guards.
**Tradeoff**: Adds latency to every request (one Supabase call). Acceptable for the security guarantee.

## 6. Feed polling over realtime
**Decision**: Feed uses server-side rendering + revalidation, not Supabase Realtime.
**Rationale**: Feed doesn't need sub-second updates. Server rendering provides better SEO and initial load. Messages use Realtime where latency matters.

## 7. Custom Button component over shadcn default
**Decision**: Replaced shadcn's @base-ui/react Button with a custom implementation supporting `asChild`.
**Rationale**: The @base-ui/react Button doesn't support the `asChild` prop used extensively for `<Link>` wrapping. Custom implementation uses React.cloneElement for the same pattern.
