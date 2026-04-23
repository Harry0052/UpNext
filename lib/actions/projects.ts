'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createProjectSchema, updateProjectSchema } from '@/lib/validations'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createProject(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const rawData = {
    name: formData.get('name') as string,
    tagline: formData.get('tagline') as string,
    description: formData.get('description') as string,
    stage: formData.get('stage') as string,
    website_url: formData.get('website_url') as string,
    tags: formData.getAll('tags') as string[],
  }

  const parsed = createProjectSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Get user's campus
  const { data: profile } = await supabase
    .from('users')
    .select('campus_id')
    .eq('id', user.id)
    .single()

  let slug = slugify(parsed.data.name)
  // Check for slug collision
  const { data: existingSlug } = await supabase
    .from('projects')
    .select('slug')
    .eq('slug', slug)
    .single()

  if (existingSlug) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      name: parsed.data.name,
      slug,
      tagline: parsed.data.tagline,
      description: parsed.data.description || null,
      stage: parsed.data.stage,
      campus_id: profile?.campus_id || null,
      website_url: parsed.data.website_url || null,
      created_by: user.id,
    })
    .select('id, slug')
    .single()

  if (error) return { error: error.message }

  // Add creator as team member
  await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: user.id,
    role: 'Founder',
  })

  // Add tags
  if (parsed.data.tags && parsed.data.tags.length > 0) {
    await supabase.from('project_tags').insert(
      parsed.data.tags.map((tag) => ({ project_id: project.id, tag }))
    )
  }

  // Create project group conversation
  await supabase.from('conversations').insert({
    type: 'project',
    project_id: project.id,
  }).select('id').single().then(async ({ data: conv }) => {
    if (conv) {
      await supabase.from('conversation_participants').insert({
        conversation_id: conv.id,
        user_id: user.id,
      })
    }
  })

  revalidatePath('/projects')
  redirect(`/projects/${project.slug}`)
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify membership
  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!member) return { error: 'Not a team member' }

  const rawData: Record<string, unknown> = {}
  const fields = ['name', 'tagline', 'description', 'stage', 'website_url']
  for (const field of fields) {
    const value = formData.get(field)
    if (value !== null) rawData[field] = value
  }

  const parsed = updateProjectSchema.safeParse(rawData)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase
    .from('projects')
    .update(parsed.data)
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return { success: true }
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if current user is project creator
  const { data: project } = await supabase
    .from('projects')
    .select('created_by')
    .eq('id', projectId)
    .single()

  if (project?.created_by !== user.id) {
    return { error: 'Only the project creator can add members' }
  }

  const { error } = await supabase.from('project_members').insert({
    project_id: projectId,
    user_id: userId,
    role,
  })

  if (error) return { error: error.message }

  // Add to project conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('project_id', projectId)
    .eq('type', 'project')
    .single()

  if (conv) {
    await supabase.from('conversation_participants').insert({
      conversation_id: conv.id,
      user_id: userId,
    })
  }

  // Notify
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'invite',
    title: 'You were added to a project!',
    actor_id: user.id,
    resource_type: 'project',
    resource_id: projectId,
  })

  revalidatePath(`/projects`)
  return { success: true }
}

export async function addMilestone(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .single()

  if (!member) return { error: 'Not a team member' }

  const { error } = await supabase.from('project_milestones').insert({
    project_id: projectId,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    target_date: (formData.get('target_date') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/projects`)
  return { success: true }
}

export async function toggleMilestoneComplete(milestoneId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: milestone } = await supabase
    .from('project_milestones')
    .select('completed_at, project_id')
    .eq('id', milestoneId)
    .single()

  if (!milestone) return { error: 'Not found' }

  // Verify membership
  const { data: member } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', milestone.project_id)
    .eq('user_id', user.id)
    .single()

  if (!member) return { error: 'Not a team member' }

  await supabase
    .from('project_milestones')
    .update({
      completed_at: milestone.completed_at ? null : new Date().toISOString(),
    })
    .eq('id', milestoneId)

  revalidatePath('/projects')
  return { success: true }
}

export async function addRoleNeeded(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('project_roles_needed').insert({
    project_id: projectId,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/projects')
  return { success: true }
}
