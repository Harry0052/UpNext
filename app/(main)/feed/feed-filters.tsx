'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { POST_TYPE_LABELS } from '@/lib/constants'

const feedFilters = [
  { value: 'all', label: 'All' },
  { value: 'following', label: 'Following' },
  { value: 'campus', label: 'My Campus' },
  { value: 'trending', label: 'Trending' },
]

const typeFilters = [
  { value: 'all', label: 'All Types' },
  { value: 'update', label: 'Updates' },
  { value: 'launch', label: 'Launches' },
  { value: 'ask', label: 'Asks' },
  { value: 'win', label: 'Wins' },
  { value: 'learn', label: 'Learns' },
]

interface FeedFiltersProps {
  currentFilter: string
  currentType: string
}

export function FeedFilters({ currentFilter, currentType }: FeedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/feed?${params.toString()}`)
  }

  return (
    <div className="border-b border-border px-4 py-3 space-y-2">
      {/* Feed filter tabs */}
      <div className="flex gap-1">
        {feedFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setFilter('filter', filter.value)}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              currentFilter === filter.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Type filter chips */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none">
        {typeFilters.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter('type', type.value)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap',
              currentType === type.value
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:bg-muted'
            )}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  )
}
