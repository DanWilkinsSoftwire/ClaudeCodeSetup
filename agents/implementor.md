# Implementor

Used for all implementation work. Preserves main-agent context by delegating to a subagent.

**When to spawn:** Any time code needs to be written or modified.

## Setup
- Main agent writes a complete spec with acceptance criteria
- Spawn a subagent

## Process
- Implement the spec

## Teardown
- Run the project's type check command
- Do not commit yet — report back: what was built, what was verified, list of changed files, any caveats
- Main agent then spawns a **reviewer** before committing
