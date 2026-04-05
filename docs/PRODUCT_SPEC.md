# UpNext — Product Specification

## Vision
UpNext is the social network where ambitious college students discover who is building on their campus, share structured updates, find teammates, join projects, attend events, and build reputation by shipping and helping.

## Target User
Verified college students (.edu email) who are building startups, apps, clubs, brands, side projects, research projects, hackathon teams, agencies, or campus ventures.

## Core Experience

### 1. Authentication & Onboarding
- .edu email sign-up via Supabase Auth (magic link + password)
- Campus verification via email domain mapping
- Onboarding flow: school, major, grad year, skills, interests, role (founder/builder/designer/etc.), what they're building
- Profile photo upload during onboarding

### 2. User Profiles
- Display name, handle, avatar, bio, school, grad year
- Role badges (Founder, Engineer, Designer, Marketer, etc.)
- Skills tags, interests tags
- Projects they're part of
- Posts feed
- Stats: followers, following, projects, posts, vouches received
- "Raise Hand" history (what they've offered to help with)
- Shipped streak counter
- Vouch system (other users can vouch for skills/reliability)

### 3. Projects / Startups
- Project name, tagline, description, logo, cover image
- Stage selector: Idea, Building, Launched, Growing, Funded
- Team members with roles
- Open roles / positions needed
- Milestones timeline
- Updates feed (project-scoped posts)
- Media gallery (screenshots, demo videos)
- Tags: industry, tech stack, campus
- "Raise Hand" button for visitors to offer help or apply

### 4. Feed & Posts
- Structured post types:
  - **Update**: general status update
  - **Launch**: announcing something new
  - **Ask**: requesting help, feedback, or teammates
  - **Win**: celebrating a milestone
  - **Learn**: sharing a lesson or resource
  - **Event**: promoting an event
- Rich text body with markdown support
- Image attachments (up to 4)
- Short video attachments (up to 60s)
- Project tagging (link post to a project)
- Reactions (fire, rocket, lightbulb, clap, heart)
- Comments with threading
- Save/bookmark
- Repost
- Share link

### 5. Feed Filters
- Following (people you follow)
- Campus (your school)
- Trending (algorithmic)
- By post type
- By role/skill
- By tag

### 6. Discovery & Search
- Global search with tabs: People, Projects, Posts, Events, Campuses
- Typeahead suggestions
- Filter by school, role, skill, stage, tag
- Trending section
- Recommended: who to follow, projects to join, posts to read

### 7. Messaging
- 1:1 direct messages
- Project group conversations (auto-created for project teams)
- Message types: text, image, link preview
- Read receipts
- Realtime via Supabase Realtime
- Unread count badges

### 8. Notifications
- In-app notification center
- Types: new follower, reaction, comment, mention, raise hand, message, project invite, vouch
- Read/unread state
- Email digest (daily/weekly configurable)

### 9. Events
- Event listing: title, description, date/time, location (physical or virtual), organizer
- Campus-scoped and global events
- RSVP system
- Attendee list
- Event types: Hackathon, Demo Day, Workshop, Meetup, Speaker, Social

### 10. Reputation & Trust
- Vouch system: users can vouch for others' skills
- Shipped streak: consecutive weeks with a post tagged as Launch or Win
- Completion signals: projects with milestones hit
- Social proof: follower count, project count, vouch count
- Campus leaderboard (opt-in)

### 11. Raise Hand (Apply/Offer Help)
- Available on project pages and Ask posts
- Quick action: select what you can help with (from your skills)
- Optional message
- Creates a pending request visible to project owner
- Accept/decline flow
- Notification to both parties

### 12. Admin & Moderation
- Admin dashboard (role-gated)
- Content moderation queue (reported posts, comments, messages)
- User management (ban, suspend, verify)
- Campus management (add schools, map domains)
- Analytics overview (DAU, signups, posts, projects)
- Feature flags management
- Featured content curation

### 13. Growth Systems
- Waitlist mode (pre-launch)
- Referral codes with tracking
- Featured launches section on explore
- Campus ambassador program tracking
- Invite system

### 14. Settings
- Profile editing
- Notification preferences (in-app, email, digest frequency)
- Privacy settings
- Account management (email change, password, delete account)
- Theme preference (dark/light/system)

### 15. Monetization Primitives (Feature-flagged)
- Organization seats
- Recruiting access tier
- Sponsorship/promotion tools
- These are UI stubs behind feature flags, not fully implemented

## Design Language
- Bold, energetic, modern
- Dark mode first with light mode support
- Accent colors: electric blue, vibrant purple gradients
- Typography: Inter for body, Cal Sans or similar for headings
- Card-based layouts with generous spacing
- Micro-interactions and subtle animations
- Mobile-first responsive design
