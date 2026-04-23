'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface FeatureFlagManagerProps {
  flags: any[]
}

export function FeatureFlagManager({ flags }: FeatureFlagManagerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [key, setKey] = useState('')
  const [description, setDescription] = useState('')

  async function handleToggle(flagId: string, currentValue: boolean) {
    const supabase = createClient()
    const { error } = await supabase
      .from('feature_flags')
      .update({ is_enabled: !currentValue })
      .eq('id', flagId)

    if (error) toast.error(error.message)
    else router.refresh()
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!key || !description) return

    const supabase = createClient()
    const { error } = await supabase.from('feature_flags').insert({
      key,
      description,
    })

    if (error) toast.error(error.message)
    else {
      toast.success('Flag created')
      setKey('')
      setDescription('')
      setIsOpen(false)
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4" />
              Add Flag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Key</Label>
                <Input
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. org_seats"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this flag control?"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border divide-y">
        {flags.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No feature flags yet
          </div>
        ) : (
          flags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-mono text-sm font-medium">{flag.key}</p>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
              <Switch
                checked={flag.is_enabled}
                onCheckedChange={() => handleToggle(flag.id, flag.is_enabled)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
