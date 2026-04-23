import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { CampusManagement } from './campus-management'

export const metadata: Metadata = {
  title: 'Campus Management — Admin',
}

export default async function AdminCampusesPage() {
  const supabase = await createClient()

  const { data: campuses } = await supabase
    .from('campuses')
    .select('*')
    .order('name')

  // Get user count per campus
  const campusesWithCounts = await Promise.all(
    (campuses ?? []).map(async (campus) => {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('campus_id', campus.id)
        .eq('onboarding_completed', true)
      return { ...campus, user_count: count ?? 0 }
    })
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Campus Management</h1>
      <CampusManagement campuses={campusesWithCounts} />
    </div>
  )
}
