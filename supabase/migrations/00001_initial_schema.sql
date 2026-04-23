-- ============================================================================
-- UpNext Social Network - Initial Schema Migration
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Helper: updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Table: campuses
-- ============================================================================
CREATE TABLE campuses (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  slug       text        UNIQUE NOT NULL,
  domain     text        NOT NULL,
  logo_url   text,
  location   text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campuses_select" ON campuses
  FOR SELECT USING (true);

CREATE POLICY "campuses_insert" ON campuses
  FOR INSERT WITH CHECK (false); -- admin-only via service role

CREATE INDEX idx_campuses_slug ON campuses (slug);
CREATE INDEX idx_campuses_domain ON campuses (domain);

-- ============================================================================
-- Table: users
-- ============================================================================
CREATE TABLE users (
  id                       uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  handle                   text        UNIQUE NOT NULL,
  display_name             text        NOT NULL,
  avatar_url               text,
  bio                      text,
  campus_id                uuid        REFERENCES campuses ON DELETE SET NULL,
  role                     text        NOT NULL DEFAULT 'builder',
  graduation_year          int,
  major                    text,
  building_description     text,
  website_url              text,
  twitter_handle           text,
  github_handle            text,
  linkedin_url             text,
  is_verified              boolean     NOT NULL DEFAULT false,
  is_admin                 boolean     NOT NULL DEFAULT false,
  is_ambassador            boolean     NOT NULL DEFAULT false,
  shipped_streak           int         NOT NULL DEFAULT 0,
  onboarding_completed     boolean     NOT NULL DEFAULT false,
  notification_preferences jsonb       NOT NULL DEFAULT '{"email_digest": "weekly", "email_notifications": true}'::jsonb,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE INDEX idx_users_handle ON users (handle);
CREATE INDEX idx_users_campus_id ON users (campus_id);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: user_skills
-- ============================================================================
CREATE TABLE user_skills (
  user_id uuid NOT NULL REFERENCES users ON DELETE CASCADE,
  skill   text NOT NULL,
  PRIMARY KEY (user_id, skill)
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_skills_select" ON user_skills
  FOR SELECT USING (true);

CREATE POLICY "user_skills_insert" ON user_skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_skills_delete" ON user_skills
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_skills_user_id ON user_skills (user_id);

-- ============================================================================
-- Table: user_interests
-- ============================================================================
CREATE TABLE user_interests (
  user_id  uuid NOT NULL REFERENCES users ON DELETE CASCADE,
  interest text NOT NULL,
  PRIMARY KEY (user_id, interest)
);

ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_interests_select" ON user_interests
  FOR SELECT USING (true);

CREATE POLICY "user_interests_insert" ON user_interests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_interests_delete" ON user_interests
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_user_interests_user_id ON user_interests (user_id);

-- ============================================================================
-- Table: follows
-- ============================================================================
CREATE TABLE follows (
  follower_id  uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  following_id uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select" ON follows
  FOR SELECT USING (true);

CREATE POLICY "follows_insert" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "follows_delete" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

CREATE INDEX idx_follows_follower_id ON follows (follower_id);
CREATE INDEX idx_follows_following_id ON follows (following_id);

-- ============================================================================
-- Table: vouches
-- ============================================================================
CREATE TABLE vouches (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  vouchee_id uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  skill      text        NOT NULL,
  message    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (voucher_id, vouchee_id, skill)
);

ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "vouches_select" ON vouches
  FOR SELECT USING (true);

CREATE POLICY "vouches_insert" ON vouches
  FOR INSERT WITH CHECK (auth.uid() = voucher_id);

CREATE POLICY "vouches_delete" ON vouches
  FOR DELETE USING (auth.uid() = voucher_id);

CREATE INDEX idx_vouches_voucher_id ON vouches (voucher_id);
CREATE INDEX idx_vouches_vouchee_id ON vouches (vouchee_id);

-- ============================================================================
-- Table: projects
-- ============================================================================
CREATE TABLE projects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        UNIQUE NOT NULL,
  tagline     text        NOT NULL,
  description text,
  logo_url    text,
  cover_url   text,
  stage       text        NOT NULL DEFAULT 'idea'
                          CHECK (stage IN ('idea', 'building', 'launched', 'growing', 'funded')),
  campus_id   uuid        REFERENCES campuses ON DELETE SET NULL,
  website_url text,
  created_by  uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  is_featured boolean     NOT NULL DEFAULT false,
  is_archived boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (true);

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE INDEX idx_projects_slug ON projects (slug);
CREATE INDEX idx_projects_campus_id ON projects (campus_id);
CREATE INDEX idx_projects_created_by ON projects (created_by);
CREATE INDEX idx_projects_stage ON projects (stage);
CREATE INDEX idx_projects_is_featured ON projects (is_featured) WHERE is_featured = true;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: project_members
-- ============================================================================
CREATE TABLE project_members (
  project_id uuid        NOT NULL REFERENCES projects ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  role       text        NOT NULL,
  joined_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_members_select" ON project_members
  FOR SELECT USING (true);

CREATE POLICY "project_members_insert" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
        AND pm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
        AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "project_members_delete" ON project_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_members.project_id
        AND p.created_by = auth.uid()
    )
  );

CREATE INDEX idx_project_members_project_id ON project_members (project_id);
CREATE INDEX idx_project_members_user_id ON project_members (user_id);

-- ============================================================================
-- Table: project_roles_needed
-- ============================================================================
CREATE TABLE project_roles_needed (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  uuid        NOT NULL REFERENCES projects ON DELETE CASCADE,
  title       text        NOT NULL,
  description text,
  is_filled   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_roles_needed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_roles_needed_select" ON project_roles_needed
  FOR SELECT USING (true);

CREATE POLICY "project_roles_needed_insert" ON project_roles_needed
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_roles_needed.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "project_roles_needed_update" ON project_roles_needed
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_roles_needed.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "project_roles_needed_delete" ON project_roles_needed
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_roles_needed.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE INDEX idx_project_roles_needed_project_id ON project_roles_needed (project_id);

-- ============================================================================
-- Table: project_milestones
-- ============================================================================
CREATE TABLE project_milestones (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid        NOT NULL REFERENCES projects ON DELETE CASCADE,
  title        text        NOT NULL,
  description  text,
  completed_at timestamptz,
  target_date  date,
  sort_order   int         NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_milestones_select" ON project_milestones
  FOR SELECT USING (true);

CREATE POLICY "project_milestones_insert" ON project_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_milestones.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "project_milestones_update" ON project_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_milestones.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "project_milestones_delete" ON project_milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_milestones.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE INDEX idx_project_milestones_project_id ON project_milestones (project_id);

-- ============================================================================
-- Table: project_tags
-- ============================================================================
CREATE TABLE project_tags (
  project_id uuid NOT NULL REFERENCES projects ON DELETE CASCADE,
  tag        text NOT NULL,
  PRIMARY KEY (project_id, tag)
);

ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_tags_select" ON project_tags
  FOR SELECT USING (true);

CREATE POLICY "project_tags_insert" ON project_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_tags.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "project_tags_delete" ON project_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = project_tags.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE INDEX idx_project_tags_project_id ON project_tags (project_id);

-- ============================================================================
-- Table: posts
-- ============================================================================
CREATE TABLE posts (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  project_id uuid        REFERENCES projects ON DELETE SET NULL,
  type       text        NOT NULL DEFAULT 'update'
                         CHECK (type IN ('update', 'launch', 'ask', 'win', 'learn', 'event')),
  content    text        NOT NULL,
  is_pinned  boolean     NOT NULL DEFAULT false,
  is_removed boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select" ON posts
  FOR SELECT USING (is_removed = false);

CREATE POLICY "posts_insert" ON posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "posts_update" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "posts_delete" ON posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE INDEX idx_posts_author_id ON posts (author_id);
CREATE INDEX idx_posts_project_id ON posts (project_id);
CREATE INDEX idx_posts_type ON posts (type);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_posts_is_pinned ON posts (is_pinned) WHERE is_pinned = true;

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: post_media
-- ============================================================================
CREATE TABLE post_media (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES posts ON DELETE CASCADE,
  url        text        NOT NULL,
  type       text        NOT NULL DEFAULT 'image'
                         CHECK (type IN ('image', 'video')),
  alt_text   text,
  sort_order int         NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_media_select" ON post_media
  FOR SELECT USING (true);

CREATE POLICY "post_media_insert" ON post_media
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
        AND posts.author_id = auth.uid()
    )
  );

CREATE POLICY "post_media_delete" ON post_media
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_media.post_id
        AND posts.author_id = auth.uid()
    )
  );

CREATE INDEX idx_post_media_post_id ON post_media (post_id);

-- ============================================================================
-- Table: post_reactions
-- ============================================================================
CREATE TABLE post_reactions (
  post_id    uuid        NOT NULL REFERENCES posts ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN ('fire', 'rocket', 'lightbulb', 'clap', 'heart')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id, type)
);

ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_reactions_select" ON post_reactions
  FOR SELECT USING (true);

CREATE POLICY "post_reactions_insert" ON post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "post_reactions_delete" ON post_reactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_post_reactions_post_id ON post_reactions (post_id);
CREATE INDEX idx_post_reactions_user_id ON post_reactions (user_id);

-- ============================================================================
-- Table: comments
-- ============================================================================
CREATE TABLE comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid        NOT NULL REFERENCES posts ON DELETE CASCADE,
  author_id  uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  parent_id  uuid        REFERENCES comments ON DELETE CASCADE,
  content    text        NOT NULL,
  is_removed boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON comments
  FOR SELECT USING (is_removed = false);

CREATE POLICY "comments_insert" ON comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "comments_update" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE INDEX idx_comments_post_id ON comments (post_id);
CREATE INDEX idx_comments_author_id ON comments (author_id);
CREATE INDEX idx_comments_parent_id ON comments (parent_id);
CREATE INDEX idx_comments_created_at ON comments (created_at DESC);

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: saved_posts
-- ============================================================================
CREATE TABLE saved_posts (
  user_id    uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  post_id    uuid        NOT NULL REFERENCES posts ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_posts_select" ON saved_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "saved_posts_insert" ON saved_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_posts_delete" ON saved_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_saved_posts_user_id ON saved_posts (user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts (post_id);

-- ============================================================================
-- Table: reposts
-- ============================================================================
CREATE TABLE reposts (
  user_id    uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  post_id    uuid        NOT NULL REFERENCES posts ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reposts_select" ON reposts
  FOR SELECT USING (true);

CREATE POLICY "reposts_insert" ON reposts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reposts_delete" ON reposts
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_reposts_user_id ON reposts (user_id);
CREATE INDEX idx_reposts_post_id ON reposts (post_id);

-- ============================================================================
-- Table: raise_hands
-- ============================================================================
CREATE TABLE raise_hands (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  project_id uuid        REFERENCES projects ON DELETE CASCADE,
  post_id    uuid        REFERENCES posts ON DELETE CASCADE,
  message    text,
  skills     text[]      NOT NULL DEFAULT '{}',
  status     text        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE raise_hands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "raise_hands_select" ON raise_hands
  FOR SELECT USING (true);

CREATE POLICY "raise_hands_insert" ON raise_hands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "raise_hands_update" ON raise_hands
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = raise_hands.project_id
        AND project_members.user_id = auth.uid()
    )
  );

CREATE POLICY "raise_hands_delete" ON raise_hands
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_raise_hands_user_id ON raise_hands (user_id);
CREATE INDEX idx_raise_hands_project_id ON raise_hands (project_id);
CREATE INDEX idx_raise_hands_post_id ON raise_hands (post_id);
CREATE INDEX idx_raise_hands_status ON raise_hands (status);

CREATE TRIGGER trg_raise_hands_updated_at
  BEFORE UPDATE ON raise_hands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: conversations
-- ============================================================================
CREATE TABLE conversations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  type       text        NOT NULL DEFAULT 'direct'
                         CHECK (type IN ('direct', 'project')),
  project_id uuid        REFERENCES projects ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE INDEX idx_conversations_project_id ON conversations (project_id);

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: conversation_participants
-- ============================================================================
CREATE TABLE conversation_participants (
  conversation_id uuid        NOT NULL REFERENCES conversations ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  last_read_at    timestamptz,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversation_participants_select" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants (conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants (user_id);

-- ============================================================================
-- Table: messages
-- ============================================================================
CREATE TABLE messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES conversations ON DELETE CASCADE,
  sender_id       uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  content         text        NOT NULL,
  type            text        NOT NULL DEFAULT 'text'
                              CHECK (type IN ('text', 'image', 'system')),
  media_url       text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_sender_id ON messages (sender_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

-- ============================================================================
-- Function: update conversation.updated_at on new message
-- ============================================================================
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_messages_update_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- ============================================================================
-- Table: notifications
-- ============================================================================
CREATE TABLE notifications (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  type          text        NOT NULL,
  title         text        NOT NULL,
  body          text,
  actor_id      uuid        REFERENCES users ON DELETE SET NULL,
  resource_type text,
  resource_id   uuid,
  is_read       boolean     NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_user_id_unread ON notifications (user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_actor_id ON notifications (actor_id);
CREATE INDEX idx_notifications_created_at ON notifications (created_at DESC);

-- ============================================================================
-- Table: events
-- ============================================================================
CREATE TABLE events (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  slug           text        UNIQUE NOT NULL,
  description    text,
  type           text        NOT NULL DEFAULT 'meetup'
                             CHECK (type IN ('hackathon', 'demo_day', 'workshop', 'meetup', 'speaker', 'social')),
  cover_url      text,
  start_time     timestamptz NOT NULL,
  end_time       timestamptz NOT NULL,
  location       text,
  is_virtual     boolean     NOT NULL DEFAULT false,
  virtual_url    text,
  campus_id      uuid        REFERENCES campuses ON DELETE SET NULL,
  organizer_id   uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  max_attendees  int,
  is_featured    boolean     NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON events
  FOR SELECT USING (true);

CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "events_update" ON events
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "events_delete" ON events
  FOR DELETE USING (auth.uid() = organizer_id);

CREATE INDEX idx_events_slug ON events (slug);
CREATE INDEX idx_events_campus_id ON events (campus_id);
CREATE INDEX idx_events_organizer_id ON events (organizer_id);
CREATE INDEX idx_events_start_time ON events (start_time);
CREATE INDEX idx_events_type ON events (type);
CREATE INDEX idx_events_is_featured ON events (is_featured) WHERE is_featured = true;

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: event_rsvps
-- ============================================================================
CREATE TABLE event_rsvps (
  event_id   uuid        NOT NULL REFERENCES events ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  status     text        NOT NULL DEFAULT 'going'
                         CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, user_id)
);

ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_rsvps_select" ON event_rsvps
  FOR SELECT USING (true);

CREATE POLICY "event_rsvps_insert" ON event_rsvps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "event_rsvps_update" ON event_rsvps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "event_rsvps_delete" ON event_rsvps
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_event_rsvps_event_id ON event_rsvps (event_id);
CREATE INDEX idx_event_rsvps_user_id ON event_rsvps (user_id);

-- ============================================================================
-- Table: reports
-- ============================================================================
CREATE TABLE reports (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  resource_type text        NOT NULL,
  resource_id   uuid        NOT NULL,
  reason        text        NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'other')),
  details       text,
  status        text        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by   uuid        REFERENCES users ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
  );

CREATE POLICY "reports_insert" ON reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "reports_update" ON reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
  );

CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_status ON reports (status);
CREATE INDEX idx_reports_resource ON reports (resource_type, resource_id);

-- ============================================================================
-- Table: referrals
-- ============================================================================
CREATE TABLE referrals (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid        NOT NULL REFERENCES users ON DELETE CASCADE,
  code        text        UNIQUE NOT NULL,
  used_by     uuid        REFERENCES users ON DELETE SET NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "referrals_select" ON referrals
  FOR SELECT USING (true);

CREATE POLICY "referrals_insert" ON referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE INDEX idx_referrals_referrer_id ON referrals (referrer_id);
CREATE INDEX idx_referrals_code ON referrals (code);

-- ============================================================================
-- Table: feature_flags
-- ============================================================================
CREATE TABLE feature_flags (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text        UNIQUE NOT NULL,
  description text        NOT NULL,
  is_enabled  boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_select" ON feature_flags
  FOR SELECT USING (true);

CREATE POLICY "feature_flags_insert" ON feature_flags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
  );

CREATE POLICY "feature_flags_update" ON feature_flags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
  );

CREATE POLICY "feature_flags_delete" ON feature_flags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
  );

CREATE TRIGGER trg_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Trigger: auto-create user profile on auth.users insert
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_prefix text;
  user_handle  text;
  handle_count int;
BEGIN
  -- Extract prefix from email (everything before @)
  email_prefix := split_part(NEW.email, '@', 1);

  -- Sanitize: lowercase, replace non-alphanumeric with underscore, trim underscores
  user_handle := lower(regexp_replace(email_prefix, '[^a-zA-Z0-9]', '_', 'g'));
  user_handle := trim(both '_' from user_handle);

  -- If empty after sanitization, use a fallback
  IF user_handle = '' THEN
    user_handle := 'user';
  END IF;

  -- Ensure uniqueness by appending a numeric suffix if needed
  SELECT count(*) INTO handle_count
  FROM users
  WHERE handle = user_handle OR handle LIKE user_handle || '_%';

  IF handle_count > 0 THEN
    user_handle := user_handle || '_' || (handle_count + 1)::text;
  END IF;

  INSERT INTO public.users (id, handle, display_name)
  VALUES (
    NEW.id,
    user_handle,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      initcap(replace(email_prefix, '.', ' '))
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
