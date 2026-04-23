---
name: messaging-realtime
description: Build realtime messaging features using Supabase Realtime channels, presence, and optimistic updates
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# Realtime Messaging for UpNext

## Architecture
- **Server**: conversations, participants, messages stored in Postgres with RLS
- **Client**: Supabase Realtime subscription per active conversation
- **Actions**: `lib/actions/messages.ts` — sendMessage, createConversation, markAsRead

## Data Flow

### Sending a Message
1. User types message and clicks send
2. Optimistic: append message to local state immediately
3. Call `sendMessage` server action → inserts into `messages` table
4. Supabase Realtime broadcasts to all participants
5. Other participants receive via `postgres_changes` subscription

### Receiving a Message
```typescript
// In chat-view.tsx (client component)
supabase
  .channel(`conversation:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    const newMessage = payload.new as any
    if (newMessage.sender_id !== currentUserId) {
      // Fetch full message with sender details
      // Append to local state
      // Auto-scroll to bottom
      // Mark as read
    }
  })
  .subscribe()
```

## Unread Counts
- `conversation_participants.last_read_at` tracks when user last viewed the conversation
- Unread = messages where `created_at > last_read_at` AND `sender_id != user_id`
- Main layout fetches total unread via RPC: `get_unread_message_count`
- Badge shown in sidebar and mobile nav

## Conversation Types
| Type | Creation | Members |
|------|----------|---------|
| `direct` | When user sends first DM | Exactly 2 users |
| `project` | Auto-created with project | All project members, updated on member add |

## Message Types
| Type | Content | Media |
|------|---------|-------|
| `text` | Message body | null |
| `image` | Caption | media_url |
| `system` | "X joined the project" | null |

## UI Patterns
- Messages grouped by date (Today, Yesterday, date)
- Own messages: right-aligned, primary color
- Others' messages: left-aligned, with avatar and name
- Auto-scroll to bottom on new messages
- Scroll-to-bottom button when scrolled up
