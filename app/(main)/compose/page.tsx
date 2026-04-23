import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostComposer } from '@/components/posts/post-composer'

export const metadata: Metadata = {
  title: 'New Post',
}

export default async function ComposePage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('id, display_name, avatar_url')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/onboarding')

  const { data: projectMembers } = await supabase
    .from('project_members')
    .select('project:projects(id, name, slug)')
    .eq('user_id', authUser.id)

  const projects = (projectMembers ?? [])
    .map((pm: any) => pm.project)
    .filter(Boolean) as any[]

  return (
    <div>
      <h1 className="text-2xl font-bold px-4 py-4">New Post</h1>
      <PostComposer user={user} projects={projects} expanded />
    </div>
  )
}
