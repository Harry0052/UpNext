import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getFeedPosts } from '@/lib/queries/posts'
import { PostCard } from '@/components/posts/post-card'
import { UserAvatar } from '@/components/user-avatar'
import { RoleBadge } from '@/components/role-badge'
import { StageBadge } from '@/components/stage-badge'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MapPin, Users, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import type { PostWithAuthor, User, Project, Event, Campus } from '@/types/database'

export const metadata: Metadata = {
  title: 'Explore',
}

interface ExplorePageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { tab } = await searchParams
  const activeTab = tab || 'trending'
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  // Fetch data for all tabs in parallel
  const [
    trendingPosts,
    { data: featuredProjects },
    { data: people },
    { data: allProjects },
    { data: events },
    { data: campuses },
  ] = await Promise.all([
    getFeedPosts({
      userId: authUser.id,
      filter: 'all',
      limit: 10,
    }),
    supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('users')
      .select('id, handle, display_name, avatar_url, bio, role, campus_id')
      .eq('onboarding_completed', true)
      .neq('id', authUser.id)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('events')
      .select(`
        *,
        organizer:users!events_organizer_id_fkey(id, handle, display_name, avatar_url),
        campus:campuses(id, name)
      `)
      .gte('end_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(20),
    supabase
      .from('campuses')
      .select('*')
      .order('name', { ascending: true }),
  ])

  // Get follow status for listed people
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', authUser.id)

  const followingIds = new Set(followingData?.map((f) => f.following_id) ?? [])

  // Get member counts for projects
  const projectIds = (allProjects ?? []).map((p) => p.id)
  const { data: memberCounts } = projectIds.length > 0
    ? await supabase
        .from('project_members')
        .select('project_id')
        .in('project_id', projectIds)
    : { data: [] }

  const projectMemberCountMap: Record<string, number> = {}
  memberCounts?.forEach((m) => {
    projectMemberCountMap[m.project_id] = (projectMemberCountMap[m.project_id] || 0) + 1
  })

  // Get member counts for campuses
  const campusIds = (campuses ?? []).map((c) => c.id)
  const { data: campusMembers } = campusIds.length > 0
    ? await supabase
        .from('users')
        .select('campus_id')
        .in('campus_id', campusIds)
        .eq('onboarding_completed', true)
    : { data: [] }

  const campusMemberCountMap: Record<string, number> = {}
  campusMembers?.forEach((u) => {
    if (u.campus_id) {
      campusMemberCountMap[u.campus_id] = (campusMemberCountMap[u.campus_id] || 0) + 1
    }
  })

  // Get RSVP counts for events
  const eventIds = (events ?? []).map((e) => e.id)
  const { data: rsvpCounts } = eventIds.length > 0
    ? await supabase
        .from('event_rsvps')
        .select('event_id')
        .in('event_id', eventIds)
        .eq('status', 'going')
    : { data: [] }

  const eventRsvpCountMap: Record<string, number> = {}
  rsvpCounts?.forEach((r) => {
    eventRsvpCountMap[r.event_id] = (eventRsvpCountMap[r.event_id] || 0) + 1
  })

  return (
    <div>
      <h1 className="text-2xl font-bold px-4 py-4">Explore</h1>

      <Tabs defaultValue={activeTab}>
        <TabsList variant="line" className="w-full border-b border-border px-4 overflow-x-auto">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="campuses">Campuses</TabsTrigger>
        </TabsList>

        {/* Trending Tab */}
        <TabsContent value="trending">
          {/* Featured Projects */}
          {(featuredProjects ?? []).filter((p) => p.is_featured).length > 0 && (
            <div className="p-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Featured Projects
              </h2>
              <div className="grid gap-3">
                {(featuredProjects ?? [])
                  .filter((p) => p.is_featured)
                  .slice(0, 3)
                  .map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {project.tagline}
                          </p>
                        </div>
                        <StageBadge stage={project.stage} />
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Trending Posts */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-4 mb-2 mt-4">
              Recent Posts
            </h2>
            <div className="divide-y divide-border">
              {trendingPosts.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <p className="text-muted-foreground">No posts to show</p>
                </div>
              ) : (
                trendingPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={authUser.id}
                  />
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people">
          <div className="divide-y divide-border">
            {(people ?? []).length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              (people ?? []).map((person) => (
                <div key={person.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/${person.handle}`} className="shrink-0">
                    <UserAvatar
                      src={person.avatar_url}
                      name={person.display_name}
                      size="md"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/${person.handle}`}
                        className="font-semibold text-sm hover:underline truncate"
                      >
                        {person.display_name}
                      </Link>
                      <RoleBadge role={person.role} />
                    </div>
                    <p className="text-xs text-muted-foreground">@{person.handle}</p>
                    {person.bio && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {person.bio}
                      </p>
                    )}
                  </div>
                  {!followingIds.has(person.id) && (
                    <Link href={`/${person.handle}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                        View
                      </Badge>
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <div className="grid gap-4 p-4">
            {(allProjects ?? []).length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No projects found</p>
              </div>
            ) : (
              (allProjects ?? []).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {project.tagline}
                      </p>
                    </div>
                    <StageBadge stage={project.stage} />
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {projectMemberCountMap[project.id] || 0} members
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <div className="divide-y divide-border">
            {(events ?? []).length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              (events ?? []).map((event) => {
                const organizer = (event as any).organizer
                const eventCampus = (event as any).campus

                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="block px-4 py-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-center min-w-[50px]">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {format(new Date(event.start_time), 'MMM')}
                        </span>
                        <span className="text-lg font-bold leading-tight">
                          {format(new Date(event.start_time), 'd')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.start_time), 'h:mm a')}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          {eventCampus && (
                            <span>{eventCampus.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <span>by {organizer.display_name}</span>
                          <span>
                            {eventRsvpCountMap[event.id] || 0} attending
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </TabsContent>

        {/* Campuses Tab */}
        <TabsContent value="campuses">
          <div className="grid gap-3 p-4">
            {(campuses ?? []).length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No campuses found</p>
              </div>
            ) : (
              (campuses ?? []).map((campus) => (
                <div
                  key={campus.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{campus.name}</h3>
                    {campus.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {campus.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {campusMemberCountMap[campus.id] || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">members</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
