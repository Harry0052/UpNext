import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Analytics — Admin',
}

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Get signups over time (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentSignups } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('onboarding_completed', true)
    .order('created_at')

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('created_at, type')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .eq('is_removed', false)

  // Top campuses by user count
  const { data: campuses } = await supabase
    .from('campuses')
    .select('name, slug')

  const campusStats = await Promise.all(
    (campuses ?? []).slice(0, 10).map(async (campus) => {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('onboarding_completed', true)
      return { name: campus.name, count: count ?? 0 }
    })
  )

  // Post type distribution
  const postTypes: Record<string, number> = {}
  recentPosts?.forEach((post) => {
    postTypes[post.type] = (postTypes[post.type] || 0) + 1
  })

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Signups (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{recentSignups?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {((recentSignups?.length ?? 0) / 30).toFixed(1)} per day average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{recentPosts?.length ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {((recentPosts?.length ?? 0) / 30).toFixed(1)} per day average
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(postTypes)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const total = recentPosts?.length || 1
                const percentage = Math.round((count / total) * 100)
                return (
                  <div key={type} className="flex items-center gap-3">
                    <span className="w-20 text-sm capitalize font-medium">{type}</span>
                    <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/60 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {count} ({percentage}%)
                    </span>
                  </div>
                )
              })}
            {Object.keys(postTypes).length === 0 && (
              <p className="text-sm text-muted-foreground">No posts yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Campuses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {campusStats
              .sort((a, b) => b.count - a.count)
              .slice(0, 10)
              .map((campus, i) => (
                <div key={campus.name} className="flex items-center justify-between text-sm">
                  <span>
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {campus.name}
                  </span>
                  <span className="text-muted-foreground">{campus.count} members</span>
                </div>
              ))}
            {campusStats.length === 0 && (
              <p className="text-sm text-muted-foreground">No campuses yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
