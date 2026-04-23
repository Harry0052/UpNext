---
name: feed-ranking
description: Build and tune the UpNext feed — post queries, filtering, ranking signals, and content recommendation
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# Feed & Ranking System for UpNext

## Feed Query
Main query in `lib/queries/posts.ts` → `getFeedPosts()`.

### Data Shape (PostWithAuthor)
```typescript
{
  ...post,
  author: { id, handle, display_name, avatar_url, role },
  project: { id, name, slug } | null,
  media: [{ id, url, type, alt_text, sort_order }],
  reaction_counts: { fire: 3, rocket: 1, ... },
  comment_count: 5,
  user_reactions: ['fire'],  // current user's reactions
  is_saved: false,
  is_reposted: false
}
```

### Enrichment Strategy (Avoid N+1)
```typescript
const postIds = posts.map(p => p.id)
const [reactions, comments, userReactions, userSaves, userReposts] = await Promise.all([
  supabase.from('post_reactions').select('post_id, type').in('post_id', postIds),
  supabase.from('comments').select('post_id').in('post_id', postIds).eq('is_removed', false),
  supabase.from('post_reactions').select('post_id, type').in('post_id', postIds).eq('user_id', userId),
  supabase.from('saved_posts').select('post_id').in('post_id', postIds).eq('user_id', userId),
  supabase.from('reposts').select('post_id').in('post_id', postIds).eq('user_id', userId),
])
```

## Filter Modes
| Mode | Query Logic |
|------|------------|
| All | All non-removed posts, newest first |
| Following | Posts where author_id IN (followed users + self) |
| Campus | Posts where author's campus_id = current user's campus_id |
| Trending | Algorithmic (see ranking below) |

## Post Type Filters
Secondary filter: `update`, `launch`, `ask`, `win`, `learn`, `event`.
Applied as `.eq('type', postType)` on the query.

## Trending Ranking (Future)
```
score = (reaction_count * 2 + comment_count * 3) / (hours_since_post + 2)^1.5
         * type_multiplier
         * (1 + 0.1 * author_reputation)
```

Type multipliers: launch=2.0, win=1.5, ask=1.3, learn=1.2, event=1.1, update=1.0

## Pagination
Currently offset-based: `range(offset, offset + limit - 1)`.
Future: cursor-based using `created_at` for infinite scroll.

## Explore Page
Separate from feed. Shows:
- Featured projects (is_featured = true)
- Trending posts (cross-campus)
- Recommended people (who to follow algorithm)
- Upcoming events
- Campus directory
