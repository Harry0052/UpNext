import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsForm } from './settings-form'

export const metadata: Metadata = {
  title: 'Settings',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/onboarding')

  const { data: skills } = await supabase
    .from('user_skills')
    .select('skill')
    .eq('user_id', authUser.id)

  const { data: interests } = await supabase
    .from('user_interests')
    .select('interest')
    .eq('user_id', authUser.id)

  const { data: campuses } = await supabase
    .from('campuses')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm
        user={user}
        skills={skills?.map((s) => s.skill) ?? []}
        interests={interests?.map((i) => i.interest) ?? []}
        campuses={campuses ?? []}
      />
    </div>
  )
}
