'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage, markAsRead } from '@/lib/actions/messages'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send } from 'lucide-react'
import { toast } from 'sonner'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'
import Link from 'next/link'

interface MessageWithSender {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  type: string
  media_url: string | null
  created_at: string
  sender: {
    id: string
    handle: string
    display_name: string
    avatar_url: string | null
  }
}

interface ChatViewProps {
  conversationId: string
  conversationName: string
  conversationAvatar: string | null
  currentUserId: string
  initialMessages: MessageWithSender[]
}

function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMMM d, yyyy')
}

export function ChatView({
  conversationId,
  conversationName,
  conversationAvatar,
  currentUserId,
  initialMessages,
}: ChatViewProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark as read on mount
  useEffect(() => {
    markAsRead(conversationId)
  }, [conversationId])

  // Subscribe to realtime messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any

          // Don't add if we already have it (from optimistic update)
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev

            // Fetch sender info
            // For realtime messages, we need to get sender details
            return prev
          })

          // Fetch the full message with sender info
          const { data: fullMessage } = await supabase
            .from('messages')
            .select('id, conversation_id, sender_id, content, type, media_url, created_at, sender:users(id, handle, display_name, avatar_url)')
            .eq('id', newMessage.id)
            .single()

          if (fullMessage) {
            const formatted: MessageWithSender = {
              id: fullMessage.id,
              conversation_id: fullMessage.conversation_id,
              sender_id: fullMessage.sender_id,
              content: fullMessage.content,
              type: fullMessage.type,
              media_url: fullMessage.media_url,
              created_at: fullMessage.created_at,
              sender: fullMessage.sender as any,
            }

            setMessages((prev) => {
              if (prev.some((m) => m.id === formatted.id)) return prev
              return [...prev, formatted]
            })
          }

          // Mark as read if the message is from someone else
          if (newMessage.sender_id !== currentUserId) {
            markAsRead(conversationId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId])

  const handleSend = () => {
    const content = inputValue.trim()
    if (!content) return

    setInputValue('')

    startTransition(async () => {
      const formData = new FormData()
      formData.set('content', content)
      formData.set('type', 'text')

      const result = await sendMessage(conversationId, formData)
      if (result.error) {
        toast.error(result.error)
        setInputValue(content) // Restore input on error
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const groupedMessages: { date: Date; messages: MessageWithSender[] }[] = []
  messages.forEach((message) => {
    const messageDate = new Date(message.created_at)
    const lastGroup = groupedMessages[groupedMessages.length - 1]

    if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
      lastGroup.messages.push(message)
    } else {
      groupedMessages.push({ date: messageDate, messages: [message] })
    }
  })

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" className="lg:hidden" asChild>
          <Link href="/messages">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <UserAvatar
          src={conversationAvatar}
          name={conversationName}
          size="md"
        />
        <div className="min-w-0">
          <h2 className="font-semibold truncate">{conversationName}</h2>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-6"
      >
        {groupedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* Date separator */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground font-medium">
                  {formatDateSeparator(group.date)}
                </span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Messages in this group */}
              <div className="space-y-3">
                {group.messages.map((message) => {
                  const isOwn = message.sender_id === currentUserId

                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      {!isOwn && (
                        <UserAvatar
                          src={message.sender?.avatar_url}
                          name={message.sender?.display_name ?? 'Unknown'}
                          size="sm"
                        />
                      )}

                      <div
                        className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}
                      >
                        {!isOwn && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {message.sender?.display_name ?? 'Unknown'}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {format(new Date(message.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isPending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!inputValue.trim() || isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
