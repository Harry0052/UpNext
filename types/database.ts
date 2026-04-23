export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      campuses: {
        Row: {
          id: string
          name: string
          slug: string
          domain: string
          logo_url: string | null
          location: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          domain: string
          logo_url?: string | null
          location?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          domain?: string
          logo_url?: string | null
          location?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          handle: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          campus_id: string | null
          role: string
          graduation_year: number | null
          major: string | null
          building_description: string | null
          website_url: string | null
          twitter_handle: string | null
          github_handle: string | null
          linkedin_url: string | null
          is_verified: boolean
          is_admin: boolean
          is_ambassador: boolean
          shipped_streak: number
          onboarding_completed: boolean
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          handle: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          campus_id?: string | null
          role?: string
          graduation_year?: number | null
          major?: string | null
          building_description?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          github_handle?: string | null
          linkedin_url?: string | null
          is_verified?: boolean
          is_admin?: boolean
          is_ambassador?: boolean
          shipped_streak?: number
          onboarding_completed?: boolean
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          handle?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          campus_id?: string | null
          role?: string
          graduation_year?: number | null
          major?: string | null
          building_description?: string | null
          website_url?: string | null
          twitter_handle?: string | null
          github_handle?: string | null
          linkedin_url?: string | null
          is_verified?: boolean
          is_admin?: boolean
          is_ambassador?: boolean
          shipped_streak?: number
          onboarding_completed?: boolean
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_skills: {
        Row: { user_id: string; skill: string }
        Insert: { user_id: string; skill: string }
        Update: { user_id?: string; skill?: string }
      }
      user_interests: {
        Row: { user_id: string; interest: string }
        Insert: { user_id: string; interest: string }
        Update: { user_id?: string; interest?: string }
      }
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string }
        Insert: { follower_id: string; following_id: string; created_at?: string }
        Update: { follower_id?: string; following_id?: string; created_at?: string }
      }
      vouches: {
        Row: {
          id: string
          voucher_id: string
          vouchee_id: string
          skill: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          voucher_id: string
          vouchee_id: string
          skill: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          voucher_id?: string
          vouchee_id?: string
          skill?: string
          message?: string | null
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          slug: string
          tagline: string
          description: string | null
          logo_url: string | null
          cover_url: string | null
          stage: string
          campus_id: string | null
          website_url: string | null
          created_by: string
          is_featured: boolean
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          tagline: string
          description?: string | null
          logo_url?: string | null
          cover_url?: string | null
          stage?: string
          campus_id?: string | null
          website_url?: string | null
          created_by: string
          is_featured?: boolean
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          tagline?: string
          description?: string | null
          logo_url?: string | null
          cover_url?: string | null
          stage?: string
          campus_id?: string | null
          website_url?: string | null
          created_by?: string
          is_featured?: boolean
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: { project_id: string; user_id: string; role: string; joined_at: string }
        Insert: { project_id: string; user_id: string; role: string; joined_at?: string }
        Update: { project_id?: string; user_id?: string; role?: string; joined_at?: string }
      }
      project_roles_needed: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          is_filled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          is_filled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          is_filled?: boolean
          created_at?: string
        }
      }
      project_milestones: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          completed_at: string | null
          target_date: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          completed_at?: string | null
          target_date?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          completed_at?: string | null
          target_date?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      project_tags: {
        Row: { project_id: string; tag: string }
        Insert: { project_id: string; tag: string }
        Update: { project_id?: string; tag?: string }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          project_id: string | null
          type: string
          content: string
          is_pinned: boolean
          is_removed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          project_id?: string | null
          type?: string
          content: string
          is_pinned?: boolean
          is_removed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          project_id?: string | null
          type?: string
          content?: string
          is_pinned?: boolean
          is_removed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      post_media: {
        Row: {
          id: string
          post_id: string
          url: string
          type: string
          alt_text: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          url: string
          type?: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          url?: string
          type?: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      post_reactions: {
        Row: { post_id: string; user_id: string; type: string; created_at: string }
        Insert: { post_id: string; user_id: string; type: string; created_at?: string }
        Update: { post_id?: string; user_id?: string; type?: string; created_at?: string }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_id: string | null
          content: string
          is_removed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_id?: string | null
          content: string
          is_removed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_id?: string | null
          content?: string
          is_removed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      saved_posts: {
        Row: { user_id: string; post_id: string; created_at: string }
        Insert: { user_id: string; post_id: string; created_at?: string }
        Update: { user_id?: string; post_id?: string; created_at?: string }
      }
      reposts: {
        Row: { user_id: string; post_id: string; created_at: string }
        Insert: { user_id: string; post_id: string; created_at?: string }
        Update: { user_id?: string; post_id?: string; created_at?: string }
      }
      raise_hands: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          post_id: string | null
          message: string | null
          skills: string[]
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          post_id?: string | null
          message?: string | null
          skills?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          post_id?: string | null
          message?: string | null
          skills?: string[]
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          type: string
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type?: string
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: string
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
          last_read_at: string | null
          joined_at: string
        }
        Insert: {
          conversation_id: string
          user_id: string
          last_read_at?: string | null
          joined_at?: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
          last_read_at?: string | null
          joined_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          type: string
          media_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          type?: string
          media_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          type?: string
          media_url?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          actor_id: string | null
          resource_type: string | null
          resource_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          actor_id?: string | null
          resource_type?: string | null
          resource_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          body?: string | null
          actor_id?: string | null
          resource_type?: string | null
          resource_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          type: string
          cover_url: string | null
          start_time: string
          end_time: string
          location: string | null
          is_virtual: boolean
          virtual_url: string | null
          campus_id: string | null
          organizer_id: string
          max_attendees: number | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          type?: string
          cover_url?: string | null
          start_time: string
          end_time: string
          location?: string | null
          is_virtual?: boolean
          virtual_url?: string | null
          campus_id?: string | null
          organizer_id: string
          max_attendees?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          type?: string
          cover_url?: string | null
          start_time?: string
          end_time?: string
          location?: string | null
          is_virtual?: boolean
          virtual_url?: string | null
          campus_id?: string | null
          organizer_id?: string
          max_attendees?: number | null
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_rsvps: {
        Row: { event_id: string; user_id: string; status: string; created_at: string }
        Insert: { event_id: string; user_id: string; status?: string; created_at?: string }
        Update: { event_id?: string; user_id?: string; status?: string; created_at?: string }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          resource_type: string
          resource_id: string
          reason: string
          details: string | null
          status: string
          reviewed_by: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          reporter_id: string
          resource_type: string
          resource_id: string
          reason: string
          details?: string | null
          status?: string
          reviewed_by?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          reporter_id?: string
          resource_type?: string
          resource_id?: string
          reason?: string
          details?: string | null
          status?: string
          reviewed_by?: string | null
          created_at?: string
          resolved_at?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          code: string
          used_by: string | null
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          code: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          code?: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          key: string
          description: string
          is_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          description: string
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          description?: string
          is_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Commonly used types
export type User = Tables<'users'>
export type Campus = Tables<'campuses'>
export type Project = Tables<'projects'>
export type Post = Tables<'posts'>
export type Comment = Tables<'comments'>
export type Message = Tables<'messages'>
export type Conversation = Tables<'conversations'>
export type Notification = Tables<'notifications'>
export type Event = Tables<'events'>
export type RaiseHand = Tables<'raise_hands'>
export type Report = Tables<'reports'>
export type Vouch = Tables<'vouches'>

// Extended types with relations
export type UserWithRelations = User & {
  campus: Campus | null
  skills: string[]
  interests: string[]
  follower_count: number
  following_count: number
  project_count: number
  vouch_count: number
}

export type PostWithAuthor = Post & {
  author: Pick<User, 'id' | 'handle' | 'display_name' | 'avatar_url' | 'role'>
  project: Pick<Project, 'id' | 'name' | 'slug'> | null
  media: Tables<'post_media'>[]
  reaction_counts: Record<string, number>
  comment_count: number
  user_reactions: string[]
  is_saved: boolean
  is_reposted: boolean
}

export type ProjectWithRelations = Project & {
  campus: Campus | null
  members: (Tables<'project_members'> & {
    user: Pick<User, 'id' | 'handle' | 'display_name' | 'avatar_url'>
  })[]
  roles_needed: Tables<'project_roles_needed'>[]
  milestones: Tables<'project_milestones'>[]
  tags: string[]
}

export type ConversationWithDetails = Conversation & {
  participants: (Tables<'conversation_participants'> & {
    user: Pick<User, 'id' | 'handle' | 'display_name' | 'avatar_url'>
  })[]
  last_message: Message | null
  unread_count: number
}

export type EventWithDetails = Event & {
  organizer: Pick<User, 'id' | 'handle' | 'display_name' | 'avatar_url'>
  campus: Campus | null
  rsvp_count: number
  user_rsvp: string | null
}
