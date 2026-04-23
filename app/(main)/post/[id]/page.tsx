import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPostById } from '@/lib/queries/posts'
import { PostCard } from '@/components/posts/post-card'
import { CommentSection } from './comment-section'
import { ArrowLeft } from 'lucide-react'

interface PostPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return { title: 'Post' }

  const post = await getPostById(id, authUser.id)

  if (!post) return { title: 'Post Not Found' }

  return {
    title: `${post.author.display_name}: "${post.content.slice(0, 60)}${post.content.length > 60 ? '...' : ''}"`,
    description: post.content.slice(0, 160),
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  // Fetch the post
  const post = await getPostById(id, authUser.id)

  if (!post) notFound()

  // Fetch current user info for the comment composer
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, display_name, avatar_url')
    .eq('id', authUser.id)
    .single()

  if (!currentUser) return null

  // Fetch comments with authors
  const { data: commentsRaw } = await supabase
    .from('comments')
    .select(`
      id, post_id, author_id, parent_id, content, created_at,
      author:users!comments_author_id_fkey(id, handle, display_name, avatar_url)
    `)
    .eq('post_id', id)
    .eq('is_removed', false)
    .order('created_at', { ascending: true })

  const comments = (commentsRaw ?? []).map((c) => ({
    id: c.id,
    post_id: c.post_id,
    author_id: c.author_id,
    parent_id: c.parent_id,
    content: c.content,
    created_at: c.created_at,
    author: c.author as any,
  }))

  return (
    <div>
      {/* Back navigation */}
      <div className="px-4 py-3 border-b border-border">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Post */}
      <PostCard post={post} currentUserId={authUser.id} />

      {/* Comments */}
      <CommentSection
        postId={id}
        comments={comments}
        currentUser={currentUser}
      />
    </div>
  )
}
