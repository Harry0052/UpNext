# UpNext — Claude Code Setup Guide

This document explains the Claude Code operating system configured for the UpNext project — skills, subagents, hooks, settings, and MCP integrations.

## Overview

```
.claude/
├── settings.json          # Project permissions and hooks (committed)
├── settings.local.json    # Local overrides (gitignored)
├── mcp.json              # MCP server stubs (disabled by default)
├── hooks/                 # Hook scripts
│   ├── lint-typecheck.sh  # Lint .ts/.tsx after edits
│   ├── sql-rls-check.sh   # Block unsafe SQL without RLS
│   ├── docs-update-check.sh # Remind about doc updates
│   └── build-check.sh    # Full build verification
├── skills/                # Project-level skills (10)
│   ├── product-architect/
│   ├── nextjs-app-router/
│   ├── supabase-rls/
│   ├── social-graph/
│   ├── feed-ranking/
│   ├── messaging-realtime/
│   ├── moderation-safety/
│   ├── growth-analytics/
│   ├── qa-playwright/
│   └── release-hardening/
└── agents/                # Custom subagents (8)
    ├── architect/
    ├── frontend-designer/
    ├── backend-builder/
    ├── db-rls-guardian/
    ├── search-ranking-engineer/
    ├── realtime-messaging-engineer/
    ├── qa-systems/
    └── growth-ops/
```

## Skills

Skills are invoked with `/skill-name` in the Claude Code prompt. They provide domain-specific instructions.

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `/product-architect` | Design features against the product spec | Before implementing a new feature |
| `/nextjs-app-router` | Next.js 16 patterns and conventions | Writing any page, layout, or route handler |
| `/supabase-rls` | Database schema, RLS, migrations | Adding/modifying database tables |
| `/social-graph` | Follows, vouches, raise hands, reputation | Working on social features |
| `/feed-ranking` | Feed queries, filtering, ranking | Working on feed or explore |
| `/messaging-realtime` | Supabase Realtime, messaging, presence | Working on chat or notifications |
| `/moderation-safety` | Reports, admin tools, content policies | Working on moderation or admin |
| `/growth-analytics` | Referrals, analytics, growth loops | Working on growth features |
| `/qa-playwright` | E2E test patterns and coverage | Writing or running tests |
| `/release-hardening` | Pre-release checklist and audits | Before deploying to production |

## Subagents

Subagents run in isolated context windows. They're automatically selected by Claude based on the task, or can be explicitly invoked.

| Agent | Model | Purpose |
|-------|-------|---------|
| `architect` | Opus | Plans features, designs data models, writes specs |
| `frontend-designer` | Sonnet | Builds UI components and pages |
| `backend-builder` | Sonnet | Writes server actions, queries, API routes |
| `db-rls-guardian` | Sonnet | Reviews/writes SQL, RLS policies, migrations |
| `search-ranking-engineer` | Sonnet | Search, discovery, recommendations |
| `realtime-messaging-engineer` | Sonnet | Realtime messaging and presence |
| `qa-systems` | Sonnet | Tests (unit and E2E) and quality |
| `growth-ops` | Sonnet | Growth features, analytics, referrals |

## Hooks

Hooks run automatically in response to tool use events.

### Active Hooks

| Trigger | Script | Behavior |
|---------|--------|----------|
| After Edit/Write on `.ts`/`.tsx` | `lint-typecheck.sh` | Runs ESLint on changed file, reports issues |
| After Edit/Write on `.sql` | `sql-rls-check.sh` | **Blocks** if CREATE TABLE without RLS, or DROP TABLE |
| After Edit/Write on arch files | `docs-update-check.sh` | Reminds to update docs (advisory) |
| On demand | `build-check.sh` | Full `npm run build` verification |

### Hook Behavior
- **Exit 0**: Hook passes. stdout is added to Claude's context.
- **Exit 2**: Hook blocks the action. stderr is shown as the reason.
- Hooks receive the tool event as JSON on stdin.

### Architectural Files That Trigger Docs Check
- `proxy.ts`, `next.config.ts`
- `lib/supabase/*`, `supabase/migrations/*`
- `types/database.ts`, `lib/validations.ts`, `lib/constants.ts`
- `app/layout.tsx`, `app/(main)/layout.tsx`

