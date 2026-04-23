'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === targetUserId) return { error: 'Cannot follow yourself' }

  const { data: existing } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existing) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
  } else {
    await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: targetUserId,
    })

    // Create notification
    await supabase.from('notifications').insert({
      user_id: targetUserId,
      type: 'follow',
      title: 'New follower',
      actor_id: user.id,
      resource_type: 'user',
      resource_id: user.id,
    })
  }

  revalidatePath('/', 'layout')
  return { success: true, isFollowing: !existing }
}

export async function vouchUser(
  voucheeId: string,
  skill: string,
  message?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === voucheeId) return { error: 'Cannot vouch for yourself' }

  const { error } = await supabase.from('vouches').insert({
    voucher_id: user.id,
    vouchee_id: voucheeId,
    skill,
    message: message || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already vouched for this skill' }
    }
    return { error: error.message }
  }

  // Notification
  await supabase.from('notifications').insert({
    user_id: voucheeId,
    type: 'vouch',
    title: 'New vouch',
    actor_id: user.id,
    resource_type: 'user',
    resource_id: voucheeId,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function raiseHand(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const projectId = formData.get('project_id') as string | null
  const postId = formData.get('post_id') as string | null
  const message = formData.get('message') as string
  const skills = formData.getAll('skills') as string[]

  const { error } = await supabase.from('raise_hands').insert({
    user_id: user.id,
    project_id: projectId || null,
    post_id: postId || null,
    message: message || null,
    skills,
  })

  if (error) return { error: error.message }

  // Notify the project owner or post author
  if (projectId) {
    const { data: project } = await supabase
      .from('projects')
      .select('created_by')
      .eq('id', projectId)
      .single()

    if (project) {
      await supabase.from('notifications').insert({
        user_id: project.created_by,
        type: 'raise_hand',
        title: 'Someone wants to help!',
        actor_id: user.id,
        resource_type: 'project',
        resource_id: projectId,
      })
    }
  }

  if (postId) {
    const { data: post } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single()

    if (post) {
      await supabase.from('notifications').insert({
        user_id: post.author_id,
        type: 'raise_hand',
        title: 'Someone raised their hand!',
        actor_id: user.id,
        resource_type: 'post',
        resource_id: postId,
      })
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateRaiseHandStatus(
  raiseHandId: string,
  status: 'accepted' | 'declined'
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: rh } = await supabase
    .from('raise_hands')
    .select('*, projects(created_by), posts(author_id)')
    .eq('id', raiseHandId)
    .single()

  if (!rh) return { error: 'Not found' }

  // Verify ownership
  const isProjectOwner = rh.projects?.created_by === user.id
  const isPostAuthor = rh.posts?.author_id === user.id
  if (!isProjectOwner && !isPostAuthor) {
    return { error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('raise_hands')
    .update({ status })
    .eq('id', raiseHandId)

  if (error) return { error: error.message }

  // Notify the person who raised their hand
  await supabase.from('notifications').insert({
    user_id: rh.user_id,
    type: 'raise_hand',
    title: status === 'accepted' ? 'Your offer was accepted!' : 'Your offer was declined',
    actor_id: user.id,
  })

  revalidatePath('/', 'layout')
  return { success: true }
}
