# Review Fixup

Used when addressing PR review comments on an existing feature branch.

**When to spawn:** When the user asks to fix PR review comments.

## Setup
- Main agent reads PR comments and drafts a spec of changes needed
- Spawn a subagent on the feature branch

## Process
- Merge origin/main into the feature branch before applying fixes
- Apply the review fixes

## Teardown
- Verify the PR is still open before pushing:
  ```
  gh pr view <number> --json state --jq '.state'
  ```
  If state is MERGED or CLOSED, stop and report back — do not push
- Run type checking: `npx tsc --noEmit`
- Commit and push
- Report back: what was changed, any caveats
