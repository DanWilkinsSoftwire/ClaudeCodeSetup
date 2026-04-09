---
name: update-code-preferences
description: Extract code conventions and preferences from PR reviews and conversations. Fetches review comments, identifies generalizable rules, and presents candidates for user approval before writing to the preferences library. Supports --last N, --pr NUMBER, --since DATE, or defaults to since-last-review.
---

You are extracting code conventions and preferences from PR review comments. The library lives at `~/.claude/code-preferences/`.

## Arguments

Parse the user's arguments to determine scope:
- `--last N` — last N merged PRs in the current repo
- `--pr NUMBER` — a specific PR (or comma-separated list)
- `--since YYYY-MM-DD` — all PRs merged since that date
- No args — since last review (read timestamp from `~/.claude/code-preferences/.last-review`; if empty, ask the user for a scope)

## Process

1. **Fetch PRs** using `gh` CLI:
   - `gh pr list --state merged --limit N --json number,title,mergedAt`
   - For each PR, fetch review comments: `gh api repos/{owner}/{repo}/pulls/{number}/comments` and `gh api repos/{owner}/{repo}/pulls/{number}/reviews`
   - Apply the scope filter from arguments above.
   - Before proceeding, report how many PRs and how many comments were found. If the count is very large (>50 PRs), confirm with the user before continuing.

2. **Extract candidates** — For each review comment (or conversation thread), determine:
   - Is this about a code convention, pattern, style, or architectural decision (not just a correctness fix for this specific PR)?
   - Is it generalizable — would it apply to future code, not just this one instance?
   - If yes to both: extract it as a candidate rule with:
     - A clear, imperative rule statement
     - A concrete code example (before/after if applicable, taken from the PR)
     - Source PR number(s)

3. **Present candidates** to the user, one at a time or in small batches. For each candidate:
   - Show the rule and example
   - Show the original comment for context
   - Ask: approve, edit, or skip?

4. **Write approved rules** to the appropriate file in `~/.claude/code-preferences/`:
   - Read `index.md` to see existing files and their scopes.
   - If a rule fits an existing file, append it there.
   - If no file fits, create a new `.md` file with an appropriate name, and add it to `index.md` with a keyword-rich description of its scope.
   - If a rule overlaps or conflicts with an existing rule in the library, flag this to the user and ask how to resolve.

5. **Update state**:
   - Write the current timestamp to `~/.claude/code-preferences/.last-review`.
   - Commit and push changes to `~/.claude` repo.

## Rule format

Each rule in a preference file should follow this structure:

```markdown
### Rule name

Source: PR #1234, PR #1301

{Rule statement — imperative, concrete}

{Code example if applicable}
```
