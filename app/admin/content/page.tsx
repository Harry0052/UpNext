import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

export const metadata: Metadata = {
  title: 'Content — Admin',
}

export default async function AdminContentPage() {
  const supabase = await createClient()

  // Recent posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select(`
      id, content, type, is_removed, is_pinned, created_at,
      author:users!posts_author_id_fkey(display_name, handle)
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  // Featured projects
  const { data: featuredProjects } = await supabase
    .from('projects')
    .select('id, name, slug, is_featured, stage')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Content Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPosts?.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">
                      {(post.author as any)?.display_name}
                    </span>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {post.type}
                    </Badge>
                    {post.is_pinned && (
                      <Badge variant="outline" className="text-xs">Pinned</Badge>
                    )}
                    {post.is_removed && (
                      <Badge variant="destructive" className="text-xs">Removed</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {post.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {featuredProjects?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No featured projects</p>
          ) : (
            <div className="space-y-2">
              {featuredProjects?.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-medium text-sm hover:underline"
                  >
                    {project.name}
                  </Link>
                  <Badge variant="outline" className="capitalize">{project.stage}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
