---
name: supabase-rls
description: Write and audit Supabase RLS policies, indexes, and migrations for UpNext database tables
user-invocable: true
allowed-tools: Read Grep Glob Edit Write Bash
---

# Supabase RLS & Database Patterns for UpNext

## Migration Files
All SQL lives in `supabase/migrations/`. Never modify existing migrations — create new numbered files.
```
supabase/migrations/
├── 00001_initial_schema.sql   # Full initial schema
├── 00002_add_feature.sql      # Subsequent changes
```

## New Table Checklist

Every new table MUST include all of these:

```sql
-- 1. Create table
CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  -- columns...
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable RLS (MANDATORY)
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Public read" ON public.new_table
  FOR SELECT USING (true);

CREATE POLICY "Owner insert" ON public.new_table
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner update" ON public.new_table
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owner delete" ON public.new_table
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Indexes
CREATE INDEX idx_new_table_user_id ON public.new_table(user_id);
CREATE INDEX idx_new_table_created_at ON public.new_table(created_at DESC);

-- 5. Updated_at trigger
CREATE TRIGGER update_new_table_updated_at
  BEFORE UPDATE ON public.new_table
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Standard RLS Patterns

| Table Type | SELECT | INSERT | UPDATE | DELETE |
|-----------|--------|--------|--------|--------|
| Public content (posts, projects) | `true` (with is_removed check) | `auth.uid() = author_id` | `auth.uid() = author_id` | `auth.uid() = author_id` |
| Private content (messages) | Participant check | Participant check | Never | Never |
| Notifications | `auth.uid() = user_id` | System only (via trigger) | `auth.uid() = user_id` (is_read only) | Never |
| Admin tables (reports, flags) | `is_admin` check | Authenticated (reports) or admin | Admin only | Admin only |
| Junction tables (follows, saves) | `true` | `auth.uid() = user_id` | Never | `auth.uid() = user_id` |

## Admin Check Pattern
```sql
CREATE POLICY "Admin only" ON public.reports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = true)
  );
```

## Participant Check Pattern (Messages)
```sql
CREATE POLICY "Participants read" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );
```

## Audit Checklist
When reviewing SQL changes, verify:
- [ ] RLS enabled on every table
- [ ] SELECT policy exists (who can read?)
- [ ] INSERT policy exists with proper CHECK
- [ ] UPDATE policy restricts to owner/admin
- [ ] DELETE policy exists or is intentionally omitted
- [ ] Indexes on all foreign keys
- [ ] Indexes on frequently queried columns (created_at, status)
- [ ] CHECK constraints on enum columns
- [ ] ON DELETE CASCADE where appropriate
- [ ] No service-role bypass in user-facing code
