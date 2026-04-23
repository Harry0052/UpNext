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
import { createProjectSchema, type CreateProjectInput } from '@/lib/validations'
import { PROJECT_STAGES, PROJECT_STAGE_LABELS, INTERESTS } from '@/lib/constants'
import { createProject } from '@/lib/actions/projects'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'

const COMMON_TAGS = INTERESTS

export function CreateProjectForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      tagline: '',
      description: '',
      stage: 'idea',
      website_url: '',
      tags: [],
    },
  })

  const selectedTags = watch('tags') ?? []
  const selectedStage = watch('stage')

  function toggleTag(tag: string) {
    const current = selectedTags
    if (current.includes(tag)) {
      setValue(
        'tags',
        current.filter((t) => t !== tag),
        { shouldValidate: true }
      )
    } else if (current.length < 10) {
      setValue('tags', [...current, tag], { shouldValidate: true })
    }
  }

  async function onSubmit(data: CreateProjectInput) {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.set('name', data.name)
    formData.set('tagline', data.tagline)
    if (data.description) formData.set('description', data.description)
    formData.set('stage', data.stage)
    if (data.website_url) formData.set('website_url', data.website_url)
    if (data.tags) {
      for (const tag of data.tags) {
        formData.append('tags', tag)
      }
    }

    const result = await createProject(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsSubmitting(false)
    }
    // On success, the server action redirects to /projects/[slug]
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          placeholder="My Awesome Project"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Tagline */}
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          placeholder="A short description of your project"
          {...register('tagline')}
        />
        {errors.tagline && (
          <p className="text-sm text-destructive">{errors.tagline.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Tell people more about your project..."
          rows={5}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Stage */}
      <div className="space-y-2">
        <Label>Stage</Label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_STAGES.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => setValue('stage', stage, { shouldValidate: true })}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                selectedStage === stage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted'
              )}
            >
              {PROJECT_STAGE_LABELS[stage]}
            </button>
          ))}
        </div>
        {errors.stage && (
          <p className="text-sm text-destructive">{errors.stage.message}</p>
        )}
      </div>

      {/* Website URL */}
      <div className="space-y-2">
        <Label htmlFor="website_url">Website URL (optional)</Label>
        <Input
          id="website_url"
          type="url"
          placeholder="https://myproject.com"
          {...register('website_url')}
        />
        {errors.website_url && (
          <p className="text-sm text-destructive">
            {errors.website_url.message}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags (up to 10)</Label>
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="default"
                className="cursor-pointer"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {COMMON_TAGS.filter((tag) => !selectedTags.includes(tag)).map(
            (tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            )
          )}
        </div>
        {errors.tags && (
          <p className="text-sm text-destructive">{errors.tags.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Project
      </Button>
    </form>
  )
}
