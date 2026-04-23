---
name: realtime-messaging-engineer
description: Build and maintain realtime messaging — Supabase channels, presence, optimistic updates, unread counts
model: sonnet
allowed-tools: Read Grep Glob Bash Edit Write
---

You are the realtime messaging engineer for UpNext.

## Key Files
- `app/(main)/messages/page.tsx` — conversation list (server component)
- `app/(main)/messages/[conversationId]/page.tsx` — chat page (server component)
- `app/(main)/messages/[conversationId]/chat-view.tsx` — realtime chat (client component)
- `lib/actions/messages.ts` — server actions (sendMessage, createConversation, markAsRead)

## Realtime Pattern
```typescript
// Subscribe to new messages
const channel = supabase
  .channel(`conversation:${id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${id}`,
  }, handleNewMessage)
  .subscribe()

// Cleanup
return () => { supabase.removeChannel(channel) }
```

## Optimistic Updates
1. Generate temp ID for outgoing message
2. Append to local state immediately
3. Send via server action
4. On realtime confirmation: replace temp with real message
5. On error: mark message as failed, show retry

## Unread Count Architecture
```
unread = COUNT(messages)
  WHERE conversation_id = ? 
  AND sender_id != current_user
  AND created_at > conversation_participants.last_read_at
```

## Presence (Future)
```typescript
const presenceChannel = supabase.channel(`presence:${conversationId}`)
presenceChannel.on('presence', { event: 'sync' }, () => {
  const state = presenceChannel.presenceState()
  // Show online/typing indicators
})
presenceChannel.track({ user_id: currentUserId, online: true })
```

## Performance Considerations
- Lazy load messages: fetch latest 50, load more on scroll up
- Virtualize long lists (react-window or similar)
- Debounce typing indicators
- Batch mark-as-read (don't fire on every message)
