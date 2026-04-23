import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StageBadge } from '@/components/stage-badge'
import { UserAvatar } from '@/components/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PROJECT_STAGES, PROJECT_STAGE_LABELS } from '@/lib/constants'
import { Plus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Projects',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string; campus?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  // Fetch campuses for filter
  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name, slug')
    .order('name')

  // Build projects query
  let query = supabase
    .from('projects')
    .select(`
      id, name, slug, tagline, stage, logo_url, created_at,
      campus:campuses(id, name),
      members:project_members(
        user:users(id, display_name, avatar_url)
      ),
      tags:project_tags(tag)
    `)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (params.stage) {
    query = query.eq('stage', params.stage)
  }

  if (params.campus) {
    query = query.eq('campus_id', params.campus)
  }

  const { data: projects } = await query

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button asChild size="sm">
          <Link href="/projects/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="border-b border-border px-4 py-3 space-y-2">
        {/* Stage filter */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          <Link
            href="/projects"
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              !params.stage
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All Stages
          </Link>
          {PROJECT_STAGES.map((stage) => (
            <Link
              key={stage}
              href={`/projects?stage=${stage}${params.campus ? `&campus=${params.campus}` : ''}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                params.stage === stage
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {PROJECT_STAGE_LABELS[stage]}
            </Link>
          ))}
        </div>

        {/* Campus filter */}
        {campuses && campuses.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            <Link
              href={`/projects${params.stage ? `?stage=${params.stage}` : ''}`}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                !params.campus
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              All Campuses
            </Link>
            {campuses.map((campus) => (
              <Link
                key={campus.id}
                href={`/projects?campus=${campus.id}${params.stage ? `&stage=${params.stage}` : ''}`}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  params.campus === campus.id
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {campus.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Project cards */}
      <div className="divide-y divide-border">
        {!projects || projects.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-medium">No projects yet</p>
            <p className="text-muted-foreground mt-1">
              Be the first to create a project!
            </p>
          </div>
        ) : (
          projects.map((project) => {
            const tags = project.tags?.map((t: { tag: string }) => t.tag) ?? []
            const members = project.members ?? []
            return (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block px-4 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Logo placeholder */}
                  {project.logo_url ? (
                    <img
                      src={project.logo_url}
                      alt={project.name}
                      className="h-12 w-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {project.name[0]}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      <StageBadge stage={project.stage} />
                    </div>

                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {project.tagline}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      {/* Team avatars */}
                      {members.length > 0 && (
                        <div className="flex -space-x-1.5">
                          {members.slice(0, 4).map((m: any) => {
                            const u = Array.isArray(m.user) ? m.user[0] : m.user
                            if (!u) return null
                            return (
                            <UserAvatar
                              key={u.id}
                              src={u.avatar_url}
                              name={u.display_name}
                              size="sm"
                            />
                            )
                          })}
                          {members.length > 4 && (
                            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground ring-2 ring-background">
                              +{members.length - 4}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex gap-1 overflow-hidden">
                          {tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Campus */}
                      {project.campus && (
                        <span className="text-xs text-muted-foreground truncate">
                          {(project as any).campus?.name ?? (Array.isArray((project as any).campus) ? (project as any).campus[0]?.name : '')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
