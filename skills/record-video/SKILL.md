---
name: record-video
description: Record browser videos at localhost:3002 for PR demos. Analyses the diff, writes custom Playwright scripts to demonstrate changes, and saves recordings.
---

Record videos of the app at localhost:3002 to demonstrate PR changes.

## Interactive workflow

### Step 1 — Analyse the changes
Run `git diff main...HEAD` to understand what changed and which pages/flows are affected. Tell the user what you plan to record.

### Step 2 — Open browser for login
Run the browser script in the background so the user can log in:

```
node C:/Users/danwil/.claude/skills/record-video/browser.js open
```

Tell the user: "A browser has opened at localhost:3002. Please log in and navigate to the page you want to record. When you're ready, close the browser and let me know the URL."

Wait for the user to respond with the URL and confirmation they're ready.

### Step 3 — Record
Run the recording command. The persistent profile means the user is still logged in:

```
node C:/Users/danwil/.claude/skills/record-video/browser.js record <URL> <LABEL> <CWD>
```

Where:
- `<URL>` is the full URL (e.g. `http://localhost:3002/advanced-search`)
- `<LABEL>` is a descriptive name (e.g. `before_search_loading`, `after_search_loading`)
- `<CWD>` is the current working directory (so recordings save to `./recordings/` in the project)

Tell the user: "Recording has started. Perform your actions in the browser, then close the browser window when done."

Wait for the user to confirm they've closed the browser.

The script will:
1. Save the video as .webm
2. Convert to .mp4 using ffmpeg-wasm
3. Delete the .webm source file
4. Report the final .mp4 path

### Step 4 — Repeat or finish
If recording before/after, repeat steps 3 for additional recordings (the session persists).

### Step 5 — Cleanup
After all recordings are done:
- Delete `./recordings/record_tmp.js` if it exists
- Tell the user the paths of all saved .mp4 files
- Remind them to add `recordings/` to `.gitignore` if it isn't already

## Notes
- The persistent browser profile is stored at `C:/Users/danwil/.claude/skills/record-video/chrome-profile/`
- Login survives between `open` and `record` calls because cookies/storage are extracted from the persistent profile
- Videos save to `./recordings/<label>_<timestamp>.mp4` in the project directory
- If the user needs to re-login (e.g. session expired), run the `open` command again
