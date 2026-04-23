'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Search, PlusCircle } from 'lucide-react'
import type { User } from '@/types/database'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Sidebar } from './sidebar'

interface MobileHeaderProps {
  user: User
  unreadNotifications: number
  unreadMessages: number
}

export function MobileHeader({ user, unreadNotifications, unreadMessages }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 backdrop-blur-lg px-4 lg:hidden">
      <Sheet>
        <SheetTrigger>
          <button className="flex items-center">
            <UserAvatar
              src={user.avatar_url}
              name={user.display_name}
              size="sm"
            />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar
            user={user}
            unreadNotifications={unreadNotifications}
            unreadMessages={unreadMessages}
          />
        </SheetContent>
      </Sheet>

      <Logo showText />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/search">
            <Search className="h-5 w-5" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/compose">
            <PlusCircle className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
