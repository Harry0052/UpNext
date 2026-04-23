import { Badge } from '@/components/ui/badge'
import { POST_TYPE_LABELS, POST_TYPE_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Rocket, HelpCircle, Trophy, Lightbulb, Calendar, MessageSquare } from 'lucide-react'

const postTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  update: MessageSquare,
  launch: Rocket,
  ask: HelpCircle,
  win: Trophy,
  learn: Lightbulb,
  event: Calendar,
}

export function PostTypeBadge({
  type,
  className,
  showIcon = true,
}: {
  type: string
  className?: string
  showIcon?: boolean
}) {
  const Icon = postTypeIcons[type] || MessageSquare
  return (
    <Badge
      variant="secondary"
      className={cn(
        'gap-1 font-medium',
        POST_TYPE_COLORS[type] || POST_TYPE_COLORS.update,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {POST_TYPE_LABELS[type] || type}
    </Badge>
  )
}
