import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { MobileHeader } from '@/components/layout/mobile-header'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    redirect('/onboarding')
  }

  if (!user.onboarding_completed) {
    redirect('/onboarding')
  }

  // Get unread counts
  const [{ count: unreadNotifications }, { count: unreadMessages }] = await Promise.all([
    supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('is_read', false),
    Promise.resolve(
      supabase
        .rpc('get_unread_message_count', { p_user_id: authUser.id })
        .then((res) => ({ count: res.data ?? 0 }))
    ).catch(() => ({ count: 0 })),
  ])

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          user={user}
          unreadNotifications={unreadNotifications ?? 0}
          unreadMessages={unreadMessages ?? 0}
        />
      </div>

      {/* Mobile header */}
      <MobileHeader
        user={user}
        unreadNotifications={unreadNotifications ?? 0}
        unreadMessages={unreadMessages ?? 0}
      />

      {/* Main content */}
      <main className="flex-1 lg:ml-0">
        <div className="mx-auto max-w-3xl px-4 py-6 pb-20 lg:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav
        unreadNotifications={unreadNotifications ?? 0}
        unreadMessages={unreadMessages ?? 0}
      />
    </div>
  )
}
