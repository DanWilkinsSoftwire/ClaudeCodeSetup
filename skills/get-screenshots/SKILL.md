---
name: get-screenshots
description: Take browser screenshots at localhost:3002 for PR demos. Analyses the diff, captures screenshots of affected pages, and saves PNGs.
---

Take screenshots of the app at localhost:3002 to demonstrate PR changes.

## Interactive workflow

### Step 1 — Analyse the changes
Run `git diff main...HEAD` to understand what changed and which pages/flows are affected. Tell the user what you plan to screenshot.

### Step 2 — Open browser for login
Run the browser script in the background so the user can log in:

```
node C:/Users/danwil/.claude/skills/get-screenshots/browser.js open
```

Tell the user: "A browser has opened at localhost:3002. Please log in and navigate to the page you want to screenshot. When you're ready, close the browser and let me know the URL."

Wait for the user to respond with the URL and confirmation they're ready.

### Step 3 — Screenshot
Run the screenshot command. The persistent profile means the user is still logged in. The screenshot is taken headlessly — no user interaction needed:

```
node C:/Users/danwil/.claude/skills/get-screenshots/browser.js screenshot <URL> <LABEL> <CWD>
```

Where:
- `<URL>` is the full URL (e.g. `http://localhost:3002/advanced-search`)
- `<LABEL>` is a descriptive name (e.g. `before_search_layout`, `after_search_layout`)
- `<CWD>` is the current working directory (so screenshots save to `./screenshots/` in the project)

The script will:
1. Load the page headlessly with the saved session
2. Wait for network idle + 500ms
3. Take a full-page screenshot as .png
4. Report the final .png path

### Step 4 — Repeat or finish
If capturing before/after, repeat step 3 for additional screenshots (the session persists).

### Step 5 — Cleanup
After all screenshots are done:
- Tell the user the paths of all saved .png files
- Remind them to add `screenshots/` to `.gitignore` if it isn't already

## Notes
- The persistent browser profile is stored at `C:/Users/danwil/.claude/skills/get-screenshots/chrome-profile/`
- Login survives between `open` and `screenshot` calls because cookies/storage are extracted from the persistent profile
- Screenshots save to `./screenshots/<label>_<timestamp>.png` in the project directory
- If the user needs to re-login (e.g. session expired), run the `open` command again
