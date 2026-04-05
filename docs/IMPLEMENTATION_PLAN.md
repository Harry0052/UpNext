# UpNext — Implementation Plan

## Phase 1: Foundation
1. Initialize Next.js project with TypeScript, Tailwind, shadcn/ui
2. Set up Supabase project config and types
3. Create design system (colors, typography, components)
4. Set up auth (signup, login, magic link, .edu validation)
5. Create database migration with all tables, indexes, RLS
6. Build layout shell (sidebar, topbar, mobile nav)

## Phase 2: Core Identity
7. User onboarding flow (multi-step form)
8. User profile pages
9. Profile editing in settings
10. Follow/unfollow system
11. Campus pages

## Phase 3: Content
12. Post composer with type selector
13. Media upload (images, video)
14. Feed page with filters
15. Post detail page with comments
16. Reactions system
17. Save/bookmark and repost
18. Report flow

## Phase 4: Projects
19. Create project flow
20. Project detail page
21. Team management
22. Open roles / roles needed
23. Milestones
24. Project updates
25. Raise Hand flow

## Phase 5: Social
26. Vouch system
27. Shipped streak calculation
28. Recommendation engine (who to follow, what to join)
29. Explore page with trending/featured

## Phase 6: Communication
30. Messaging: conversation list
31. Messaging: chat view with realtime
32. Project group conversations
33. In-app notifications
34. Email digest system

## Phase 7: Events
35. Event creation
36. Event listing and detail
37. RSVP system
38. Event discovery

## Phase 8: Search & Discovery
39. Global search with tabs
40. Typeahead/autocomplete
41. Advanced filters
42. Campus leaderboard

## Phase 9: Admin & Moderation
43. Admin layout and dashboard
44. User management
45. Content moderation queue
46. Campus management
47. Feature flags UI
48. Analytics dashboard

## Phase 10: Growth & Polish
49. Waitlist/referral system
50. Featured launches
51. Campus ambassador tracking
52. Seed script with realistic data
53. E2E tests for critical flows
54. Performance optimization
55. PWA manifest and service worker
56. Final design polish pass

## Vertical Slice Strategy
Each phase delivers end-to-end functionality. No phase leaves broken or dead-end UI. After each phase, tests run, docs update, and a checkpoint is recorded.
