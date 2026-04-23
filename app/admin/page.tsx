import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, FolderKanban, Flag, CalendarDays, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: userCount },
    { count: postCount },
    { count: projectCount },
    { count: eventCount },
    { count: reportCount },
    { count: campusCount },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('onboarding_completed', true),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_removed', false),
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_archived', false),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('campuses').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Users', value: userCount ?? 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Posts', value: postCount ?? 0, icon: FileText, color: 'text-green-500' },
    { label: 'Projects', value: projectCount ?? 0, icon: FolderKanban, color: 'text-purple-500' },
    { label: 'Events', value: eventCount ?? 0, icon: CalendarDays, color: 'text-orange-500' },
    { label: 'Pending Reports', value: reportCount ?? 0, icon: Flag, color: 'text-red-500' },
    { label: 'Campuses', value: campusCount ?? 0, icon: TrendingUp, color: 'text-cyan-500' },
  ]

  // Recent signups
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, handle, display_name, avatar_url, role, created_at, campus:campuses(name)')
    .eq('onboarding_completed', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Recent reports
  const { data: recentReports } = await supabase
    .from('reports')
    .select('id, resource_type, reason, status, created_at, reporter:users!reports_reporter_id_fkey(display_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers?.map((u) => (
                <div key={u.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{u.display_name}</span>
                    <span className="text-muted-foreground ml-2">@{u.handle}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {(!recentUsers || recentUsers.length === 0) && (
                <p className="text-sm text-muted-foreground">No users yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports?.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium capitalize">{r.resource_type}</span>
                    <span className="text-muted-foreground ml-2">— {r.reason}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-500'
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
              {(!recentReports || recentReports.length === 0) && (
                <p className="text-sm text-muted-foreground">No reports yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
