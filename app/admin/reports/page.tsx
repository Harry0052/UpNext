import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ReportQueue } from './report-queue'

export const metadata: Metadata = {
  title: 'Moderation Queue — Admin',
}

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const { data: reports } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reports_reporter_id_fkey(id, handle, display_name, avatar_url),
      reviewer:users!reports_reviewed_by_fkey(id, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Moderation Queue</h1>
      <ReportQueue reports={reports ?? []} />
    </div>
  )
}
