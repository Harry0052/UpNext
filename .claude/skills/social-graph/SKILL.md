---
name: social-graph
description: Implement social features — follows, vouches, raise hands, reputation, campus connections — with proper data modeling
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# Social Graph Features for UpNext

## Core Social Primitives

### Follows
- Table: `follows` (follower_id, following_id) — composite PK
- Self-follow prevented by CHECK constraint
- Server action: `toggleFollow()` in `lib/actions/social.ts`
- Creates notification for the followed user
- Feed "following" filter uses this table

### Vouches
- Table: `vouches` (voucher_id, vouchee_id, skill, message) — UNIQUE on (voucher, vouchee, skill)
- Users vouch for specific skills of other users
- Server action: `vouchUser()` in `lib/actions/social.ts`
- Displayed on profile page under Vouches tab
- Vouch count is a reputation signal

### Raise Hand
- Table: `raise_hands` (user_id, project_id, post_id, message, skills[], status)
- Available on project pages and ask-type posts
- Status flow: pending → accepted/declined
- Server actions: `raiseHand()`, `updateRaiseHandStatus()` in `lib/actions/social.ts`
- Notifies project owner or post author

## Reputation System

### Signals (strongest to weakest)
1. **Shipped streak** — consecutive weeks with a Launch or Win post
2. **Vouch count** — total vouches received from other users
3. **Project count** — active projects where user is a member
4. **Follower count** — social proof
5. **Campus ambassador** — admin-granted badge

### Shipped Streak Calculation
```
For each week (Mon-Sun) going backwards:
  - If user has a post with type 'launch' or 'win' → streak continues
  - If no qualifying post → streak breaks
User.shipped_streak = count of consecutive qualifying weeks
```

## Campus Connections
- Users belong to campuses via `campus_id` foreign key
- Campus auto-detected from .edu email domain during onboarding
- Campus-scoped feed: filter posts by `author.campus_id`
- Campus page: list all users and projects at a school
- Campus leaderboard: rank by active users, posts, projects

## Recommendation Algorithms

### Who to Follow
Priority order:
1. Same campus, not yet followed
2. Shared skills (>2 overlap)
3. Shared interests (>2 overlap)
4. High reputation users (vouch count + followers)
5. Recently active (posted in last 7 days)

### Projects to Join
Match: user's skills ∩ project's open roles → sorted by campus proximity, then recency

## Notification Triggers
| Action | Notification To | Type |
|--------|----------------|------|
| Follow | Followed user | `follow` |
| Vouch | Vouchee | `vouch` |
| Raise Hand | Project owner / Post author | `raise_hand` |
| Accept/Decline Hand | Raiser | `raise_hand` |
| Add to Project | Added user | `invite` |
