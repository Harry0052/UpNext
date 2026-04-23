import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EVENT_TYPE_LABELS } from '@/lib/constants'
import { toggleRsvp } from '@/lib/actions/events'
import { EventShareButton } from './event-share-button'
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Users,
  Video,
} from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description')
    .eq('slug', slug)
    .single()

  if (!event) return { title: 'Event Not Found' }

  return {
    title: event.title,
    description: event.description ?? undefined,
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      organizer:users!events_organizer_id_fkey(id, handle, display_name, avatar_url),
      campus:campuses(id, name)
    `)
    .eq('slug', slug)
    .single()

  if (!event) notFound()

  // Fetch RSVPs
  const { data: rsvps } = await supabase
    .from('event_rsvps')
    .select(`
      status,
      user:users(id, handle, display_name, avatar_url)
    `)
    .eq('event_id', event.id)

  const goingRsvps = (rsvps ?? []).filter((r) => r.status === 'going')
  const maybeRsvps = (rsvps ?? []).filter((r) => r.status === 'maybe')

  // Current user's RSVP
  const userRsvp = (rsvps ?? []).find(
    (r: any) => r.user?.id === authUser.id
  )

  const startDate = new Date(event.start_time)
  const endDate = new Date(event.end_time)
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = `${startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${endDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`

  const isPast = new Date(event.end_time) < new Date()

  return (
    <div>
      {/* Cover image */}
      {event.cover_url && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={event.cover_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary">
                {EVENT_TYPE_LABELS[event.type] || event.type}
              </Badge>
              {isPast && (
                <Badge variant="outline" className="text-muted-foreground">
                  Past Event
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{event.title}</h1>

            {event.campus && (
              <p className="text-sm text-muted-foreground mt-1">
                {(event.campus as { name: string }).name}
              </p>
            )}
          </div>

          {/* Share button */}
          <EventShareButton />
        </div>

        {/* Date / Time / Location */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{timeStr}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}
          {event.is_virtual && event.virtual_url && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-muted-foreground" />
              <a
                href={event.virtual_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Join Virtual Event
                <ExternalLink className="inline ml-1 h-3 w-3" />
              </a>
            </div>
          )}
          {event.max_attendees && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {goingRsvps.length} / {event.max_attendees} spots filled
              </span>
            </div>
          )}
        </div>

        {/* RSVP buttons */}
        {!isPast && (
          <div className="flex gap-2 mt-4">
            <form action={toggleRsvp}>
              <input type="hidden" name="event_id" value={event.id} />
              <input type="hidden" name="status" value="going" />
              <Button
                type="submit"
                variant={userRsvp?.status === 'going' ? 'default' : 'outline'}
                size="sm"
              >
                Going
              </Button>
            </form>
            <form action={toggleRsvp}>
              <input type="hidden" name="event_id" value={event.id} />
              <input type="hidden" name="status" value="maybe" />
              <Button
                type="submit"
                variant={userRsvp?.status === 'maybe' ? 'default' : 'outline'}
                size="sm"
              >
                Maybe
              </Button>
            </form>
            <form action={toggleRsvp}>
              <input type="hidden" name="event_id" value={event.id} />
              <input type="hidden" name="status" value="not_going" />
              <Button
                type="submit"
                variant={
                  userRsvp?.status === 'not_going' ? 'default' : 'outline'
                }
                size="sm"
              >
                Can&apos;t Go
              </Button>
            </form>
          </div>
        )}

        {/* Organizer */}
        {event.organizer && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-1.5">Organized by</p>
            <Link
              href={`/@${(event.organizer as { handle: string }).handle}`}
              className="flex items-center gap-2 hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors"
            >
              <UserAvatar
                src={
                  (event.organizer as { avatar_url: string | null }).avatar_url
                }
                name={
                  (event.organizer as { display_name: string }).display_name
                }
                size="md"
              />
              <span className="font-medium text-sm">
                {(event.organizer as { display_name: string }).display_name}
              </span>
            </Link>
          </div>
        )}
      </div>

      <Separator />

      {/* Description */}
      {event.description && (
        <>
          <div className="px-4 py-4">
            <h2 className="font-semibold mb-2">About this event</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
          <Separator />
        </>
      )}

      {/* Attendees */}
      <div className="px-4 py-4">
        <h2 className="font-semibold mb-3">
          Going ({goingRsvps.length})
        </h2>
        {goingRsvps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No one has RSVP&apos;d yet. Be the first!
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {goingRsvps.map((rsvp) => {
              const user = rsvp.user as any
              return (
                <Link
                  key={user.id}
                  href={`/@${user.handle}`}
                  title={user.display_name}
                >
                  <UserAvatar
                    src={user.avatar_url}
                    name={user.display_name}
                    size="md"
                  />
                </Link>
              )
            })}
          </div>
        )}

        {maybeRsvps.length > 0 && (
          <>
            <h3 className="font-medium text-sm mt-4 mb-2 text-muted-foreground">
              Maybe ({maybeRsvps.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {maybeRsvps.map((rsvp) => {
                const user = rsvp.user as any
                return (
                  <Link
                    key={user.id}
                    href={`/@${user.handle}`}
                    title={user.display_name}
                  >
                    <UserAvatar
                      src={user.avatar_url}
                      name={user.display_name}
                      size="sm"
                    />
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
