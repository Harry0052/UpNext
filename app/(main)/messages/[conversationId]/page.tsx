import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatView } from './chat-view'

export const metadata: Metadata = {
  title: 'Chat',
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  // Verify user is a participant
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('conversation_id', conversationId)
    .eq('user_id', authUser.id)
    .single()

  if (!participant) {
    notFound()
  }

  // Fetch conversation details
  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, type, project_id, created_at, updated_at')
    .eq('id', conversationId)
    .single()

  if (!conversation) {
    notFound()
  }

  // Fetch participants with user info
  const { data: participants } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id, last_read_at, joined_at, user:users(id, handle, display_name, avatar_url)')
    .eq('conversation_id', conversationId)

  const otherParticipants = participants?.filter(
    (p) => p.user_id !== authUser.id
  ) ?? []

  // Determine display name/avatar
  let conversationName: string
  let conversationAvatar: string | null = null

  if (conversation.type === 'dm' && otherParticipants.length > 0) {
    const otherUser = otherParticipants[0].user as any
    conversationName = otherUser?.display_name ?? 'Unknown'
    conversationAvatar = otherUser?.avatar_url ?? null
  } else if (conversation.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('name, logo_url')
      .eq('id', conversation.project_id)
      .single()
    conversationName = project?.name ?? 'Group Chat'
    conversationAvatar = project?.logo_url ?? null
  } else {
    conversationName = 'Group Chat'
  }

  // Fetch initial messages
  const { data: messages } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, type, media_url, created_at, sender:users(id, handle, display_name, avatar_url)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100)

  const formattedMessages = messages?.map((m) => ({
    id: m.id,
    conversation_id: m.conversation_id,
    sender_id: m.sender_id,
    content: m.content,
    type: m.type,
    media_url: m.media_url,
    created_at: m.created_at,
    sender: m.sender as any,
  })) ?? []

  return (
    <ChatView
      conversationId={conversationId}
      conversationName={conversationName}
      conversationAvatar={conversationAvatar}
      currentUserId={authUser.id}
      initialMessages={formattedMessages}
    />
  )
}
