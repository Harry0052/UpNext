'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations'
import { ROLES, ROLE_LABELS, SKILLS, INTERESTS, MAX_BIO_LENGTH } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, User, Bell, Shield, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User as UserType } from '@/types/database'

interface SettingsFormProps {
  user: UserType
  skills: string[]
  interests: string[]
  campuses: { id: string; name: string }[]
}

export function SettingsForm({ user, skills: initialSkills, interests: initialInterests, campuses }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initialInterests)
  const [emailNotifications, setEmailNotifications] = useState(
    (user.notification_preferences as any)?.email_notifications ?? true
  )
  const [emailDigest, setEmailDigest] = useState(
    (user.notification_preferences as any)?.email_digest ?? 'weekly'
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      display_name: user.display_name,
      handle: user.handle,
      bio: user.bio || '',
      role: user.role as any,
      major: user.major || '',
      graduation_year: user.graduation_year || undefined,
      building_description: user.building_description || '',
      website_url: user.website_url || '',
      twitter_handle: user.twitter_handle || '',
      github_handle: user.github_handle || '',
      linkedin_url: user.linkedin_url || '',
    },
  })

  async function onSubmit(data: ProfileUpdateInput) {
    setIsLoading(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('users')
      .update({
        ...data,
        bio: data.bio || null,
        major: data.major || null,
        website_url: data.website_url || null,
        twitter_handle: data.twitter_handle || null,
        github_handle: data.github_handle || null,
        linkedin_url: data.linkedin_url || null,
        notification_preferences: {
          email_notifications: emailNotifications,
          email_digest: emailDigest,
        },
      })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }

    // Update skills
    await supabase.from('user_skills').delete().eq('user_id', user.id)
    if (selectedSkills.length > 0) {
      await supabase.from('user_skills').insert(
        selectedSkills.map((skill) => ({ user_id: user.id, skill }))
      )
    }

    // Update interests
    await supabase.from('user_interests').delete().eq('user_id', user.id)
    if (selectedInterests.length > 0) {
      await supabase.from('user_interests').insert(
        selectedInterests.map((interest) => ({ user_id: user.id, interest }))
      )
    }

    toast.success('Settings saved')
    router.refresh()
    setIsLoading(false)
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : prev.length < 10
        ? [...prev, skill]
        : prev
    )
  }

  function toggleInterest(interest: string) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : prev.length < 10
        ? [...prev, interest]
        : prev
    )
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    if (!confirm('Really delete your account and all your data?')) return

    const supabase = createClient()
    // This would need a server action with admin client in production
    toast.error('Account deletion requires contacting support')
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-6">
        <TabsTrigger value="profile" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="account" className="gap-2">
          <Shield className="h-4 w-4" />
          Account
        </TabsTrigger>
      </TabsList>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" {...register('display_name')} />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle">Handle</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input id="handle" className="pl-7" {...register('handle')} />
              </div>
              {errors.handle && (
                <p className="text-sm text-destructive">{errors.handle.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" maxLength={MAX_BIO_LENGTH} {...register('bio')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <select
              id="role"
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              {...register('role')}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="building_description">What you&apos;re building</Label>
            <Textarea id="building_description" {...register('building_description')} />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website_url">Website</Label>
              <Input id="website_url" placeholder="https://" {...register('website_url')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_handle">Twitter</Label>
              <Input id="twitter_handle" placeholder="handle" {...register('twitter_handle')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github_handle">GitHub</Label>
              <Input id="github_handle" placeholder="handle" {...register('github_handle')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input id="linkedin_url" placeholder="https://linkedin.com/in/..." {...register('linkedin_url')} />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Skills ({selectedSkills.length}/10)</Label>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map((skill) => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Interests ({selectedInterests.length}/10)</Label>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  variant={selectedInterests.includes(interest) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive email notifications for important activity
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="space-y-2">
            <Label>Email Digest Frequency</Label>
            <select
              value={emailDigest}
              onChange={(e) => setEmailDigest(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <div className="rounded-lg border border-destructive/20 p-4 space-y-3">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </TabsContent>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Tabs>
  )
}
