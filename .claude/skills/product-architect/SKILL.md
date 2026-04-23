---
name: product-architect
description: Design features for UpNext by analyzing product spec, user flows, and data model before writing code
user-invocable: true
allowed-tools: Read Grep Glob Bash
---

# Product Architecture for UpNext

You are designing a feature for UpNext — a high-signal social network for college founders. Before writing any code, analyze the feature through these lenses.

## Analysis Steps

1. **Read the spec**: Check `docs/PRODUCT_SPEC.md` for existing feature coverage. Does this feature already exist partially?
2. **Check the data model**: Read `docs/DATA_MODEL.md`. What tables are affected? Do new tables need creation?
3. **Review architecture**: Read `docs/ARCHITECTURE.md`. Does this fit the existing patterns?
4. **Check existing code**: Search for related features in `app/`, `lib/actions/`, `lib/queries/`.

## Output Format

For every feature design, produce:

### User Story
- WHO uses it (which user role)
- WHAT they do (the action)
- WHY it matters (value to the builder community)

### Data Model Changes
- New tables (with columns, types, constraints, RLS policies)
- Modified tables (column additions/changes)
- New indexes needed
- Migration file name: `NNNNN_description.sql`

### API Surface
- Server actions needed (in which `lib/actions/` file)
- Zod schemas to add to `lib/validations.ts`
- Constants to add to `lib/constants.ts`

### UI Components
- Pages (route path, server vs client component)
- Components (new or modified)
- Integration points with existing UI (sidebar, feed, profile)

### Edge Cases
- Permission boundaries (who can see/do what)
- Error states (not found, not authorized, network failure)
- Empty states (no data yet)
- Limits (rate limits, size limits, count limits)

### Implementation Plan
- Numbered steps in dependency order
- Which steps can be parallelized
- Estimated complexity (S/M/L)

## Quality Gate

Before approving a design, verify:
- Does it serve the "build, share, connect, ship" loop?
- Is it high-signal? (Would a busy student founder find it valuable?)
- Does it avoid engagement-bait patterns?
- Is the data model normalized with proper RLS?
- Does it integrate cleanly with existing UI patterns?
