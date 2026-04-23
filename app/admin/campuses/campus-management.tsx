'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, GraduationCap, Users } from 'lucide-react'

interface CampusManagementProps {
  campuses: (any & { user_count: number })[]
}

export function CampusManagement({ campuses }: CampusManagementProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [location, setLocation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAddCampus(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !domain) return

    setIsSubmitting(true)
    const supabase = createClient()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { error } = await supabase.from('campuses').insert({
      name,
      slug,
      domain,
      location: location || null,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Campus added')
      setName('')
      setDomain('')
      setLocation('')
      setIsOpen(false)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4" />
              Add Campus
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Campus</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCampus} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">University Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Stanford University"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Email Domain</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="stanford.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Stanford, CA"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Add Campus
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {campuses.map((campus) => (
          <Card key={campus.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{campus.name}</h3>
                  <p className="text-sm text-muted-foreground">{campus.domain}</p>
                  {campus.location && (
                    <p className="text-xs text-muted-foreground mt-0.5">{campus.location}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {campus.user_count} members
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
