'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createEventSchema } from '@/lib/validations'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const rawData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    type: formData.get('type') as string,
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    location: formData.get('location') as string,
    is_virtual: formData.get('is_virtual') === 'true',
    virtual_url: formData.get('virtual_url') as string,
    max_attendees: formData.get('max_attendees')
      ? Number(formData.get('max_attendees'))
      : null,
  }

  const parsed = createEventSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Get user's campus
  const { data: profile } = await supabase
    .from('users')
    .select('campus_id')
    .eq('id', user.id)
    .single()

  let slug = slugify(parsed.data.title)
  // Check for slug collision
  const { data: existingSlug } = await supabase
    .from('events')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({
      title: parsed.data.title,
      slug,
      description: parsed.data.description || null,
      type: parsed.data.type,
      start_time: parsed.data.start_time,
      end_time: parsed.data.end_time,
      location: parsed.data.location || null,
      is_virtual: parsed.data.is_virtual,
      virtual_url: parsed.data.virtual_url || null,
      campus_id: profile?.campus_id || null,
      organizer_id: user.id,
      max_attendees: parsed.data.max_attendees ?? null,
    })
    .select('id, slug')
    .single()

  if (error) return { error: error.message }

  // Auto-RSVP the organizer as going
  await supabase.from('event_rsvps').insert({
    event_id: event.id,
    user_id: user.id,
    status: 'going',
  })

  revalidatePath('/events')
  redirect(`/events/${event.slug}`)
}

export async function updateEvent(eventId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify ownership
  const { data: event } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', eventId)
    .single()

  if (!event || event.organizer_id !== user.id) {
    return { error: 'Not authorized' }
  }

  const updateData: Record<string, unknown> = {}
  const fields = [
    'title',
    'description',
    'type',
    'start_time',
    'end_time',
    'location',
    'virtual_url',
  ]
  for (const field of fields) {
    const value = formData.get(field)
    if (value !== null) updateData[field] = value
  }

  const isVirtual = formData.get('is_virtual')
  if (isVirtual !== null) {
    updateData.is_virtual = isVirtual === 'true'
  }

  const maxAttendees = formData.get('max_attendees')
  if (maxAttendees !== null) {
    updateData.max_attendees = maxAttendees ? Number(maxAttendees) : null
  }

  const { error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', eventId)

  if (error) return { error: error.message }

  revalidatePath('/events')
  return { success: true }
}

export async function toggleRsvp(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const eventId = formData.get('event_id') as string
  const status = formData.get('status') as string

  if (!eventId || !status) return

  // Check if user already has an RSVP
  const { data: existing } = await supabase
    .from('event_rsvps')
    .select('status')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    if (existing.status === status) {
      // Toggle off: remove the RSVP
      await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id)
    } else {
      // Update status
      await supabase
        .from('event_rsvps')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', user.id)
    }
  } else {
    // Check max attendees for 'going'
    if (status === 'going') {
      const { data: event } = await supabase
        .from('events')
        .select('max_attendees')
        .eq('id', eventId)
        .single()

      if (event?.max_attendees) {
        const { count } = await supabase
          .from('event_rsvps')
          .select('event_id', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('status', 'going')

        if (count && count >= event.max_attendees) {
          return
        }
      }
    }

    await supabase.from('event_rsvps').insert({
      event_id: eventId,
      user_id: user.id,
      status,
    })

    // Notify the organizer
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single()

    if (event && event.organizer_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: event.organizer_id,
        type: 'rsvp',
        title: `New RSVP for your event`,
        actor_id: user.id,
        resource_type: 'event',
        resource_id: eventId,
      })
    }
  }

  revalidatePath('/events')
}
