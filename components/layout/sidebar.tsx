'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import {
  Home,
  Compass,
  FolderKanban,
  CalendarDays,
  MessageCircle,
  Bell,
  Search,
  Settings,
  PlusCircle,
  Shield,
  LogOut,
} from 'lucide-react'
import type { User } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  user: User
  unreadNotifications: number
  unreadMessages: number
}

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/messages', label: 'Messages', icon: MessageCircle, badge: 'messages' as const },
  { href: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' as const },
  { href: '/search', label: 'Search', icon: Search },
]

export function Sidebar({ user, unreadNotifications, unreadMessages }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function getBadgeCount(badge?: 'messages' | 'notifications') {
    if (badge === 'messages') return unreadMessages
    if (badge === 'notifications') return unreadNotifications
    return 0
  }

  return (
    <aside className="flex h-dvh w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/feed">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const badgeCount = getBadgeCount(item.badge)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </Link>
          )
        })}

        {/* Create Post Button */}
        <div className="pt-4">
          <Button asChild className="w-full gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0">
            <Link href="/compose">
              <PlusCircle className="h-4 w-4" />
              New Post
            </Link>
          </Button>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-3 space-y-1">
        {user.is_admin && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Shield className="h-5 w-5" />
            Admin
          </Link>
        )}
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Link href={`/${user.handle}`} className="flex items-center gap-3 flex-1 min-w-0">
            <UserAvatar
              src={user.avatar_url}
              name={user.display_name}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.display_name}</p>
              <p className="truncate text-xs text-muted-foreground">@{user.handle}</p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
