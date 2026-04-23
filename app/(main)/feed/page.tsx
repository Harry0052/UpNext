import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getFeedPosts } from '@/lib/queries/posts'
import { PostComposer } from '@/components/posts/post-composer'
import { PostCard } from '@/components/posts/post-card'
import { FeedFilters } from './feed-filters'

export const metadata: Metadata = {
  title: 'Feed',
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; type?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: user } = await supabase
    .from('users')
    .select('id, display_name, avatar_url, campus_id')
    .eq('id', authUser.id)
    .single()

  if (!user) return null

  // Get user's projects for the composer
  const { data: projectMembers } = await supabase
    .from('project_members')
    .select('project:projects(id, name, slug)')
    .eq('user_id', authUser.id)

  const projects = (projectMembers ?? [])
    .map((pm: any) => pm.project)
    .filter(Boolean) as any[]

  const posts = await getFeedPosts({
    userId: authUser.id,
    filter: (params.filter as 'following' | 'campus' | 'trending' | 'all') || 'all',
    postType: params.type,
    campusId: user.campus_id ?? undefined,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold px-4 py-4">Feed</h1>

      <PostComposer user={user} projects={projects} />

      <FeedFilters
        currentFilter={params.filter || 'all'}
        currentType={params.type || 'all'}
      />

      <div className="divide-y divide-border">
        {posts.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-muted-foreground mt-1">
              Be the first to share an update!
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={authUser.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
