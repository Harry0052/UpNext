---
name: qa-playwright
description: Write and run Playwright E2E tests for UpNext critical user flows — auth, posting, projects, messaging
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# QA & Playwright Testing for UpNext

## Test Structure
```
tests/
├── e2e/
│   ├── auth.spec.ts        # Signup, login, logout
│   ├── onboarding.spec.ts  # 4-step onboarding wizard
│   ├── feed.spec.ts        # Post creation, reactions, comments
│   ├── projects.spec.ts    # Create, view, milestones, raise hand
│   ├── profile.spec.ts     # View, follow, edit settings
│   ├── messaging.spec.ts   # Start conversation, send messages
│   ├── events.spec.ts      # Create, RSVP, view
│   ├── search.spec.ts      # Search across tabs
│   └── admin.spec.ts       # Admin dashboard, user mgmt
├── helpers/
│   ├── auth.ts             # Login helper functions
│   └── seed.ts             # Test data setup
└── playwright.config.ts
```

## Test Credentials
- Admin: `alex@stanford.edu` / `Demo1234!`
- Regular: `maya@mit.edu` / `Demo1234!`
- All demo users: `<name>@<school>.edu` / `Demo1234!`

## Critical Flows to Test

### Auth
- Signup with valid .edu email → verification page shown
- Login with credentials → redirect to feed
- Login with wrong password → error shown
- Non-.edu email rejected on signup

### Onboarding
- Step 1: fill name, handle, school, grad year → next
- Step 2: select role → next
- Step 3: describe what building → next
- Step 4: select skills + interests → submit → redirect to feed

### Feed
- Create post with each type (update, launch, ask, win, learn)
- React to a post → reaction count increments
- Comment on a post → comment appears
- Save a post → bookmark icon fills
- Filter by following/campus/trending
- Filter by post type

### Projects
- Create project with name, tagline, stage → redirect to project page
- View project detail → see team, milestones, roles
- Raise hand on project → form appears, submit → success

### Profile
- View own profile → see posts, projects, vouches tabs
- View other profile → follow button visible
- Follow/unfollow → button state changes
- Edit settings → changes saved

## Page Object Pattern
```typescript
// tests/helpers/auth.ts
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/feed')
}
```

## Running Tests
```bash
npx playwright test                    # All tests
npx playwright test tests/e2e/auth    # Specific file
npx playwright test --headed           # With browser
npx playwright show-report             # View results
```

## Before Testing
1. Ensure dev server is running: `npm run dev`
2. Ensure database is seeded: `npx tsx scripts/seed.ts`
3. Ensure Supabase is accessible (check .env.local)
