'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PostCard } from '@/components/posts/post-card'
import { UserAvatar } from '@/components/user-avatar'
import { StageBadge } from '@/components/stage-badge'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { PostWithAuthor } from '@/types/database'

interface VouchDisplay {
  id: string
  skill: string
  message: string | null
  created_at: string
  voucher: {
    id: string
    handle: string
    display_name: string
    avatar_url: string | null
  }
}

interface ProjectDisplay {
  id: string
  name: string
  slug: string
  tagline: string
  stage: string
  member_count: number
}

interface ProfileTabsProps {
  posts: PostWithAuthor[]
  projects: ProjectDisplay[]
  vouches: VouchDisplay[]
  currentUserId: string
}

export function ProfileTabs({ posts, projects, vouches, currentUserId }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts">
      <TabsList variant="line" className="w-full border-b border-border">
        <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
        <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
        <TabsTrigger value="vouches">Vouches ({vouches.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        {posts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-muted-foreground">No posts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} currentUserId={currentUserId} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="projects">
        {projects.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-muted-foreground">No projects yet</p>
          </div>
        ) : (
          <div className="grid gap-4 p-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{project.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.tagline}
                    </p>
                  </div>
                  <StageBadge stage={project.stage} />
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {project.member_count} {project.member_count === 1 ? 'member' : 'members'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="vouches">
        {vouches.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-muted-foreground">No vouches yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {vouches.map((vouch) => (
              <div key={vouch.id} className="px-4 py-4">
                <div className="flex items-start gap-3">
                  <Link href={`/${vouch.voucher.handle}`} className="shrink-0">
                    <UserAvatar
                      src={vouch.voucher.avatar_url}
                      name={vouch.voucher.display_name}
                      size="sm"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/${vouch.voucher.handle}`}
                        className="font-medium text-sm hover:underline"
                      >
                        {vouch.voucher.display_name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        vouched for
                      </span>
                      <Badge variant="secondary">{vouch.skill}</Badge>
                    </div>
                    {vouch.message && (
                      <p className="text-sm text-muted-foreground mt-1">
                        &quot;{vouch.message}&quot;
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(vouch.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
