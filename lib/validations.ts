import { z } from 'zod'
import {
  ROLES,
  PROJECT_STAGES,
  POST_TYPES,
  REACTION_TYPES,
  EVENT_TYPES,
  REPORT_REASONS,
  MAX_BIO_LENGTH,
  MAX_POST_LENGTH,
  MAX_COMMENT_LENGTH,
  MAX_TAGLINE_LENGTH,
} from './constants'

// Auth
export const signUpSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email')
    .refine((email) => email.endsWith('.edu'), {
      message: 'Please use a .edu email address',
    }),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

// Onboarding
export const onboardingSchema = z.object({
  handle: z
    .string()
    .min(3, 'Handle must be at least 3 characters')
    .max(30, 'Handle must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers, and underscores'),
  display_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  role: z.enum(ROLES),
  campus_id: z.string().uuid('Please select your school'),
  graduation_year: z
    .number()
    .int()
    .min(2020)
    .max(2035),
  major: z.string().max(100).optional(),
  bio: z.string().max(MAX_BIO_LENGTH).optional(),
  building_description: z
    .string()
    .min(10, 'Tell us a bit more about what you\'re building')
    .max(500),
  skills: z.array(z.string()).min(1, 'Select at least one skill').max(10),
  interests: z.array(z.string()).min(1, 'Select at least one interest').max(10),
})

// Profile
export const profileUpdateSchema = z.object({
  display_name: z.string().min(2).max(50).optional(),
  handle: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(MAX_BIO_LENGTH).optional(),
  role: z.enum(ROLES).optional(),
  major: z.string().max(100).optional(),
  graduation_year: z.number().int().min(2020).max(2035).optional(),
  building_description: z.string().max(500).optional(),
  website_url: z.string().url().or(z.literal('')).optional(),
  twitter_handle: z.string().max(30).optional(),
  github_handle: z.string().max(50).optional(),
  linkedin_url: z.string().url().or(z.literal('')).optional(),
})

// Posts
export const createPostSchema = z.object({
  type: z.enum(POST_TYPES),
  content: z
    .string()
    .min(1, 'Post content is required')
    .max(MAX_POST_LENGTH, `Post must be under ${MAX_POST_LENGTH} characters`),
  project_id: z.string().uuid().optional().nullable(),
})

// Comments
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment is required')
    .max(MAX_COMMENT_LENGTH),
  parent_id: z.string().uuid().optional().nullable(),
})

// Reactions
export const reactionSchema = z.object({
  type: z.enum(REACTION_TYPES),
})

// Projects
export const createProjectSchema = z.object({
  name: z.string().min(2, 'Project name is required').max(100),
  tagline: z
    .string()
    .min(10, 'Tagline must be at least 10 characters')
    .max(MAX_TAGLINE_LENGTH),
  description: z.string().max(5000).optional(),
  stage: z.enum(PROJECT_STAGES),
  website_url: z.string().url().or(z.literal('')).optional(),
  tags: z.array(z.string()).max(10).optional(),
})

export const updateProjectSchema = createProjectSchema.partial()

// Project Roles
export const createRoleSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
})

// Project Milestones
export const createMilestoneSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  target_date: z.string().optional(),
})

// Raise Hand
export const raiseHandSchema = z.object({
  message: z.string().max(500).optional(),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
})

// Messages
export const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'image']).default('text'),
})

// Events
export const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(EVENT_TYPES),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string().max(200).optional(),
  is_virtual: z.boolean().default(false),
  virtual_url: z.string().url().or(z.literal('')).optional(),
  max_attendees: z.number().int().positive().optional().nullable(),
})

// Reports
export const createReportSchema = z.object({
  resource_type: z.enum(['post', 'comment', 'user', 'project', 'message']),
  resource_id: z.string().uuid(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(1000).optional(),
})

// Search
export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  type: z.enum(['all', 'people', 'projects', 'posts', 'events']).default('all'),
  campus_id: z.string().uuid().optional(),
})

// Settings
export const notificationPreferencesSchema = z.object({
  email_notifications: z.boolean(),
  email_digest: z.enum(['daily', 'weekly', 'never']),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type OnboardingInput = z.infer<typeof onboardingSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type CreateReportInput = z.infer<typeof createReportSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type RaiseHandInput = z.infer<typeof raiseHandSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
