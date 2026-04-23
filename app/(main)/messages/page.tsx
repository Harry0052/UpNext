import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { MessageSquarePlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { ConversationWithDetails } from '@/types/database'

export const metadata: Metadata = {
  title: 'Messages',
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  // Fetch conversations with participants and last message
  const { data: participantRows } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', authUser.id)

  const conversationIds = participantRows?.map((p) => p.conversation_id) ?? []

  if (conversationIds.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Messages</h1>
          <Button asChild size="sm">
            <Link href="/messages/new">
              <MessageSquarePlus className="mr-2 h-4 w-4" />
              New Message
            </Link>
          </Button>
        </div>
        <div className="px-4 py-16 text-center">
          <p className="text-lg font-medium">No conversations yet</p>
          <p className="text-muted-foreground mt-1">
            Start a conversation with someone!
          </p>
        </div>
      </div>
    )
  }

  // Fetch full conversation details
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, type, project_id, updated_at, created_at')
    .in('id', conversationIds)
    .order('updated_at', { ascending: false })

  // Fetch all participants for these conversations
  const { data: allParticipants } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id, last_read_at, joined_at, user:users(id, handle, display_name, avatar_url)')
    .in('conversation_id', conversationIds)

  // Fetch the latest message for each conversation
  const { data: latestMessages } = await supabase
    .from('messages')
    .select('id, conversation_id, sender_id, content, type, created_at')
    .in('conversation_id', conversationIds)
    .order('created_at', { ascending: false })

  // Fetch project details for group chats
  const projectIds = conversations
    ?.filter((c) => c.project_id)
    .map((c) => c.project_id!) ?? []

  const { data: projects } = projectIds.length > 0
    ? await supabase
        .from('projects')
        .select('id, name, slug, logo_url')
        .in('id', projectIds)
    : { data: [] }

  // Build conversation list with details
  const conversationList = conversations?.map((conv) => {
    const participants = allParticipants?.filter(
      (p) => p.conversation_id === conv.id
    ) ?? []

    const myParticipant = participants.find((p) => p.user_id === authUser.id)
    const otherParticipants = participants.filter((p) => p.user_id !== authUser.id)

    // Get last message (first one due to desc ordering)
    const lastMessage = latestMessages?.find(
      (m) => m.conversation_id === conv.id
    ) ?? null

    // Count unread messages
    const lastReadAt = myParticipant?.last_read_at
    const unreadCount = lastReadAt
      ? latestMessages?.filter(
          (m) =>
            m.conversation_id === conv.id &&
            m.sender_id !== authUser.id &&
            m.created_at > lastReadAt
        ).length ?? 0
      : latestMessages?.filter(
          (m) =>
            m.conversation_id === conv.id &&
            m.sender_id !== authUser.id
        ).length ?? 0

    const project = projects?.find((p) => p.id === conv.project_id) ?? null

    return {
      ...conv,
      participants,
      otherParticipants,
      lastMessage,
      unreadCount,
      project,
    }
  }) ?? []

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button asChild size="sm">
          <Link href="/messages/new">
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New Message
          </Link>
        </Button>
      </div>

      <div className="divide-y divide-border">
        {conversationList.map((conv) => {
          const otherUser = conv.otherParticipants[0]?.user as any

          const displayName = conv.type === 'dm'
            ? otherUser?.display_name ?? 'Unknown'
            : conv.project?.name ?? 'Group Chat'

          const displayAvatar = conv.type === 'dm'
            ? otherUser?.avatar_url ?? null
            : conv.project?.logo_url ?? null

          return (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <UserAvatar
                src={displayAvatar}
                name={displayName}
                size="md"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-medium truncate ${conv.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'}`}>
                    {displayName}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.lastMessage?.content ?? 'No messages yet'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="ml-2 flex-shrink-0 inline-flex items-center justify-center h-5 min-w-[1.25rem] rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
