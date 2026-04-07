---
name: get-jira-ticket
description: Fetch JIRA ticket content (title, description, acceptance criteria) by ticket ID using Playwright with a persistent Chrome profile.
---

Fetch the content of a JIRA ticket. Usage: `/get-jira-ticket EIP1-12345`

Run the Playwright script to fetch the ticket:

```
node C:/Users/danwil/.claude/skills/get-jira-ticket/fetch.js <TICKET_ID>
```

The script will:
1. Attempt a headless fetch using the saved Chrome profile
2. If a login page is detected, re-launch with a visible browser for manual login
3. After login, re-attempt headless to confirm the session is saved

Present the returned ticket content to the user.

If key fields (title, description) come back empty or the script errors, tell the user — the JIRA DOM selectors may have changed and the script may need updating. Do not guess the ticket content.
