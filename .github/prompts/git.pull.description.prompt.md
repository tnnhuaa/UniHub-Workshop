---
tools:
  [
    "execute",
    "read",
    "search",
    "web",
    "agent",
    "gitkraken/git_blame",
    "gitkraken/git_branch",
    "gitkraken/git_checkout",
    "gitkraken/git_log_or_diff",
    "gitkraken/git_status",
    "gitkraken/git_worktree",
    "gitkraken/gitkraken_workspace_list",
    "gitkraken/issues_get_detail",
    "gitkraken/pull_request_get_comments",
    "gitkraken/pull_request_get_detail",
    "gitkraken/repository_get_file_content",
    "serena/*",
    "oraios/serena/*",
    "context7/*",
    "vscode.mermaid-chat-features/renderMermaidDiagram",
  ]
description: Propose a high-quality Pull Request title + description from the current branch changes (do NOT create a PR). Use GitKraken tools and essential git terminal commands to analyze diffs/logs.
---

## User Input

```text
$ARGUMENTS
```

## Mission

Draft a **copy-pastable Pull Request title + description** for the current branch.

- **DO NOT** create/open/submit a Pull Request.
- **DO NOT** run `git push`, `gh pr create`, `hub pull-request`, or any PR-creation command.
- **DO NOT** stage/unstage or commit.

## Base branch (default)

- Default base: `main`
- If the repo uses `master` or another base, infer from repo conventions or from `$ARGUMENTS`.
- If `$ARGUMENTS` contains an explicit base branch (e.g., `base=develop`), use it.

## Required analysis steps (use tools + terminal commands)

You must gather evidence for the PR description from **branch-to-base comparison**, not from unstaged-only local noise.

### 1) Quick state

- Use **#tool:gitkraken/git_status** (or terminal `git status`) to determine:
  - current branch name
  - whether there are unstaged changes (acknowledge, but PR should focus on branch diff)
  - whether there are staged changes (informational)

### 2) Compare branch to base (MUST)

Compute changes in current branch vs base.
Prefer terminal commands when available; otherwise use **#tool:gitkraken/git_log_or_diff** to view diffs/logs.

Run these (or equivalent) in this order:

1. `git fetch --all --prune` (safe read-only update)
2. `git log --oneline --decorate --no-color <BASE>..HEAD`
3. `git diff --stat <BASE>...HEAD`
4. `git diff <BASE>...HEAD` (only if needed to accurately describe behavior changes)
5. Optional (when useful):
   - `git diff --name-status <BASE>...HEAD`
   - `git log --merges --oneline <BASE>..HEAD` (if merges exist)

6. Try to use git terminal commands, github CLI commands to gather more context about the repo, e.g.:

- `git remote get-url origin`
- `gh repo view --json defaultBranchRef`
- `gh pr view --json baseRefName,headRefName` (if in a PR context)
- `git branch -r` to list remote branches
- git commit history may help understand the purpose of the branch, but do NOT rely on it solely.

Notes:

- Use `<BASE>` as `origin/main` by default (or `origin/<branch>`), unless repo conventions indicate otherwise.
- If `origin/main` doesn't exist, try `origin/master` or the base specified in `$ARGUMENTS`.
- If you cannot fetch (tooling restrictions), proceed with local refs but clearly note the limitation.

### 3) Build “How to Review (suggested order)” (MUST)

You must derive a **review plan** from the actual branch diff and include it in the PR description under:

> **How to Review (suggested order)**

How to build it:

1. Get the changed-file inventory (do this even if you already ran `--stat`):
   - `git diff --name-status <BASE>...HEAD`
   - `git diff --stat <BASE>...HEAD`
2. Group changes by reviewer-flow impact (typical order):
   - **Schema / migrations / contracts** (DB migrations, OpenAPI, DTO/Zod, protobuf, etc.)
   - **Core domain / business logic**
   - **API / service boundaries** (routes, controllers, service layer)
   - **UI / integration layers**
   - **Tests / docs / tooling**
3. Output 5–10 ordered bullets that:
   - name the key files/directories to open
   - explain _why this order_ (what each step unlocks)
   - optionally include 1–3 helpful commands for reviewers (e.g., `git diff <BASE>...HEAD -- path/`)

Notes:

- Prefer a stable, logical review order over commit order.
- If the diff is tiny, still include a short 2–3 step order.

### 4) Optional context (use tools to improve quality)

Use these only if they help:

- `#tool:search/codebase` to find:
  - project naming conventions
  - existing PR templates in `.github/PULL_REQUEST_TEMPLATE*`
  - changelog conventions
- `#tool:search/changes` to spot key changes quickly
- `web` only if the diff references external issue specs/links and you need to confirm naming (do not overuse)

## Output requirements (COPY-FRIENDLY)

Your final answer must include seperated copiable blocks for:

1. **PR title options** (3 options, 3 separated text code blocks for copying easily)

2. **Recommended PR title** (single separated text copy block)

- Provide ONE recommended title option inside a fenced code block for easy copying.

```text
$source to $destination: $RECOMMENDED_TITLE
```

3. **PR description (single copy block)**:

- Provide ONE fenced code block containing the full PR description in Markdown.
- The description must be fully copy-pastable and ready for GitHub/GitLab.

Use this template, filled from evidence:

```markdown
## Summary

- What changed? (bullet points - detailed)
- Why was it needed? (bullet points - context)

## How to Review (suggested order)

1.
2.
3.

## Changes

- Added:
- Modified:
- Fixed:
- Removed:

## Technical Notes

- Architecture / module boundaries:
- API changes (routes, request/response, validation):
- DB/Prisma changes (schema/migrations/queries):
- UI changes (components, flows):
- Config/CI changes:

## Testing

- Automated:
- Manual:

## Screenshots / Demo (if applicable)

- Before:
- After:

## Impact / Risk

- Breaking changes:
- Migration steps:
- Rollout/feature flags:
- Backward compatibility:

## Checklist

- [ ] Tests added/updated
- [ ] Lint/typecheck pass locally
- [ ] Docs updated (if needed)
- [ ] No secrets leaked
```

## Quality bar

- Derive everything from `<BASE>...HEAD` diff/log.
- Be specific (name endpoints/components/modules) but avoid verbosity.
- Always include a “How to Review (suggested order)” section derived from the diff.

## Interpret user constraints

Treat `$ARGUMENTS` as constraints, e.g.:

- audience=reviewers | product | ops
- base=develop
- include=how-to-test
- style=concise|detailed
