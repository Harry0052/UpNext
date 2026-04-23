import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SearchInterface } from './search-interface'

export const metadata: Metadata = {
  title: 'Search',
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>
}) {
  const params = await searchParams
  const query = params.q || ''
  const tab = params.tab || 'all'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  let people: any[] = []
  let projects: any[] = []
  let posts: any[] = []
  let events: any[] = []

  if (query.length > 0) {
    const searchTerm = `%${query}%`

    if (tab === 'all' || tab === 'people') {
      const { data } = await supabase
        .from('users')
        .select('id, handle, display_name, avatar_url, bio, role, campus:campuses(name)')
        .or(`display_name.ilike.${searchTerm},handle.ilike.${searchTerm},bio.ilike.${searchTerm}`)
        .eq('onboarding_completed', true)
        .limit(tab === 'all' ? 5 : 20)
      people = data ?? []
    }

    if (tab === 'all' || tab === 'projects') {
      const { data } = await supabase
        .from('projects')
        .select('id, name, slug, tagline, stage, logo_url, campus:campuses(name)')
        .or(`name.ilike.${searchTerm},tagline.ilike.${searchTerm}`)
        .eq('is_archived', false)
        .limit(tab === 'all' ? 5 : 20)
      projects = data ?? []
    }

    if (tab === 'all' || tab === 'posts') {
      const { data } = await supabase
        .from('posts')
        .select('id, content, type, created_at, author:users!posts_author_id_fkey(id, handle, display_name, avatar_url)')
        .ilike('content', searchTerm)
        .eq('is_removed', false)
        .order('created_at', { ascending: false })
        .limit(tab === 'all' ? 5 : 20)
      posts = data ?? []
    }

    if (tab === 'all' || tab === 'events') {
      const { data } = await supabase
        .from('events')
        .select('id, title, slug, type, start_time, location, is_virtual')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .gte('end_time', new Date().toISOString())
        .order('start_time')
        .limit(tab === 'all' ? 5 : 20)
      events = data ?? []
    }
  }

  return (
    <SearchInterface
      initialQuery={query}
      currentTab={tab}
      results={{ people, projects, posts, events }}
      currentUserId={user.id}
    />
  )
}
