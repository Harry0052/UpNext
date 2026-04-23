import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateProjectForm } from './create-project-form'

export const metadata: Metadata = {
  title: 'Create Project',
}

export default async function NewProjectPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create a Project</h1>
      <CreateProjectForm />
    </div>
  )
}
