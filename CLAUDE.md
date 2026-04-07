# Personal Rules

## Git
- Do not add Co-Authored-By lines to commit messages.
- Never force-push to feature branches.

## Parameters
- Do not use sentinel or magic values (e.g. `-1`, `""`, `null`) as parameters to work around a type or missing concept. Instead, surface the design question and find a semantically meaningful alternative.

## Incremental Implementation
- When implementing a multi-step plan, implement one step at a time and stop after each step for the user to review and commit before proceeding.
- Do not proceed to the next step until the user explicitly approves.

## Shell
- When working in worktrees, cd to the worktree directory once at the start, then use relative paths. Do not prefix every Bash command with `cd <worktree-path> &&`.

## Project Documentation
- If a project has a `docs/` directory, read the relevant doc before making changes — do not duplicate its content in CLAUDE.md files.

## Plans
- When a plan step is completed (code merged or verified on main), update the plan file to mark that step's Status as Done.
- When writing plan steps that define database schemas, include constraints (NOT NULL, CHECK, foreign keys, length limits) — not just column types. If a column references application-defined values, specify the DB-level enforcement strategy.

## PR Workflow
- When work will become a PR, create the feature branch before writing any files. This avoids writing to main and then needing to stage selectively.

## Review Markup — Merging Main
- When applying review markup fixes to an existing feature branch, always merge origin/main first — do not rebase:
  ```
  git fetch origin main
  git merge origin/main
  ```
- Then apply the fixes and push normally.
