'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { markNotificationRead, markAllNotificationsRead } from '@/lib/actions/notifications'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow, isToday } from 'date-fns'

interface NotificationActor {
  id: string
  handle: string
  display_name: string
  avatar_url: string | null
}

interface NotificationItem {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  actor_id: string | null
  resource_type: string | null
  resource_id: string | null
  is_read: boolean
  created_at: string
  actor: NotificationActor | null
}

interface NotificationListProps {
  notifications: NotificationItem[]
  hasUnread: boolean
}

function getNotificationHref(notification: NotificationItem): string {
  if (!notification.resource_type || !notification.resource_id) {
    return '/notifications'
  }

  switch (notification.resource_type) {
    case 'post':
      return `/post/${notification.resource_id}`
    case 'project':
      return `/project/${notification.resource_id}`
    case 'user':
      return `/profile/${notification.resource_id}`
    case 'comment':
      return `/post/${notification.resource_id}`
    case 'event':
      return `/event/${notification.resource_id}`
    case 'conversation':
      return `/messages/${notification.resource_id}`
    default:
      return '/notifications'
  }
}

export function NotificationList({ notifications, hasUnread }: NotificationListProps) {
  const [isPending, startTransition] = useTransition()

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllNotificationsRead()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('All notifications marked as read')
      }
    })
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.is_read) {
      startTransition(async () => {
        await markNotificationRead(notification.id)
      })
    }
  }

  // Group by today vs earlier
  const todayNotifications = notifications.filter((n) =>
    isToday(new Date(n.created_at))
  )
  const earlierNotifications = notifications.filter(
    (n) => !isToday(new Date(n.created_at))
  )

  if (notifications.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-lg font-medium">No notifications</p>
        <p className="text-muted-foreground mt-1">
          You're all caught up!
        </p>
      </div>
    )
  }

  return (
    <div>
      {hasUnread && (
        <div className="px-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-muted-foreground"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      )}

      {todayNotifications.length > 0 && (
        <div>
          <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Today
          </h3>
          <div className="divide-y divide-border">
            {todayNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        </div>
      )}

      {earlierNotifications.length > 0 && (
        <div>
          <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Earlier
          </h3>
          <div className="divide-y divide-border">
            {earlierNotifications.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onClick={() => handleNotificationClick(notification)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationRow({
  notification,
  onClick,
}: {
  notification: NotificationItem
  onClick: () => void
}) {
  const href = getNotificationHref(notification)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
        !notification.is_read ? 'bg-primary/5' : ''
      }`}
    >
      {notification.actor ? (
        <UserAvatar
          src={notification.actor.avatar_url}
          name={notification.actor.display_name}
          size="md"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
              {notification.title}
            </p>
            {notification.body && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {notification.body}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
