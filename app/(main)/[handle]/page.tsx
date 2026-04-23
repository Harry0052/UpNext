import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getFeedPosts } from '@/lib/queries/posts'
import { UserAvatar } from '@/components/user-avatar'
import { RoleBadge } from '@/components/role-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FollowButton } from './follow-button'
import { ProfileTabs } from './profile-tabs'
import {
  Globe,
  Flame,
  MapPin,
  GraduationCap,
  Pencil,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import type { PostWithAuthor } from '@/types/database'

interface ProfilePageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { handle } = await params
  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('display_name, bio')
    .eq('handle', handle)
    .single()

  if (!user) return { title: 'User Not Found' }

  return {
    title: `${user.display_name} (@${handle})`,
    description: user.bio || `${user.display_name} on UpNext`,
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { handle } = await params
  const supabase = await createClient()

  // Get current auth user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  // Fetch profile user by handle
  const { data: profileUser } = await supabase
    .from('users')
    .select('*')
    .eq('handle', handle)
    .single()

  if (!profileUser) notFound()

  // Fetch related data in parallel
  const [
    { data: skills },
    { data: interests },
    { data: campus },
    { count: followerCount },
    { count: followingCount },
    { count: vouchCount },
    { count: projectCount },
    { data: isFollowingData },
    { data: vouchesRaw },
    { data: projectMemberships },
  ] = await Promise.all([
    supabase
      .from('user_skills')
      .select('skill')
      .eq('user_id', profileUser.id),
    supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', profileUser.id),
    profileUser.campus_id
      ? supabase
          .from('campuses')
          .select('*')
          .eq('id', profileUser.campus_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', profileUser.id),
    supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', profileUser.id),
    supabase
      .from('vouches')
      .select('*', { count: 'exact', head: true })
      .eq('vouchee_id', profileUser.id),
    supabase
      .from('project_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profileUser.id),
    authUser
      ? supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', authUser.id)
          .eq('following_id', profileUser.id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from('vouches')
      .select(`
        id, skill, message, created_at,
        voucher:users!vouches_voucher_id_fkey(id, handle, display_name, avatar_url)
      `)
      .eq('vouchee_id', profileUser.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('project_members')
      .select(`
        project:projects(id, name, slug, tagline, stage)
      `)
      .eq('user_id', profileUser.id),
  ])

  const isOwnProfile = authUser?.id === profileUser.id
  const isFollowing = !!isFollowingData

  // Fetch posts for this user
  const posts: PostWithAuthor[] = authUser
    ? await getFeedPosts({
        userId: authUser.id,
        filter: 'all',
        limit: 50,
      }).then((allPosts) => allPosts.filter((p) => p.author_id === profileUser.id))
    : []

  // Build projects list with member counts
  const projectIds = (projectMemberships ?? [])
    .map((pm: any) => pm.project)
    .filter(Boolean)
    .map((p: any) => p.id as string)

  const projectsWithCounts = await Promise.all(
    (projectMemberships ?? [])
      .map((pm) => pm.project)
      .filter(Boolean)
      .map(async (project: any) => {
        const p = project as any
        const { count } = await supabase
          .from('project_members')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', p.id)
        return {
          ...p,
          member_count: count ?? 0,
        }
      })
  )

  // Build vouches list
  const vouches = (vouchesRaw ?? []).map((v: any) => ({
    id: v.id,
    skill: v.skill,
    message: v.message,
    created_at: v.created_at,
    voucher: v.voucher,
  }))

  const userSkills = skills?.map((s) => s.skill) ?? []
  const userInterests = interests?.map((i) => i.interest) ?? []

  return (
    <div>
      {/* Profile header */}
      <div className="px-4 pb-4 pt-2">
        <div className="flex items-start justify-between gap-4">
          <UserAvatar
            src={profileUser.avatar_url}
            name={profileUser.display_name}
            size="xl"
          />

          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/settings">
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit Profile
                </Link>
              </Button>
            ) : authUser ? (
              <>
                <FollowButton
                  targetUserId={profileUser.id}
                  isFollowing={isFollowing}
                />
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${handle}?vouch=true`}>Vouch</Link>
                </Button>
              </>
            ) : null}
          </div>
        </div>

        {/* Name, handle, role */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{profileUser.display_name}</h1>
            {profileUser.is_verified && (
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-muted-foreground">@{profileUser.handle}</span>
            <RoleBadge role={profileUser.role} />
          </div>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <p className="mt-3 text-sm leading-relaxed">{profileUser.bio}</p>
        )}

        {/* Building description */}
        {profileUser.building_description && (
          <p className="mt-2 text-sm text-muted-foreground">
            Building: {profileUser.building_description}
          </p>
        )}

        {/* School, major, grad year */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {campus && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {campus.name}
            </span>
          )}
          {profileUser.major && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              {profileUser.major}
              {profileUser.graduation_year && ` '${String(profileUser.graduation_year).slice(2)}`}
            </span>
          )}
          {profileUser.shipped_streak > 0 && (
            <span className="flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {profileUser.shipped_streak} week streak
            </span>
          )}
        </div>

        {/* Social links */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {profileUser.website_url && (
            <a
              href={profileUser.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="underline-offset-2 hover:underline">Website</span>
            </a>
          )}
          {profileUser.twitter_handle && (
            <a
              href={`https://twitter.com/${profileUser.twitter_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="underline-offset-2 hover:underline">@{profileUser.twitter_handle}</span>
            </a>
          )}
          {profileUser.github_handle && (
            <a
              href={`https://github.com/${profileUser.github_handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="underline-offset-2 hover:underline">{profileUser.github_handle}</span>
            </a>
          )}
          {profileUser.linkedin_url && (
            <a
              href={profileUser.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="underline-offset-2 hover:underline">LinkedIn</span>
            </a>
          )}
        </div>

        {/* Stats row */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span>
            <span className="font-semibold">{followerCount ?? 0}</span>{' '}
            <span className="text-muted-foreground">followers</span>
          </span>
          <span>
            <span className="font-semibold">{followingCount ?? 0}</span>{' '}
            <span className="text-muted-foreground">following</span>
          </span>
          <span>
            <span className="font-semibold">{vouchCount ?? 0}</span>{' '}
            <span className="text-muted-foreground">vouches</span>
          </span>
          <span>
            <span className="font-semibold">{projectCount ?? 0}</span>{' '}
            <span className="text-muted-foreground">projects</span>
          </span>
        </div>

        {/* Skills */}
        {userSkills.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {userSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {userInterests.length > 0 && (
          <div className="mt-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Interests
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {userInterests.map((interest) => (
                <Badge key={interest} variant="outline">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Tabs */}
      <ProfileTabs
        posts={posts}
        projects={projectsWithCounts}
        vouches={vouches}
        currentUserId={authUser?.id ?? ''}
      />
    </div>
  )
}
