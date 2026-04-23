import { createClient } from '@/lib/supabase/server'
import type { PostWithAuthor } from '@/types/database'

export async function getFeedPosts(options: {
  userId: string
  filter?: 'following' | 'campus' | 'trending' | 'all'
  postType?: string
  campusId?: string
  limit?: number
  offset?: number
}): Promise<PostWithAuthor[]> {
  const supabase = await createClient()
  const { userId, filter = 'all', postType, limit = 20, offset = 0 } = options

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, handle, display_name, avatar_url, role),
      project:projects!posts_project_id_fkey(id, name, slug),
      media:post_media(id, url, type, alt_text, sort_order)
    `)
    .eq('is_removed', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (postType && postType !== 'all') {
    query = query.eq('type', postType)
  }

  if (filter === 'following') {
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    const followingIds = following?.map((f) => f.following_id) ?? []
    followingIds.push(userId) // Include own posts
    query = query.in('author_id', followingIds)
  }

  if (filter === 'campus' && options.campusId) {
    query = query.eq('author:users.campus_id', options.campusId)
  }

  const { data: posts, error } = await query

  if (error || !posts) return []

  // Get reaction counts, comment counts, and user interactions for each post
  const postIds = posts.map((p) => p.id)

  const [
    { data: reactions },
    { data: comments },
    { data: userReactions },
    { data: userSaves },
    { data: userReposts },
  ] = await Promise.all([
    supabase
      .from('post_reactions')
      .select('post_id, type')
      .in('post_id', postIds),
    supabase
      .from('comments')
      .select('post_id')
      .in('post_id', postIds)
      .eq('is_removed', false),
    supabase
      .from('post_reactions')
      .select('post_id, type')
      .in('post_id', postIds)
      .eq('user_id', userId),
    supabase
      .from('saved_posts')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', userId),
    supabase
      .from('reposts')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', userId),
  ])

  return posts.map((post) => {
    const postReactions = reactions?.filter((r) => r.post_id === post.id) ?? []
    const reactionCounts: Record<string, number> = {}
    postReactions.forEach((r) => {
      reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
    })

    return {
      ...post,
      author: post.author as PostWithAuthor['author'],
      project: post.project as PostWithAuthor['project'],
      media: post.media ?? [],
      reaction_counts: reactionCounts,
      comment_count: comments?.filter((c) => c.post_id === post.id).length ?? 0,
      user_reactions: userReactions
        ?.filter((r) => r.post_id === post.id)
        .map((r) => r.type) ?? [],
      is_saved: userSaves?.some((s) => s.post_id === post.id) ?? false,
      is_reposted: userReposts?.some((r) => r.post_id === post.id) ?? false,
    }
  })
}

export async function getPostById(postId: string, userId: string): Promise<PostWithAuthor | null> {
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:users!posts_author_id_fkey(id, handle, display_name, avatar_url, role),
      project:projects!posts_project_id_fkey(id, name, slug),
      media:post_media(id, url, type, alt_text, sort_order)
    `)
    .eq('id', postId)
    .eq('is_removed', false)
    .single()

  if (!post) return null

  const [
    { data: reactions },
    { data: comments },
    { data: userReactions },
    { data: userSaves },
    { data: userReposts },
  ] = await Promise.all([
    supabase.from('post_reactions').select('type').eq('post_id', postId),
    supabase.from('comments').select('id').eq('post_id', postId).eq('is_removed', false),
    supabase.from('post_reactions').select('type').eq('post_id', postId).eq('user_id', userId),
    supabase.from('saved_posts').select('post_id').eq('post_id', postId).eq('user_id', userId),
    supabase.from('reposts').select('post_id').eq('post_id', postId).eq('user_id', userId),
  ])

  const reactionCounts: Record<string, number> = {}
  reactions?.forEach((r) => {
    reactionCounts[r.type] = (reactionCounts[r.type] || 0) + 1
  })

  return {
    ...post,
    author: post.author as PostWithAuthor['author'],
    project: post.project as PostWithAuthor['project'],
    media: post.media ?? [],
    reaction_counts: reactionCounts,
    comment_count: comments?.length ?? 0,
    user_reactions: userReactions?.map((r) => r.type) ?? [],
    is_saved: (userSaves?.length ?? 0) > 0,
    is_reposted: (userReposts?.length ?? 0) > 0,
  }
}
