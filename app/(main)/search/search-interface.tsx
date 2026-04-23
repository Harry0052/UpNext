'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAvatar } from '@/components/user-avatar'
import { RoleBadge } from '@/components/role-badge'
import { StageBadge } from '@/components/stage-badge'
import { PostTypeBadge } from '@/components/post-type-badge'
import { Search, Users, FolderKanban, FileText, CalendarDays } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

interface SearchInterfaceProps {
  initialQuery: string
  currentTab: string
  results: {
    people: any[]
    projects: any[]
    posts: any[]
    events: any[]
  }
  currentUserId: string
}

export function SearchInterface({
  initialQuery,
  currentTab,
  results,
  currentUserId,
}: SearchInterfaceProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&tab=${currentTab}`)
    }
  }

  function handleTabChange(tab: string) {
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${tab}`)
  }

  const totalResults =
    results.people.length +
    results.projects.length +
    results.posts.length +
    results.events.length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, projects, posts, events..."
              className="pl-10 h-12 text-base"
              autoFocus
            />
          </div>
        </form>
      </div>

      {initialQuery && (
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="people" className="gap-1.5">
              <Users className="h-4 w-4" />
              People {results.people.length > 0 && `(${results.people.length})`}
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5">
              <FolderKanban className="h-4 w-4" />
              Projects {results.projects.length > 0 && `(${results.projects.length})`}
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Posts {results.posts.length > 0 && `(${results.posts.length})`}
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5">
              <CalendarDays className="h-4 w-4" />
              Events {results.events.length > 0 && `(${results.events.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {totalResults === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                No results found for &quot;{initialQuery}&quot;
              </p>
            ) : (
              <>
                {results.people.length > 0 && (
                  <Section title="People" href={`/search?q=${encodeURIComponent(initialQuery)}&tab=people`}>
                    {results.people.map((person) => (
                      <PersonResult key={person.id} person={person} />
                    ))}
                  </Section>
                )}
                {results.projects.length > 0 && (
                  <Section title="Projects" href={`/search?q=${encodeURIComponent(initialQuery)}&tab=projects`}>
                    {results.projects.map((project) => (
                      <ProjectResult key={project.id} project={project} />
                    ))}
                  </Section>
                )}
                {results.posts.length > 0 && (
                  <Section title="Posts" href={`/search?q=${encodeURIComponent(initialQuery)}&tab=posts`}>
                    {results.posts.map((post) => (
                      <PostResult key={post.id} post={post} />
                    ))}
                  </Section>
                )}
                {results.events.length > 0 && (
                  <Section title="Events" href={`/search?q=${encodeURIComponent(initialQuery)}&tab=events`}>
                    {results.events.map((event) => (
                      <EventResult key={event.id} event={event} />
                    ))}
                  </Section>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="people" className="mt-6 space-y-2">
            {results.people.map((person) => (
              <PersonResult key={person.id} person={person} />
            ))}
            {results.people.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No people found</p>
            )}
          </TabsContent>

          <TabsContent value="projects" className="mt-6 space-y-2">
            {results.projects.map((project) => (
              <ProjectResult key={project.id} project={project} />
            ))}
            {results.projects.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No projects found</p>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6 space-y-2">
            {results.posts.map((post) => (
              <PostResult key={post.id} post={post} />
            ))}
            {results.posts.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No posts found</p>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6 space-y-2">
            {results.events.map((event) => (
              <EventResult key={event.id} event={event} />
            ))}
            {results.events.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No events found</p>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!initialQuery && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium">Search UpNext</p>
          <p className="text-muted-foreground mt-1">
            Find people, projects, posts, and events
          </p>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  href,
  children,
}: {
  title: string
  href: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">{title}</h3>
        <Link href={href} className="text-sm text-primary hover:underline">
          See all
        </Link>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function PersonResult({ person }: { person: any }) {
  return (
    <Link
      href={`/${person.handle}`}
      className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
    >
      <UserAvatar src={person.avatar_url} name={person.display_name} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{person.display_name}</span>
          <RoleBadge role={person.role} />
        </div>
        <p className="text-sm text-muted-foreground truncate">
          @{person.handle} {person.campus?.name && `· ${person.campus.name}`}
        </p>
      </div>
    </Link>
  )
}

function ProjectResult({ project }: { project: any }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-lg font-bold">
        {project.name[0]}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{project.name}</span>
          <StageBadge stage={project.stage} />
        </div>
        <p className="text-sm text-muted-foreground truncate">{project.tagline}</p>
      </div>
    </Link>
  )
}

function PostResult({ post }: { post: any }) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
    >
      <UserAvatar
        src={post.author?.avatar_url}
        name={post.author?.display_name ?? 'User'}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{post.author?.display_name}</span>
          <PostTypeBadge type={post.type} showIcon={false} />
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{post.content}</p>
      </div>
    </Link>
  )
}

function EventResult({ event }: { event: any }) {
  return (
    <Link
      href={`/events/${event.slug}`}
      className="flex items-center gap-3 rounded-lg p-3 hover:bg-muted transition-colors"
    >
      <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
        <span className="text-xs font-bold leading-none">
          {format(new Date(event.start_time), 'MMM')}
        </span>
        <span className="text-lg font-bold leading-none">
          {format(new Date(event.start_time), 'd')}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-medium truncate block">{event.title}</span>
        <p className="text-sm text-muted-foreground truncate">
          {event.is_virtual ? 'Virtual' : event.location}
        </p>
      </div>
    </Link>
  )
}
