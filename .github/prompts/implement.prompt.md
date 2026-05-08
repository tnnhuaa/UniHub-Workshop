---
tools:
  [
    "read",
    "search",
    "edit",
    "execute",
    "web",
    "github-semantic-search-server/*",
    "context7/*",
    "serena/*",
    "oraios/serena/*",
    "todo",
    "agent/runSubagent",
    "gitkraken/git_status",
    "gitkraken/git_log_or_diff",
  ]
description: Wrapper prompt for UniHub Workshop — generate dependency-ordered tasks.md using the project implementer workflow (NestJS + Fastify + Prisma + Zod, NextJS admin web, RabbitMQ workers). Allowed to call subagents and skills.
---

## User Input

```text
$ARGUMENTS
```

## Primary Instruction

Use the **UniHub Workshop Implementer** workflow to:

1. Analyze the request against `REQUIREMENTS.md`, `blueprint/proposal.md`, `blueprint/design.md`, and `blueprint/IMPLEMENTATION-GUIDE.md`.
2. During **planning**, call relevant **subagents/skills** when they help surface repo conventions, test strategy, or implementation details.
3. If requirements are ambiguous, ask targeted clarifying questions and **STOP** after asking them. Do not edit files until ambiguity is resolved.
4. If requirements are clear, propose a dependency-ordered plan with an impacted file list.
5. Produce a complete `.copilot_temp/tasks.md` that includes explicit dependencies, implementation order, and a verification checklist.

## Execution Permissions

After you have a **complete plan + tasks + TODOs** (and there are **no open questions**), you may proceed to
CRUD files/folders in the workspace and run local-only verification/demo scripts **without additional user confirmation**.

However, if a command is **sensitive** (external publish/deploy, uses credentials, destructive/hard-to-revert,
system-level changes), you must ask the user to confirm before executing.

You are allowed to stage changes incrementally as you work with `git add <paths>`.

## Assistance Allowed

You are allowed (and encouraged when helpful) to call:

- **Subagents** via **#runSubagent** (e.g., “Git Commit Message Agent”, repo-specific implementers, test helpers, review helpers, or research agents).
- **Skills** (repo-defined skill prompts/instructions) for specialized work such as:
  - reading diffs / review checklist
  - generating NestJS + Zod API route skeletons
  - Prisma schema and query patterns
  - NextJS + MUI admin UI patterns
  - test scaffolding (Jest/Supertest)

When a relevant skill exists, prefer invoking it rather than reinventing the process.

## UniHub Workshop Constraints

Treat the following as fixed project constraints:

- Backend: **NestJS + Fastify**
- ORM: **Prisma** with **PostgreSQL**
- Validation: **Zod** only; derive TS types via `z.infer`
- Auth: **BetterAuth** hybrid session/JWT flow
- Cache/rate limiting/idempotency: **Redis**
- Async jobs: **RabbitMQ** workers for notifications, AI summary, CSV sync
- Storage: **Object Storage** for PDF uploads and AI artifacts
- Architecture: **modular monolith + background workers**
- External integrations must use adapters/interfaces, not direct coupling
- Prefer DRY shared utilities for idempotency, rate limiting, and circuit breaking

## Blueprint Alignment

The prompt must align with:

- `blueprint/proposal.md`
- `blueprint/design.md`
- `blueprint/IMPLEMENTATION-GUIDE.md`
- `blueprint/specs/*.md`

The implementer should preserve consistency across docs when making code changes.

## Completion behavior (after work is done)

When ALL tasks are complete and Phase 2 verification passes:

- Use **#runSubagent** with **Git Commit Message Agent** to draft a commit message from **staged** changes.
- Include the proposed commit message (header + detailed description body from **Git Commit Message Agent**) inside the numbered completion report in `docs/reports`.

## Extra constraints

Treat `$ARGUMENTS` as constraints (module boundaries, preferred patterns, folder scopes, naming, etc.).
Do not define user-defined `interface`/`type` aliases for request DTOs or response DTOs; derive TypeScript types from Zod schemas via `z.infer`.
Favor the smallest coherent change set that satisfies the request and keeps the blueprint/docs synchronized.
