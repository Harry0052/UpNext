'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PostTypeBadge } from '@/components/post-type-badge'
import { POST_TYPES, POST_TYPE_LABELS, MAX_POST_LENGTH } from '@/lib/constants'
import { createPost } from '@/lib/actions/posts'
import { cn } from '@/lib/utils'
import { Loader2, ImagePlus, X } from 'lucide-react'
import { toast } from 'sonner'
import type { User, Project } from '@/types/database'

interface PostComposerProps {
  user: Pick<User, 'id' | 'display_name' | 'avatar_url'>
  projects?: Pick<Project, 'id' | 'name' | 'slug'>[]
  defaultType?: string
  defaultProjectId?: string
  onSuccess?: () => void
  expanded?: boolean
}

export function PostComposer({
  user,
  projects = [],
  defaultType = 'update',
  defaultProjectId,
  onSuccess,
  expanded = false,
}: PostComposerProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(expanded)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState(defaultType)
  const [projectId, setProjectId] = useState(defaultProjectId || '')

  async function handleSubmit() {
    if (!content.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.set('type', postType)
    formData.set('content', content)
    if (projectId) formData.set('project_id', projectId)

    const result = await createPost(formData)

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
      return
    }

    setContent('')
    setIsExpanded(false)
    setPostType('update')
    setProjectId('')
    toast.success('Post published!')
    onSuccess?.()
    router.refresh()
  }

  const charCount = content.length
  const isOverLimit = charCount > MAX_POST_LENGTH

  return (
    <div className="border-b border-border px-4 py-4">
      <div className="flex gap-3">
        <UserAvatar
          src={user.avatar_url}
          name={user.display_name}
          size="md"
        />
        <div className="flex-1 min-w-0">
          {/* Post type selector */}
          {isExpanded && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {POST_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    postType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {POST_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}

          <Textarea
            placeholder={
              postType === 'ask'
                ? "What do you need help with?"
                : postType === 'launch'
                ? "What are you launching?"
                : postType === 'win'
                ? "What's your win?"
                : postType === 'learn'
                ? "What did you learn?"
                : "What's happening?"
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="min-h-[80px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
            rows={isExpanded ? 4 : 2}
          />

          {isExpanded && (
            <div className="flex items-center justify-between pt-3 border-t border-border mt-3">
              <div className="flex items-center gap-2">
                {/* Project selector */}
                {projects.length > 0 && (
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                  >
                    <option value="">No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                )}

                <Button variant="ghost" size="icon-sm" type="button">
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                </Button>

                {/* Character count */}
                <span
                  className={cn(
                    'text-xs',
                    isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                  )}
                >
                  {charCount}/{MAX_POST_LENGTH}
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isOverLimit || isSubmitting}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
