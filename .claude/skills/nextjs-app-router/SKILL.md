---
name: nextjs-app-router
description: Write Next.js 16 App Router code following UpNext conventions — proxy.ts, async params, server components, server actions
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# Next.js 16 App Router Patterns for UpNext

## Critical: Next.js 16 Breaking Changes

### proxy.ts (not middleware.ts)
```typescript
// proxy.ts at project root
export async function proxy(request: NextRequest) { ... }
export const proxyConfig = { matcher: [...] }
```

### Async params and searchParams
```typescript
// CORRECT — Next.js 16
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams
}
```

## Server Components (Default)
Every page.tsx and layout.tsx is a server component unless it has `'use client'`.

```typescript
// app/(main)/projects/page.tsx — server component
import { createClient } from '@/lib/supabase/server'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('projects').select('*')
  return <div>{/* render data */}</div>
}
```

## Client Components (Only When Needed)
Add `'use client'` ONLY for: forms, event handlers, hooks, browser APIs, realtime subscriptions.

```typescript
// app/(main)/feed/feed-filters.tsx — client component
'use client'
import { useRouter, useSearchParams } from 'next/navigation'
```

## Server Actions
All mutations go through server actions in `lib/actions/`:

```typescript
// lib/actions/posts.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPostSchema } from '@/lib/validations'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = createPostSchema.safeParse({...})
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  // ... mutation ...
  revalidatePath('/feed')
  return { data: result }
}
```

## Layout Hierarchy
```
app/layout.tsx         — root (metadata, fonts, providers, ThemeProvider)
app/(auth)/layout.tsx  — auth pages (split panel, logo)
app/(main)/layout.tsx  — authenticated shell (sidebar, mobile nav, auth check)
app/admin/layout.tsx   — admin (admin check, admin sidebar)
```

## Route Handlers
Only for: file uploads, webhooks, streaming, OAuth callbacks.
```typescript
// app/api/upload/route.ts
export async function POST(request: Request) { ... }
```

## File Naming
- Pages: `page.tsx` (always)
- Layouts: `layout.tsx`
- Client components: `kebab-case.tsx` in the same route directory
- Shared components: `components/kebab-case.tsx`

## Import Order
1. React/Next.js (`import { useState } from 'react'`)
2. External libraries (`import { formatDistanceToNow } from 'date-fns'`)
3. Internal components (`import { Button } from '@/components/ui/button'`)
4. Internal lib (`import { createClient } from '@/lib/supabase/server'`)
5. Types (`import type { PostWithAuthor } from '@/types/database'`)
