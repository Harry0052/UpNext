'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/logo'
import { onboardingSchema, type OnboardingInput } from '@/lib/validations'
import { ROLES, ROLE_LABELS, SKILLS, INTERESTS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingWizardProps {
  userId: string
  userEmail: string
  campuses: { id: string; name: string; slug: string; domain: string }[]
}

const STEPS = ['basics', 'role', 'building', 'skills'] as const

export function OnboardingWizard({ userId, userEmail, campuses }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Try to auto-detect campus from email domain
  const emailDomain = userEmail.split('@')[1]
  const detectedCampus = campuses.find((c) => emailDomain?.endsWith(c.domain))

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      handle: userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_'),
      display_name: '',
      role: 'founder',
      campus_id: detectedCampus?.id ?? '',
      graduation_year: new Date().getFullYear() + 2,
      major: '',
      bio: '',
      building_description: '',
      skills: [],
      interests: [],
    },
  })

  const selectedSkills = watch('skills')
  const selectedInterests = watch('interests')
  const selectedRole = watch('role')

  function toggleSkill(skill: string) {
    const current = selectedSkills || []
    if (current.includes(skill)) {
      setValue('skills', current.filter((s) => s !== skill))
    } else if (current.length < 10) {
      setValue('skills', [...current, skill])
    }
  }

  function toggleInterest(interest: string) {
    const current = selectedInterests || []
    if (current.includes(interest)) {
      setValue('interests', current.filter((i) => i !== interest))
    } else if (current.length < 10) {
      setValue('interests', [...current, interest])
    }
  }

  async function nextStep() {
    const fieldsToValidate: Record<number, (keyof OnboardingInput)[]> = {
      0: ['handle', 'display_name', 'campus_id', 'graduation_year'],
      1: ['role'],
      2: ['building_description'],
      3: ['skills', 'interests'],
    }

    const isValid = await trigger(fieldsToValidate[step])
    if (isValid && step < STEPS.length - 1) {
      setStep(step + 1)
    }
  }

  async function onSubmit(data: OnboardingInput) {
    setIsSubmitting(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('users')
      .update({
        handle: data.handle,
        display_name: data.display_name,
        role: data.role,
        campus_id: data.campus_id,
        graduation_year: data.graduation_year,
        major: data.major || null,
        bio: data.bio || null,
        building_description: data.building_description,
        onboarding_completed: true,
      })
      .eq('id', userId)

    if (error) {
      toast.error(error.message)
      setIsSubmitting(false)
      return
    }

    // Save skills
    if (data.skills.length > 0) {
      await supabase.from('user_skills').insert(
        data.skills.map((skill) => ({ user_id: userId, skill }))
      )
    }

    // Save interests
    if (data.interests.length > 0) {
      await supabase.from('user_interests').insert(
        data.interests.map((interest) => ({ user_id: userId, interest }))
      )
    }

    toast.success('Welcome to UpNext!')
    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <Logo className="justify-center" />
        <h1 className="text-2xl font-bold mt-4">Set up your profile</h1>
        <p className="text-muted-foreground">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= step ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basics */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">The basics</h2>
            <div className="space-y-2">
              <Label htmlFor="display_name">Full Name</Label>
              <Input id="display_name" placeholder="Your name" {...register('display_name')} />
              {errors.display_name && (
                <p className="text-sm text-destructive">{errors.display_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="handle">Handle</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input id="handle" className="pl-7" placeholder="yourhandle" {...register('handle')} />
              </div>
              {errors.handle && (
                <p className="text-sm text-destructive">{errors.handle.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="campus_id">School</Label>
              <select
                id="campus_id"
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('campus_id')}
              >
                <option value="">Select your school</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
              {errors.campus_id && (
                <p className="text-sm text-destructive">{errors.campus_id.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduation_year">Graduation Year</Label>
                <Input
                  id="graduation_year"
                  type="number"
                  min={2020}
                  max={2035}
                  {...register('graduation_year', { valueAsNumber: true })}
                />
                {errors.graduation_year && (
                  <p className="text-sm text-destructive">{errors.graduation_year.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major (optional)</Label>
                <Input id="major" placeholder="e.g. Computer Science" {...register('major')} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Role */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">What best describes you?</h2>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue('role', role)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                    selectedRole === role
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <div className="flex-1">
                    <p className="font-medium">{ROLE_LABELS[role]}</p>
                  </div>
                  {selectedRole === role && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Building */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">What are you building?</h2>
            <p className="text-sm text-muted-foreground">
              Tell the community about your current project, startup, or what you want to build.
            </p>
            <div className="space-y-2">
              <Label htmlFor="building_description">What you&apos;re building</Label>
              <Textarea
                id="building_description"
                placeholder="I'm building an AI tool for students to..."
                rows={4}
                {...register('building_description')}
              />
              {errors.building_description && (
                <p className="text-sm text-destructive">{errors.building_description.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="A quick intro about yourself"
                rows={2}
                maxLength={280}
                {...register('bio')}
              />
            </div>
          </div>
        )}

        {/* Step 4: Skills & Interests */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Your skills</h2>
              <p className="text-sm text-muted-foreground">
                Select up to 10 skills ({selectedSkills?.length ?? 0}/10)
              </p>
              {errors.skills && (
                <p className="text-sm text-destructive">{errors.skills.message}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills?.includes(skill) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedSkills?.includes(skill)
                        ? 'bg-primary hover:bg-primary/80'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Your interests</h2>
              <p className="text-sm text-muted-foreground">
                Select up to 10 interests ({selectedInterests?.length ?? 0}/10)
              </p>
              {errors.interests && (
                <p className="text-sm text-destructive">{errors.interests.message}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests?.includes(interest) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-all',
                      selectedInterests?.includes(interest)
                        ? 'bg-primary hover:bg-primary/80'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-8">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Launch Profile
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
