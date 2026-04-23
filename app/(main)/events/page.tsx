import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/constants'
import { Plus, Calendar, MapPin, Users, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Events',
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; campus?: string; past?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const now = new Date().toISOString()

  // Fetch campuses for filter
  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name, slug')
    .order('name')

  // Upcoming events
  let upcomingQuery = supabase
    .from('events')
    .select(`
      id, title, slug, type, start_time, end_time, location, is_virtual, cover_url,
      organizer:users!events_organizer_id_fkey(id, display_name, avatar_url),
      campus:campuses(id, name)
    `)
    .gte('start_time', now)
    .order('start_time', { ascending: true })

  if (params.type) {
    upcomingQuery = upcomingQuery.eq('type', params.type)
  }
  if (params.campus) {
    upcomingQuery = upcomingQuery.eq('campus_id', params.campus)
  }

  const { data: upcomingEvents } = await upcomingQuery

  // Past events
  let pastQuery = supabase
    .from('events')
    .select(`
      id, title, slug, type, start_time, end_time, location, is_virtual,
      organizer:users!events_organizer_id_fkey(id, display_name, avatar_url),
      campus:campuses(id, name)
    `)
    .lt('start_time', now)
    .order('start_time', { ascending: false })
    .limit(10)

  if (params.type) {
    pastQuery = pastQuery.eq('type', params.type)
  }
  if (params.campus) {
    pastQuery = pastQuery.eq('campus_id', params.campus)
  }

  const { data: pastEvents } = await pastQuery

  // Get RSVP counts for all events
  const allEventIds = [
    ...(upcomingEvents ?? []).map((e) => e.id),
    ...(pastEvents ?? []).map((e) => e.id),
  ]

  const rsvpCounts: Record<string, number> = {}
  if (allEventIds.length > 0) {
    const { data: rsvps } = await supabase
      .from('event_rsvps')
      .select('event_id')
      .in('event_id', allEventIds)
      .eq('status', 'going')

    for (const rsvp of rsvps ?? []) {
      rsvpCounts[rsvp.event_id] = (rsvpCounts[rsvp.event_id] || 0) + 1
    }
  }

  const showPast = params.past === '1'

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild size="sm">
          <Link href="/events/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="border-b border-border px-4 py-3 space-y-2">
        {/* Type filter */}
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          <Link
            href={`/events${params.campus ? `?campus=${params.campus}` : ''}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              !params.type
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All Types
          </Link>
          {EVENT_TYPES.map((type) => (
            <Link
              key={type}
              href={`/events?type=${type}${params.campus ? `&campus=${params.campus}` : ''}`}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                params.type === type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {EVENT_TYPE_LABELS[type]}
            </Link>
          ))}
        </div>

        {/* Campus filter */}
        {campuses && campuses.length > 0 && (
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            <Link
              href={`/events${params.type ? `?type=${params.type}` : ''}`}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                !params.campus
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              All Campuses
            </Link>
            {campuses.map((campus) => (
              <Link
                key={campus.id}
                href={`/events?campus=${campus.id}${params.type ? `&type=${params.type}` : ''}`}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  params.campus === campus.id
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {campus.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming events */}
      <div className="divide-y divide-border">
        {!upcomingEvents || upcomingEvents.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-lg font-medium">No upcoming events</p>
            <p className="text-muted-foreground mt-1">
              Create one and bring the community together!
            </p>
          </div>
        ) : (
          upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              rsvpCount={rsvpCounts[event.id] || 0}
            />
          ))
        )}
      </div>

      {/* Past events section */}
      {pastEvents && pastEvents.length > 0 && (
        <div className="border-t border-border">
          <div className="px-4 py-3">
            <Link
              href={`/events?${new URLSearchParams({
                ...(params.type ? { type: params.type } : {}),
                ...(params.campus ? { campus: params.campus } : {}),
                past: showPast ? '0' : '1',
              }).toString()}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPast ? 'Hide' : 'Show'} Past Events ({pastEvents.length})
            </Link>
          </div>

          {showPast && (
            <div className="divide-y divide-border opacity-75">
              {pastEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  rsvpCount={rsvpCounts[event.id] || 0}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({
  event,
  rsvpCount,
}: {
  event: any
  rsvpCount: number
}) {
  const organizer = Array.isArray(event.organizer) ? event.organizer[0] : event.organizer
  const campus = Array.isArray(event.campus) ? event.campus[0] : event.campus
  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const timeStr = `${startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`

  return (
    <Link
      href={`/events/${event.slug}`}
      className="block px-4 py-4 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Date block */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-3 py-2 min-w-[56px]">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {startDate.toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-lg font-bold">{startDate.getDate()}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{event.title}</h3>
            <Badge variant="secondary" className="text-xs shrink-0">
              {EVENT_TYPE_LABELS[event.type] || event.type}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {timeStr}
            </span>

            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {event.location}
              </span>
            )}

            {event.is_virtual && !event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Virtual
              </span>
            )}

            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {rsvpCount} going
            </span>
          </div>

          {/* Organizer */}
          {event.organizer && (
            <div className="flex items-center gap-1.5 mt-2">
              <UserAvatar
                src={organizer?.avatar_url}
                name={organizer?.display_name}
                size="sm"
              />
              <span className="text-xs text-muted-foreground">
                by {organizer?.display_name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
