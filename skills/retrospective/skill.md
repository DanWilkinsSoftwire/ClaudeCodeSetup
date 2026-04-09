---
name: retrospective
description: Analyze the current conversation for workflow improvements — repeated commands, context waste, rule gaps, and process issues. Use after completing a significant piece of work or when a conversation felt inefficient.
---

Analyze this conversation and produce a structured report with four sections:

1. **Commands audit** — read `.claude/settings.local.json` to determine which tools are auto-allowed. List every tool call that was NOT auto-allowed (i.e. required manual approval) during the conversation. Note: Agent tool spawns are auto-allowed and do not require manual approval — do not list them. For each, note whether it succeeded, was rejected, or was interrupted. Flag any that could be eliminated by a rule, script, or process change.

2. **High context usage areas** — parts of the conversation that burned disproportionate context relative to their value. Identify root causes (stale state, lost work, back-and-forth fixes, etc.).

3. **Rule gaps** — situations where a CLAUDE.md rule or agent process instruction would have prevented a mistake or inefficiency. Draft the specific rule.

4. **Code preferences** — review the conversation for any generalizable conventions, patterns, or decisions that should be added to the code preferences library (`~/.claude/code-preferences/`). Read the index to avoid duplicates. Present candidates for approval.

5. **Other improvements** — anything else that would make the next similar conversation smoother.

For each item, classify as:
- **Systemic** — will recur without a change
- **One-off** — unlikely to happen again, not worth a rule

Only propose changes for systemic issues. Be concrete — draft the actual rule text, skill, or process change rather than vague suggestions.

After the user approves the retrospective changes, apply them and commit and push changes to both the project repo (if applicable) and the `~/.claude` repo.
