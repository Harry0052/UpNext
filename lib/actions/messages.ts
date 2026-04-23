'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendMessageSchema } from '@/lib/validations'

export async function sendMessage(conversationId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify the user is a participant
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participant) return { error: 'Not a participant in this conversation' }

  const parsed = sendMessageSchema.safeParse({
    content: formData.get('content'),
    type: formData.get('type') || 'text',
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: parsed.data.content,
      type: parsed.data.type,
    })
    .select('id, content, type, sender_id, created_at')
    .single()

  if (error) return { error: error.message }

  // Update the conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)

  revalidatePath('/messages')
  revalidatePath(`/messages/${conversationId}`)
  return { data: message }
}

export async function createConversation(otherUserId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  if (user.id === otherUserId) {
    return { error: 'Cannot start a conversation with yourself' }
  }

  // Check if a DM conversation already exists between these two users
  const { data: existingConversations } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id)

  if (existingConversations && existingConversations.length > 0) {
    const conversationIds = existingConversations.map((c) => c.conversation_id)

    const { data: sharedConversation } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations:conversation_id(id, type)')
      .eq('user_id', otherUserId)
      .in('conversation_id', conversationIds)

    const existingDM = sharedConversation?.find(
      (sc) => {
        const conv = sc.conversations as unknown as { id: string; type: string }
        return conv?.type === 'dm'
      }
    )

    if (existingDM) {
      return { data: { id: existingDM.conversation_id } }
    }
  }

  // Create a new DM conversation
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({ type: 'dm' })
    .select('id')
    .single()

  if (convError) return { error: convError.message }

  // Add both participants
  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert([
      { conversation_id: conversation.id, user_id: user.id },
      { conversation_id: conversation.id, user_id: otherUserId },
    ])

  if (partError) return { error: partError.message }

  revalidatePath('/messages')
  return { data: { id: conversation.id } }
}

export async function markAsRead(conversationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/messages')
  return { success: true }
}
