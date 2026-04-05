# UpNext — Data Model

## Entity Relationship Overview

```
campuses ──< users ──< posts ──< comments
                │        │        │
                │        │        └── reactions
                │        │
                │        ├──< post_media
                │        └──< post_reactions
                │
                ├──< user_skills
                ├──< user_interests
                ├──< follows (self-referential)
                ├──< vouches
                ├──< notifications
                ├──< saved_posts
                │
                ├──< project_members >── projects
                │                          │
                │                          ├──< project_roles_needed
                │                          ├──< project_milestones
                │                          ├──< project_tags
                │                          └──< project_updates
                │
                ├──< raise_hands
                ├──< conversation_participants >── conversations
                │                                      │
                │                                      └──< messages
                │
                └──< event_rsvps >── events
```

## Tables

### campuses
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | e.g. "Stanford University" |
| slug | text | unique, e.g. "stanford" |
| domain | text | e.g. "stanford.edu" |
| logo_url | text | nullable |
| location | text | city, state |
| created_at | timestamptz | |

### users (extends auth.users)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, references auth.users |
| handle | text | unique, @handle |
| display_name | text | |
| avatar_url | text | nullable |
| bio | text | nullable, max 280 chars |
| campus_id | uuid | FK → campuses |
| role | text | founder/builder/designer/marketer/researcher/other |
| graduation_year | int | |
| major | text | nullable |
| building_description | text | what they're currently building |
| website_url | text | nullable |
| twitter_handle | text | nullable |
| github_handle | text | nullable |
| linkedin_url | text | nullable |
| is_verified | boolean | email verified |
| is_admin | boolean | default false |
| is_ambassador | boolean | default false |
| shipped_streak | int | default 0 |
| onboarding_completed | boolean | default false |
| notification_preferences | jsonb | email/push settings |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### user_skills
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → users, PK |
| skill | text | PK |

### user_interests
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → users, PK |
| interest | text | PK |

### follows
| Column | Type | Notes |
|--------|------|-------|
| follower_id | uuid | FK → users, PK |
| following_id | uuid | FK → users, PK |
| created_at | timestamptz | |

### vouches
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| voucher_id | uuid | FK → users |
| vouchee_id | uuid | FK → users |
| skill | text | what they're vouching for |
| message | text | nullable |
| created_at | timestamptz | |
| UNIQUE | | (voucher_id, vouchee_id, skill) |

### projects
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | text | |
| slug | text | unique |
| tagline | text | max 120 chars |
| description | text | markdown |
| logo_url | text | nullable |
| cover_url | text | nullable |
| stage | text | idea/building/launched/growing/funded |
| campus_id | uuid | FK → campuses |
| website_url | text | nullable |
| created_by | uuid | FK → users |
| is_featured | boolean | default false |
| is_archived | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### project_members
| Column | Type | Notes |
|--------|------|-------|
| project_id | uuid | FK → projects, PK |
| user_id | uuid | FK → users, PK |
| role | text | e.g. "Founder", "Lead Engineer" |
| joined_at | timestamptz | |

### project_roles_needed
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| title | text | e.g. "Frontend Developer" |
| description | text | nullable |
| is_filled | boolean | default false |
| created_at | timestamptz | |

### project_milestones
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| project_id | uuid | FK → projects |
| title | text | |
| description | text | nullable |
| completed_at | timestamptz | nullable |
| target_date | date | nullable |
| sort_order | int | |
| created_at | timestamptz | |

### project_tags
| Column | Type | Notes |
|--------|------|-------|
| project_id | uuid | FK → projects, PK |
| tag | text | PK |

### posts
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| author_id | uuid | FK → users |
| project_id | uuid | FK → projects, nullable |
| type | text | update/launch/ask/win/learn/event |
| content | text | markdown body |
| is_pinned | boolean | default false |
| is_removed | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### post_media
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| post_id | uuid | FK → posts |
| url | text | |
| type | text | image/video |
| alt_text | text | nullable |
| sort_order | int | |
| created_at | timestamptz | |

