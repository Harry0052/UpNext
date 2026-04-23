import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StageBadge } from '@/components/stage-badge'
import { UserAvatar } from '@/components/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PostCard } from '@/components/posts/post-card'
import { ProjectActions } from './project-actions'
import {
  ExternalLink,
  Check,
  Circle,
  Calendar,
  Pencil,
  Users,
} from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('name, tagline')
    .eq('slug', slug)
    .single()

  if (!project) return { title: 'Project Not Found' }

  return {
    title: project.name,
    description: project.tagline,
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  // Fetch project with relations
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      campus:campuses(id, name),
      members:project_members(
        role, joined_at,
        user:users(id, handle, display_name, avatar_url)
      ),
      roles_needed:project_roles_needed(id, title, description, is_filled),
      milestones:project_milestones(id, title, description, completed_at, target_date, sort_order),
      tags:project_tags(tag)
    `)
    .eq('slug', slug)
    .single()

  if (!project) notFound()

  const tags = project.tags?.map((t: { tag: string }) => t.tag) ?? []
  const members = project.members ?? []
  const rolesNeeded = project.roles_needed ?? []
  const milestones = (project.milestones ?? []).sort(
    (a: { sort_order: number }, b: { sort_order: number }) =>
      a.sort_order - b.sort_order
  )

  const isMember = members.some(
    (m: { user: { id: string } }) => m.user.id === authUser.id
  )

  // Fetch project posts
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, handle, display_name, avatar_url, role),
      project:projects!posts_project_id_fkey(id, name, slug),
      media:post_media(id, url, type, alt_text, sort_order)
    `)
    .eq('project_id', project.id)
    .eq('is_removed', false)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch reaction counts and user reactions for posts
  const postsWithMeta = await Promise.all(
    (posts ?? []).map(async (post) => {
      const { data: reactions } = await supabase
        .from('post_reactions')
        .select('type')
        .eq('post_id', post.id)

      const { data: userReactions } = await supabase
        .from('post_reactions')
        .select('type')
        .eq('post_id', post.id)
        .eq('user_id', authUser.id)

      const { count: commentCount } = await supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id)
        .eq('is_removed', false)

      const reactionCounts: Record<string, number> = {}
      for (const r of reactions ?? []) {
        reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
      }

      return {
        ...post,
        reaction_counts: reactionCounts,
        comment_count: commentCount ?? 0,
        user_reactions: userReactions?.map((r) => r.type) ?? [],
        is_saved: false,
        is_reposted: false,
      }
    })
  )

  const openRoles = rolesNeeded.filter(
    (r: { is_filled: boolean }) => !r.is_filled
  )

  return (
    <div>
      {/* Cover image */}
      {project.cover_url && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={project.cover_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-4">
          {project.logo_url ? (
            <img
              src={project.logo_url}
              alt={project.name}
              className="h-16 w-16 rounded-xl object-cover border border-border"
            />
          ) : (
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {project.name[0]}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold truncate">{project.name}</h1>
              <StageBadge stage={project.stage} />
            </div>
            <p className="text-muted-foreground mt-1">{project.tagline}</p>

            {project.campus && (
              <p className="text-sm text-muted-foreground mt-1">
                {(project.campus as { name: string }).name}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {project.website_url && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={project.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Website
                </a>
              </Button>
            )}
            {isMember && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${slug}/edit`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      {project.description && (
        <div className="px-4 py-4">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {project.description}
          </p>
        </div>
      )}

      <Separator />

      {/* Team */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team ({members.length})
          </h2>
        </div>
        <div className="space-y-3">
          {members.map(
            (m: {
              role: string
              user: {
                id: string
                handle: string
                display_name: string
                avatar_url: string | null
              }
            }) => (
              <Link
                key={m.user.id}
                href={`/@${m.user.handle}`}
                className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors"
              >
                <UserAvatar
                  src={m.user.avatar_url}
                  name={m.user.display_name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-sm">{m.user.display_name}</p>
                  <p className="text-xs text-muted-foreground">{m.role}</p>
                </div>
              </Link>
            )
          )}
        </div>
      </div>

      <Separator />

      {/* Open Roles / Raise Hand */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Roles Needed</h2>
          {isMember && (
            <ProjectActions
              projectId={project.id}
              isMember={isMember}
              variant="add-role"
            />
          )}
        </div>
        {openRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open roles right now.
          </p>
        ) : (
          <div className="space-y-2">
            {openRoles.map(
              (role: { id: string; title: string; description: string | null }) => (
                <div
                  key={role.id}
                  className="rounded-lg border border-border p-3"
                >
                  <p className="font-medium text-sm">{role.title}</p>
                  {role.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {!isMember && (
          <div className="mt-4">
            <ProjectActions
              projectId={project.id}
              isMember={isMember}
              variant="raise-hand"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Milestones */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Milestones</h2>
          {isMember && (
            <ProjectActions
              projectId={project.id}
              isMember={isMember}
              variant="add-milestone"
            />
          )}
        </div>
        {milestones.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No milestones yet.
          </p>
        ) : (
          <div className="space-y-3">
            {milestones.map(
              (ms: {
                id: string
                title: string
                description: string | null
                completed_at: string | null
                target_date: string | null
              }) => (
                <div key={ms.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {ms.completed_at ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        ms.completed_at
                          ? 'line-through text-muted-foreground'
                          : ''
                      }`}
                    >
                      {ms.title}
                    </p>
                    {ms.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ms.description}
                      </p>
                    )}
                    {ms.target_date && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ms.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Project Updates / Posts */}
      <div className="px-4 py-4">
        <h2 className="font-semibold mb-3">Updates</h2>
      </div>
      <div className="divide-y divide-border">
        {postsWithMeta.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No updates posted yet.
            </p>
          </div>
        ) : (
          postsWithMeta.map((post) => (
            <PostCard
              key={post.id}
              post={post as any}
              currentUserId={authUser.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
