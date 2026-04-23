'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Compass,
  FolderKanban,
  MessageCircle,
  Bell,
} from 'lucide-react'

interface MobileNavProps {
  unreadNotifications: number
  unreadMessages: number
}

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/messages', label: 'Messages', icon: MessageCircle, badge: 'messages' as const },
  { href: '/notifications', label: 'Alerts', icon: Bell, badge: 'notifications' as const },
]

export function MobileNav({ unreadNotifications, unreadMessages }: MobileNavProps) {
  const pathname = usePathname()

  function getBadgeCount(badge?: 'messages' | 'notifications') {
    if (badge === 'messages') return unreadMessages
    if (badge === 'notifications') return unreadNotifications
    return 0
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const badgeCount = getBadgeCount(item.badge)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {badgeCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
