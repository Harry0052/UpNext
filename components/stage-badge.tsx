import { Badge } from '@/components/ui/badge'
import { PROJECT_STAGE_LABELS, PROJECT_STAGE_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function StageBadge({ stage, className }: { stage: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        PROJECT_STAGE_COLORS[stage] || 'bg-muted text-muted-foreground',
        className
      )}
    >
      {PROJECT_STAGE_LABELS[stage] || stage}
    </Badge>
  )
}
