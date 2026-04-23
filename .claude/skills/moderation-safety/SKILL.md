---
name: moderation-safety
description: Implement content moderation, report flows, admin review queues, and trust/safety for UpNext
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# Moderation & Safety for UpNext

## Report Flow
1. User clicks Report on post/comment/user/project/message
2. Selects reason: spam, harassment, inappropriate, other
3. Optional: adds details text
4. Server action creates report row with status=pending
5. Admin sees in moderation queue at `/admin/reports`
6. Admin resolves (take action) or dismisses (no action needed)

## Reports Table
```sql
reports (
  id, reporter_id, resource_type, resource_id,
  reason CHECK (spam/harassment/inappropriate/other),
  details, status CHECK (pending/reviewed/resolved/dismissed),
  reviewed_by, created_at, resolved_at
)
```
RLS: admin-only SELECT, authenticated INSERT, admin-only UPDATE.

## Content Removal
- Posts and comments use `is_removed` boolean — **soft delete only**
- Never hard-delete user content (legal/compliance reasons)
- Removed content hidden from feed queries: `.eq('is_removed', false)`
- Admin can see removed content in admin content view

## Admin Tools
| Page | Purpose |
|------|---------|
| `/admin` | Dashboard with stats |
| `/admin/users` | User management, role assignment |
| `/admin/content` | Content overview, featured projects |
| `/admin/reports` | Moderation queue |
| `/admin/campuses` | School management |
| `/admin/features` | Feature flags |
| `/admin/analytics` | Usage metrics |

## Trust Layers
1. **.edu verification** — primary spam gate, required for signup
2. **Structured posts** — post types enforce quality (must pick type)
3. **Community reporting** — users flag bad content
4. **Admin review** — human decision on reported content
5. **Reputation signals** — vouches and shipped streaks indicate trusted builders

## User Actions (Admin)
- Toggle admin role
- Toggle ambassador role
- View user details
- (Future: suspend/ban with reason)

## Feature Flags
Gate experimental features without deployment:
```sql
feature_flags (key TEXT UNIQUE, description, is_enabled BOOLEAN)
```
Check in server components: `supabase.from('feature_flags').select('is_enabled').eq('key', 'feature_name')`
