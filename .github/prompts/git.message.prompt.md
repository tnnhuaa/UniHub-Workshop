---
tools:
  [
    "read",
    "search",
    "execute",
    "gitkraken/git_status",
    "gitkraken/git_log_or_diff",
    "agent/runSubagent",
    "serena/*",
    "oraios/serena/*",
  ]
description: Wrapper prompt — draft a Conventional Commit message from STAGED changes using Git Commit Message Agent. Never commit/push.
---

## User Input

```text
$ARGUMENTS
```

## Instruction

Delegate to **Git Commit Message Agent** and produce a commit proposal **from staged changes only**.

### Required behavior (staged-only)

- Run (staged-first):
  - `git status`
  - `git diff --cached --stat`
  - `git diff --cached` (or `#tool:gitkraken/git_log_or_diff` in staged view)
- IF NO STAGED CHANGES FOUND: stage all changes and try again.

### Output requirements (copy-friendly)

- Provide 1–3 header options (1-3 code blocks for copying easily).
- Provide ONE recommended commit message inside a TWO SEPERATED fenced code block containing:
  - header line
  - blank line
  - detailed body template filled in

### Prohibitions

- Do not run any staging commands (`git add*`, `git restore --staged`, etc.).
- Do not analyze unstaged content (no `git diff`, no working-tree summaries).
- If there are no staged changes: say so and STOP.

### Extra constraints

Treat `$ARGUMENTS` as constraints (preferred scope/type, tone, extra sections, etc.).
