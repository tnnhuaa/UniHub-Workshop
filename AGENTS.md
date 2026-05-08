# UniHub Workshop Agents

This repo defines Copilot agents and prompt wrappers to keep changes consistent and testable.

## Agents

- .github/agents/implement.agent.md
  - Implements features using the UniHub workflow (plan -> execute -> verify -> report).
- .github/agents/git.message.agent.md
  - Drafts commit messages from staged changes.

## Prompts

- .github/prompts/implement.prompt.md
  - Wrapper prompt for planning and task breakdown before implementation.
- .github/prompts/git.message.prompt.md
  - Wrapper prompt for commit message drafting.
- .github/prompts/git.pull.description.prompt.md
  - Wrapper prompt for PR description drafting.

## Usage Notes

- Prefer the implement agent for multi-step work.
- Keep docs in blueprint/ aligned with code changes.
