'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment } from '@/lib/actions/posts'
import { toast } from 'sonner'
import { MessageCircle, Reply } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentData {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  created_at: string
  author: {
    id: string
    handle: string
    display_name: string
    avatar_url: string | null
  }
}

interface CommentSectionProps {
  postId: string
  comments: CommentData[]
  currentUser: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

function CommentComposer({
  postId,
  currentUser,
  parentId,
  onCancel,
  placeholder,
}: {
  postId: string
  currentUser: CommentSectionProps['currentUser']
  parentId?: string | null
  onCancel?: () => void
  placeholder?: string
}) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    const formData = new FormData()
    formData.set('content', content.trim())
    if (parentId) {
      formData.set('parent_id', parentId)
    }

    startTransition(async () => {
      const result = await createComment(postId, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        setContent('')
        onCancel?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <UserAvatar
        src={currentUser.avatar_url}
        name={currentUser.display_name}
        size="sm"
      />
      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || 'Write a comment...'}
          className="min-h-[60px] resize-none text-sm"
          maxLength={1000}
        />
        <div className="flex items-center justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !content.trim()}
          >
            {isPending ? 'Posting...' : 'Comment'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function CommentThread({
  comment,
  replies,
  allComments,
  postId,
  currentUser,
  depth,
}: {
  comment: CommentData
  replies: CommentData[]
  allComments: CommentData[]
  postId: string
  currentUser: CommentSectionProps['currentUser']
  depth: number
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })

  return (
    <div className={cn('pt-4', depth > 0 && 'ml-8 border-l border-border pl-4')}>
      <div className="flex gap-3">
        <Link href={`/${comment.author.handle}`} className="shrink-0">
          <UserAvatar
            src={comment.author.avatar_url}
            name={comment.author.display_name}
            size="sm"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/${comment.author.handle}`}
              className="text-sm font-semibold hover:underline"
            >
              {comment.author.display_name}
            </Link>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
          {depth < 3 && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 mt-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-10 mt-3">
          <CommentComposer
            postId={postId}
            currentUser={currentUser}
            parentId={comment.id}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.author.display_name}...`}
          />
        </div>
      )}

      {/* Nested replies */}
      {replies.map((reply) => {
        const childReplies = allComments.filter((c) => c.parent_id === reply.id)
        return (
          <CommentThread
            key={reply.id}
            comment={reply}
            replies={childReplies}
            allComments={allComments}
            postId={postId}
            currentUser={currentUser}
            depth={depth + 1}
          />
        )
      })}
    </div>
  )
}

export function CommentSection({ postId, comments, currentUser }: CommentSectionProps) {
  // Build threaded structure: top-level comments have no parent_id
  const topLevelComments = comments.filter((c) => !c.parent_id)
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_id === parentId)

  return (
    <div>
      {/* Comment count header */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <MessageCircle className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Composer */}
      <div className="px-4 pb-4">
        <CommentComposer postId={postId} currentUser={currentUser} />
      </div>

      {/* Threaded comments */}
      <div className="px-4 pb-4 divide-y divide-border">
        {topLevelComments.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          topLevelComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              replies={getReplies(comment.id)}
              allComments={comments}
              postId={postId}
              currentUser={currentUser}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  )
}
