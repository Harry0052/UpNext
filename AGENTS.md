<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UpNext Agent Rules

## Critical Conventions
- **Next.js 16**: uses `proxy.ts` (not middleware.ts), `params` and `searchParams` are async
- **Server components default**: only add `'use client'` for interactivity
- **Server actions for mutations**: `lib/actions/` with Zod validation
- **RLS on every table**: no exceptions, use `auth.uid()` in policies
- **Validate with Zod**: every form input validated on both client and server

## Available Skills
Use `/skill-name` to invoke: product-architect, nextjs-app-router, supabase-rls, social-graph, feed-ranking, messaging-realtime, moderation-safety, growth-analytics, qa-playwright, release-hardening.

## Available Subagents
architect, frontend-designer, backend-builder, db-rls-guardian, search-ranking-engineer, realtime-messaging-engineer, qa-systems, growth-ops.

## Active Hooks
- **PostToolUse (Edit/Write .ts/.tsx)**: lint check
- **PostToolUse (Edit/Write .sql)**: RLS enforcement (blocks if missing)
- **PostToolUse (Edit/Write arch files)**: docs update reminder
