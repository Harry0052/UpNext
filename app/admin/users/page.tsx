import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { UserManagement } from './user-management'

export const metadata: Metadata = {
  title: 'User Management — Admin',
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const params = await searchParams
  const query = params.q || ''
  const page = parseInt(params.page || '1')
  const limit = 25
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let dbQuery = supabase
    .from('users')
    .select('*, campus:campuses(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (query) {
    dbQuery = dbQuery.or(
      `display_name.ilike.%${query}%,handle.ilike.%${query}%`
    )
  }

  const { data: users, count } = await dbQuery

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      <UserManagement
        users={users ?? []}
        totalCount={count ?? 0}
        currentPage={page}
        pageSize={limit}
        query={query}
      />
    </div>
  )
}
