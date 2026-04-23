'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/lib/actions/social'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FollowButtonProps {
  targetUserId: string
  isFollowing: boolean
}

export function FollowButton({ targetUserId, isFollowing: initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isHovering, setIsHovering] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFollow(targetUserId)
      if (result.error) {
        toast.error(result.error)
      } else {
        setIsFollowing(result.isFollowing ?? !isFollowing)
      }
    })
  }

  if (isFollowing) {
    return (
      <Button
        variant={isHovering ? 'destructive' : 'outline'}
        size="sm"
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        disabled={isPending}
        className="min-w-[100px]"
      >
        {isPending ? 'Loading...' : isHovering ? 'Unfollow' : 'Following'}
      </Button>
    )
  }

  return (
    <Button
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="min-w-[100px]"
    >
      {isPending ? 'Loading...' : 'Follow'}
    </Button>
  )
}
