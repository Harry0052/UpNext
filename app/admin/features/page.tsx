import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FeatureFlagManager } from './feature-flag-manager'

export const metadata: Metadata = {
  title: 'Feature Flags — Admin',
}

export default async function AdminFeaturesPage() {
  const supabase = await createClient()

  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .order('key')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Feature Flags</h1>
      <FeatureFlagManager flags={flags ?? []} />
    </div>
  )
}