### post_reactions
| Column | Type | Notes |
|--------|------|-------|
| post_id | uuid | FK → posts, PK |
| user_id | uuid | FK → users, PK |
| type | text | fire/rocket/lightbulb/clap/heart, PK |
| created_at | timestamptz | |

### comments
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| post_id | uuid | FK → posts |
| author_id | uuid | FK → users |
| parent_id | uuid | FK → comments, nullable (threading) |
| content | text | |
| is_removed | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### saved_posts
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → users, PK |
| post_id | uuid | FK → posts, PK |
| created_at | timestamptz | |

### reposts
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK → users, PK |
| post_id | uuid | FK → posts, PK |
| created_at | timestamptz | |

### raise_hands
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| project_id | uuid | FK → projects, nullable |
| post_id | uuid | FK → posts, nullable |
| message | text | nullable |
| skills | text[] | what they can help with |
| status | text | pending/accepted/declined |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### conversations
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| type | text | direct/project |
| project_id | uuid | FK → projects, nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### conversation_participants
| Column | Type | Notes |
|--------|------|-------|
| conversation_id | uuid | FK → conversations, PK |
| user_id | uuid | FK → users, PK |
| last_read_at | timestamptz | nullable |
| joined_at | timestamptz | |

### messages
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| conversation_id | uuid | FK → conversations |
| sender_id | uuid | FK → users |
| content | text | |
| type | text | text/image/system |
| media_url | text | nullable |
| created_at | timestamptz | |

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| type | text | follow/reaction/comment/mention/raise_hand/message/invite/vouch |
| title | text | |
| body | text | nullable |
| actor_id | uuid | FK → users, nullable |
| resource_type | text | nullable (post/project/comment/etc) |
| resource_id | uuid | nullable |
| is_read | boolean | default false |
| created_at | timestamptz | |

### events
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | |
| slug | text | unique |
| description | text | markdown |
| type | text | hackathon/demo_day/workshop/meetup/speaker/social |
| cover_url | text | nullable |
| start_time | timestamptz | |
| end_time | timestamptz | |
| location | text | nullable |
| is_virtual | boolean | default false |
| virtual_url | text | nullable |
| campus_id | uuid | FK → campuses, nullable |
| organizer_id | uuid | FK → users |
| max_attendees | int | nullable |
| is_featured | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### event_rsvps
| Column | Type | Notes |
|--------|------|-------|
| event_id | uuid | FK → events, PK |
| user_id | uuid | FK → users, PK |
| status | text | going/maybe/not_going |
| created_at | timestamptz | |

### reports
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| reporter_id | uuid | FK → users |
| resource_type | text | post/comment/user/project/message |
| resource_id | uuid | |
| reason | text | spam/harassment/inappropriate/other |
| details | text | nullable |
| status | text | pending/reviewed/resolved/dismissed |
| reviewed_by | uuid | FK → users, nullable |
| created_at | timestamptz | |
| resolved_at | timestamptz | nullable |

### referrals
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| referrer_id | uuid | FK → users |
| code | text | unique |
| used_by | uuid | FK → users, nullable |
| used_at | timestamptz | nullable |
| created_at | timestamptz | |

### feature_flags
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| key | text | unique |
| description | text | |
| is_enabled | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Indexes

- users: handle, campus_id, role, created_at
- posts: author_id, project_id, type, created_at, is_removed
- comments: post_id, author_id, parent_id
- follows: follower_id, following_id
- messages: conversation_id, created_at
- notifications: user_id, is_read, created_at
- events: campus_id, start_time, type
- projects: campus_id, stage, slug, created_by
- raise_hands: user_id, project_id, post_id, status
- reports: status, resource_type
- search: GIN indexes on users(display_name, handle), projects(name, tagline), posts(content)

## RLS Policy Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| users | public profiles | own only | own only | never (soft) |
| posts | public (not removed) | authenticated | own only | own only (soft) |
| comments | public (not removed) | authenticated | own only | own only (soft) |
| messages | participants only | participants only | never | never |
| conversations | participants only | authenticated | never | never |
| notifications | own only | system/triggers | own only (read) | never |
| projects | public | authenticated | team members | creator only |
| reports | admin only | authenticated | admin only | never |
| feature_flags | admin only | admin only | admin only | admin only |
