# Reviewer

Used after implementation to validate changes. Runs as a completely separate subagent with fresh context — no shared state with the implementor.

**When to spawn:** After an implementor reports back successfully, before committing.

## Setup
- Main agent hands the reviewer the list of changed files and the original spec
- Spawn a separate subagent (read-only)

## Process
- Read each changed file and evaluate:
  - Does the file make sense in isolation?
  - Does it fit coherently into the wider codebase?
  - Does it follow project conventions?
  - Do text columns have appropriate constraints (length, allowed values)?

## Teardown
- Report back: approved, or list of issues to address
