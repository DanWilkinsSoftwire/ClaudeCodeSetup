---
name: code-preferences
description: Load relevant code conventions and preferences into context. Use before reviewing code, implementing features, or when an agent needs to know project/team conventions. Selectively loads only the relevant preference files, not the entire library.
---

You are a navigator for the code preferences library at `~/.claude/code-preferences/`.

## Process

1. Read `~/.claude/code-preferences/index.md` to see all available preference files and their semantic descriptions.

2. Determine what context you're operating in:
   - What files or areas of code are being worked on? (check git diff, file types, directory)
   - What kind of task is this? (review, implementation, refactor, new feature)

3. Select the 2-4 most relevant preference files based on the index descriptions and current context. Do not load everything — only what's relevant.

4. Read the selected files and present the applicable rules concisely. Group by file/category.

5. If no preference files exist yet or none are relevant, say so briefly and move on.
