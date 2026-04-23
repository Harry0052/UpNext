'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/components/user-avatar'
import { PostTypeBadge } from '@/components/post-type-badge'
import { RoleBadge } from '@/components/role-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { REACTION_EMOJIS } from '@/lib/constants'
import { toggleReaction, toggleSavePost, toggleRepost, deletePost } from '@/lib/actions/posts'
import { cn } from '@/lib/utils'
import {
  MessageCircle,
  Repeat2,
  Bookmark,
  BookmarkCheck,
  MoreHorizontal,
  Flag,
  Trash2,
  Share2,
  ExternalLink,
  Hand,
} from 'lucide-react'
import type { PostWithAuthor } from '@/types/database'
import { toast } from 'sonner'

interface PostCardProps {
  post: PostWithAuthor
  currentUserId: string
  compact?: boolean
}

export function PostCard({ post, currentUserId, compact = false }: PostCardProps) {
  const isAuthor = post.author_id === currentUserId
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  async function handleReaction(type: string) {
    const result = await toggleReaction(post.id, type)
    if (result.error) toast.error(result.error)
  }

  async function handleSave() {
    const result = await toggleSavePost(post.id)
    if (result.error) toast.error(result.error)
  }

  async function handleRepost() {
    const result = await toggleRepost(post.id)
    if (result.error) toast.error(result.error)
  }

  async function handleDelete() {
    if (!confirm('Delete this post?')) return
    const result = await deletePost(post.id)
    if (result.error) toast.error(result.error)
    else toast.success('Post deleted')
  }

  const totalReactions = Object.values(post.reaction_counts).reduce((a, b) => a + b, 0)

  return (
    <article className="border-b border-border px-4 py-5 transition-colors hover:bg-muted/30">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/${post.author.handle}`} className="shrink-0">
          <UserAvatar
            src={post.author.avatar_url}
            name={post.author.display_name}
            size="md"
          />
        </Link>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link
                href={`/${post.author.handle}`}
                className="font-semibold hover:underline truncate"
              >
                {post.author.display_name}
              </Link>
              <Link
                href={`/${post.author.handle}`}
                className="text-sm text-muted-foreground truncate"
              >
                @{post.author.handle}
              </Link>
              <span className="text-muted-foreground">·</span>
              <Link
                href={`/post/${post.id}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                {timeAgo}
              </Link>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon-xs">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)}>
                  <Share2 className="h-4 w-4" />
                  Copy link
                </DropdownMenuItem>
                {isAuthor ? (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Post type & project badge */}
          <div className="flex items-center gap-2 mt-1">
            {post.type !== 'update' && <PostTypeBadge type={post.type} />}
            {post.project && (
              <Link
                href={`/projects/${post.project.slug}`}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                {post.project.name}
              </Link>
            )}
          </div>

          {/* Content */}
          <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
            {post.content}
          </div>

          {/* Media */}
          {post.media.length > 0 && (
            <div
              className={cn(
                'mt-3 grid gap-2 rounded-xl overflow-hidden',
                post.media.length === 1 && 'grid-cols-1',
                post.media.length === 2 && 'grid-cols-2',
                post.media.length >= 3 && 'grid-cols-2'
              )}
            >
              {post.media.slice(0, 4).map((media, i) => (
                <div
                  key={media.id}
                  className={cn(
                    'relative aspect-video bg-muted rounded-lg overflow-hidden',
                    post.media.length === 3 && i === 0 && 'row-span-2 aspect-square'
                  )}
                >
                  {media.type === 'image' ? (
                    <Image
                      src={media.url}
                      alt={media.alt_text || ''}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 500px"
                    />
                  ) : (
                    <video
                      src={media.url}
                      controls
                      className="h-full w-full object-cover"
                      preload="metadata"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions bar */}
          <div className="flex items-center gap-1 mt-3 -ml-2">
            {/* Reaction buttons */}
            <div className="flex items-center">
              {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => {
                const count = post.reaction_counts[type] || 0
                const isActive = post.user_reactions.includes(type)
                return (
                  <button
                    key={type}
                    onClick={() => handleReaction(type)}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                    title={type}
                  >
                    <span className="text-sm">{emoji}</span>
                    {count > 0 && <span className="font-medium">{count}</span>}
                  </button>
                )
              })}
            </div>

            <div className="flex-1" />

            {/* Comment count */}
            <Link
              href={`/post/${post.id}`}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comment_count > 0 && <span>{post.comment_count}</span>}
            </Link>

            {/* Repost */}
            <button
              onClick={handleRepost}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors',
                post.is_reposted
                  ? 'text-green-500 bg-green-500/10'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <Repeat2 className="h-4 w-4" />
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors',
                post.is_saved
                  ? 'text-yellow-500 bg-yellow-500/10'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {post.is_saved ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>

            {/* Raise Hand (for Ask posts) */}
            {post.type === 'ask' && !isAuthor && (
              <Link
                href={`/post/${post.id}?raise=true`}
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                <Hand className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
