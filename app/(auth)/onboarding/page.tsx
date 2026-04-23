import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingWizard } from './onboarding-wizard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Set Up Your Profile',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if already onboarded
  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/feed')
  }

  // Get campuses for selection
  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name, slug, domain')
    .order('name')

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <OnboardingWizard
          userId={user.id}
          userEmail={user.email ?? ''}
          campuses={campuses ?? []}
        />
      </div>
    </div>
  )
}
