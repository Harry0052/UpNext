'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPostSchema, createCommentSchema, reactionSchema } from '@/lib/validations'
import { z } from 'zod'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawData = {
    type: formData.get('type') as string,
    content: formData.get('content') as string,
    project_id: (formData.get('project_id') as string) || null,
  }

  const parsed = createPostSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      type: parsed.data.type,
      content: parsed.data.content,
      project_id: parsed.data.project_id,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  // Handle media uploads
  const mediaUrls = formData.getAll('media_urls') as string[]
  const mediaTypes = formData.getAll('media_types') as string[]

  if (mediaUrls.length > 0) {
    const mediaInserts = mediaUrls.map((url, i) => ({
      post_id: post.id,
      url,
      type: mediaTypes[i] || 'image',
      sort_order: i,
    }))

    await supabase.from('post_media').insert(mediaInserts)
  }

  revalidatePath('/feed')
  revalidatePath('/explore')
  return { data: post }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('posts')
    .update({ is_removed: true })
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/feed')
  return { success: true }
}

export async function toggleReaction(postId: string, reactionType: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const parsed = reactionSchema.safeParse({ type: reactionType })
  if (!parsed.success) return { error: 'Invalid reaction type' }

  // Check if reaction exists
  const { data: existing } = await supabase
    .from('post_reactions')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .eq('type', parsed.data.type)
    .single()

  if (existing) {
    await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('type', parsed.data.type)
  } else {
    await supabase.from('post_reactions').insert({
      post_id: postId,
      user_id: user.id,
      type: parsed.data.type,
    })
  }

  revalidatePath('/feed')
  return { success: true }
}

export async function createComment(postId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const parsed = createCommentSchema.safeParse({
    content: formData.get('content'),
    parent_id: formData.get('parent_id') || null,
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: user.id,
    content: parsed.data.content,
    parent_id: parsed.data.parent_id,
  })

  if (error) return { error: error.message }

  revalidatePath(`/post/${postId}`)
  revalidatePath('/feed')
  return { success: true }
}

export async function toggleSavePost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('saved_posts')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
  } else {
    await supabase.from('saved_posts').insert({
      post_id: postId,
      user_id: user.id,
    })
  }

  revalidatePath('/feed')
  return { success: true }
}

export async function toggleRepost(postId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: existing } = await supabase
    .from('reposts')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase
      .from('reposts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
  } else {
    await supabase.from('reposts').insert({
      post_id: postId,
      user_id: user.id,
    })
  }

  revalidatePath('/feed')
  return { success: true }
}

export async function reportContent(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    resource_type: formData.get('resource_type') as string,
    resource_id: formData.get('resource_id') as string,
    reason: formData.get('reason') as string,
    details: (formData.get('details') as string) || null,
  })

  if (error) return { error: error.message }

  return { success: true }
}
