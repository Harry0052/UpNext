import { Badge } from '@/components/ui/badge'
import { ROLE_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const roleColors: Record<string, string> = {
  founder: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  engineer: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  designer: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  marketer: 'bg-green-500/10 text-green-500 border-green-500/20',
  researcher: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  creator: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  operator: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  other: 'bg-muted text-muted-foreground',
}

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        roleColors[role] || roleColors.other,
        className
      )}
    >
      {ROLE_LABELS[role] || role}
    </Badge>
  )
}
