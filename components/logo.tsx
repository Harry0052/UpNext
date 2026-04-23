import { cn } from '@/lib/utils'
import { Rocket } from 'lucide-react'

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
        <Rocket className="h-4 w-4 text-white" />
      </div>
      {showText && (
        <span className="text-xl font-bold tracking-tight">
          Up<span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Next</span>
        </span>
      )}
    </div>
  )
}
