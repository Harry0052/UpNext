'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/user-avatar'
import { RoleBadge } from '@/components/role-badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Search, Shield, ShieldOff, Ban } from 'lucide-react'

interface UserManagementProps {
  users: any[]
  totalCount: number
  currentPage: number
  pageSize: number
  query: string
}

export function UserManagement({
  users,
  totalCount,
  currentPage,
  pageSize,
  query,
}: UserManagementProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(query)
  const totalPages = Math.ceil(totalCount / pageSize)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/admin/users?q=${encodeURIComponent(searchQuery)}`)
  }

  async function toggleAdmin(userId: string, isAdmin: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ is_admin: !isAdmin })
      .eq('id', userId)

    if (error) toast.error(error.message)
    else {
      toast.success(isAdmin ? 'Admin removed' : 'Admin granted')
      router.refresh()
    }
  }

  async function toggleAmbassador(userId: string, isAmbassador: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('users')
      .update({ is_ambassador: !isAmbassador })
      .eq('id', userId)

    if (error) toast.error(error.message)
    else {
      toast.success(isAmbassador ? 'Ambassador removed' : 'Ambassador granted')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <p className="text-sm text-muted-foreground">{totalCount} users total</p>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Campus</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={user.avatar_url} name={user.display_name} size="sm" />
                    <div>
                      <p className="font-medium text-sm">{user.display_name}</p>
                      <p className="text-xs text-muted-foreground">@{user.handle}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="p-3 text-sm text-muted-foreground">
                  {user.campus?.name || '—'}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {user.is_admin && (
                      <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                        Admin
                      </Badge>
                    )}
                    {user.is_ambassador && (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                        Ambassador
                      </Badge>
                    )}
                    {user.is_verified && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Verified
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Button
                      size="icon-xs"
                      variant={user.is_admin ? 'destructive' : 'ghost'}
                      onClick={() => toggleAdmin(user.id, user.is_admin)}
                      title={user.is_admin ? 'Remove admin' : 'Make admin'}
                    >
                      {user.is_admin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={() => toggleAmbassador(user.id, user.is_ambassador)}
                      title={user.is_ambassador ? 'Remove ambassador' : 'Make ambassador'}
                    >
                      <span className="text-xs">🎓</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => router.push(`/admin/users?q=${query}&page=${currentPage - 1}`)}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => router.push(`/admin/users?q=${query}&page=${currentPage + 1}`)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