## Settings

### Project Settings (`.claude/settings.json`)

**Permissions** — pre-approved tool patterns:
- All read tools (Read, Glob, Grep)
- Common bash commands (npm run, git, npx, ls, find, mkdir)
- Edit/Write for project source files (app/, components/, lib/, types/, tests/, scripts/, supabase/, docs/)
- File types: .ts, .tsx, .md, .json, .css, .sql

**Denied patterns** (always blocked):
- `rm -rf` — prevent accidental mass deletion
- `git push --force` — prevent force pushes
- `git reset --hard` — prevent hard resets
- Writing to `.env.local` or `.env` — prevent secret exposure

### Local Settings (`.claude/settings.local.json`)

Override permissions for your development environment:
- npm install/uninstall
- npx create-next-app
- git push (non-force)
- File operations (mv, rmdir, chmod)

This file is gitignored — add your own overrides without affecting the team.

## MCP Server Stubs

Pre-configured MCP servers in `.claude/mcp.json`. All are **disabled by default** — enable by setting `"disabled": false` and providing the required environment variables.

### Playwright (Browser Automation)
```bash
# Enable in .claude/mcp.json: set disabled to false
# No env vars needed for local testing
```
Use for: visual regression testing, screenshot comparison, browser interaction testing.

### GitHub
```bash
# Set env var:
export GITHUB_TOKEN=ghp_your_token_here
# Enable in .claude/mcp.json: set disabled to false
```
Use for: PR creation, issue management, code review, CI status checks.

### Postgres / Supabase
```bash
# Set env var (from Supabase dashboard > Settings > Database):
export DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
# Enable in .claude/mcp.json: set disabled to false
```
Use for: direct database inspection, query testing, schema exploration.

### Figma
```bash
# Set env var (from Figma > Settings > Personal Access Tokens):
export FIGMA_TOKEN=figd_your_token_here
# Enable in .claude/mcp.json: set disabled to false
```
Use for: design-to-code translation, component inspection, design token extraction.

### Sentry
```bash
# Set env vars:
export SENTRY_AUTH_TOKEN=sntrys_your_token_here
export SENTRY_ORG=your-org-slug
# Enable in .claude/mcp.json: set disabled to false
```
Use for: error investigation, performance monitoring, release tracking.

## Getting Started

### 1. Prerequisites
- Node.js 24+
- Claude Code CLI installed
- Supabase project created

### 2. Setup
```bash
# Clone and install
git clone <repo-url>
cd UpNext
npm install

# Copy environment template
cp .env.local.example .env.local
# Fill in Supabase URL and keys

# Run database migration
# (paste supabase/migrations/00001_initial_schema.sql into Supabase SQL editor)

# Seed demo data
npx tsx scripts/seed.ts

# Start dev server
npm run dev
```

### 3. Using Claude Code
```bash
# Start Claude Code in the project
claude

# Use skills
> /product-architect Design a "Campus Leaderboard" feature
> /supabase-rls Review the RLS policies for the messages table
> /qa-playwright Write E2E tests for the onboarding flow
> /release-hardening Run the pre-release checklist

# Claude will automatically:
# - Select appropriate subagents for tasks
# - Run lint/typecheck hooks after edits
# - Block unsafe SQL changes
# - Remind about docs updates
```

### 4. Enabling MCP Servers
Edit `.claude/mcp.json` and set `"disabled": false` for any server you want. Provide the required environment variables in your shell or `.env.local`.

### 5. Customizing
- **Add new skills**: Create a new directory in `.claude/skills/` with a `SKILL.md` file
- **Add new agents**: Create a new directory in `.claude/agents/` with an `agent.md` file
- **Modify hooks**: Edit scripts in `.claude/hooks/` or add new hook entries in `.claude/settings.json`
- **Override permissions**: Add to `.claude/settings.local.json` (gitignored)

## Best Practices

1. **Use skills before coding** — `/product-architect` before new features, `/supabase-rls` before schema changes
2. **Let hooks catch issues** — don't suppress lint warnings, fix them
3. **Run `/release-hardening` before every deploy** — it catches what CI doesn't
4. **Use subagents for parallel work** — architect plans while frontend-designer builds UI
5. **Keep `.claude/settings.local.json` minimal** — only override what you need for your local setup
