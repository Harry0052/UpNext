'use client'

import { Button } from '@/components/ui/button'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'

export function EventShareButton() {
  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
      }
    } catch {
      // User cancelled share
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleShare}
      title="Share event"
    >
      <Share2 className="h-4 w-4" />
    </Button>
  )
}
