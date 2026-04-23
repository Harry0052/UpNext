---
name: release-hardening
description: Pre-release checklist — build verification, security audit, performance check, accessibility, and deploy readiness
user-invocable: true
allowed-tools: Read Grep Glob Bash
---

# Release Hardening Checklist for UpNext

Run through this checklist before any production deployment.

## 1. Build Verification
```bash
npm run build    # Must pass with zero errors
npm run lint     # Must pass with zero errors
```
- [ ] Build output shows all routes compiled
- [ ] No TypeScript errors
- [ ] No ESLint errors or warnings

## 2. Security Audit

### RLS
```bash
# Verify all tables have RLS enabled
grep -c "ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql
# Count should match number of tables
```
- [ ] Every table has RLS enabled
- [ ] No service-role client used in user-facing server actions
- [ ] All server actions check `auth.getUser()` first

### Input Validation
```bash
# Check all server actions use Zod validation
grep -l "safeParse\|.parse(" lib/actions/*.ts
```
- [ ] Every server action validates input with Zod
- [ ] File upload limits enforced (MAX_FILE_SIZE, MAX_VIDEO_SIZE)
- [ ] No `dangerouslySetInnerHTML` with user content

### Secrets
```bash
# Check no secrets committed
grep -r "SUPABASE_SERVICE_ROLE_KEY\|sk_live\|password" --include="*.ts" --include="*.tsx" -l | grep -v node_modules | grep -v ".env"
```
- [ ] No secrets in source code
- [ ] `.env.local` in .gitignore
- [ ] `.env.local.example` documents all required vars

## 3. Performance
- [ ] No N+1 queries (batch fetch in `lib/queries/posts.ts`)
- [ ] All images use `next/image` with `sizes` prop
- [ ] Fonts use `next/font` (Geist)
- [ ] Heavy client components have loading states
- [ ] Database indexes on all foreign keys and query columns

## 4. Accessibility
- [ ] All images have `alt` text
- [ ] Form inputs have associated `<Label>` elements
- [ ] Buttons have accessible names
- [ ] Color contrast meets WCAG AA (check gradient text)
- [ ] Focus states visible on all interactive elements

## 5. Error Handling
- [ ] `app/not-found.tsx` exists with styled 404 page
- [ ] `app/error.tsx` or `app/global-error.tsx` exists
- [ ] Server actions return `{ error: string }` on failure
- [ ] Client forms show error messages from server

## 6. Deploy Readiness
- [ ] `next.config.ts` has correct `images.remotePatterns`
- [ ] `proxy.ts` handles all auth redirects correctly
- [ ] Database migration is idempotent
- [ ] Seed script works on fresh database
- [ ] All environment variables documented in `.env.local.example`
- [ ] Vercel project configured with correct env vars

## 7. Content Quality
- [ ] No placeholder text ("Lorem ipsum", "TODO", "TBD")
- [ ] No dead-end UI (buttons that do nothing)
- [ ] Empty states have helpful messaging
- [ ] Error states are user-friendly (not raw error messages)

## Quick Command
```bash
# Run all checks
npm run build && npm run lint && echo "✅ Ready for release"
```
