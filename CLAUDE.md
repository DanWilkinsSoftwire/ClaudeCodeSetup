# Personal Rules

## Git
- Do not add Co-Authored-By lines to commit messages.

## Parameters
- Do not use sentinel or magic values (e.g. `-1`, `""`, `null`) as parameters to work around a type or missing concept. Instead, surface the design question and find a semantically meaningful alternative.

## Incremental Implementation
- When implementing a multi-step plan, implement one step at a time and stop after each step for the user to review and commit before proceeding.
- Do not proceed to the next step until the user explicitly approves.

## Project Documentation
- If a project has a `docs/` directory, read the relevant doc before making changes — do not duplicate its content in CLAUDE.md files.

