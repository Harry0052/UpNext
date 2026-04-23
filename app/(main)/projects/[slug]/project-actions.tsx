'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { addMilestone, addRoleNeeded } from '@/lib/actions/projects'
import { raiseHand } from '@/lib/actions/social'
import { SKILLS } from '@/lib/constants'
import { toast } from 'sonner'
import { Loader2, Plus, Hand } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectActionsProps {
  projectId: string
  isMember: boolean
  variant: 'raise-hand' | 'add-milestone' | 'add-role'
}

export function ProjectActions({
  projectId,
  isMember,
  variant,
}: ProjectActionsProps) {
  if (variant === 'raise-hand') {
    return <RaiseHandDialog projectId={projectId} />
  }
  if (variant === 'add-milestone') {
    return <AddMilestoneDialog projectId={projectId} />
  }
  if (variant === 'add-role') {
    return <AddRoleDialog projectId={projectId} />
  }
  return null
}

function RaiseHandDialog({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 5
          ? [...prev, skill]
          : prev
    )
  }

  async function handleSubmit() {
    if (selectedSkills.length === 0) {
      toast.error('Select at least one skill')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.set('project_id', projectId)
    if (message) formData.set('message', message)
    for (const skill of selectedSkills) {
      formData.append('skills', skill)
    }

    const result = await raiseHand(formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Your hand has been raised!')
      setOpen(false)
      setMessage('')
      setSelectedSkills([])
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>
          <Hand className="mr-1.5 h-4 w-4" />
          Raise Hand
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise Your Hand</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>What skills can you contribute?</Label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {SKILLS.map((skill) => (
                <Badge
                  key={skill}
                  variant={
                    selectedSkills.includes(skill) ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rh-message">Message (optional)</Label>
            <Textarea
              id="rh-message"
              placeholder="Tell the team why you want to join..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddMilestoneDialog({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await addMilestone(projectId, formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Milestone added!')
      setOpen(false)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Milestone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="ms-title">Title</Label>
            <Input
              id="ms-title"
              name="title"
              placeholder="Launch MVP"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ms-desc">Description (optional)</Label>
            <Textarea
              id="ms-desc"
              name="description"
              placeholder="What does this milestone entail?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ms-date">Target Date (optional)</Label>
            <Input id="ms-date" name="target_date" type="date" />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Milestone
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddRoleDialog({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await addRoleNeeded(projectId, formData)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Role added!')
      setOpen(false)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Role Needed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="role-title">Role Title</Label>
            <Input
              id="role-title"
              name="title"
              placeholder="Frontend Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-desc">Description (optional)</Label>
            <Textarea
              id="role-desc"
              name="description"
              placeholder="What will this person work on?"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Role
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
