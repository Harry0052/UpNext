export const APP_NAME = 'UpNext'
export const APP_DESCRIPTION = 'The social network for college founders and builders'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const ROLES = [
  'founder',
  'engineer',
  'designer',
  'marketer',
  'researcher',
  'creator',
  'operator',
  'other',
] as const

export const ROLE_LABELS: Record<string, string> = {
  founder: 'Founder',
  engineer: 'Engineer',
  designer: 'Designer',
  marketer: 'Marketer',
  researcher: 'Researcher',
  creator: 'Creator',
  operator: 'Operator',
  other: 'Other',
}

export const PROJECT_STAGES = [
  'idea',
  'building',
  'launched',
  'growing',
  'funded',
] as const

export const PROJECT_STAGE_LABELS: Record<string, string> = {
  idea: 'Idea',
  building: 'Building',
  launched: 'Launched',
  growing: 'Growing',
  funded: 'Funded',
}

export const PROJECT_STAGE_COLORS: Record<string, string> = {
  idea: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  building: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  launched: 'bg-green-500/10 text-green-500 border-green-500/20',
  growing: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  funded: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
}

export const POST_TYPES = [
  'update',
  'launch',
  'ask',
  'win',
  'learn',
  'event',
] as const

export const POST_TYPE_LABELS: Record<string, string> = {
  update: 'Update',
  launch: 'Launch',
  ask: 'Ask',
  win: 'Win',
  learn: 'Learn',
  event: 'Event',
}

export const POST_TYPE_ICONS: Record<string, string> = {
  update: 'MessageSquare',
  launch: 'Rocket',
  ask: 'HelpCircle',
  win: 'Trophy',
  learn: 'Lightbulb',
  event: 'Calendar',
}

export const POST_TYPE_COLORS: Record<string, string> = {
  update: 'bg-muted text-muted-foreground',
  launch: 'bg-orange-500/10 text-orange-500',
  ask: 'bg-blue-500/10 text-blue-500',
  win: 'bg-yellow-500/10 text-yellow-500',
  learn: 'bg-green-500/10 text-green-500',
  event: 'bg-purple-500/10 text-purple-500',
}

export const REACTION_TYPES = [
  'fire',
  'rocket',
  'lightbulb',
  'clap',
  'heart',
] as const

export const REACTION_EMOJIS: Record<string, string> = {
  fire: '🔥',
  rocket: '🚀',
  lightbulb: '💡',
  clap: '👏',
  heart: '❤️',
}

export const EVENT_TYPES = [
  'hackathon',
  'demo_day',
  'workshop',
  'meetup',
  'speaker',
  'social',
] as const

export const EVENT_TYPE_LABELS: Record<string, string> = {
  hackathon: 'Hackathon',
  demo_day: 'Demo Day',
  workshop: 'Workshop',
  meetup: 'Meetup',
  speaker: 'Speaker Event',
  social: 'Social',
}

export const SKILLS = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Python', 'Swift',
  'Kotlin', 'Flutter', 'React Native', 'Node.js', 'Django', 'Rails',
  'Go', 'Rust', 'Java', 'C++', 'SQL', 'PostgreSQL', 'MongoDB',
  'AWS', 'GCP', 'Docker', 'Kubernetes', 'GraphQL', 'REST APIs',
  'Machine Learning', 'AI/ML', 'Data Science', 'Computer Vision',
  'NLP', 'Blockchain', 'Web3', 'Solidity',
  'UI Design', 'UX Design', 'Figma', 'Product Design', 'Brand Design',
  'Motion Design', 'Illustration', '3D Design',
  'Growth Marketing', 'Content Marketing', 'SEO', 'Social Media',
  'Copywriting', 'Video Production', 'Photography',
  'Sales', 'Business Development', 'Finance', 'Legal',
  'Product Management', 'Project Management', 'Operations',
  'Public Speaking', 'Fundraising', 'Community Building',
] as const

export const INTERESTS = [
  'AI/ML', 'Web3/Crypto', 'FinTech', 'EdTech', 'HealthTech',
  'CleanTech', 'SaaS', 'Consumer Apps', 'Developer Tools',
  'E-Commerce', 'Social Impact', 'Gaming', 'Media/Content',
  'Hardware', 'Robotics', 'Biotech', 'SpaceTech', 'FoodTech',
  'PropTech', 'LegalTech', 'InsurTech', 'AgriTech',
  'Open Source', 'Design', 'No-Code', 'Mobile Apps',
  'Enterprise', 'Marketplace', 'API/Infrastructure',
  'AR/VR', 'IoT', 'Cybersecurity', 'Data Analytics',
] as const

export const REPORT_REASONS = [
  'spam',
  'harassment',
  'inappropriate',
  'other',
] as const

export const MAX_BIO_LENGTH = 280
export const MAX_POST_LENGTH = 2000
export const MAX_COMMENT_LENGTH = 1000
export const MAX_TAGLINE_LENGTH = 120
export const MAX_IMAGES_PER_POST = 4
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm']
