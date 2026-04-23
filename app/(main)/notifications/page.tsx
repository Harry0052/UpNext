import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { NotificationList } from './notification-list'

export const metadata: Metadata = {
  title: 'Notifications',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, body, actor_id, resource_type, resource_id, is_read, created_at')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch actor details for notifications that have an actor
  const actorIds = [
    ...new Set(
      notifications?.filter((n) => n.actor_id).map((n) => n.actor_id!) ?? []
    ),
  ]

  const { data: actors } = actorIds.length > 0
    ? await supabase
        .from('users')
        .select('id, handle, display_name, avatar_url')
        .in('id', actorIds)
    : { data: [] }

  const actorMap = new Map(actors?.map((a) => [a.id, a]) ?? [])

  const notificationsWithActors = notifications?.map((n) => ({
    ...n,
    actor: n.actor_id ? actorMap.get(n.actor_id) ?? null : null,
  })) ?? []

  const hasUnread = notificationsWithActors.some((n) => !n.is_read)

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <NotificationList
        notifications={notificationsWithActors}
        hasUnread={hasUnread}
      />
    </div>
  )
}
